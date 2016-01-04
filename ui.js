"use strict";
function ui(world){
	this.world = world;
	this.w = 32;
	this.h = 24;
	this.cx = 0;
	this.cy = 0;
	this.cw = 450/24;
	this.ch = 300/24;
	var terrains = getTerrainBuild();
	this.tiles = terrains[0].build(this.w, this.h);
}
module.exports = ui;
var gfx = require("./gfx");
var sock = require("./sock");
var TerrainType = require("./TerrainType");

function getTerrainBuild(){
	var r = [];
	r.push(new TerrainType(Math.random()*0x7fffffff, ["stone", "grass"], new Uint8Array([7, 3, 11, 5, 0, 10, 13, 12, 14, 8, 4, 2, 1, 6, 9, 15])));
	return r;
}
ui.prototype.getTile = function(x, y){
	return x>=0 && x<this.w && y>=0 && y<this.h ? this.tiles[x+y*this.w] : undefined;
}
ui.prototype.render = function(){
	if (!this.world.follow) return;
	this.cx = Math.max(Math.min(this.cx, this.world.follow.x+5.5), this.world.follow.x-6);
	this.cy = Math.max(Math.min(this.cy, this.world.follow.y+3), this.world.follow.y-4);
	var x1 = this.cx - this.cw/2, y1 = this.cy - this.ch/2,
		x2 = x1 + this.cw, y2 = y1 + this.ch;
	if (x2 > this.w){
		x1 = this.w - this.cw;
		x2 = this.w;
	}else if (x1<0){
		x1 = 0;
		x2 = this.cw;
	}
	if (y2 > this.h){
		y1 = this.h - this.ch;
		y2 = this.h;
	}else if (y1<0){
		y1 = 0;
		y2 = this.ch;
	}
	var ctx = gfx.ctx;
	ctx.begin(x1, y1, x2, y2);
	var fx1 = Math.floor(x1), fy1 = Math.floor(y1);
	for(var j=fy1; j<=y2; j++){
		for(var i=fx1; i<=x2; i++){
			var tij = this.getTile(i, j);
			if (tij) ctx.draw(tij, i, j);
		}
	}
	this.world.things.forEach(function(thing){
		if (thing.render) thing.render(ctx);
	});
	/*for(var j=fy1+1; j<=Math.min(y2+1, this.h); j++){
		for(var i=fx1; i<=x2; i++){
			var tij = this.getTile(i, j), tiu = this.getTile(i, j-1);
			if (tij && tiu && ~gfx.tiles.wall.indexOf(tij) && !~gfx.tiles.wall.indexOf(tiu)){
				ctx.draw(gfx.tiles.wall[gfx.tiles.wall.indexOf(tij)%3], i, j-1);
			}
		}
	}*/
	ctx.render();
}
ui.prototype.hookSocket = function(){
	var w = this.world;
	sock.et.onmessage = function(msg){
		var data = JSON.parse(msg.data);
		if (data._ == "m"){
			document.getElementById("tbox").textContent = msg.data;
		}else w.event(JSON.parse(msg.data));
	}
}
ui.prototype.hookControls = function(){
	var self = this;
	document.body.addEventListener("keydown", function(e){
		var ch = String.fromCharCode(e.keyCode);
		var dir = ch == "A" ? 2 :
			ch == "W" ? 1 :
			ch == "S" ? 3 :
			ch == "D" ? 0 : -1;
		if (~dir) sock.emit("m", {c:dir});
	});
	var lastmove = 0;
	document.addEventListener("mousemove", function(e){
		if (e.timeStamp - lastmove < 16){
			e.stopPropagation();
		}else{
			this.mx = e.clientX;
			this.my = e.clientY;
			lastmove = e.timeStamp;
		}
	});
}
ui.prototype.hookLoop = function(){
	var w = this;
	function anim(){
		w.render();
		requestAnimationFrame(anim);
	}
	anim();
}