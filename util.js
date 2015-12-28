"use strict";
exports.sum = function(a){
	var r=0;
	for(var i=0,l=a.length;i<l;i++){
		r += a[i];
	}
	return r;
}
