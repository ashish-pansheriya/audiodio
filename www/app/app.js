// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('audiodio', [
  'ionic',
  'frame',
  'splash',
  'resourceDirectory',
  'browse',
  'audiodio.playlist',
  'audiodio.directives.song',
  'audiodio.directives.song-info',
  'audiodio.directives.artist',
  'account',
  'search',
  'history',
  'radioStuff',
  'radioServices',
  'album.covers',
  'meta-data',
  'audiodio.search.artists',
  'angular-inview',
  'audiodio.metrics',
  'audiodio.xipath'
])

  .run(function($ionicPlatform) {
    $ionicPlatform.ready(function () {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      if (window.cordova && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        cordova.plugins.Keyboard.disableScroll(false);
        cordova.plugins.backgroundMode.enable(); //do not freeze on context switch for iphone
        cordova.plugins.backgroundMode.onfailure = function(errorCode) {
          console.log(errorCode); //TESTING!!!
        };
        cordova.plugins.backgroundMode.ondeactivate = function() {
          console.log('deactivated');//TESTING!!!
        };
        //cordova.plugins.backgroundMode.disable();
      }
      if (window.StatusBar) {
        // org.apache.cordova.statusbar required
        StatusBar.styleDefault();
      }
    });
  })
  .factory('httpHeaderFilter', function () {
    return {
      request: function (config) {

        // use this to destroying other existing headers
/*        config.headers = {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, X-Requested-With'
        };*/

        // use this to prevent destroying other existing headers
        // config.headers['Authorization'] = 'authentication';

        return config;
      }
    };
  })
  .config(['$stateProvider', '$urlRouterProvider', '$httpProvider', '$ionicConfigProvider', function ($stateProvider, $urlRouterProvider, $httpProvider, $ionicConfigProvider) {

    //FIXES tabs on footer for android
    $ionicConfigProvider.tabs.position('bottom');

    //ALLOW CORS
  $httpProvider.interceptors.push('httpHeaderFilter');

    $stateProvider

      .state('app', {
        url: '/audiodio',
        abstract: true,
        templateUrl: 'app/controllers/frame.html',
        controller: 'frameCtrl',
        cache:false
      })
      .state('app.welcome', {
        url: '/welcome',
        views: {
          'mainContent': {
            templateUrl: 'app/controllers/splash.html',
            controller: 'splashCtrl as vm'
          }
        }
      })
      .state('app.artists', {
        url: '/artists',
        views: {
          'mainContent': {
            templateUrl: 'app/controllers/artists.html',
            controller: 'ArtistsCtrl as vm'
          }
        }
      })
      .state('app.albums', {
        url: '/albums',
        views: {
          'mainContent': {
            templateUrl: 'app/controllers/albums.html',
            controller: 'albumsCtrl'
          }
        }
      })
      .state('app.playlists', {
        url: '/playlists',
        views: {
          'mainContent': {
            templateUrl: 'app/controllers/playlists.html',
            controller: 'playlistsCtrl'
          }
        }
      })
      .state('app.playlist', {
        url: '/playlist',
        views: {
          'mainContent': {
            templateUrl: 'app/controllers/album.html',
            controller: 'playlistCtrl'
          }
        }
      })
      .state('app.radio', {
        url: '/radio',
        views: {
          'mainContent': {
            templateUrl: 'app/controllers/channels.html',
            controller: 'channelsCtrl'
          }
        }
      })
      .state('app.album', {
        url: '/album',
        views: {
          'mainContent': {
            templateUrl: 'app/controllers/album.html',
            controller: 'albumCtrl'
          }
        }
      });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/audiodio/welcome');
  }]).filter('trusted', ['$sce', function ($sce) {
    return function(url) {
      return $sce.trustAsResourceUrl(url);
    };
  }]);
