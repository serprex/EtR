"use strict";
function mkBuilder(x, y, opt){
	var b = Object.create(opt);
	b.dir = Math.random()*4|0;
	b.x = x;
	b.y = y;
	return b;
}
function step(opt, builders){
	var r90 = opt.r90 || .125,
		r180 = r90 + (opt.r180 || .125),
		r270 = r180 + (opt.r270 || .125);
	var makenew = opt.rnew && Math.random() < opt.rnew;
	if (makenew){
		var bnew = mkBuilder(opt.prototype);
		builders.push(bnew);
	}
	var r = Math.random();
	var turn = r < r90 ? 1 :
		r < r180 ? 2 :
		r < r270 ? 3 : 0;
	if (turn) opt.dir = (opt.dir+turn)&3;
	opt.x += (opt.dir == 0) - (opt.dir == 1);
	opt.y += (opt.dir == 3) - (opt.dir == 2);
	if (opt.x < 0) opt.x = 8;
	if (opt.y < 0) opt.y = 8;
}
module.exports = function(tiles, w, h, options){
	var b0 = mkBuilder(8, 8, options);
	var builders = [b0];
	var clear = new Set();
	for(var i=0; i<w*h/4;){
		builders.forEach(function(b){
			step(b, builders);
			var j = b.x+b.y*w;
			if (clear.has(j)) i++;
			else clear.add(j);
		});
	}
	for(var i=0; i<w*h; i++){
		if (!clear.has(i)) tiles[i] = 60001;
	}
}