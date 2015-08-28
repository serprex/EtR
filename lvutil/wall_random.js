module.exports = function(tiles, w, h, ttype, rate){
	for(var i=0; i<tiles.length; i++){
		if (Math.random()<rate) tiles[i] = ttype;
	}
}