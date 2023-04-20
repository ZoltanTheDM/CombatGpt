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
	system:{details:{biography: {value: "Some Description 2"}}}
}

test('characterObject', () => {
	let i = D.actorObject(testCharacter);

	expect(i.id).toBe("111");
	expect(i.name).toBe("Dude");
	expect(i.description).toBe("Some Description 2");
});

test("Join Taget Names" , ()=>{
	expect(D.joinTargetNames([{name: "Jo"}]) ).toBe("Jo");
	expect(D.joinTargetNames([{name: "Jo"}, {name: "Bob"}]) ).toBe("Jo and Bob");
	expect(D.joinTargetNames([{name: "Jo"}, {name: "Bob"}, {name: "Norton"}]) ).toBe("Jo, Bob and, Norton");
	expect(D.joinTargetNames([])).toBe("ERROR");
});

