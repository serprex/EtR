"use strict";
var sock = require("./sock");
function World(display){
	this.display = display;
	this.things = [];
	this.keys = [];
}
World.prototype.add = function(obj, idx){
	if (obj.gfx) this.display.addChild(obj.gfx);
	obj.idx = idx;
	this.things[idx] = obj;
	obj.world = this;
}
World.prototype.rm = function(obj){
	delete this.things[obj.idx];
	if (obj.gfx) this.display.removeChild(obj.gfx);
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
function Thing(x,y){
	this.idx = -1;
	this.setpos(x||-1, y||-1);
}
function Player(){
	this.gfx = new PIXI.Graphics();
	this.gfx.beginFill(0x336699);
	this.gfx.drawRect(0, 0, 24, 24);
	Thing.apply(this, arguments);
	this.hp = 10;
	this.quanta = new Uint8Array(12);
}
function Wall(){
	this.gfx = new PIXI.Graphics();
	this.gfx.beginFill(0x443333);
	this.gfx.drawRect(0, 0, 24, 24);
	Thing.apply(this, arguments);
}
Player.prototype = Object.create(Thing.prototype);
Wall.prototype = Object.create(Thing.prototype);
Wall.prototype.solid = true;
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
}
World.prototype.step = function(){
	this.things.forEach(function(thing){
		if (thing.act) thing.act();
	});
}
var os = [function(){var p=new Player(this.x, this.y);p.hp=this.hp;p.quanta=this.quanta;return p;}, function(){return new Wall(this.x, this.y);}];
World.prototype.world = function(data){
	this.fromArray(data.o);
}
World.prototype.fromArray = function(o){
	this.things.forEach(function(obj){if (obj.gfx) this.display.removeChild(obj.gfx);}, this);
	this.things.length = 0;
	o.forEach(function(data){
		console.log(data);
		this.add(os[data.oid].call(data), data.i);
	}, this);
}
Thing.prototype.setpos = function(x,y){
	if (arguments.length == 1){
		this.x = x.x;
		this.y = x.y;
	}else{
		this.x = x;
		this.y = y;
	}
	this.gfx.position.set(this.x*24, this.y*24);
}
Thing.prototype.move = function(dx, dy){
	var colwith = this.colcheck(this.x+dx, this.y+dy);
	if (!colwith){
		this.setpos(this.x+dx, this.y+dy);
	}else{
		var ndx = 0, ndy = 0;
		if (this.x+dx+1>colwith.x) ndx = colwith.x-(this.x+1);
		//else if (this.x+dx<colwith.x+1) ndx = (colwith.x+1)-this.x;
		if (this.y+dy+1>colwith.y) ndy = colwith.y-(this.y+1);
		if (Math.abs(ndx) > Math.abs(dx)) ndx = 0;
		if (Math.abs(ndy) > Math.abs(dy)) ndy = 0;
		this.setpos(this.x+ndx, this.y+ndy);
	}
}
Thing.prototype.colcheck = function(x, y){
	var things = this.world.things;
	for(var i=0; i<things.length; i++){
		var thing = things[i];
		if (thing != this && thing.solid && x+1>thing.x && x<thing.x+1 && y+1>thing.y && y<thing.y+1) return thing;
	}
}
exports.World = World;
exports.Thing = Thing;
exports.Player = Player;
exports.Wall = Wall;