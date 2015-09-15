angular.module('starter.services', [])


.service('appStatus', function ($timeout) //This service handles displaying errors on pages
{
	var statusTime = 8000; //How long the error message will last
	var self = this;

	this.show = function ($scope, type, msg) //Show a message
	{
		$scope.status = {
			type: type, //Currently just the "error" type
			msg: msg
		}

		self.timer = $timeout(function ()
		{
			if ($scope.status.type !== null) //Don't hide if it's already hidden
			{
				self.hide($scope);
			}
		}, statusTime);
	}

	this.hide = function ($scope) //Hide message prematurely
	{
		$scope.status.type = null;
	}
})

.service('errors', function (storage)
{
	this.add = function (error)
	{
		var settings = storage.get('teams-v1-settings')
		if (!settings || !settings.errors)
		{
			var errors = [];
		}
		else
		{
			var errors = settings.errors;
		}
		errors.unshift({
			msg: error,
			time: new Date()
		});

		if (errors.length > 10)
		{
			errors.shift();
		}
		storage.update('teams-v1-settings', 'errors', errors);
	}

	this.get = function ()
	{
		var errors = storage.get('teams-v1-settings').errors;
		if (!errors)
		{
			errors = [];
		}
		return errors;
	}
})

.service('storage', function () //Handles localstorage of settings
{
	this.set = function (key, value) //Set a key
	{
		localStorage[key] = JSON.stringify(value);
	}

	this.update = function (key, subkey, value) //Alter a subkey (key of key)
	{
		var json;

		json = this.get(key);
		if (json)
		{
			json[subkey] = value;
			this.set(key, json);
		}
		else //If the key doesn't exist make a new one
		{
			var json = {};
			json[subkey] = value;
			this.set(key, json);
		}
	}

	this.get = function (key) //Get a key
	{
		var json;

		try {
			json = JSON.parse(window.localStorage[key]);
		}
		catch (e) {
			json = undefined;
		}

		return json;
	}

	this.clear = function () //Clear all localstorage
	{
		localStorage.clear();
	}
})

.service('request', function ($http, $ionicLoading, $cordovaDevice, storage, appStatus, errors) //Abstracts requests to our server
{
	var self = this;

	this.setURL = function (url) //Set the server URL (for development)
	{
		storage.update('teams-v1-settings', 'baseURL', url);
		serverURL = this.getURL();
	}

	this.getURL = function () //Get the server URL (defaults to localhost)
	{
		var settings = storage.get('teams-v1-settings');
		if (settings && settings.baseURL)
		{
			return settings.baseURL
		}
		else
		{
			// return 'http://localhost:7500'
			return 'http://qapi.teams360.net'
		}
	}

	var serverURL = this.getURL()
	var apiEndpoint = '/mobile'
	var apiVersion = '/v1'
	var apiKey = "2e66d029544b2d009b1f71936bcdebf0"

	var timeout = 10000; //How long before our request expires

	this.post = function (settings, success, error) //POST requests... not really used
	{
		$ionicLoading.show({ //Show our loading overlay animation
			templateUrl: 'templates/loading.html'
		});

		var url = settings.url;
		var $scope = settings.scope;
		var startTime = new Date().getTime();

		$http({ //Send post to our server
			method: 'post',
			url: serverURL+apiEndpoint+apiVersion+url,
			timeout: timeout,
			data: settings.data,
			params: {key: apiKey}
		})

		.success(function (data) //Call success callback on response
		{
			if ($scope)
			{
				$scope.error = false;
			}
			$ionicLoading.hide();
			success(data);
		})

		.error(function (data, status) //On error (non-response or error status code)
		{
			$ionicLoading.hide();

			var respTime = new Date().getTime() - startTime;

			if ($scope) //Display various error messages depending on the problem
			{
				$scope.error = true;
				if (respTime >= timeout)
				{
					//appStatus.show($scope, 'error', 'Server timeout. Please try again later.');
					errors.add("Server timeout.")
				}
				else if (data == null && status == 0)
				{
					//appStatus.show($scope, 'error', 'There was no response from our servers.');
					errors.add("No response.")
				}
				else if (status == 500)
				{
					appStatus.show($scope, 'error', 'An unknown error occured with our servers.');
					errors.add("500 status.")
				}
				else
				{
					//appStatus.show($scope, 'error', data.msg);
					errors.add("Other error. Server returned "+data.errors[0].message+".")
				}
			}

			if (error) //Optional error callback
			{
				error(data);
			}
		});
	}

	this.get = function (settings, success, error) //See POST request comments
	{
      $ionicLoading.show({
			templateUrl: 'templates/loading.html'
		});

		console.log(settings.url);
		var url = settings.url;
		var $scope = settings.scope;
		var startTime = new Date().getTime();

		if (!settings.data) settings.data = {};
		settings.data.key = apiKey;

		$http({
			method: 'get',
			url: serverURL+apiEndpoint+apiVersion+url,
			params: settings.data,
			timeout: timeout
		})

		.success(function (data)
		{
			if ($scope)
			{
				$scope.error = false;
			}
			$ionicLoading.hide();
			success(data);
		})

		.error(function (data, status)
		{
			$ionicLoading.hide();

			var respTime = new Date().getTime() - startTime;

			if ($scope)
			{
				$scope.error = true;
				if (respTime >= timeout)
				{
					//appStatus.show($scope, 'error', 'Server timeout. Please try again later.');
					errors.add("Server timeout.")
				}
				else if (data == null && status == 0)
				{
					//appStatus.show($scope, 'error', 'There was no response from our servers.');
					errors.add("No response.")
				}
				else if (status == 500)
				{
					appStatus.show($scope, 'error', 'An unknown error occured with TEAMS.');
					errors.add("500 status.")
				}
				else
				{
					//appStatus.show($scope, 'error', data.msg);
					errors.add("Other error. Server returned "+data.errors[0].message+".")
				}
			}

			if (error)
			{
				error(data);
			}
		});
	}

})

.service('districts', function (request, storage, appStatus) //Another layer of abstraction to our server's API
{
   this.getAll = function ($scope, callback, error) { //Get list of all the districts

      request.get({
			url: '/districts',
			scope: $scope
		}, function (res)
		{
			callback(res.data.districts);
		}, function ()
		{
			if (error)
			{
				error();
			}
		});
   }

	this.findOne = function (position, $scope, callback) { //Get district by location

		request.get({
			url: '/districts',
			scope: $scope,
			data: {
				latitude: position.coords.latitude,
				longitude: position.coords.longitude
			}
		}, function (res)
		{
			callback(res.data.districts[0]);
		})
	}

	this.getURL = function ($scope, callback) //Get district by name
	{
		request.get({
			url: '/districts',
			scope: $scope,
			data: {
				name: storage.get('teams-v1-settings').district
			}
		}, function (res)
		{
			if (res.data && res.data.districts && res.data.districts[0])
			{
				var match = res.data.districts[0].accounts[storage.get('teams-v1-settings').type].url;
				callback(match+'?deviceId='+device.uuid, res.data.districts[0]);
				storage.update('teams-v1-settings', 'url', match);
			}
			else
			{
				callback(storage.get('teams-v1-settings').url+'?deviceId='+device.uuid, storage.get('teams-v1-settings'));
			}

		}, function ()
		{
			callback(storage.get('teams-v1-settings').url+'?deviceId='+device.uuid, storage.get('teams-v1-settings'));
		});
	}

	this.getPages = function ($scope, callback)
	{
		request.get({
			url: '/districts',
			scope: $scope,
			data: {
				name: storage.get('teams-v1-settings').district
			}
		}, function (res)
		{
			if (res.data && res.data.districts && res.data.districts[0])
			{
				var match = res.data.districts[0].accounts[storage.get('teams-v1-settings').type].pages;
				storage.update('teams-v1-settings', 'pages', match);
				callback(match);
			}
			else
			{
				callback(storage.get('teams-v1-settings').pages);
			}

		}, function ()
		{
			callback(storage.get('teams-v1-settings').pages);
		});
	}

	this.setSettings = function (district, type) //Update URL-related settings
	{
		storage.update('teams-v1-settings', 'district', district);
		storage.update('teams-v1-settings', 'type', type);
	}

	this.getSettings = function () //Return URL-related settings
	{
		return storage.get('teams-v1-settings');
	}
})

.service('devices', function (request) //Another layer of abstraction to our server's API
{
	this.getDevice = function ($scope, callback)
	{
		if (device && device.uuid)
		{
			request.get({
				url: '/devices/'+device.uuid,
				scope: $scope
			}, function (res)
			{
				if (res.data && res.data.device)
				{
					callback(res.data.device);
				}
			});
		}
		else
		{
			callback({
				name: 'Localhost Developer',
				dev: true,
				id: 123
			});
		}
	}
})
