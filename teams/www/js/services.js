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

.service('request', function ($http, status, $ionicLoading)
{
	//var serverURL = 'https://gradebuzz.azurewebsites.net';
	var serverURL = 'http://localhost:7500'
	var self = this;

	this.serverURL = serverURL;
	this.timeout = 20000;
	this.token = null;

	this.post = function (settings, success, error)
	{
		$ionicLoading.show({
			templateUrl: 'templates/loading.html'
		});

		var url = settings.url;
		var data = settings.data;
		var $scope = settings.scope;

		if (settings.token)
		{
			data.v = '2.0';
			data.token = this.token;
		}

		var startTime = new Date().getTime();

		$http({
			method: 'post',
			url: serverURL+url,
			timeout: this.timeout,
			data: data
		})

		.success(function (data)
		{
			$ionicLoading.hide();
			success(data);
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
		if (settings.token) { data.token = settings.token }

		var startTime = new Date().getTime();

		$http({
			method: 'get',
			url: serverURL+url,
			params: {v: '2.0'},
			timeout: this.timeout
		})

		.success(function (data)
		{
			$ionicLoading.hide();
			success(data);
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

	this.getStatus = function (callback)
	{
		$http({
			method: 'get',
			url: 'http://localhost:7400/status',
			//url: 'http://www.gradebuzz.com/status',
			timeout: 5000
		}).success(function (data,status)
		{
			callback(data)
			console.log(data);

		}).error(function (data,status)
		{
			$http({
				method: 'get',
				url: serverURL,
				timeout: 5000
			}).success(function (data,status)
			{
				callback({
					type: 'bad',
					msg: 'Couldn\'t get server status. This may be because of routine maintainence.',
					date: moment(new Date()).format("h:mm A, MMM D")
				})
			}).error(function ()
			{
				callback({
					type: 'bad',
					msg: 'You are not currently connected to the internet. A connection is required to use Grade Buzz.',
					date: moment(new Date()).format("h:mm A, MMM D")
				})
			})
		});
	}
})

.service('districts', function (request)
{
   this.get = function ($scope, callback) {

      request.get({
			url: '/districts',
			scope: $scope
		}, function (data)
		{
			callback(data);
		});

   }

	this.find = function (position, $scope, callback) {

		request.post({
			url: '/find',
			scope: $scope,
			data: {
				latitude: position.coords.latitude,
				longitude: position.coords.longitude
			}
		}, function (data)
		{
			callback(data);
		})
	}
})
