"use strict";
exports.sum = function(a){
	var r=0;
	for(var i=0,l=a.length;i<l;i++){
		r += a[i];
	}
	return r;
}
exports.untypeArray = function(a){
	return a.length == 1 ? [a[0]] : Array.apply(null, a);
}
exports.parseJSON = function(str){
	try{
		return JSON.parse(str);
	}catch(e){
		return null;
	}
}
