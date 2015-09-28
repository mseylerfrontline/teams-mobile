angular.module('starter.controllers', [])

.controller('MenuCtrl', function ($scope, $ionicHistory, $cordovaAppAvailability, $cordovaDevice, $state, districts)
{
   var device = $cordovaDevice.getDevice();
   
   $scope.$on('updatePagesBroadcast', function ()
   {
      updatePages();
   })

   function updatePages ()
   {
      districts.getPages($scope, function (pages)
      {
         $scope.pages = [];

         pages.forEach(function (page)
         {
            console.log(page.url);
            if (device.platform === 'iOS')
            {
               var scheme = page.url.ios.app;
               var url = page.url.ios.app;
               var fallback = page.url.ios.fallback;
            }
            else if (device.platform === 'Android')
            {
               var scheme = page.url.android.app;
               var url = "intent://#Intent;package="+scheme+";end;"
               var fallback = page.url.android.fallback;
            }

            if (scheme && (page.url.ios || page.url.android)) //Looking for native app
            {
               page.type = "external";
               $cordovaAppAvailability.check(scheme, function() // Success callback
               {
                  page.url = scheme;
               }, function() // Error callback
               {
                  $page.url = fallback;
               });
            }
            else
            {
               page.url = page.url.web;
               page.type = "web";
            }

            $scope.pages.push(page);
         });
         console.log($scope.pages);
      });
   }
   updatePages();

   $scope.handlePage = function (index)
   {
      var page = $scope.pages[index];

      if (page.type === "external")
      {
         var win = window.open(page.url, '_blank');
         win.focus();
      }
      else if (page.type === "web")
      {
         $state.go('app.page', {pageId: index})
         $ionicHistory.nextViewOptions({
            disableAnimate: true,
            disableBack: true
         });
      }
   }
})

.controller('PageCtrl', function ($scope, $state, $sce, $stateParams, $ionicLoading, districts)
{
   $scope.trustSrc = function (src)
   {
      return $sce.trustAsResourceUrl(src);
   }

   districts.getPages($scope, function (pages)
   {
      $scope.page = pages[$stateParams.pageId];
      $scope.page.url = $scope.trustSrc($scope.page.url.web);
      console.log($scope.page)
      $ionicLoading.show({ //Show our loading overlay animation
         templateUrl: 'templates/loading.html'
      });
   });

   $scope.iframeLoaded = function ()
   {
      $ionicLoading.hide();
   }
})

/* Controls the District Selection Page */
.controller('DistrictCtrl', function($scope, $ionicPlatform, $ionicPopup, $location, $state, $ionicHistory, $window, districts, request, appStatus) {

   /* Don't run our plugins until they're loaded */
   $ionicPlatform.ready(function() {
      console.log(districts.getSettings())
      if (districts.getSettings() && districts.getSettings().type && districts.getSettings().name && districts.getSettings().id)
      {
         /* Go to the login page and prevent going back to this page. */
         $state.go('app.main')
         $ionicHistory.nextViewOptions({
            disableAnimate: true,
            disableBack: true
         });
      }
      else
      {
         /* Load list of districts via our REST api */
         districts.getAll($scope, function (data)
         {
            $scope.districts = data; //Make the data accessible to the page

            if (window.district_id)
            {
               $scope.form.list = _.findWhere($scope.districts, {id: window.district_id});
            }
            else if (navigator.geolocation)
            {
               navigator.geolocation.getCurrentPosition(function (position)
               {
                  districts.findOne(position, $scope, function (district)
                  {
                     if (district)
                     {
                        // $scope.form.list = _.findWhere($scope.districts, {name: district.name});
                     }
                     else // Not sure if this is necessary
                     {
                        $scope.form.list = null;
                     }
                  });
               });
            }

         }, function ()
         {
            appStatus.show($scope, 'error', 'Could not connect to TEAMS. You\'ll need to open the app again later in order to procede.');
            $scope.data = {}

            var updateURL = $ionicPopup.show({
               template: '<input type="text" ng-model="data.serverURL">',
               title: 'Enter Server URL',
               subTitle: 'Could not connect to server, enter new URL',
               scope: $scope,
               buttons: [
                  { text: 'Cancel' },
                  {
                     text: '<b>Update</b>',
                     type: 'button-positive',
                     onTap: function(e)
                     {
                        if (!$scope.data.serverURL)
                        {
                           e.preventDefault();
                        }
                        else
                        {
                           return $scope.data.serverURL;
                        }
                     }
                  }
               ]
            });

            updateURL.then(function(res)
            {
               request.setURL(res);
               $window.location.reload(true)
            });
         });
      }

   });

   $scope.accountTypes = []
   $scope.forms = {}; //So we can access our form from within a child scope
   $scope.form = { //The actual form values
      submitted: false,
      list: null,
      type: ''
   }

   $scope.getAccounts = function ()
   {
      districts.getOne($scope.form.list.id, $scope, function (district)
      {
         $scope.accountTypes = districts.sortAccounts(district.accounts);
      });
   }

   /* Whenever our form is submitted */
   $scope.submit = function ()
   {
      $scope.form.submitted = true; //Tell our errors they can show now

      if ($scope.forms.form1.accountType && $scope.forms.form1.accountType.$valid && $scope.forms.form1.listField.$valid)
      {
         $scope.showConfirm($scope.form.list, $scope.form.type); //Name field included for legacy
      }
   }

   /* Confirm our district selection with a pop-up */
   $scope.showConfirm = function(district, type)
   {
      var confirmPopup = $ionicPopup.confirm({
         title: 'Confirm',
         template: 'Make <b>'+district.name+' - '+type+'</b> your default setting? (This can be changed later in your settings.)'
      });

      confirmPopup.then(function(res) { //Once our user has made a choice

         if (res)  //If they confirmed
         {
            districts.setSettings(district.name, district.id, type);

            /* Go to the login page and prevent going back to this page. */
            $state.go('app.main')
            $ionicHistory.nextViewOptions({
               disableAnimate: false,
               disableBack: true
            });
         }

      });
   };
})

/* Controls the Login Page */
.controller('LoginCtrl', function($scope, $ionicHistory, $location) {

   $scope.user = { //Actual form values
      username: '',
      password: '',
      remember: false
   }

   /* When the login form is submitted */
   $scope.login = function ()
   {
      /* Go to the main app page and prevent going back to this page. */
      $location.path('app.main').replace()
      $ionicHistory.nextViewOptions({
         disableAnimate: false,
         disableBack: true
      });
   }
})

/* Controls the Main App Page */
.controller('MainCtrl', function($scope, $ionicHistory, $ionicLoading, $sce, districts, appStatus, errors) {

   /* Reenable the back button so a user can return to the app after visiting their settings */
   $ionicHistory.nextViewOptions({
      disableAnimate: false,
      disableBack: false
   });

   $scope.trustSrc = function (src)
   {
      return $sce.trustAsResourceUrl(src);
   }

   var iframeTimeout;

   districts.getURL($scope, function (url, district)
   {
      $scope.district = district;
      $scope.showFrame = false;

      $scope.mobileURL = $scope.trustSrc(url);
      $ionicLoading.show({ //Show our loading overlay animation
         templateUrl: 'templates/loading.html'
      });
      iframeTimeout = setTimeout($scope.iframeError, 5000)
   });

   $scope.iframeError = function ()
   {
      $ionicLoading.hide();
      errors.add('Failed to load TEAMS iframe.');
      appStatus.show($scope, 'error', 'Could not connect to TEAMS - it may be temporarily unavailable for maintainence. You\'ll need to open this page later to access it.');
   }

   $scope.iframeLoaded = function ()
   {
      clearTimeout(iframeTimeout);
      $scope.showFrame = true;
      $ionicLoading.hide();
   }

   $scope.error = function ()
   {

   }

   var iframe = document.getElementById('app-vaadin');
   function sendMessage(msg) {
      iframe.contentWindow.postMessage("cordova-" + msg, "*");
   }
   function check() {
      var sts = navigator.network.connection.type == Connection.NONE ? 'offline' : 'online';
      sendMessage(sts);
   }
   function showIframe(ev) {
      $scope.iframeLoaded();
      sendMessage('resume');
   }
   // Listen for offline/online events
   document.addEventListener('offline', check);
   document.addEventListener('online', check);
   document.addEventListener('resume', function(){sendMessage('resume')});
   document.addEventListener('pause', function(){sendMessage('pause')});
   // check the connection periodically
   setInterval(check, 30000);
   // when vaadin app is loaded, it sends to the parent window a ready message
   window.addEventListener('message', showIframe, false);
})

/* Controls the Settings Page (accessible via a button on the Main page)*/
.controller('SettingsCtrl', function($scope, $ionicHistory, $ionicPopup, $state, $location, $rootScope, request, appStatus, districts, storage, devices) {

   function start ()
   {
      /* Load list of districts via our REST api */
      districts.getAll($scope, function (data)
      {
         $scope.districts = data; //Make the data accessible to the page

         var settings = districts.getSettings();

         $scope.form.list = _.findWhere($scope.districts, {id: settings.id});
         $scope.form.type = settings.type
         $scope.getAccounts();

         devices.getDevice($scope, function (device)
         {
            if (device.dev)
            {
               $scope.isDev = true;
            }
         });
      }, function ()
      {
         appStatus.show($scope, 'error', 'Could not connect to TEAMS. You won\'t be able to change your settings.');
      });
   }
   start();

   $scope.isDev = false;
   $scope.accountTypes = [];
   $scope.forms = {}; //So we can access our form from within a child scope
   $scope.form = { //The actual form values
      list: '',
      type: ''
   }

   $scope.getAccounts = function ()
   {
      districts.getOne($scope.form.list.id, $scope, function (district)
      {
         $scope.accountTypes = districts.sortAccounts(district.accounts);
      });
   }

   $scope.hasChanges = false;
   $scope.returnToTeams = function ()
   {
      $ionicHistory.nextViewOptions({
         disableAnimate: true,
         disableBack: true
      });
      $state.go('app.main');
   }

   $scope.$watch('form', function (newVal, oldVal)
   {
      console.log(newVal)
      if (newVal !== oldVal && newVal.list !== "" && newVal.type !== "")
      {
         if (oldVal.list !== "") { $scope.hasChanges = true; }

         districts.setSettings(newVal.list.name, newVal.list.id, newVal.type);
         $rootScope.$broadcast('updatePagesBroadcast');
         $ionicHistory.clearCache()
      }
   }, true);

   $scope.changeServer = function ()
   {
      $scope.data = {
         serverURL: request.getURL()
      };

      var updateURL = $ionicPopup.show({
         template: '<input type="text" ng-model="data.serverURL">',
         title: 'Enter Server URL',
         subTitle: 'Change the old server URL.',
         scope: $scope,
         buttons: [
            { text: 'Cancel' },
            {
               text: '<b>Update</b>',
               type: 'button-positive',
               onTap: function(e)
               {
                  if (!$scope.data.serverURL)
                  {
                     e.preventDefault();
                  }
                  else
                  {
                     return $scope.data.serverURL;
                  }
               }
            }
         ]
      });

      updateURL.then(function(res)
      {
         if (res)
         {
            request.setURL(res);
            $rootScope.$broadcast('updatePagesBroadcast');
            $ionicHistory.clearCache()

            start();
         }
      });
   }

   $scope.clear = function ()
   {
      var confirmPopup = $ionicPopup.confirm({
         title: 'Confirm',
         template: 'Clear all of the data associated with this app? You\'ll need to redo your settings.'
      });

      confirmPopup.then(function(res) { //Once our user has made a choice

         if (res)  //If they confirmed
         {
            storage.clear();

            /* Go to the login page and prevent going back to this page. */
            $location.path('/district').replace()
            $ionicHistory.nextViewOptions({
               disableAnimate: false,
               disableBack: true
            });
         }

      });
   }
})

.controller('HelpCtrl', function ($scope, errors)
{
   $scope.errors = errors.get()
   $scope.topics = [
      {
         "title": "Why can't I change my district or account type in the settings page?",
         "answer": "Sometimes if we're having server problems you'll be unable to change your settings for a time. This is normal and you should be able to make changes again when everything is online!"
      },
      {
         "title": "I want to let someone else use this app to check their grades. How do I do it?",
         "answer": "If they have the same account type as you (they are also a student or also a parent and are from the same district), simple logout from the \"TEAMS\" page and they will be able to sign in with their credentials. If not, they\'ll need to go to the \"Settings\" page to configure their account type and then sign in."
      },
      {
         "title": "I can't access TEAMS. What should I do?",
         "answer": "It's likely TEAMS is simply unavialable due to maintainence. This issue should not persist long - if it does, contact us at http://mobile.ptsteams.com/"
      },
      // {
      //    "title": "Can I turn off push notifications?",
      //    "answer": "Sure you can! Just go to your settings page and set \"Push Notifcations\" to off."
      // }
   ]

   $scope.toggleGroup = function(group)
   {
      if ($scope.isGroupShown(group))
      {
         $scope.shownGroup = null;
      }
      else
      {
         $scope.shownGroup = group;
      }
   }

   $scope.isGroupShown = function(group)
   {
      return $scope.shownGroup === group;
   }
})
