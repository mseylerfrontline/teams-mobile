#!/usr/bin/env node

//this hook installs all your plugins

// add your plugins to this list--either
// the identifier, the filesystem location
// or the URL
var pluginlist = [
   "ionic-plugin-keyboard",
 // "com.phonegap.plugins.PushPlugin",
   "cordova-plugin-console",
   "cordova-plugin-device",
   "cordova-plugin-geolocation",
   "cordova-plugin-splashscreen",
   "cordova-plugin-whitelist"
];

// no need to configure below

var fs = require('fs');
var path = require('path');
var sys = require('sys')
var exec = require('child_process').exec;

function puts(error, stdout, stderr)
{
   console.log(stdout)
}

pluginlist.forEach(function(plug)
{
   exec("ionic cordova plugin add " + plug, puts);
});