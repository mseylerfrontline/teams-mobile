angular.module('starter.controllers', [])

/* Controls the District Selection Page */
.controller('DistrictCtrl', function($scope, $ionicPlatform, $ionicPopup, $location, $ionicHistory, $state, districts, status) {

   /* Don't run our plugins until they're loaded */
   $ionicPlatform.ready(function() {

      /* Load list of districts via our REST api */
      districts.getAll($scope, function (data)
      {
         console.log(data);
         $scope.districts = data; //Make the data accessible to the page

         if (navigator.geolocation)
         {
            navigator.geolocation.getCurrentPosition(function (position)
            {
               districts.findOne(position, $scope, function (district)
               {
                  console.log(district.altName);
                  if (district)
                  {
                     $scope.form.list = _.findWhere($scope.districts, {name: district.name});
                  }
               });
            });
         }
      })

   });

   if (districts.getSettings() && districts.getSettings().type !== "" && districts.getSettings().district !== "")
   {
      /* Go to the login page and prevent going back to this page. */
      $location.path('app').replace()
      $ionicHistory.nextViewOptions({
         disableAnimate: true,
         disableBack: true
      });
   }

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
            $location.path('app').replace()
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
      $location.path('app').replace()
      $ionicHistory.nextViewOptions({
         disableAnimate: false,
         disableBack: true
      });
   }
})

/* Controls the Main App Page */
.controller('AppCtrl', function($scope, $ionicHistory, $sce, districts) {

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
   })
})

/* Controls the Settings Page (accessible via a button on the Main page)*/
.controller('SettingsCtrl', function($scope, $ionicPlatform, $ionicHistory, $ionicPopup, $location, $ionicHistory, $state, districts, status) {

   /* Don't run our plugins until they're loaded */
   $ionicPlatform.ready(function() {

      /* Load list of districts via our REST api */
      districts.getAll($scope, function (data)
      {
         $scope.districts = data; //Make the data accessible to the page

         if (navigator.geolocation)
         {
            navigator.geolocation.getCurrentPosition(function (position)
            {
               var settings = districts.getSettings();
               $scope.$apply(function ()
               {
                  $scope.form.list = _.findWhere($scope.districts, {name: settings.district});
                  $scope.form.type = settings.type

               });
            });
         }
      })

   });

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
         console.log(newVal.list);
         districts.setSettings(newVal.list.name, newVal.type);
         $ionicHistory.clearCache()
      }
   }, true);
})
