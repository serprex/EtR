"use strict";
var sock = require("./sock");
var gfx = require("./gfx");
function World(display){
	this.display = display;
	this.things = [];
	this.keys = [];
	var tiles = [];
	var ttype = ["stonegrass", "grass", "grass", "grass", "wall", "waterstone"];
	var wid = 20, hei = 15;
	for(var i=-1; i<wid+1; i++){
		tiles[i] = [];
		for(var j=-1; j<hei+1; j++){
			tiles[i].push(Math.floor(Math.random()*ttype.length));
		}
	}
	this.tiles = [];
	for(var i=0; i<wid; i++){
		this.tiles[i] = [];
		for(var j=0; j<hei; j++){
			var tt = ttype[tiles[i][j]];
			var t = 4;
			if (tt != "grass"){
				if (tiles[i][j] != tiles[i+1][j-1] && tt != "wall"){
					t = 2;
				}else if (tiles[i][j] != tiles[i-1][j-1] && tt != "wall"){
					t = 0;
				}else if (tiles[i][j] != tiles[i][j-1] && tt != "wall"){
					t = 1;
				}else if (tiles[i][j] != tiles[i][j+1]){
					t = 7;
				}else if (tiles[i][j] != tiles[i+1][j]){
					t = 5;
				}else if (tiles[i][j] != tiles[i-1][j]){
					t = 3;
				}else if (tiles[i][j] != tiles[i+1][j+1]){
					t = 8;
				}else if (tiles[i][j] != tiles[i-1][j+1]){
					t = 6;
				}
			}
			this.tiles[i].push(gfx["tiles_"+tt][t]);
		}
	}
}
World.prototype.add = function(obj, idx){
	obj.idx = idx;
	this.things[idx] = obj;
	obj.world = this;
}
World.prototype.rm = function(obj){
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
	this.fromArray(data.o);
}
World.prototype.fromArray = function(o){
	this.things.length = 0;
	o.forEach(function(data){
		console.log(data);
		this.add(os[data.oid].call(data), data.i);
	}, this);
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
	var ctx = gfx.begin();
	for(var i=0; i<this.tiles.length; i++){
		for(var j=0; j<this.tiles[i].length; j++){
			ctx.draw(this.tiles[i][j], i, j);
		}
	}
	this.things.forEach(function(thing){
		if (thing.render) thing.render(ctx);
	});
	for(var i=0; i<this.tiles.length; i++){
		for(var j=0; j<this.tiles[i].length; j++){
			if (~gfx.tiles_wall.indexOf(this.tiles[i][j]) && !~gfx.tiles_wall.indexOf(this.tiles[i][j-1])){
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