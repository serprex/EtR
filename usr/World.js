function World(){
	this.things = [];
	this.keys = [];
	this.follow = null;
	var tiles = [];
	this.w = 32;
	this.h = 24;
	this.cx = 0;
	this.cy = 0;
	this.cw = 450/24;
	this.ch = 300/24;
	var terrains = getTerrainBuild();
	this.tiles = terrains[0].build(this.w, this.h);/**/
}
module.exports = World;
var gfx = require("../gfx");
var sock = require("../sock");
var TerrainType = require("../TerrainType");
var Player = require("./Player");
var Wall = require("./Wall");

function getTerrainBuild(){
	var r = [];
	r.push(new TerrainType(["stone", "grass"], new Uint8Array([7, 3, 11, 5, 0, 10, 13, 12, 14, 8, 4, 2, 1, 6, 9, 15])));
	return r;
}
World.prototype.add = function(obj, idx){
	obj.idx = idx;
	this.things[idx] = obj;
	obj.world = this;
}
World.prototype.rm = function(obj){
	if (obj == this.follow) this.follow = null;
	delete this.things[obj.idx];
}
World.prototype.np = function(e){
	this.add(new Player(), e.i);
}
World.prototype.die = function(e){
	this.rm(e.things[e.i]);
}
World.prototype.event = function(e){
	if ("src" in e) this.things[e.src][e._](e);
	else if(e._ in this) this[e._](e);
}
World.prototype.step = function(){
	this.things.forEach(function(thing){
		if (thing.act) thing.act();
	});
}
var os = [function(){var p=new Player(this.x, this.y);p.hp=this.hp;p.quanta=this.quanta;return p;}, function(){return new Wall(this.x, this.y);}];
World.prototype.world = function(data){
	this.things.length = 0;
	data.o.forEach(function(obj){
		console.log(obj);
		var inst = os[obj.oid].call(obj);
		this.add(inst, obj.i);
	}, this);
	this.follow = this.things[data.f];
}
World.prototype.getTile = function(x, y){
	return x>=0 && x<this.w && y>=0 && y<this.h ? this.tiles[x+y*this.w] : undefined;
}
World.prototype.render = function(){
	if (!this.follow) return;
	this.cx = Math.max(Math.min(this.cx, this.follow.x+5.5), this.follow.x-6);
	this.cy = Math.max(Math.min(this.cy, this.follow.y+3), this.follow.y-4);
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
	this.things.forEach(function(thing){
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
World.prototype.hookControls = function(){
	var self = this;
	document.body.addEventListener("keydown", function(e){
		if (!self.keys[e.keyCode]) sock.userEmit("kd", {c:e.keyCode});
		self.keys[e.keyCode] = true;
	});
	document.body.addEventListener("keyup", function(e){
		if (self.keys[e.keyCode]) sock.userEmit("ku", {c:e.keyCode});
		self.keys[e.keyCode] = false;
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