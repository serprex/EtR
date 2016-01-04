"use strict";
function Missile(x, y, dx, dy){
	Thing.apply(this, arguments);
	this.dx = dx;
	this.dy = dy;
}
module.exports = Missile;
var Thing = require("./Thing");

Missile.prototype = Object.create(Thing.prototype);
Missile.prototype.act = function(){
	this.move(this.dx, this.dy);
}
Missile.prototype._toJSON = function(data){
	data.oid = 3;
	data.dx = this.dx;
	data.dy = this.dy;
}
