var usercmd = require("./usercmd");
var socket = new WebSocket("ws://"+location.hostname);
var buffer = [];
var attempts = 0, attemptTimeout = 0;
exports.user = {name:"", auth:""};
socket.onopen = function(){
	attempts = 0;
	if (attemptTimeout){
		clearTimeout(attemptTimeout);
		attemptTimeout = 0;
	}
	buffer.forEach(this.send, this);
	buffer.length = 0;
}
socket.onclose = function(){
	if (attemptTimeout) return;
	if (attempts < 8) attempts++;
	var timeout = 99+Math.floor(99*Math.random())*attempts;
	attemptTimeout = setTimeout(function(){
		attemptTimeout = 0;
		var oldsock = socket;
		exports.et = socket = new WebSocket("ws://"+location.hostname);
		socket.onopen = oldsock.onopen;
		socket.onclose = oldsock.onclose;
		socket.onmessage = oldsock.onmessage;
	}, timeout);
}
exports.et = socket;
exports.userEmit = function(x, data) {
	if (!data) data = {};
	data.u = exports.user.name;
	data.a = exports.user.auth;
	exports.emit(x, data);
}
exports.emit = function(x, data){
	if (!data) data = {};
	data._ = x;
	var msg = JSON.stringify(data);
	if (socket && socket.readyState == 1){
		socket.send(msg);
	}else{
		buffer.push(msg);
	}
}
exports.userExec = function(x, data){
	if (!data) data = {};
	exports.userEmit(x, data);
	usercmd[x](data, exports.user);
}
exports.prepuser = function(){
}