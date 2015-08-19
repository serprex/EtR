var util = require("./util");
module.exports = function(canvas){
	var gfx = require("./gfx");
	gfx.load(canvas, function(){
		var px = require("./px");
		/*var lv = new PIXI.Container();
		for(var i=0; i<10; i++){
			for(var j=0; j<10; j++){
				var t = new PIXI.Sprite(gfx.tiles);
				t.position.set(i*144, j*144);
				t.scale.set(2, 2);
				lv.addChild(t);
			}
		}*/
		var world = new util.World();
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
		function anim(){
			world.render();
			requestAnimationFrame(anim);
		}
		anim();
	});
}