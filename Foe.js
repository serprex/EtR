"use strict";
module.exports = Foe;
var Thing = require("./Thing");
var util = require("./util");
function Foe(){
	Thing.apply(this, arguments);
	this.hp = 10;
	this.dir = Math.floor(Math.random()*4);
	this.dirtime = 0;
	this.dirtimes = new Uint16Array([0xffff,0xffff,0xffff,0xffff]);
}
Foe.prototype = Object.create(Thing.prototype);
Foe.prototype.act = function(){
	this.dirtime++;
	if (this.dirtime > 10 && Math.random() > .1){
		var d = Math.floor(Math.random()*util.sum(this.dirtimes));
		var dir;
		for(var i=0; i<4; i++){
			d -= this.dirtimes[i];
			if (d <= 0){
				dir = i;
				break;
			}
		}
		this.dir = dir;
		this.dirtime = 0;
	}
	this.dirtimes[this.dir]--;
	var dx = (this.dir == 0)-(this.dir == 1), dy = (this.dir == 2)-(this.dir == 3);
	this.move(dx, dy);
}
Foe.prototype._toJSON = function(data){
	data.oid = 2;
	data.hp = this.hp;
	return data;
}
