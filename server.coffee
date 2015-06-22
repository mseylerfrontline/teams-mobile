# Import native Node modules
http = require 'http'
path = require 'path'
url = require 'url'
fs = require 'fs'

# Set up mongodb
mongoose = require 'mongoose'
DistrictModel = require './SchoolDistricts/districtModel.js'
db = mongoose.connection
mongoose.connect 'mongodb://localhost:27017/teams'

# Import and set up express (routing library)
express = require 'express'
bodyParser = require 'body-parser'
app = express();

# Set up form body parsing with Express
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

# Permit Cross-Origin requests
app.all '*', (req, res, next) ->
	res.header 'Access-Control-Allow-Origin', '*'
	res.header 'Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS'
	res.header 'Access-Control-Allow-Headers', 'Content-Type'
	next()

# Client asks for list of districts
app.get '/districts', (req,res) ->

	DistrictModel.find { teams: true }, null, { sort: { name: -1 } }, (err, data) ->
		console.log data
		res.send {
			districts: data
		} # Implied 200 status and connection end

app.post '/find', (req,res) ->

	geoJSONpoint = { type: 'Point', coordinates: [ req.body.longitude, req.body.latitude ] }
	DistrictModel.find { teams: true, loc: { $near: { $geometry: geoJSONpoint, $maxDistance: 1000 }}}, (err, data) ->

		if err
			res.status(403).end()

		else
			if data && data[0]
				res.send {
					name: data[0].name
					altName: data[0].altName
					num: data[0].num
				}
			else
				res.send null


# Latitude: 30.1948365
# Longitude: -97.82450469999999


app.listen 7500
