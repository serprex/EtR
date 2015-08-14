var Thing = require("./Thing");
function Wall(){
	Thing.apply(this, arguments);
}
Wall.prototype = Object.create(Thing.prototype);
Wall.prototype.solid = true;
Wall.prototype._toJSON = function(data){
	data.oid = 1;
	return data;
}
module.exports = Wall;