import D from "../Descriptions.js";

const testItem = {
	uuid:"0",
	name: "Thing",
	system:{description:{value: "Some Description"}},
}

test('itemObject', () => {
	let i = D.itemObject(testItem);

	expect(i.id).toBe("0");
	expect(i.name).toBe("Thing");
	expect(i.description).toBe("Some Description");
});

const testCharacter = {
	uuid:"111",
	name: "Dude",
	system:{details:{biography: {value: "Some Description 2"}}},
	id: "111"
}

test('characterObject', () => {
	let i = D.actorObject(testCharacter);

	expect(i.id).toBe("111");
	expect(i.name).toBe("Dude");
	expect(i.description).toBe("Some Description 2");
});

test("Join Taget Names" , ()=>{
	expect(D.joinTargetNames([{name: "Jo", id:"01"}]) ).toBe("Jo (01)");
	expect(D.joinTargetNames([{name: "Jo", id:"01"}, {name: "Bob", id:"02"}]) ).toBe("Jo (01) and Bob (02)");
	expect(D.joinTargetNames([{name: "Jo", id:"1"}, {name: "Bob", id:"2"}, {name: "Norton", id:"3"}]) ).toBe("Jo (1), Bob (2) and, Norton (3)");
	expect(D.joinTargetNames([])).toBe("ERROR");
});

function getWorkflow(updates={}){
	const boring = {
		actor: testCharacter,
		token: testCharacter,
		item: testItem,
		attackRollCount: 0,
		hitTargets: new Set(),
		targets: new Set(),
		damageRollCount: 0,
		isCritical: false,
		damageList: [],
		failedSaves: new Set(),
		saveResults: [],
		saves: new Set(),
	}

	return {
		...boring,
		...updates,
	}
}


test("Test Empty Workflow" , ()=>{
	const testWorkflowEmpty = getWorkflow()
	
	expect(D.missed(testWorkflowEmpty)).toBe(undefined)
	expect(D.hit(testWorkflowEmpty)).toBe(undefined)
	// expect(D.hitSingle(testWorkflowEmpty)).toBe(undefined)
	expect(D.saveHit(testWorkflowEmpty)).toBe(undefined)
	expect(D.saveMiss(testWorkflowEmpty)).toBe(undefined)
});

const testCharacter2 = {
	uuid:"112",
	name: "Dudette",
	system:{
		details:{biography: {value: "Some Description 3"}},
		attributes:{hp:{max: 10}}
	},
}

test("Test Missing Workflow" , ()=>{
	const testWorkflowMiss = getWorkflow({
		targets: new Set([{actor: testCharacter2, name: testCharacter2.name, id:testCharacter2.uuid}]),
		attackRollCount: 1,
	})

	const missedLog = D.missed(testWorkflowMiss)

	expect(missedLog).not.toBe(undefined)
	expect(missedLog[0][0].description).toBe("Dude (111) misses Dudette (112) with Thing")
	expect(missedLog[1].length).toBe(3)

	expect(D.hit(testWorkflowMiss)).toBe(undefined)
	// expect(D.hitSingle(testWorkflowMiss)).toBe(undefined)
	expect(D.saveHit(testWorkflowMiss)).toBe(undefined)
	expect(D.saveMiss(testWorkflowMiss)).toBe(undefined)
})

test("Test hit workflow", ()=>{
	const testWorkflowHit = getWorkflow({
		targets: new Set([{actor: testCharacter2, name: testCharacter2.name, id:testCharacter2.uuid}]),
		hitTargets: new Set([{actor: testCharacter2, name: testCharacter2.name, id:testCharacter2.uuid}]),
		attackRollCount: 1,
		damageRollCount: 1,
	})

	const HitLog = D.hit(testWorkflowHit)

	expect(HitLog).not.toBe(undefined)
	expect(HitLog[0][0].description).toBe("Dude (111) hits Dudette (112) with Thing")

	// expect(D.hitSingle(testWorkflowHit)).toBe(undefined)
	expect(D.missed(testWorkflowHit)).toBe(undefined)
	expect(D.saveHit(testWorkflowHit)).toBe(undefined)
	expect(D.saveMiss(testWorkflowHit)).toBe(undefined)
})

// test("Test hit 2 workflow", ()=>{
// 	const testWorkflowHit = getWorkflow({
// 		targets: new Set([{actor: testCharacter2, name: testCharacter2.name}]),
// 		hitTargets: new Set([{actor: testCharacter2, name: testCharacter2.name}]),
// 		damageList:[{appliedDamage: 1, newHP: 9}],
// 		attackRollCount: 1,
// 		damageRollCount: 1,
// 	})

// 	const HitLog = D.hit(testWorkflowHit)

// 	expect(HitLog).not.toBe(undefined)

// 	const Hit2Log = D.hitSingle(testWorkflowHit)
// 	expect(Hit2Log).not.toBe(undefined)

// 	expect(D.missed(testWorkflowHit)).toBe(undefined)
// 	expect(D.saveHit(testWorkflowHit)).toBe(undefined)
// 	expect(D.saveMiss(testWorkflowHit)).toBe(undefined)
// })

//MidiQOL.completeItemUse(canvas.tokens.controlled[0].actor.items.get('kccU0cngRTiFlfLu'))

// const testWorkflowAttackHitStep1 = {}
// const testWorkflowAttackHitStep2 = {}
// const testWorkflowAttackMiss = {}
// const testWorkflowAttackSaveSuccess = {}
// const testWorkflowAttackSaveFail = {}