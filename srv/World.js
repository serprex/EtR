"use strict";
module.exports = World;
var sutil = require("./sutil");
function World(){
	this.things = [];
	this.freeslots = [];
}
World.prototype.add = function(obj){
	if (this.freeslots.length){
		var idx = this.freeslots.pop();
		obj.idx = idx;
		this.things[idx] = obj;
	}else{
		obj.idx = this.things.length;
		this.things.push(obj);
	}
	obj.world = this;
}
World.prototype.rm = function(obj){
	sutil.broadcast("die", {i:obj.idx});
	this.freeslots.push(obj.idx);
	this.things[obj.idx] = null;
	obj.idx = -1;
}
World.prototype.createPlayer = function(socket){
	var Player = require("./Player");
	var p = new Player(0, 0);
	this.add(p);
	sutil.broadcast("np", {i:p.idx}, socket);
	return p;
}
World.prototype.createFoe = function(){
	var Foe = require("./Foe");
	var f = new Foe(10, 10);
	this.add(f);
	sutil.broadcast("nf", {x:f.x, y:f.y, i:f.idx});
	return f;
}
World.prototype.createMissile = function(x, y, dx, dy){
	var Missile = require("./Missile");
	var m = new Missile(x, y, dx, dy);
	this.add(m);
	sutil.broadcast("nm", {x:x, y:y, dx:dx, dy:dy, i:m.idx});
	return m;
}
World.prototype.step = function(){
	this.things.forEach(function(thing){
		if (thing && thing.act) thing.act();
	});
}
World.prototype.toJSON = function(player){
	var data = {o:[]};
	this.things.forEach(function(thing, idx){
		if (thing){
			var json = thing.toJSON();
			if (thing == player) data.f = idx;
			data.o.push(json);
		}
	});
	return data;
}