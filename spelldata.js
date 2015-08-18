function mk(name, func, ){
}
function DAG(name){
	this.name = name;
	this.edges = [];
	this.deps = [];
	for(var i=1; i<arguments.length; i++){
		var node = arguments[i];
		this.edges.push(node);
		node.deps.push(this);
	}
}
function fairyDAG(){
	var steal = new DAG("Steal"),
		scramble = new DAG("Scramble"),
		nova = new DAG("Nova", scramble),
		storm = new DAG("Thunderstorm"),
		blitz = new DAG("Sky Blitz"),
		flyingweap = new DAG("Flying Weapon"),
		tornado = new DAG("Thunderstorm", steal),
		wind = new DAG("Scattering Wind", blitz, nova),
		shock = new DAG("Shockwave", storm),
		draft = new DAG("Draft", flyingweap, wind, tornado);
	return new DAG("Fairy", draft, shock);
}
function ulithDAG(){
	var tears = new DAG("Nymph's Tears"),
		protect = new DAG("Atlantis's Protection", tears),
		dryspell = new DAG("Dry Spell", tears),
		goo = new DAG("Gift of Oceanus", dryspell),
		purify = new DAG("Purify", protect, goo),
		icebolt = new DAG("Ice Bolt", dryspell),
		freeze = new DAG("Freeze", icebolt),
		unsummon = new DAG("Unsummon"),
		silence = new DAG("Silence", unsummon),
		lobo = new DAG("Lobotomize", lobo);
	return new DAG("Ulitharid", lobo, freeze);
}
exports.tree = {
	Fairy:fairyDAG(),
	Ulitharid:ulithDAG(),
}