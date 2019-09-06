var mongoose = require("mongoose");

var friendSchema = new mongoose.Schema({ //creating Schema
	name: String,
	affiliation: String
});
module.exports = mongoose.model("Friend", friendSchema); //creating model and collection