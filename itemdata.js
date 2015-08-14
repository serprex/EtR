exports.weapon = {
	base:[
	{	name:"Sword",
		atk:3,
		dur:4,
	},
	{	name:"Hammer",
		atk:4,
		dur:3,
		spd:-1,
	},
	{	name:"Gavel",
		atk:9,
		dur:5,
		spd:-2,
	},
	],
	prefix:[
	{	name:"Short",
		spd:[1,2],
		atk:-1,
	},
	{	name:"Long",
		asp:[-1,-2],
		atk:2,
	},
	{	name:"Sharp",
		atk:[1,2]
	},
	{	name:"Durable",
		dur:1
	},
	{	name:"Cursed"
		dur:92,
		hp:[2,-4],
		atk:[2,-4],
		asp:[1,-2],
	},
	],
	suffix:[
	{	name:"Wrath",
		def:[0,-2],
		atk:[1,3],
		asp:[-1,1],
	},
	],
};
exports.armor = {
	base:[
		{	name:"Chainmail",
			def:3,
			def_projectile:-2,
			ban:"Cloth",
		},
	],
	prefix:[
	{	name:"Feint",
		def:[-1,-2],
		eva:[1,2],
	},
	[{	name:"Cloth",
		def:1,
	},
	{	name:"Iron",
		group:2,
		def:3,
	},
	{	name:"Bronze",
		def:4,
	}]
	],
	suffix:[
	{	name:"Fortitude",
		hp:[1,3],
	},
	{	name:"Tortoise",
		def:[3,6],
		spd:[-1,-5],
		asp:[0,-2],
	}
	],
];
exports.shield = {
	base:[
	],
	prefix:[
	],
	suffix[
	],
};
exports.consume = [
];
exports.generate = function(data, lv){
}