function Thing(x,y){
	this.idx = -1;
	this.x = x;
	this.y = y;
}
Thing.prototype.solid = false;
Thing.prototype.setpos = function(x, y){
	this.x = x;
	this.y = y;
}
Thing.prototype.move = function(dx, dy){
	var colwith = this.colcheck(this.x+dx, this.y+dy);
	if (!colwith){
		this.setpos(this.x+dx, this.y+dy);
	}else{
		if (this.collide){
			this.collide(colwith);
		}
		if (colwith.collide){
			colwith.collide(this);
		}
		if (colwith.idx == -1) this.move(dx, dy);
	}
}
Thing.prototype.colcheck = function(x, y){
	var things = this.world.things;
	for(var i=0; i<things.length; i++){
		var thing = things[i];
		if (thing && thing.solid && thing != this && x == thing.x && y == thing.y) return thing;
	}
}
Thing.prototype.toJSON = function(isfollow){
	return this._toJSON({i:this.idx, x:this.x, y:this.y});
}
Thing.prototype._toJSON = function(data){
	return data;
}
module.exports = Thing;