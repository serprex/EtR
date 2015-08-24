"use strict";
var sock = require("./sock");
var gfx = require("./gfx");
function choose(a){
	return a[Math.random()*a.length|0];
}
//[[],type]]
function TerrainType(tts, tbl){
	this.tts = tts;
	this.tbl = tbl;
	this.aroundlist = null;
}
TerrainType.prototype.build = function(w, h, x, y){
	x = (x || w/2)|0;
	y = (y || h/2)|0;
	var tiles = new Array(w);
	for(var i=0; i<w; i++){
		tiles[i] = new Array(h);
	}
	tiles[x][y] = 0;
	this.aroundlist = [];
	this.generate(tiles, x, y);
	for(var i=0; i<w; i++){
		for(var j=0; j<h; j++){
			if (tiles[i][j] == undefined){
				tiles[i][j] = gfx["tiles_wall"][4];
			}else if (tiles[i][j] == 63){
				tiles[i][j] = gfx["tiles_waterstone"][4];
			}else if (!(tiles[i][j]&1)){
				tiles[i][j] = gfx["tiles_"+this.tts[0]+this.tts[1]][tiles[i][j]>>1];
			}else{
				tiles[i][j] = gfx["tiles_"+this.tts[1]][4];
			}
		}
	}
	this.aroundlist = null;
	return tiles;
}
TerrainType.prototype.generateAround = function(tiles, x, y){
	for(var i=-1; i<2; i++){
		for(var j=-1; j<2; j++){
			if (x == 0 && y == 0) continue;
			var nx = x+i, ny = y+j;
			if (boundCheck(tiles, nx, ny) && tiles[nx][ny] == 0){
				this.generate(tiles, nx, ny);
			}
		}
	}
}
function getTile(tiles, x, y){
	if (boundCheck(tiles, x, y) && tiles[x][y] != undefined) return tiles[x][y]&1;
}
function getType(tiles, x, y, tbl){
	if (boundCheck(tiles, x, y) && tiles[x][y] != undefined){
		var txy = tiles[x][y];
		return (txy&1) ? 15 : tbl[txy>>1];
	}
}
function setTile(tiles, x, y, t){
	if (boundCheck(tiles, x, y)) return tiles[x][y] = t;
}
function boundCheck(tiles, x, y){
	return !(x<0 || y<0 || x>=tiles.length || y>=tiles[x].length);
}
function cmpWE(w, e){
	return !(w&2) == !(e&1) && !(w&8) == !(e&4);
}
function cmpNS(n, s){
	return !(n&4) == !(s&1) && !(n&8) == !(s&2);
}
function cmpXY(dx, dy, t1, t2){
	if (dx == -1 && dy == -1) return !(t1&1) == !(t2&8);
	if (dx == -1 && dy == 0) return cmpWE(t1, t2);
	if (dx == -1 && dy == 1) return !(t1&2) == !(t2&4);
	if (dx == 0 && dy == -1) return cmpNS(t1, t2);
	if (dx == 0 && dy == 1) return cmpNS(t2, t1);
	if (dx == 1 && dy == -1) return !(t1&4) == !(t2&2);
	if (dx == 1 && dy == 0) return cmpWE(t2, t1);
	if (dx == 1 && dy == 1) return !(t1&8) == !(t2&1);
}
TerrainType.prototype.generate = function(tiles, x, y){
	var candidates = [];
	tblscan:
	for(var j=0; j<this.tbl.length; j++){
		var a = this.tbl[j];
		for(var i=0; i<8; i++){
			var ii = i+(i>=4);
			//if (!(ii&1)) continue;
			var nx = x+(ii%3)-1, ny = y+(ii/3|0)-1;
			var gt = getType(tiles, nx, ny, this.tbl);
			if (gt != undefined && !cmpXY(x-nx, y-ny, a, gt)){
				continue tblscan;
			}
		}
		candidates.push([a, j]);
	}
	for(var i=0; i<8; i++){
		var ii = i+(i>=4);
		//if (!(ii&1)) continue;
		var nx = x+(ii%3)-1, ny = y+(ii/3|0)-1;
		var gt = getType(tiles, nx, ny, this.tbl);
		if (gt != undefined && !cmpXY(x-nx, y-ny, 15, gt)){
			break;
		}
	}
	if (i == 8) candidates.push([15, -1]);
	var chosen = choose(candidates);
	console.log(candidates.length, candidates, chosen);
	if(chosen){
		if (chosen[1] == -1) tiles[x][y] = 31;
		else tiles[x][y] = chosen[1]<<1;
		var gen = [];
		for(var i=0; i<8; i++){
			var ii = i+(i>=4);
			var nx = x+(ii%3)-1, ny = y+(ii/3|0)-1;
			if (boundCheck(tiles, nx, ny) && tiles[nx][ny] == undefined){
				this.generate(tiles, nx, ny);
			}
		}
	}else tiles[x][y] = 63;
}
TerrainType.prototype.generateLoop = function(tiles){
	while (this.aroundlist.length){
		var y=this.aroundlist.pop(), x=this.aroundlist.pop();
		this.generateAround(tiles, x, y);
	}
}
function World(){
	this.things = [];
	this.keys = [];
	this.follow = null;
	var tiles = [];
	this.w = 60;
	this.h = 60;
	this.cw = 450/24;
	this.ch = 300/24;
	var terrains = getTerrainBuild();
	this.tiles = terrains[0].build(this.w, this.h, 2, 2);/**/
	/*
	var ttype = ["stonegrass", "grass", "grass", "grass", "wall", "waterstone"];
	for(var i=0; i<this.w; i++){
		tiles[i] = [];
		for(var j=0; j<this.h; j++){
			tiles[i].push(Math.floor(Math.random()*ttype.length));
		}
	}
	this.tiles = [];
	for(var i=0; i<this.w; i++){
		this.tiles[i] = [];
		for(var j=0; j<this.h; j++){
			var tij = tiles[i][j];
			var tt = ttype[tij];
			var t = 4;
			if (tt != "grass"){
				xyiter:
				for(var x=-1; x<=1; x++){
					for(var y=-1;y<=1;y++){
						var nx = i+x, ny=j+y;
						if (nx>-1 && this.nx<this.w && ny>-1 && ny<this.h && tij != tiles[nx][ny] && !(y == -1 && tt == "wall")){
							t = (x+1)+(y+1)*3;
							break xyiter;
						}
					}
				}
			}
			this.tiles[i].push(gfx["tiles_"+tt][t]);
		}
	}/**/
}
function getTerrainBuild(){
	var r = [];
	r.push(new TerrainType(["stone", "grass"], [7, 3, 11, 5, 0, 10, 13, 12, 14, 8, 4, 2, 1]));
	return r;
}
World.prototype.add = function(obj, idx){
	obj.idx = idx;
	this.things[idx] = obj;
	obj.world = this;
}
World.prototype.rm = function(obj){
	if (obj == this.follow) this.follow = null;
	delete this.things[obj.idx];
}
World.prototype.np = function(e){
	this.add(new Player(), e.i);
}
World.prototype.die = function(e){
	this.rm(e.things[e.i]);
}
World.prototype.event = function(e){
	if ("src" in e) this.things[e.src][e._](e);
	else if(e._ in this) this[e._](e);
}
function Thing(x,y){
	this.idx = -1;
	this.setpos(x||-1, y||-1);
}
function Player(){
	this.gfx = gfx.birddown[0];
	Thing.apply(this, arguments);
	this.hp = 10;
	this.frame = 0;
	this.quanta = new Uint8Array(12);
	this.dir = 3;
}
function Wall(){
	Thing.apply(this, arguments);
}
Player.prototype = Object.create(Thing.prototype);
Wall.prototype = Object.create(Thing.prototype);
Wall.prototype.solid = true;
World.prototype.hookControls = function(){
	var self = this;
	document.body.addEventListener("keydown", function(e){
		if (!self.keys[e.keyCode]) sock.userEmit("kd", {c:e.keyCode});
		self.keys[e.keyCode] = true;
	});
	document.body.addEventListener("keyup", function(e){
		if (self.keys[e.keyCode]) sock.userEmit("ku", {c:e.keyCode});
		self.keys[e.keyCode] = false;
	});
	var lastmove = 0;
	document.addEventListener("mousemove", function(e){
		if (e.timeStamp - lastmove < 16){
			e.stopPropagation();
		}else{
			this.mx = e.clientX;
			this.my = e.clientY;
			lastmove = e.timeStamp;
		}
	});
}
var pafps = 32/60;
var dirname = ["side", "up", "side", "down"];
Player.prototype.act = function(){
	this.frame += pafps;
	var g = gfx["bird"+dirname[this.dir]];
	if (this.frame >= g.length) this.frame -= g.length;
	this.gfx = g[Math.floor(this.frame)];
}
World.prototype.step = function(){
	this.things.forEach(function(thing){
		if (thing.act) thing.act();
	});
}
var os = [function(){var p=new Player(this.x, this.y);p.hp=this.hp;p.quanta=this.quanta;return p;}, function(){return new Wall(this.x, this.y);}];
World.prototype.world = function(data){
	this.things.length = 0;
	data.o.forEach(function(obj){
		console.log(obj);
		var inst = os[obj.oid].call(obj);
		this.add(inst, obj.i);
	}, this);
	this.follow = this.things[data.f];
}
Player.prototype._setpos = function(x,y){
	this.dir = x>this.x?0:y<this.y?1:x<this.x?2:3;
}
Thing.prototype.setpos = function(x,y){
	if (arguments.length == 1){
		y = x.y/24;
		x = x.x/24;
	}
	if (this._setpos) this._setpos(x, y);
	this.x = x;
	this.y = y;
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
		if (thing != this && thing.solid && x+1>thing.x && x<thing.x+1 && y+1>thing.y && y<thing.y+1) return thing;
	}
}
World.prototype.render = function(){
	if (!this.follow) return;
	var x1 = this.follow.x - this.cw/2, y1 = this.follow.y - this.ch/2,
		x2 = x1 + this.cw, y2 = y1 + this.ch;
	if (x2 > this.w){
		x1 = this.w - this.cw;
		x2 = this.w;
	}else if (x1<0){
		x1 = 0;
		x2 = this.cw;
	}
	if (y2 > this.h){
		y1 = this.h - this.ch;
		y2 = this.h;
	}else if (y1<0){
		y1 = 0;
		y2 = this.ch;
	}
	var ctx = gfx.ctx;
	ctx.begin(x1, y1, x2, y2);
	var fx1 = Math.floor(x1), fy1 = Math.floor(y1);
	for(var i=fx1; i<=x2; i++){
		for(var j=fy1; j<=y2; j++){
			if (this.tiles[i] && this.tiles[i][j]) ctx.draw(this.tiles[i][j], i, j);
		}
	}
	this.things.forEach(function(thing){
		if (thing.render) thing.render(ctx);
	});
	for(var i=fx1; i<=x2; i++){
		for(var j=fy1+1; j<=Math.min(y2+1, this.h); j++){
			if (this.tiles[i] && this.tiles[i][j] && this.tiles[i][j-1] &&
				~gfx.tiles_wall.indexOf(this.tiles[i][j]) && !~gfx.tiles_wall.indexOf(this.tiles[i][j-1])){
				ctx.draw(gfx.tiles_wall[gfx.tiles_wall.indexOf(this.tiles[i][j])%3], i, j-1);
			}
		}
	}
	ctx.render();
}
Player.prototype.render = function(ctx){
	ctx.draw(this.gfx, this.x, this.y, this.dir == 0);
}
exports.World = World;
exports.Thing = Thing;
exports.Player = Player;
exports.Wall = Wall;