"use strict";
exports.loaded = false;
function load(progress, postload){
	exports.load = undefined;
	var assets = ["atlas"];
	function process(asset, tex, base){
		var id = asset.match(/\d+$/), tex = new PIXI.Texture(tex, base?new PIXI.math.Rectangle(base[0], base[1], base[2], base[3]):null);
		if (id){
			asset = asset.slice(0, -id[0].length);
			if (!(asset in exports)) exports[asset] = [];
			exports[asset][id[0]] = tex;
		}else exports[asset] = tex;
	}
	var loadCount = 0;
	assets.forEach(function(asset){
		var img = new Image();
		img.addEventListener("load", function(){
			loadCount++;
			//progress(loadCount/assets.length);
			var tex = new PIXI.BaseTexture(this);
			tex.scaleMode = 1;
			if (asset == "atlas"){
				var atlas = require("./assets/atlas");
				for(var key in atlas){
					process(key, tex, atlas[key]);
				}
			}else process(asset, tex);
			if (loadCount == assets.length){
				exports.loaded = true;
				postload();
			}
		});
		img.src = "assets/" + asset + ".png";
	});
}
function Text(text, fontsize, color, bgcolor){
	var canvas = document.createElement("canvas"), ctx = canvas.getContext("2d");
	var font = ctx.font = fontsize + "px Dosis";
	canvas.width = ctx.measureText(text).width+1;
	canvas.height = fontsize*1.4;
	if (bgcolor !== undefined){
		ctx.fillStyle = bgcolor;
		ctx.fillRect(0, 0, canvas.width, canvas.height);
	}
	ctx.font = font;
	ctx.fillStyle = color || "black";
	ctx.fillText(text, 0, fontsize);
	return new PIXI.Texture(new PIXI.BaseTexture(canvas));
}
if (typeof PIXI !== "undefined"){
	exports.nopic = PIXI.Texture.emptyTexture;
	exports.load = load;
	exports.Text = Text;
}