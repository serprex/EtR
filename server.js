#!/bin/node
"use strict";
require("./srv/gfx");
var util = require("./util");
var sutil = require("./srv/sutil");
var World = require("./World");
var Wall = require("./Wall");
var app = require("connect")().
	use(require("compression")()).
	use(require("serve-static")(__dirname, { maxAge: 2626262000 }));
var Globe = new World();
Globe.add(new Wall(2, 3));
Globe.add(new Wall(2, 4));
Globe.add(new Wall(2, 5));
Globe.add(new Wall(3, 6));
var wss = new (require("ws/lib/WebSocketServer"))({server:app.listen(80)});
sutil.wss = wss;
wss.on("connection", function(socket){
	socket.meta = {};
	socket.meta.player = Globe.createPlayer();
	socket.on("close", function(){
		Globe.rm(this.meta.player);
	});
	socket.on("message", function(rawdata){
		var data = util.parseJSON(rawdata);
		if (!data) return;
		console.log(data, this.meta.player.x, this.meta.player.y);
		if (data._ == "m"){
			this.meta.player.cmd = data.c;
			sutil.emit(this, "m", data);
			var turn = Globe.queryExecute();
			console.log(turn);
			if (turn){
				Globe.event({_:"M", d:turn});
				sutil.broadcast("M", {d:turn});
			}
		}
	});
	var json = Globe.toJSON(socket.meta.player);
	console.log(json);
	sutil.emit(socket, "world", json);
});
