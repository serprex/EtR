var sutil = require("./sutil");
function Thing(x,y){
	this.idx = -1;
	this.x = x;
	this.y = y;
}
Thing.prototype.fire = function(cmd, data){
	if (!data) data = {};
	data.src = this.idx;
	sutil.broadcast(cmd, data);
}
Thing.prototype.setpos = function(x, y){
	this.x = x;
	this.y = y;
	this.fire("setpos", {x:(x*24)|0, y:(y*24)|0});
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
		if (thing && thing != this && thing.solid && x+1>thing.x && x<thing.x+1 && y+1>thing.y && y<thing.y+1) return thing;
	}
}
Thing.prototype.toJSON = function(){
	return this._toJSON({i:this.idx, x:this.x, y:this.y});
}
module.exports = Thing;