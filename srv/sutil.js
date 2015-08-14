exports.parseJSON = function(str){
	try{
		return JSON.parse(str);
	}catch(e){
		return null;
	}
}
exports.untypeArray = function(a){
	return a.length == 1 ? [a[0]] : Array.apply(null, a);
}
exports.emit = function(sock, cmd, data){
	var wss = exports.wss;
	if (wss && sock.readyState == 1){
		if (!data) data = {};
		data._ = cmd;
		var msg = JSON.stringify(data);
		sock.send(msg);
	}
}
exports.broadcast = function(cmd, data){
	console.log(cmd, data);
	var wss = exports.wss;
	if (wss){
		if (!data) data = {};
		data._ = cmd;
		var msg = JSON.stringify(data);
		wss.clients.forEach(function(sock){
			if (sock.readyState == 1) sock.send(msg);
		});
	}
}