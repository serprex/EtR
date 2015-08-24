var util = require("./util");
module.exports = function(canvas){
	var gfx = require("./gfx");
	gfx.load(canvas, function(){
		var px = require("./px");
		var world = new util.World();
		var sock = require("./sock");
		sock.et.onmessage = function(msg){
			var data = JSON.parse(msg.data);
			world.event(data);
		}
		world.hookControls();
		var interval = setInterval(world.step.bind(world), 60);
		function anim(){
			world.render();
			requestAnimationFrame(anim);
		}
		anim();
	});
}