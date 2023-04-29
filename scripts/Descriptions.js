const VERBOSE = false;

class D{

static DescriptionFunctions = [
	{priority: 20, func: D.saveHit},
	{priority: 20, func: D.saveMiss},
	// {priority: 10, func: D.hitSingle},
	{priority: 5,  func: D.hit},
	{priority: 5,  func: D.missed},
	{priority: 1,  func: D.useItem},
];

static CharacterDescriptionFunctions = [
	{priority: 20, func: D.DamageTaken},
	{priority: 20, func: D.HealTaken},
];

static actorObject(actor){
	return {
		id: actor.uuid,
		name: actor.name,
		description: actor.system.details.biography.value,
		data: actor,
	}
}

static itemObject(item){
	return {
		id: item.uuid,
		name: item.name,
		description: item.system.description.value,
		data: item,
	}
}



static missed(workflow){
	if (VERBOSE){
		console.log("missed")
	}
	let attackRolled = workflow.attackRollCount > 0;

	if (attackRolled && workflow.hitTargets.size == 0 && workflow.targets.size != 0){
		let targets = Array.from(workflow.targets.values())

		let targetObjects = targets.map((obj) => D.actorObject(obj.actor));
		return [
			[{
				id: workflow.id,
				description:`${workflow.actor.name} misses ${D.joinTargetNames(targets)} with ${workflow.item.name}`,
			}],
			[D.actorObject(workflow.actor), D.itemObject(workflow.item)].concat(targetObjects)
		]
	}

}

static hit(workflow){
	if (VERBOSE){
		console.log("hit")
	}
	let damageRolled = workflow.damageRollCount > 0;

	if (damageRolled && workflow.hitTargets.size != 0){
		let targets = Array.from(workflow.hitTargets.values())

		let ciritcalString = ""
		if (workflow.isCritical){
			ciritcalString = "critically "
		}

		let targetObjects = targets.map((obj) => D.actorObject(obj.actor));

		return [
			[{
				id: workflow.id,
				description:`${workflow.actor.name} ${ciritcalString}hits ${D.joinTargetNames(targets)} with ${workflow.item.name}`
			}],
			[D.actorObject(workflow.actor), D.itemObject(workflow.item)].concat(targetObjects)
		]
	}

}

static joinTargetNames(targets){
	if (targets.length == 0){
		// console.error("Got 0 Targets!")
		return "ERROR"
	}

	if (targets.length == 1){
		return targets[0].name;
	}
	
	if (targets.length == 2){
		return `${targets[0].name} and ${targets[1].name}`
	}

	return `${targets.slice(0, targets.length - 1).map(t => t.name).join(', ')} and, ${targets[targets.length - 1].name}`;
}

// static hitSingle(workflow){
// 	if (VERBOSE){
// 		console.log("hitSingle")
// 	}

// 	let damageRolled = workflow.damageRollCount > 0;

// 	if (damageRolled && workflow.damageList.length == 1 && workflow.hitTargets.size == 1){
// 		let target = workflow.hitTargets.values().next().value.actor;
// 		let dmg = workflow.damageList[0];

// 		let ciritcalString = ""
// 		if (workflow.isCritical){
// 			ciritcalString = "critically "
// 		}

// 		let damagePercent = Math.round(dmg.appliedDamage / target.system.attributes.hp.max * 100);
// 		let remainPercent = Math.round(dmg.newHP / target.system.attributes.hp.max * 100);

// 		return [
// 			[{
// 				id: workflow.id,
// 				description:`${workflow.actor.name} ${ciritcalString}hits ${target.name} with ${workflow.item.name} doing ${damagePercent}% of the targets health, leaving it with ${remainPercent}% health left`
// 			}],
// 			[D.actorObject(workflow.actor), D.actorObject(target), D.itemObject(workflow.item)]]
// 	}

// }

//A detail for 
static saveHit(workflow){
	if (VERBOSE){
		console.log("saveHit")
	}
	if (workflow.targets.size == 1 && workflow.failedSaves.size == 1 && workflow.hitTargets.size == 1 && workflow.saveResults.length > 0){
		let target = workflow.hitTargets.values().next().value.actor;

		return [
			[{
				id: workflow.id,
				description:`${target.name} gets hit by ${workflow.item.name} from ${workflow.actor.name}`
			}],
			[D.actorObject(workflow.actor), D.actorObject(target), D.itemObject(workflow.item)]]
	}
}

//A detail for 
static saveMiss(workflow){
	if (VERBOSE){
		console.log("saveMiss")
	}

	if (workflow.saves.size == 1 && workflow.targets.size == 1 && workflow.failedSaves.size == 0 && workflow.saveResults.length > 0){
		let target = workflow.hitTargets.values().next().value.actor;

		return [
			[{
				id: workflow.id,
				description:`${target.name} saves against ${workflow.item.name} from ${workflow.actor.name}`
			}],
			[D.actorObject(workflow.actor), D.actorObject(target), D.itemObject(workflow.item)]
		]
	}
}

static useItem(workflow){
	if (VERBOSE){
		console.log("Use Item")
	}

	return [
		[{
			id: workflow.id,
			description:`${workflow.actor.name} uses ${workflow.item.name}`
		}],
		[D.actorObject(workflow.actor), D.itemObject(workflow.item)]
	]
}

static DamageTaken(actor, delta){
	if (VERBOSE){
		console.log("DamageTaken")
	}

	if (delta?.dhp < 0){
		const damagePercent = Math.round(-delta.dhp / actor.system.attributes.hp.max * 100);
		const remainPercent = Math.round(actor.system.attributes.hp.value / actor.system.attributes.hp.max * 100);

		return [[{
			id: tempId++,
			description:`${actor.name} loses ${damagePercent}% of its health, leaving it with ${remainPercent}% health left`
		}],[
			D.actorObject(actor)
		]]
	}
}

static HealTaken(actor, delta){
	if (VERBOSE){
		console.log("HealTaken")
	}

	if (delta?.dhp > 0){
		const damagePercent = Math.round(delta.dhp / actor.system.attributes.hp.max * 100);
		const remainPercent = Math.round(actor.system.attributes.hp.value / actor.system.attributes.hp.max * 100);

		return [[{
			id: tempId++,
			description:`${actor.name} gains ${damagePercent}% of its health, health is now at ${remainPercent}%`
		}],[
			D.actorObject(actor)
		]]
	}
}

};

let tempId = 0;

export default D;
