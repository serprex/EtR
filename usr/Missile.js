"use strict";
function Missile(){
}
module.exports = Missile;
var Thing = require("./Thing");
var gfx = require("../gfx");

Missile.prototype = Object.create(Thing.prototype);
Missile.prototype.render = function(ctx){
	ctx.draw(gfx.tiles.water.rock, this.x, this.y);
}
