import GptSession from "./CombatGpt.js"
// const { GptSession } = require('./CombatGpt');

Hooks.on("combatStart", async (combat) => {
	// test = GptSession()
	//start a GPT session
	console.log("Start a Session")
	console.log(combat)

	GptSession.session().startCombat(combat)
});

Hooks.on("createCombatant", async (combatant, flags, id) => {
	//Add combatant description to log
	console.log("Add Combatant to Log:")
	console.log(combatant)

	// GptSession.session().addCharacter(combatant.actor);
})


Hooks.on("midi-qol.AttackRollComplete", async (workflow) => {
	//Add action description to log
	console.log("Add Attack Roll to Log:")
	console.log(workflow)

	GptSession.session().addWorkflow(workflow)
})

Hooks.on("midi-qol.DamageRollComplete", async (workflow) => {
	//Add action description to log
	console.log("Add Damage Roll to Log:")
	console.log(workflow)
})

Hooks.on("midi-qol.damageApplied", async (workflow) => {
	//Add action description to log
	console.log("Add Damage Applied to Log:")
	console.log(workflow)
})


Hooks.on("midi-qol.RollComplete", async (workflow) => {
	//Add action description to log
	console.log("Add Action to Log:")
	console.log(workflow)

	GptSession.session().addWorkflow(workflow)
})


Hooks.on("deleteCombat", async (combat) => {
	console.log("End the session")
	GptSession.session().endCombat();
})


Hooks.on("renderSidebarTab", async (app, html) => {
	if (app.options.id == "chat") {
		console.log("ADD ME");
		let button = $("<button class='get-description-id' style='max-height:30px;'><i class='fas fa-file-import'></i> Get Description</button>")

		button.click(function () {
			console.log(GptSession.session().getDescription())
		});


		html.append(button);
	}
})

