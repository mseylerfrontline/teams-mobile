# Import native Node modules
http = require 'http'
path = require 'path'
url = require 'url'
fs = require 'fs'

config = require './config/config.coffee' #Get config data (environment-specific)

# Set up mongodb
mongoose = require 'mongoose'
DistrictModel = require './districtModel.coffee'
db = mongoose.connection
mongoose.connect config.mongoURL

# Import and set up express (routing library)
express = require 'express'
bodyParser = require 'body-parser'
app = express()

# Set up form body parsing with Express
app.use bodyParser.urlencoded({ extended: false })
app.use bodyParser.json()

# Permit Cross-Origin requests
app.all '*', (req, res, next) ->
	res.header 'Access-Control-Allow-Origin', '*'
	res.header 'Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS'
	res.header 'Access-Control-Allow-Headers', 'Content-Type'
	next()

# Set parent middleware URL (all URLs descend form /mobile/v1)
v1 = express.Router()
app.use('/mobile/v1', v1)

# Client asks for list of districts
v1.get '/districts', (req,res) ->

	if req.query.longitude and req.query.latitude # If we have both longitude and latitude parameters

		geoJSONpoint = # Set up our GeoJSON data object
			type: 'Point'
			coordinates: [
				req.query.longitude,
				req.query.latitude
			]

		# Find districts with TEAMS in the given location, only get their name, altName, and URLs
		DistrictModel.find { teams: true, loc: { $near: { $geometry: geoJSONpoint, $maxDistance: 1000 } } }, "name altName accounts", (err, data) ->
			if err
				res.status(500).send({msg: 'An unexpected error occured.'})
			else
				res.send {
					pageInfo: {
						totalResults: data.length,
						resultsPerPage: data.length
					},
					items: data
				} #Standard 200 response with JSON object

	else if req.query.name #If we have just the district's full name (not alt)

		DistrictModel.find { teams: true, name: req.query.name }, "name altName accounts", (err, data) ->
			if err
				res.status(500).send({msg: 'An unexpected error occured.'})
			else
				res.send {
					pageInfo: {
						totalResults: data.length,
						resultsPerPage: data.length
					},
					items: data
				}

	else #No paramters, get all the districts with teams

		DistrictModel.find { teams: true }, "name altName accounts", { sort: { name: 1 } }, (err, data) ->
			if err
				res.status(500).send({msg: 'An unexpected error occured.'})
			else
				res.send {
					pageInfo: {
						totalResults: data.length,
						resultsPerPage: data.length
					},
					items: data
				} # Implied 200 status and connection end

app.listen config.port, config.ip
