"use strict";
module.exports = Player;
var Thing = require("./Thing");
var sutil = require("./sutil");
function Player(){
	Thing.apply(this, arguments);
	this.hp = 10;
	this.quanta = new Uint8Array(12);
	this.keys = [];
}
Player.prototype = Object.create(Thing.prototype);
Player.prototype.act = function(){
	var dx = (this.keys[68]||0)-(this.keys[65]||0), dy = (this.keys[83]||0)-(this.keys[87]||0);
	if (dx || dy){
		var m = (dx&&dy?480*Math.sqrt(2):480)/32;
		this.move(dx/m, dy/m);
	}
	if (this.keys[70]){
		this.world.createFoe();
	}
}
Player.prototype._toJSON = function(data){
	data.oid = 0;
	data.hp = this.hp;
	data.quanta = sutil.untypeArray(this.quanta);
	return data;
}