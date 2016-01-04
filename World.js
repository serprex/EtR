"use strict";
module.exports = World;
var Player = require("./Player");
var Foe = require("./Foe");
var Wall = require("./Wall");
var Missile = require("./Missile");

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
	this.freeslots.push(obj.idx);
	this.things[obj.idx] = null;
	obj.idx = -1;
}
World.prototype.createPlayer = function(socket){
	var p = new Player(0, 0);
	this.add(p);
	return p;
}
World.prototype.createFoe = function(){
	var f = new Foe(10, 10);
	this.add(f);
	return f;
}
World.prototype.createMissile = function(x, y, dx, dy){
	var m = new Missile(x, y, dx, dy);
	this.add(m);
	return m;
}
World.prototype.queryExecute = function(){
	var cmds = [];
	var decided = this.things.every(function(o){
		if (!(o instanceof Player)) return true;
		console.log(o);
		if (o.cmd === null) return false;
		cmds.push(o.idx, o.cmd);
		return true;
	});
	return decided && cmds;
}
World.prototype.event = function(data){
	var ev = Events[data._];
	if (ev) ev.call(this, data);
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
var os = [
	function(){ //0
		var p=new Player(this.x, this.y);
		p.hp=this.hp;
		p.quanta=this.quanta;
		return p;
	}, function(){ //1
		return new Wall(this.x, this.y);
	}, function() { //2
		var f = new Foe(this.x, this.y);
		f.hp = this.hp;
		return f;
	}, function() { //3
		var m = new Missile(this.x, this.y, this.dx, this.dy);
		return m;
	},
];
var Events = {
	world:function(data){
		this.things.length = 0;
		data.o.forEach(function(obj){
			console.log(obj);
			var inst = os[obj.oid].call(obj);
			this.add(inst, obj.i);
		}, this);
		this.follow = this.things[data.f];
	},
	M:function(data){
		console.log(data);
		var d = data.d;
		for(var i=0,l=d.length; i<l; i+=2){
			var oid = d[i], o = this.things[oid];
			if (o) o.event(d[i+1]);
		}
		this.things.forEach(function(thing, idx){
			if (thing && thing.act) thing.act();
		});
	},
};