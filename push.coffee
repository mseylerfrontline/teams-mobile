apn = require 'apn'
gcm = require 'gcm'

apnConnection = new apn.Connection {

}

device = new apn.Device 'token'
