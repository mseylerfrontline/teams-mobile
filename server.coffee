# Import native Node modules
http = require 'http'
path = require 'path'
url = require 'url'
fs = require 'fs'

# Set up mongodb
mongoose = require 'mongoose'
DistrictModel = require './districtModel.js'
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

v1 = express.Router()
app.use('/mobile/v1', v1)

# Client asks for list of districts
v1.get '/districts', (req,res) ->

	if req.query.longitude && req.query.latitude

		geoJSONpoint = { type: 'Point', coordinates: [ req.query.longitude, req.query.latitude ] }
		DistrictModel.find { teams: true, loc: { $near: { $geometry: geoJSONpoint, $maxDistance: 1000 }}}, "name altName url", (err, data) ->

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

	else if req.query.name

		DistrictModel.find { teams: true, name: req.query.name }, "name altName url", (err, data) ->
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

	else

		DistrictModel.find { teams: true }, "name altName url", { sort: { name: 1 } }, (err, data) ->
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

# Find a district based on longitude and latitude
v1.get '/find', (req,res) ->


# Get a district URL by name
v1.get '/district', (req,res) ->



app.listen 7500
