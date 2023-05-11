import { registerSettings, moduleName } from './settings.js';
import { getGptReplyAsHtml } from './gpt-api.js';
import GptSession from "./CombatGpt.js"
import { pushHistory } from './history.js';

const VERBOSE = false;

Hooks.once('init', () => {
	console.log(`${moduleName} | Initialization`);
	registerSettings();
});

Hooks.on("combatStart", async (combat) => {
	// test = GptSession()
	//start a GPT session
	// console.log("Start a Session")
	// console.log(combat)

	GptSession.session().startCombat(combat)
});

Hooks.on("updateActor", async (actor, changes, delta)=>{
	if (VERBOSE){
		console.log("Updated Actor");
		console.log(actor, changes, delta);
	}
	GptSession.session().addCharacterUpdate(actor, delta);
})

// Hooks.on("createCombatant", async (combatant, flags, id) => {
// 	//Add combatant description to log
// 	// console.log("Add Combatant to Log:")
// 	// console.log(combatant)

// 	// GptSession.session().addCharacter(combatant.actor);
// })


Hooks.on("midi-qol.AttackRollComplete", async (workflow) => {
	//Add action description to log
	// console.log("Add Attack Roll to Log:")
	// console.log(workflow)

	GptSession.session().addWorkflow(workflow)
})

Hooks.on("midi-qol.DamageRollComplete", async (workflow) => {
	//Add action description to log
	if (VERBOSE){
		console.log("Add Damage Roll to Log:")
		console.log(workflow)
	}

	GptSession.session().addWorkflow(workflow)
})

// Hooks.on("midi-qol.damageApplied", async (workflow) => {
// 	//Add action description to log
// 	// console.log("Add Damage Applied to Log:")
// 	// console.log(workflow)
// })


Hooks.on("midi-qol.RollComplete", async (workflow) => {
	//Add action description to log
	// console.log("Add Action to Log:")
	// console.log(workflow)

	GptSession.session().addWorkflow(workflow)
})


Hooks.on("deleteCombat", async (combat) => {
	// console.log("End the session")
	GptSession.session().endCombat();
})


Hooks.on("renderSidebarTab", async (app, html) => {
	if (game.user.isGM && app.options.id == "chat") {

		let button = $("<button class='get-description-id' style='max-height:30px;'><i class='fas fa-file-import'></i> Get Description</button>")

		button.click(async () => {
			button.disabled = true;
			await discriptionGrabber();
			button.disabled = false;
		});

		html.append(button);
	}
})

const TEST = false;

async function discriptionGrabber(){

	const desc = GptSession.session().getDescription()

	if (!desc.good){
		ui.notifications['warn']("No actions to describe")
		return
	}

	if (VERBOSE){
		console.log(desc.text)
	}

	let text;

	if (!TEST){
		try {
			let output = await getGptReplyAsHtml(desc.text)
			// console.log(output)
			text = output;
		} catch (e) {
			console.error(`${moduleName} | Failed to provide response.`, e);
			ui.notifications.error(e.message, {permanent: true, console: false});
			return
		}
	}
	else{
		// await new Promise(resolve => setTimeout(resolve, 1000));
		text = desc.text
		pushHistory(text);
	}

	ChatMessage.create({
		user: game.user.id,
		speaker: ChatMessage.getSpeaker({alias: 'Combat-GPT'}),
		content: `<abbr title="Combat Gpt Summary" class="fa-solid fa-microchip-ai"></abbr>
			<span class="">${text}</span>`,
		whisper: [game.user.id],
		sound: CONFIG.sounds.notification,
	});
}