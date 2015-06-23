angular.module('starter.services', [])


.service('status', function ($timeout)
{
	var statusTime = 5000;
	var self = this;

	this.show = function ($scope, type, msg)
	{
		$scope.status = {
			type: type, //Error, Success, Null (for hidden)
			msg: msg
		}

		self.timer = $timeout(function ()
		{
			if ($scope.status.type !== null)
			{
				self.hide($scope);
			}
		}, statusTime);
	}

	this.hide = function ($scope)
	{
		$scope.status.type = null;
	}
})

.service('storage', function ()
{
	this.set = function (key, value)
	{
		localStorage[key] = JSON.stringify(value);
	}

	this.get = function (key)
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
})

.service('request', function ($http, status, $ionicLoading)
{
	//var serverURL = 'https://gradebuzz.azurewebsites.net';
	var serverURL = 'http://localhost:7500'
	var apiEndpoint = '/mobile';
	var apiVersion = '/v1'

	var self = this;

	this.serverURL = serverURL;
	this.timeout = 20000;

	this.post = function (settings, success, error)
	{
		$ionicLoading.show({
			templateUrl: 'templates/loading.html'
		});

		var url = settings.url;
		var data = settings.data;
		var $scope = settings.scope;

		var startTime = new Date().getTime();

		$http({
			method: 'post',
			url: serverURL+apiEndpoint+apiVersion+url,
			timeout: this.timeout,
			data: data
		})

		.success(function (data)
		{
			$ionicLoading.hide();
			success(data.items);
		})

		.error(function (data, status)
		{
			$ionicLoading.hide();

			var respTime = new Date().getTime() - startTime;

			if ($scope)
			{
				if (respTime >= this.timeout)
				{
					status.show($scope, 'error', 'Server timeout. Please try again later.');
				}
				else if (data == null && status == 0 || status == 500)
				{
					status.show($scope, 'error', 'An unknown error occured with our servers.');
				}
				else
				{
					status.show($scope, 'error', data.msg);
				}
			}
		});
	}

	this.get = function (settings, success, error)
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
			timeout: this.timeout
		})

		.success(function (data)
		{
			$ionicLoading.hide();
			success(data.items);
		})

		.error(function (data, status)
		{
			$ionicLoading.hide();

			var respTime = new Date().getTime() - startTime;

			if ($scope)
			{
				if (respTime >= this.timeout)
				{
					status.show($scope, 'error', 'Server timeout. Please try again later.');
				}
				else if (data == null && status == 0 || status == 500)
				{
					status.show($scope, 'error', 'An unknown error occured with our servers.');
				}
				else
				{
					status.show($scope, 'error', data.msg);
				}
			}
		});
	}

})

.service('districts', function (request, storage)
{
   this.getAll = function ($scope, callback) {

      request.get({
			url: '/districts',
			scope: $scope
		}, function (data)
		{
			console.log(data);
			callback(data);
		});
   }

	this.findOne = function (position, $scope, callback) {

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

	this.setSettings = function (district, type)
	{
		storage.set('teams-v1-settings', {
			district: district,
			type: type
		});
	}

	this.getSettings = function ()
	{
		return storage.get('teams-v1-settings');
	}

	this.getURL = function ($scope, callback)
	{
		request.get({
			url: '/districts',
			$scope: $scope,
			data: {
				name: storage.get('teams-v1-settings').district
			}
		}, function (data)
		{
			console.log(data);
			var match = data[0].url[storage.get('teams-v1-settings').type];
			console.log(match);
			callback(match);
		});
	}
})
