function Thing(x,y){
	this.idx = -1;
	this.x = x;
	this.y = y;
	this.equips = {};
	this.buffs = [];
	this.stash = [];
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
			this.collide(colwith, true);
		}
		if (colwith.collide){
			colwith.collide(this, false);
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
Thing.prototype.attr = function(a){
	return (this.attrs[a] || 0) + (this["calc"+a] ? (this["calc"+a]() || 0) : 0) + this.scanAttrEnchant(a);
}
Thing.prototype.scanAttrEnchant(a){
	var r = 0;
	this.iterEnchants(function(x){
		if (x.type == "attr") r += x.val;
	});
	return r;
}
Thing.prototype.iterEnchants = function(func){
	for(var o in this.equips){
		this.equips[o].enchants.forEach(func, this);
	}
	this.buffs.forEach(function(buff){
		buff.enchants.forEach(func, this);
	}, this);
}
Thing.prototype.pickup = function(item){
	this.stash.push(item);
}
Thing.prototype.equip = function(item){
	var idx = this.stash.indexOf(item);
	if (~idx) this.stash.splice(idx, 1);
	var type = item.type;
	if (this.equips[type]) this.stash.push(this.equips[type]);
	this.equips[type] = item;
}
Thing.prototype.dequip = function(item){
	var idx = this.equips.indexOf(item);
	if (~idx) this.equips.splice(idx, 1);
}
Thing.prototype.dmg = function(n, data){
	if (this.onDmg){
		var r = this.onDmg(n, data);
		if (r !== undefined) n = r;
	}
	if (n > this.hp) n = this.hp;
	if (!(this.hp -= n)){
		if (this.onDeath){
			this.onDeath(n, data);
		}
		this.world.rm(this);
	}
}
Thing.prototype.attack = function(tgt){
	var r = this.world.rnd();
	if (r < .05) return 0;
	var srcdex = this.attr("dex"),
		dstdex = tgt.attr("dex"),
		dexdiff = srcdex - dstdex;
	var a = (20+Math.sqrt(Math.abs(dexdiff))*Math.sign(dexdiff))/40;
	if (a > r) tgt.dmg(this.attr("atk")+this.world.upto(this.attr("atkbonus")));
}
Thing.prototype.toJSON = function(isfollow){
	return this._toJSON({i:this.idx, x:this.x, y:this.y});
}
Thing.prototype._toJSON = function(data){
	return data;
}
module.exports = Thing;