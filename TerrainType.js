function TerrainType(tts, tbl){
	this.tts = tts;
	this.tbl = tbl;
	this.tiles = null;
	this.w = 0;
	this.h = 0;
}
module.exports = TerrainType;
var gfx = require("./gfx");
var util = require("./util");

TerrainType.prototype.build = function(w, h){
	this.tiles = new Uint16Array(w*h);
	this.w = w;
	this.h = h;
	require("lvutil/wall_random")(this.tiles, w, h, 60001, .05);
	for(var j=0; j<this.h; j++){
		for(var i=0; i<this.w; i++){
			if (this.get(i, j) == 0) this.generate(i, j);
		}
	}
	var tiles = new Array(w*h);
	for(var j=0; j<this.h; j++){
		for(var i=0; i<this.w; i++){
			var idx = i+j*this.w;
			var txy = this.tiles[idx];
			if (txy == 0){
				tiles[idx] = gfx.tiles.wall[1];
			}else if (txy == 65535){
				tiles[idx] = gfx.tiles.water.stone[4];
			}else if (txy == 60001){
				tiles[idx] = gfx.tiles.wall[7];
			}else if (txy == 31){
				tiles[idx] = util.choose(gfx.tiles[this.tts[1]]);
			}else{
				tiles[idx] = gfx.tiles[this.tts[0]][this.tts[1]][txy>>1];
			}
		}
	}
	return tiles;
}
TerrainType.prototype.get = function(x, y){
	return this.bounds(x, y) ? this.tiles[x+y*this.w] : 0;
}
TerrainType.prototype.set = function(x, y, a){
	this.tiles[x+y*this.w] = a;
}
TerrainType.prototype.getType = function(x, y){
	var txy = this.get(x, y);
	return txy == 0 ? -1 : this.tbl[txy>>1];
}
TerrainType.prototype.bounds = function(x, y){
	return !(x<0 || y<0 || x>=this.w || y>=this.h);
}
function cmpWE(w, e){
	return !(w&2) == !(e&1) && !(w&8) == !(e&4);
}
function cmpNS(n, s){
	return !(n&4) == !(s&1) && !(n&8) == !(s&2);
}
function getCorner(t, x, y){
	return !!(t&(x?(y?8:2):(y?4:1)));
}
function cmpCorner(t1, x1, y1, t2, x2, y2){
	return t2 == -1 || t2 == 60001 || getCorner(t1, x1, y1) == getCorner(t2, x2, y2);
}
TerrainType.prototype.isValid = function(x, y, tt){
	for(var i=0; i<2; i++){
		for(var j=0; j<2; j++){
			var c = getCorner(tt, i, j);
			if (i == 0){
				if (j == 0){
					var t1 = this.getType(x-1, y), t2 = this.getType(x-1, y-1), t3 = this.getType(x, y-1);
					if(!(cmpCorner(tt, i, j, t1, 1, 0) && cmpCorner(tt, i, j, t2, 1, 1) && cmpCorner(tt, i, j, t3, 0, 1))) return false;
				}else{
					var t1 = this.getType(x-1, y), t2 = this.getType(x-1, y+1), t3 = this.getType(x, y+1);
					if(!(cmpCorner(tt, i, j, t1, 1, 1) && cmpCorner(tt, i, j, t2, 1, 0) && cmpCorner(tt, i, j, t3, 0, 0))) return false;
				}
			}else{
				if (j == 0){
					var t1 = this.getType(x, y-1), t2 = this.getType(x+1, y-1), t3 = this.getType(x+1, y);
					if(!(cmpCorner(tt, i, j, t1, 1, 1) && cmpCorner(tt, i, j, t2, 0, 1) && cmpCorner(tt, i, j, t3, 0, 0))) return false;
				}else{
					var t1 = this.getType(x+1, y), t2 = this.getType(x+1, y+1), t3 = this.getType(x, y+1);
					if(!(cmpCorner(tt, i, j, t1, 0, 1) && cmpCorner(tt, i, j, t2, 0, 0) && cmpCorner(tt, i, j, t3, 1, 0))) return false;
				}
			}
		}
	}
	return true;
}
TerrainType.prototype.generate = function(x, y){
	var candidates = [];
	tblscan:
	for(var j=0; j<this.tbl.length; j++){
		if (this.isValid(x, y, this.tbl[j])) candidates.push(j);
	}
	var chosen = util.choose(candidates);
	if(chosen != undefined){
		this.set(x, y, chosen<<1|1);
	}else this.set(x, y, -1);
}
module.exports = TerrainType;