var mongoose = require('mongoose');

var districtSchema = new mongoose.Schema({
	name: String,
	altName: String,
	id: String,
	num: String,
	url: {
		parent: String,
		student: String
	},
	loc: {
		type: {type: String},
		coordinates: Array
	}
});

//districtSchema.index({ geometry: '2dsphere'})

module.exports = mongoose.model('districts', districtSchema);
