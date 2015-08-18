window.PIXI = require("./pixi");
var util = require("./util");
module.exports = function(canvas){
	require("./gfx").load(null, function(){
		var px = require("./px");
		px.init(canvas);
		var lv = new PIXI.Container();
		var world = new util.World(lv);
		var sock = require("./sock");
		sock.et.onmessage = function(msg){
			var data = JSON.parse(msg.data);
			world.event(data);
		}
		/*var player = new util.Player(2, 2);
		world.add(player);
		world.add(new util.Wall(2, 3));
		world.add(new util.Wall(2, 4));
		world.add(new util.Wall(2, 5));
		world.add(new util.Wall(3, 6));*/
		world.hookControls();
		var interval = setInterval(world.step.bind(world), 60);
		px.view({view:lv, endnext: function(){clearInterval(interval)}});
	});
}