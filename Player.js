"use strict";
module.exports = Player;
var Thing = require("./Thing");
var util = require("./util");
var gfx = require("./gfx");
function Player(){
	Thing.apply(this, arguments);
	this.hp = 10;
	this.quanta = new Uint8Array(12);
	this.cmd = null;
}
Player.prototype = Object.create(Thing.prototype);
Player.prototype.event = function(x){
	this.cmd = null;
	if (x === 0) this.move(1,0);
	else if (x === 1) this.move(0,-1);
	else if (x === 2) this.move(-1,0);
	else if (x === 3) this.move(0,1);
}
Player.prototype.render = function(ctx){
	ctx.draw(gfx.bird.down[0], this.x, this.y, false);
}
Player.prototype._toJSON = function(data){
	data.oid = 0;
	data.hp = this.hp;
	data.quanta = util.untypeArray(this.quanta);
	return data;
}