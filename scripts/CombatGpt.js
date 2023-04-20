import D from "./Descriptions.js";

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

		for (let combatant of combat.combatants){
			console.log(combatant)
			this.addCharacter(combatant.actor);
		}
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

			if (!this.actions.has(action.id)){
				this.actions.set(action.id, {
					description: action.description,
					shown: false,
				})
			}
		}

		for (let obj of objects){

			this.addObject(obj)

		}
	}

	static DescribeWorkflow(workflow){
		let descriptions = []

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
		if (!(obj.id in this.describedObjects)){
			this.describedObjects[obj.id] = {
				name: obj.name,
				description: obj.description,
				shown: false,
			};
		}
	}

	addCharacter(actor){
		this.addObject(D.actorObject(actor));
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

	getDescription(){

		const REMOVAL = true;

		let description = "";

		for (let key of Object.keys(this.describedObjects)){

			let obj = this.describedObjects[key];

			if (!obj.shown){
				if (REMOVAL){
					obj.shown = true;
				}

				description += `${obj.name}: ${obj.description}\n`;
			}
		}

		description += '\n\nActions:\n';

		for (let [key, obj] of this.actions){
			console.log(obj)

			if(!obj.shown){
				description += `- ${obj.description}\n`;

				if (REMOVAL){
					obj.shown = true;
				}
			}
		}

		description += "\n\nWrite a short theatrical description of the actions"

		return description;
	}
};

export default GptSession;