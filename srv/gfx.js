"use strict";
function nop(){}
var gfx = require("../gfx");
gfx.loaded = true;
gfx.load = undefined;
gfx.Text = gfx.Texture = nop;
var atlasdata = require("../assets/atlas");
function process(asset, base){
	var asplit = asset.split("_");
	var aid = asplit[asplit.length-1].match(/\d+$/);
	if (aid){
		asplit[asplit.length-1] = asplit[asplit.length-1].slice(0, -aid[0].length);
		asplit.push(aid[0]);
	}
	var prev = gfx;
	for(var i=0; i<asplit.length; i++){
		var a = asplit[i];
		if (prev[a]){
			prev = prev[a];
		}else{
			prev = prev[a] = i+1 == asplit.length ? base : (aid && i+2 == asplit.length) ? [] : {};
		}
	}
}
for(var key in atlasdata){
	process(key, atlasdata[key]);
}