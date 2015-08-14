"use strict";
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
World.prototype.createPlayer = function(){
	var Player = require("./Player");
	var p = new Player(0, 0);
	this.add(p);
	sutil.broadcast("np", {i:p.idx});
	return p;
}
World.prototype.step = function(){
	this.things.forEach(function(thing){
		if (thing && thing.act) thing.act();
	});
}
World.prototype.toJSON = function(){
	var o = [];
	this.things.forEach(function(thing){
		o.push(thing.toJSON());
	});
	return {o:o};
}
module.exports = World;