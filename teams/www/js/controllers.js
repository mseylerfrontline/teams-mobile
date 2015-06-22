angular.module('starter.controllers', [])

/* Controls the District Selection Page */
.controller('DistrictCtrl', function($scope, $ionicPlatform, $ionicPopup, $location, $ionicHistory, $state, districts, status) {

   /* Don't run our plugins until they're loaded */
   $ionicPlatform.ready(function() {


      /* Load list of districts via our REST api */
      districts.get($scope, function (data)
      {
         $scope.districts = data.districts; //Make the data accessible to the page

         if (navigator.geolocation)
         {
            navigator.geolocation.getCurrentPosition(function (position)
            {
               districts.find(position, $scope, function (district)
               {
                  console.log(district.altName);
                  //$scope.form.list = $scope.districts[0]
                  $scope.form.list = _.findWhere($scope.districts, {name: district.name});
               });
            });
         }
      })

   });

   $scope.forms = {}; //So we can access our form from within a child scope
   $scope.form = { //The actual form values
      submitted: false,
      list: '',
      zip: ''
   }

   /* Whenever our form is submitted */
   $scope.submit = function ()
   {
      $scope.form.submitted = true; //Tell our errors they can show now

      if ($scope.forms.form1.zipField.$valid) { //If the zip field is a zip code
         $scope.showConfirm($scope.form.zip);
      }
      else if ($scope.form.list !== "") { //If we've selected a district from the list
         $scope.showConfirm($scope.form.list);
      }
   }

   /* Confirm our district selection with a pop-up */
   $scope.showConfirm = function(district)
   {
      var confirmPopup = $ionicPopup.confirm({
         title: 'Confirm District',
         template: 'Make <b>'+district+'</b> your default district? (This can be changed later in your settings.)'
      });

      confirmPopup.then(function(res) { //Once our user has made a choice

         if (res)  //If they confirmed
         {
            /* Go to the login page and prevent going back to this page. */
            $location.path('login').replace()
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
.controller('AppCtrl', function($scope, $ionicHistory) {

   /* Reenable the back button so a user can return to the app after visiting their settings */
   $ionicHistory.nextViewOptions({
      disableAnimate: false,
      disableBack: false
   });
})

/* Controls the Settings Page (accessible via a button on the Main page)*/
.controller('SettingsCtrl', function($scope) {

})
