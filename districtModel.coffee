mongoose = require 'mongoose'

# Set up our schema and its types
districtSchema = new mongoose.Schema {
	name: String
	altName: String
	id: String
	num: String
	accounts: {
		parent: {
			url: String
			pages: [
				{
					name: String
					icon: String
					url: String
					enabled: Boolean
				}
			]
		}
		student: {
			url: String
			pages: [
				{
					name: String
					icon: String
					url: String
					enabled: Boolean
				}
			]
		}
	}
	url: {
		parent: String
		student: String
	}
	pages: [
		{
			name: String
			url: String
			enabled: Boolean
		}
	]
	loc: {
		type: {type: String}
		coordinates: Array
	}
}


module.exports = mongoose.model 'districts', districtSchema
