# get environment or development is the default
process.env.NODE_ENV = process.env.NODE_ENV or 'development'

# load the config file for the current environment
config = require('./env/' + process.env.NODE_ENV)

# extend config with universal config data

# export config
module.exports = config;
