angular.module('starter.services', [])


.service('appStatus', function ($timeout) //This service handles displaying errors on pages
{
	var statusTime = 5000; //How long the error message will last
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

.service('request', function ($http, $ionicLoading, storage, appStatus, errors) //Abstracts requests to our server
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
			return 'http://mobiledev.ptsteams.local:7500'
		}
	}

	var serverURL = this.getURL();
	var apiEndpoint = '/mobile';
	var apiVersion = '/v1'

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
			data: settings.data
		})

		.success(function (data) //Call success callback on response
		{
			if ($scope)
			{
				$scope.error = false;
			}
			$ionicLoading.hide();
			success(data.items);
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
					errors.add("Other error. Server returned "+data.msg+".")
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

		var url = settings.url;
		var $scope = settings.scope;
		var startTime = new Date().getTime();

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
			success(data.items);
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
					errors.add("Other error. Server returned "+data.msg+".")
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
		}, function (data)
		{
			callback(data);
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
		}, function (data)
		{
			callback(data[0]);
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
		}, function (data)
		{
			if (data && data[0])
			{
				var match = data[0].accounts[storage.get('teams-v1-settings').type].url;
				callback(match);
				storage.update('teams-v1-settings', 'url', match);
			}
			else
			{
				//appStatus.show($scope, 'error', 'Could not connect to server. Using last known URL instead.');
				callback(storage.get('teams-v1-settings').url);
			}

		}, function ()
		{
			//appStatus.show($scope, 'error', 'Could not connect to server. Using last known URL instead.');
			callback(storage.get('teams-v1-settings').url);
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
		}, function (data)
		{
			if (data && data[0])
			{
				var match = data[0].accounts[storage.get('teams-v1-settings').type].pages;
				storage.update('teams-v1-settings', 'pages', match);
				callback(match);
			}
			else
			{
				//appStatus.show($scope, 'error', 'Could not connect to server. Using last known pages instead.');
				callback(storage.get('teams-v1-settings').pages);
			}

		}, function ()
		{
			//appStatus.show($scope, 'error', 'Could not connect to server. Using last known pages instead.');
			callback(storage.get('teams-v1-settings').pages);
		});
	}

	this.setSettings = function (district, type) //Update URL-related settings
	{
		storage.update('teams-v1-settings', 'district', district);
		storage.update('teams-v1-settings', 'type', type);

		console.log(this.getSettings());
	}

	this.getSettings = function () //Return URL-related settings
	{
		return storage.get('teams-v1-settings');
	}
})
