import D from "./Descriptions.js";
import { pushHistory } from './history.js';

class GptSession {

	static session(){
		if (!GptSession.Combat){
			GptSession.Combat = new GptSession();
		}

		return GptSession.Combat;
	}

	constructor() {
		this.resetSession();
	}

	resetSession(){
		this.actions = new Map();
		this.describedObjects = {};
	}

	startCombat(combat){
		this.resetSession();

		this.addScene(combat.scene);

	}

	endCombat(){
		this.resetSession()
	}

	addWorkflow(workflow){
		let descriptions = GptSession.DescribeWorkflow(workflow);

		if (!descriptions){
			return;
		}

		let [actions, objects] = descriptions;

		for (let action of actions){

			this.actions.set(action.id, {
				description: action.description,
				shown: false,
				glossary: objects.reduce((a, v) => ({ ...a, [v.name]: v}), {})
			})
		}

	}

	addCharacterUpdate(actor, delta){
		let descriptions = GptSession.DescribeUpdates(actor, delta);

		if (!descriptions){
			return;
		}

		let [actions, objects] = descriptions;

		for (let action of actions){

			if (!this.actions.has(action.id)){
				this.actions.set(action.id, {
					description: action.description,
					shown: false,
					glossary: objects.reduce((a, v) => ({ ...a, [v.name]: v}), {})
				})
			}
		}

	}

	static DescribeUpdates(actor, delta){
		for (let test of GptSession.getIterator(D.CharacterDescriptionFunctions)){
			let potential = test(actor, delta);

			if (potential){
				return potential
			}
		}

		return;
	}

	static DescribeWorkflow(workflow){
		for (let test of GptSession.getIterator(D.DescriptionFunctions)){
			let potential = test(workflow);

			if (potential){
				return potential
			}
		}

		return;
	}

	static getIterator(arr){

		class Iterator {
			constructor(){
			}

			[Symbol.iterator]() {
				let counter = 0;
				let nextIndex = 0;

				let sortedList = [...arr].sort((a, b)=>{
					return b.priority - a.priority
				})

				return {
					next: ()=>{
						if ( nextIndex < sortedList.length ) {
							let result = { value: sortedList[nextIndex].func,  done: false }
							nextIndex ++;
							counter++;
							return result;
						}

						return { value: counter, done: true };
					}
				}
			} 
		}

		return new Iterator()
	}

	addObject(obj){
		if (!(obj.name in this.describedObjects)){
			this.describedObjects[obj.name] = {
				name: obj.name,
				description: obj.description,
				shown: false,
			};
		}
	}

	addScene(scene){

		if(!scene.journal){
			return;
		}

		//get journal page
		let page = scene.journal.pages.get(scene.journalEntryPage);

		if (!page || !page?.text?.content){
			return;
		}

		this.addObject({
			id: "scene",
			name: "Scene",
			description: page.text.content,
			data: scene,
			shown: false,
		})
	}

	addAction(actionString){
		this.actions.set(randomID(), {
			description: actionString,
			shown: false,
			glossary: [],
		})
	}

	getDescription(){

		const REMOVAL = true;

		const notShown = Array.from(this.actions.values()).filter(acc => !acc.shown);

		if (notShown.length < 1){
			return {text:"", good:false};
		}

		let description = "";

		let previousDescriptions = pushHistory();

		if (previousDescriptions.length > 0){
			description += "<PreviousActions>\n"
			previousDescriptions.forEach(d => {description += (d + '\n\n')})
			description += "</PreviousActions>\n\n";
		}

		const glossary = [...notShown.map(a => a.glossary)].reduce((acc, val) => {
			// console.log(val)
			Object.keys(val).forEach(a => {acc[a] = val[a];});
			return acc;
		}, {});

		for (const [key, desc] of Object.entries(glossary)){
			description += `${desc.name}:<div>${desc.description}</div>\n`
		}

		description += '\n\n<CurrentActions>\n';

		for (let obj of notShown){
			// console.log(obj)

			description += `- ${obj.description}\n`;

			if (REMOVAL){
				obj.shown = true;
			}
		}

		description += "</CurrentActions>\n\n"
		description += "Write a theatrical description of the current actions. never use percentages."

		return {text: description, good: true};
	}
};

export default GptSession;