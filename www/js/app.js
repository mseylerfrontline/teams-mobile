// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'ngCordova', 'ngAnimate', 'ngMessages', 'angularMoment', 'starter.controllers', 'starter.services', 'starter.directives'])

.run(function($ionicPlatform, $cordovaDevice) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleLightContent();
    }

    //Set device ID (depending on whether we're actually on mobile or not)
    if (ionic.Platform.isAndroid() || ionic.Platform.isIOS())
    {
      window.device = $cordovaDevice.getDevice();
    }
    else
    {
      window.device = {
         uuid: "123"
      }
    }
  });
})

.config(function ($ionicConfigProvider) {
   $ionicConfigProvider.views.maxCache(0);
})

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  // setup an abstract state for the tabs directive
   .state('district', {
      url: "/district",
      templateUrl: "templates/district.html",
      controller: "DistrictCtrl"
   })

   .state('login', {
      url: '/login',
      templateUrl: 'templates/login.html',
      controller: 'LoginCtrl'
   })

   .state('app', {
     url: "/app",
     abstract: true,
     templateUrl: "templates/menu.html",
     controller: 'MenuCtrl'
   })


   .state('app.main', {
      url: "/main",
      views: {
        'menuContent': {
          templateUrl: "templates/menu-main.html",
          controller: 'MainCtrl'
        }
      }
   })

   .state('app.settings', {
      url: "/settings",
      views: {
        'menuContent': {
          templateUrl: "templates/menu-settings.html",
          controller: 'SettingsCtrl'
        }
      }
   })

   .state('app.help', {
      url: "/help",
      views: {
        'menuContent': {
          templateUrl: "templates/menu-help.html",
          controller: 'HelpCtrl'
        }
      }
   })

   .state('app.help-topic', {
      url: "/help/:helpId",
      views: {
         'menuContent': {
            templateUrl: "templates/help-topic.html",
            controller: 'HelpTopicCtrl'
         }
      }
   })

   .state('app.page', {
      url: "/page/:pageId",
      views: {
        'menuContent': {
          templateUrl: "templates/menu-page.html",
          controller: 'PageCtrl'
        }
      }
   })

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/district');

});
