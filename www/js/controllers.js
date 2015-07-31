angular.module('starter.controllers', [])

.controller('MenuCtrl', function ($scope, districts)
{

   $scope.$on('updatePagesBroadcast', function ()
   {
      updatePages();
   })

   function updatePages ()
   {
      districts.getPages($scope, function (pages)
      {
         $scope.pages = pages;
      });
   }
   updatePages();
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
      $scope.page.url = $scope.trustSrc($scope.page.url);

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

      if (districts.getSettings() && districts.getSettings().type && districts.getSettings().district)
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

            if (navigator.geolocation)
            {
               navigator.geolocation.getCurrentPosition(function (position)
               {
                  districts.findOne(position, $scope, function (district)
                  {
                     if (district)
                     {
                        $scope.form.list = _.findWhere($scope.districts, {name: district.name});
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

   $scope.forms = {}; //So we can access our form from within a child scope
   $scope.form = { //The actual form values
      submitted: false,
      list: '',
      type: ''
   }
   $scope.accountTypes = [
      {text: "Student", value: "student"},
      {text: "Parent", value: "parent"}
   ]

   /* Whenever our form is submitted */
   $scope.submit = function ()
   {
      $scope.form.submitted = true; //Tell our errors they can show now

      if ($scope.forms.form1.accountType.$valid)
      {
         $scope.showConfirm($scope.form.list.name, $scope.form.type);
      }
   }

   /* Confirm our district selection with a pop-up */
   $scope.showConfirm = function(district, type)
   {
      var confirmPopup = $ionicPopup.confirm({
         title: 'Confirm',
         template: 'Make <b>'+district+' - '+type+'</b> your default setting? (This can be changed later in your settings.)'
      });

      confirmPopup.then(function(res) { //Once our user has made a choice

         if (res)  //If they confirmed
         {
            districts.setSettings(district, type);

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
.controller('MainCtrl', function($scope, $ionicHistory, $ionicLoading, $sce, districts) {

   /* Reenable the back button so a user can return to the app after visiting their settings */
   $ionicHistory.nextViewOptions({
      disableAnimate: false,
      disableBack: false
   });

   $scope.trustSrc = function (src)
   {
      return $sce.trustAsResourceUrl(src);
   }

   districts.getURL($scope, function (url)
   {
      $scope.mobileURL = $scope.trustSrc(url);
      $ionicLoading.show({ //Show our loading overlay animation
         templateUrl: 'templates/loading.html'
      });
   });

   $scope.iframeLoaded = function ()
   {
      $ionicLoading.hide();
   }
})

/* Controls the Settings Page (accessible via a button on the Main page)*/
.controller('SettingsCtrl', function($scope, $ionicHistory, $ionicPopup, $location, $rootScope, request, appStatus, districts, storage) {

   function start ()
   {
      /* Load list of districts via our REST api */
      districts.getAll($scope, function (data)
      {
         $scope.districts = data; //Make the data accessible to the page

         var settings = districts.getSettings();

         $scope.form.list = _.findWhere($scope.districts, {name: settings.district});
         $scope.form.type = settings.type
      }, function ()
      {
         appStatus.show($scope, 'error', 'Could not connect to TEAMS. You won\'t be able to change your settings.');
      });
   }
   start();

   $scope.forms = {}; //So we can access our form from within a child scope
   $scope.form = { //The actual form values
      list: '',
      type: ''
   }
   $scope.accountTypes = [
      {text: "Student", value: "student"},
      {text: "Parent", value: "parent"}
   ]

   $scope.$watch('form', function (newVal, oldVal)
   {
      if (newVal !== oldVal && newVal.list !== "" && newVal.type !== "")
      {
         districts.setSettings(newVal.list.name, newVal.type);
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
         "title": "Can I turn off push notifications?",
         "answer": "Sure you can! Just go to your settings page and set \"Push Notifcations\" to off."
      }
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
