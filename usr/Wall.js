function Wall(){
	Thing.apply(this, arguments);
}
module.exports = Wall;
var Thing = require("./Thing");

Wall.prototype = Object.create(Thing.prototype)
Wall.prototype.solid = true;