angular.module("audiodio.constants", [])

.constant("USER", "will")

;
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

/*var user = {
  id: 'will',
  token: null
};*/
angular.module('account', [
  'audiodio.constants'
])
.factory('user', ['$http', '$q', 'USER', function ($http, $q, USER) {
    var profile = {};

    profile.getId = function () {
      return USER;
    };

    profile.login     = function () {
      //TODO:
    };

    profile.logout    = function () {
      //TODO:
    };
    return profile;
}]);

var directory = {};
angular.module('browse', [])
  .factory('directory', ['$http', '$q',
    function ($http, $q) {
      var dir = {};
      dir.ls = function (xipath) {

      };

      return dir;
    }])
  .service('directory', function () {

    directory.context = ''; //root
    
    directory.setContext = function (xi) {
      directory.context = xi;
    };

    directory.getContext = function () {
      return directory.context;
    };

    return directory;
  })
  .factory('browseArtist', ['$http', '$q', function ($http, $q) {
    var artists = {};

    artists.getAll = function (link, user, key) {

      link += user + '?key=' + key;
      var cb = $q.defer();
      $http.get(link).then(function (response) {
          cb.resolve(response.data);
        },
        function (err) {
          cb.resolve([]);
        });

      return cb.promise;
    };

    return artists;
  }])
  .factory('browseAlbum', ['$http', '$q', function ($http, $q) {
  var albums = {};

  albums.getAtXipath = function (link, xipath) {
    link += '?xipath=' + xipath;
    var cb = $q.defer();
    $http.get(link).then(function (response) {
        cb.resolve(response.data.children);
      },
      function (err){
        cb.resolve([]);
      });

    return cb.promise;
  };

  return albums;
}]);


angular.module('meta-data', [])
  .factory('artistCovers', ['$q', '$http', function ($q, $http) {
    var service = {};
    service.artists = {}; //album cache

    service.fetchArtistMetaData = function (link, xipath) {
      var cb = $q.defer();
      link += '/' + xipath;

      if (service.artists[xipath]) {
        cb.resolve(service.artists[xipath]);
      } else {
        $http.get(link).then(function (res) {
            service.artists[xipath] = res.data;

            cb.resolve(service.artists[xipath]);
          },
          function (err) {
            cb.resolve({});
          });
      }

      return cb.promise;
    };
    return service;
  }])
  .factory('albumCovers', ['$q', '$http', function ($q, $http) {
    var service = {
      albums: {},
      fetchAlbumMetaData: fetchAlbumMetaData,
      getDefault: fetchDefaultAlbumMetaData
    };

    function fetchDefaultAlbumMetaData (link) {
      var cb = $q.defer();
      link += '/' + 'null';

      if (service.albums['null']) {
        cb.resolve(service.albums['null']);
      } else {
        $http.get(link).then(function (res) {
            service.albums['null'] = res.data;
            cb.resolve(service.albums['null']);
          },
          function (err) {
            cb.resolve({});
          });
      }

      return cb.promise;
    }
    function fetchAlbumMetaData (link, xipath) {
      var cb = $q.defer();
      link += '/' + xipath;

      if (service.albums[xipath]) {
        cb.resolve(service.albums[xipath]);
      } else {
        $http.get(link).then(function (res) {
            service.albums[xipath] = res.data;
            cb.resolve(service.albums[xipath]);
          },
          function (err) {
            cb.resolve({});
          });
      }

      return cb.promise;
    }
    return service;
  }]);
angular.module('audiodio.metrics', [])
  .factory('metrics', ['$http', '$q',
    function ($http, $q) {
      var metrics = {};
      /*      var dummy = {
       xipath: 'asdfa',
       userId: 'will'
       };*/

      metrics.recordSongPlayedByXipath = function (link, xipath, userId) {
        var cb = $q.defer();
        var payload = {
          xipath: xipath,
          userId: userId
        };

        $http.post(link, payload).then(function (res) {
            cb.resolve(true);
          },
          function (err) {
            cb.resolve(false);
          });

        return cb.promise;
      };
      return metrics;
    }]);
angular.module('audiodio.playlist', [])
.factory('session', ['$http', '$q', '$rootScope',
  function ($http, $q, $rootScope) {

    var session = {
      maxSessionSize : 500
    };

    session.temp = [];
    session.playlist = [];
    session.playlistName = 'Recently Played';
    session.getSongs = function () {
      return session.playlist;
    };
    session.clearSongs = function () {
      session.playlist = [];
      session.playlistName = 'Recently Played';
    };
    session.add = function (model) {
      var song = angular.copy(model); //fixed a funny bug where scope lost the model reference?
      if (session.indexOfSongByXipath(song.xipath) < 0 && song.xipath  && session.playlist.length < session.maxSessionSize) {
        session.playlist.push(song);
      }
    };
    session.indexOfSongByXipath = function (xi) {
      for (var s in session.playlist) {
        if (session.playlist[s].xipath === xi) {
          return parseInt(s);
        }
      }
      return -1;
    };
    session.removeSongByXipath = function (xi) {
      var killMe = session.indexOfSongByXipath(xi);
      if (killMe > -1) {
        session.playlist.splice(killMe, 1);
      }
    };

    session.getNextXipath = function (xipath) {

      var currentPosition = session.indexOfSongByXipath(xipath);
      if (currentPosition > -1 && currentPosition < session.playlist.length - 1) {
        return session.playlist[currentPosition + 1].xipath || '';//xipath;
      } else if (currentPosition > -1) {
        return '';//xipath;
      } else {
        return '';//xipath;
      }
    };

    //The following two methods are used to pass along a list of song models
    // TODO: improve dataflow from playlists -> playlist view
    session.holdPlaylist = function (songs) {
      session.temp = songs;
    };
    session.getHeldPlaylist = function () {
      return session.temp;
    };


    session.getPlaylistName = function () {
      return session.playlistName;
    };
    session.resetPlaylistName = function () {
      session.setPlaylistName('Recently Played');
    };
    session.setPlaylistName = function (name) {
      session.playlistName = name;
    };
    session.removePlaylist = function (link, user, listname) {
      var cb = $q.defer();

      link += user; //path param
      link += '?name=' + listname;

      $http.delete(link).then(function (res) {
          cb.resolve(true);
        },
        function (err) {
          cb.resolve(false);
        });
      return cb.promise;

    };

    session.getPlaylists = function (link, user) {
      var cb = $q.defer();

      link += user; //path param
      link += '?name=' + session.playlistName;

      $http.get(link).then(function (res) {
          var lists = [];
          for (var l in res.data) {
            lists[l] ={
              songs: res.data[l].xipaths,
              name: res.data[l].listName,
              _id: res.data[l]._id
            };
          }

          cb.resolve(lists);
        },
        function (err) {
          cb.resolve([]);
        });
      return cb.promise;
    };
    session.getPlaylistByName = function (link, user, name) {
      var cb = $q.defer();
      session.getPlaylists(link, user).then(function (lists) {
        for (var l in lists) {
          if (lists[l].name === name) {
            cb.resolve(lists[l]);
          }
        }
        cb.resolve([]);
      });
      return cb.promise;
    };

    session.savePlaylist =  function (link, user) {
      var cb = $q.defer();

      link += user; //path param
      link += '?name=' + session.playlistName;

      if (session.playlist.length > 0) {
        link += '&xipath=' + session.playlist[0].xipath;
        for (var xi = 1; xi < session.playlist.length; xi++) {
          link += ',' + session.playlist[xi].xipath;
        }
        $http.put(link).then(function (res) {
            cb.resolve(true);
          },
          function (err) {
            cb.resolve(false);
          });
      } else {
        cb.resolve(false);
      }

      return cb.promise;
    };
    return session;
  }]);



var station = {
  channel: '',
  pageSize: 25,
  isTurnedOn: true
};

angular.module('radioServices', [])
  .service('radioService',  ['$http', '$q',
    function ($http, $q) {
      var radio = {};

      radio.fetchSongs = function (link, userId) {
        var cb = $q.defer();

        link += userId;
        link += '/' + station.channel;

        $http.get(link).then(function (response) {
            cb.resolve(response.data);
          },
          function (err) {
            cb.resolve([]);
          });

        return cb.promise;
      };
      return radio;
    }])
  .service('channelTuner',  ['$http', '$q',
    function ($http, $q) {
      var tuner = {};

      tuner.turnOn = function () {
        station.isTurnedOn = true;
      };
      tuner.turnOff = function () {
        station.isTurnedOn = false;
      };

      tuner.isRadioOn = function () {
        return station.isTurnedOn;
      };

      tuner.fetchChannels = function (link) {
        var cb = $q.defer();
        $http.get(link).then(function (response) {
            cb.resolve(response.data.channels);
          },
          function (err) {
            cb.resolve([]);
          });
        return cb.promise;
      };

      tuner.changeChannel = function (channel) {
        station.channel = channel;
        console.log(channel); //TESTING!!!
      };
      tuner.tuneIn = tuner.changeChannel; //cool overload xD


      return tuner;
    }]);


var resourceLocale = 'http://192.168.2.203:8080/resources/public/resource-directory';//window.location.origin + '/resources/public/resource-directory';
var resources = {
  resourceDirectory: []
};
angular.module('resourceDirectory', [])
  .factory('links', ['$http', '$q',
    function ($http, $q) {

      var resourceLinks = {};
      resourceLinks.findResourceLink = function (title, links) {
        return links[title] || '';
      };

      resourceLinks.formUrl = function (resourceName) {
        var cb = $q.defer();
        if (resources.resourceDirectory.length === 0) { //keep singleton
          $http.get(resourceLocale).then(function (response) {
              resources.resourceDirectory = response.data || {};
              var link = resourceLinks.findResourceLink(resourceName, resources.resourceDirectory);
              cb.resolve(link);
            },
            function (err) {
              cb.resolve('');
            });
        } else {
          var link = resourceLinks.findResourceLink(resourceName, resources.resourceDirectory);
          cb.resolve(link);
        }

        return cb.promise;
      };

      return resourceLinks;
    }]);

angular.module('audiodio.xipath', [])
.service('xipath',  ['$http', '$q',
  function ($http, $q) {
    var service  = {
      context: '',
      setContext : setContext,
      getContext: getContext,
      fetchSongByXipath: getSongMetaData,
      cache: {}
    };

    function setContext (xi) {
      service.context = xi;
    }
    function getContext () {
      return service.context || '';
    }

    function getSongMetaData (link, xipath) {
      var cb = $q.defer();

      link += '?xipath=' + xipath;
      var mock = {
        "xipath":"000000000000",
        "bitrate":"N/A",
        "duration":0,
        "name":"00 N_A.mp3",
        "album":"001 N_A",
        "artist":"000 N_A",
        "genre":"002 N_A",
        "year":"N_A ",
        "uri":""
      };
      if (service.cache[xipath]) {
        cb.resolve(service.cache[xipath]);
      } else {
        $http.get(link).then(function (response) {
            service.cache[xipath] = response.data;
            cb.resolve(response.data);
          },
          function (err) {
            cb.resolve(mock);
          }
        );
      }
      return cb.promise;
    }

    return service;
  }]);

angular.module('audiodio.search.artists', [])

.controller('ArtistsCtrl', ArtistsCtrl);

ArtistsCtrl.$inject = ['links', '$scope', 'browseArtist', 'directory', '$state', '$ionicModal', '$filter', 'user', '$timeout'];

function ArtistsCtrl (links, $scope, browseArtist, directory, $state, $ionicModal, $filter, user, $timeout) {
  var vm = this;
  vm.artists = [];
  vm.setXipath = setXipath;
  vm.doRefresh = fetchArtists;
  vm.toggleSort = toggleComparator;
  vm.isSortByHeat = true;

  vm.sortPopup = null;
  vm.comparators = {
    sortByHeat : function (model) {
      return -1 * model.heat;
    },
    sortByName : function (model) {
      return $filter('artistTitle')(model);
    }/*,
    sortByYear: function (model) {
      //TODO: query artist meta data service to get years active. this comparator will need to wait on promises
    }*/
  };

  function toggleComparator() {
    vm.isSortByHeat = !vm.isSortByHeat;
    if (vm.isSortByHeat) {
      vm.browseComparator =  vm.comparators.sortByHeat;
    } else {
      vm.browseComparator =  vm.comparators.sortByName;
    }

    //force re render
    $timeout(function () {
      $scope.$apply();
    });
  }

  function setXipath (xi) {
    directory.setContext(xi);
    $state.go('app.albums', {reload: true});
  }

  function fetchArtists() {
    links.formUrl('searchByArtist').then(function (url) {
      browseArtist.getAll(url, user.getId(), '').then(function (artists) {
        vm.artists = artists;
        $scope.$broadcast('scroll.refreshComplete');
      });
    });
  }

  fetchArtists();
}
angular.module('frame', [])
  .controller('frameCtrl', ['$rootScope', '$scope', '$ionicModal', 'session', 'xipath', 'links', 'user', '$ionicHistory', '$location', '$state', 'radioService',  function ($rootScope, $scope, $ionicModal, session, xipath, links, user, $ionicHistory, $location, $state, radioService) {

    $scope.playlist = {
      songs: [],
      playlistName: ''
    };

    //bind to playlist collection
    $scope.playlist.songs = session.getSongs;

    //bind playlist recording
    $scope.playlist.playlistName = session.getPlaylistName();

/*    function popState(state) {
      var pieces = state.split('.');
      pieces = pieces.splice(0, pieces.length - 1);
      return pieces.join('');
    }*/
    $scope.savePlaylist = function () {
      links.formUrl('savePlaylist').then(function (url) {
        session.setPlaylistName($scope.playlist.playlistName);
        session.savePlaylist(url, user.getId()).then(function (success) {
          //success is boolean
        });
      });
    };

    $scope.clearPlaylist = function () {
      session.clearSongs();
    };

    $scope.goBack = function() {
      $ionicHistory.goBack();
    };

  }]);

angular.module('history', [])
.controller('playlistsCtrl', ['links', '$scope', 'browseAlbum', '$stateParams', 'session', 'user', '$state', function (links, $scope, browseAlbum , $stateParams, session, user, $state) {
    $scope.lists = [];

    $scope.showList = function (list) {
      session.holdPlaylist(list.songs);
      $state.go('app.playlist');
    };
    $scope.deleteList = function (list) {
      links.formUrl('savePlaylist').then(function (link) {
        session.removePlaylist(link, user.getId(), list.name).then(function (success) {
          if (success) {
            $scope.getLists();
          }
        });
      });
    };
    $scope.getLists = function () {
      links.formUrl('playlists').then(function (link) {
        session.getPlaylists(link, user.getId()).then(function (lists) {
          $scope.lists = lists;
        });
      });
    };

    $scope.getLists();
}])
.controller('playlistCtrl', ['links', '$scope', 'browseAlbum', '$stateParams', 'directory', 'session', 'user', '$state', '$controller', '$stateParams', function (links, $scope, browseAlbum , $stateParams, directory, session, user, $state, $controller, $stateParams) {
  //inherit songs controller
  $controller('songsCtrl', {$scope: $scope});

  //models
  $scope.songs  = session.getHeldPlaylist();


}]);

angular.module('radioStuff', [])
.controller('channelsCtrl', ['$rootScope', '$scope', 'channelTuner', 'links', '$state', 'radioService', 'user', function ($rootScope, $scope, channelTuner, links, $state, radioService, user) {

    $scope.channelOptions = [
    ];
    $scope.channel = {
      url: 'b'
    };

    $scope.changeChannel = function (val) {
      channelTuner.changeChannel(val);
      $rootScope.$broadcast('radio:continue');
    };

    links.formUrl('radioChannels').then(function (url) {
      channelTuner.fetchChannels(url).then(function (channels) {
        $scope.channelOptions = channels;
      });
    });

    function listenToRadio () {
      links.formUrl('radio').then(function (url) {
        radioService.fetchSongs(url, user.getId()).then(function (songs) {
          for (var s in songs) {
            session.add(songs[s]);
          }
        });
      });
    }
    $rootScope.$on('radio:continue', function (e) {
      //determine if need to fetch more songs
      var radioFetchThreshold = 1; //fetch more songs when listening to last song
      if ($state.current.name.indexOf('app.radio') > -1 && session.playlist.length - session.indexOfSongByXipath(xipath.getContext()) <= radioFetchThreshold ) {
        listenToRadio();
      }
    });
  }]);
angular.module('search', [])
  .controller('albumsCtrl', ['links', '$scope', 'browseAlbum', '$stateParams', 'directory', '$state', function (links, $scope, browseAlbum , $stateParams, directory, $state) {

    $scope.xipath    = directory.getContext();
    $scope.albums    = [];

    if ($scope.xipath.length > 0) {
      links.formUrl('getDirectories').then(function (url) {
        browseAlbum.getAtXipath(url, $scope.xipath).then(function (albums) {
          $scope.albums = albums;
        });
      });
    }
  }])
  .controller('songsCtrl', ['links', '$scope', 'browseAlbum', '$stateParams', 'directory', 'session', 'user', '$state', function (links, $scope, browseAlbum , $stateParams, directory, session, user, $state) {
    $scope.songs  = [];
    $scope.addSong = function (song) {
      //xipath.setContext(song.xipath);
      session.add(song);
      links.formUrl('savePlaylist').then(function (url) {
        session.resetPlaylistName();
        session.savePlaylist(url, user.getId()).then(function (success) {
          //success is boolean
        });
      });
    };
    $scope.addAllSongs = function () {
      if ($scope.songs.length > 0) {
        for (var s in $scope.songs) {
          session.add($scope.songs[s]);
        }
        links.formUrl('savePlaylist').then(function (url) {
          session.resetPlaylistName();
          session.savePlaylist(url, user.getId()).then(function (success) {
            //success is boolean
          });
        });
      }
    };
  }])
  .controller('albumCtrl', ['links', '$scope', 'browseAlbum', '$stateParams', 'directory', 'session', 'user', '$controller', function (links, $scope, browseAlbum , $stateParams, directory, session, user, $controller) {
    //inherit songs controller
    $controller('songsCtrl', {$scope: $scope});

    //models
    $scope.xipath = directory.getContext();


    if ($scope.xipath.length > 0) {
      links.formUrl('getDirectories').then(function (url) {
        browseAlbum.getAtXipath(url, $scope.xipath).then(function (songs) {
          $scope.songs = songs;
        });
      });
    }
  }])
  .filter('albumNameFilter', function () {
    return function (album) {
      if (album.name) {
        return album.name.substring(3, album.name.length - 1);
      } else {
        return '';
      }

    };
  })
  .filter('artistTitle', function () {
    return function (artist) {
      if (artist.name) {
        return artist.name.substring(3, artist.name.length - 1) + ' - ' + Math.ceil(artist.heat);
      } else {
        return '';
      }

    };
  })
  .filter('songNameFilter', function () {
    return function (song) {
      if (song.name) {
        return song.name.substring(3, song.name.length - 4);
      } else {
        return '';
      }

    };
  });



angular.module('splash', [
  'account'
])

.controller('splashCtrl', SplashCtrl);

SplashCtrl.$inject = ['$scope', 'user'];

function SplashCtrl ($scope, user) {
  var vm = this;
  vm.username = user.getId();
}
<!--song in playlist-->
angular.module('album.covers', [])
  .directive('albumSleeve', [function () {
    return {
      restrict: 'EA',
      scope: {
        model: '='
      },
      controller: 'sleeveCtrl',
      templateUrl: 'app/directives/albumArt.html'
    };
  }])
  .controller('sleeveCtrl', ['links', '$scope',  'xipath', '$rootScope', 'albumCovers', '$state', 'directory', 'browseAlbum', 'session', 'user',
    function (links, $scope, xipath, $rootScope, albumCovers, $state, directory, browseAlbum, session, user) {

      $scope.meta = {
        id: "",
        image: "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==",
        notes: "",
        rating: 0,
        title: "",
        xipath: "",
        year: ""
      };

      $scope.getAlbumName = function () {
        if ($scope.meta.title !== 'NA') {
          return $scope.meta.title;
        } else {
          return $scope.model.name;
        }
      };

      $scope.getAlbumYear = function () {
        if ($scope.meta.year !== '0000') {
          return $scope.meta.year;
        } else {
          return '';
        }
      };

      $scope.addAllSongs = function () {
        if ($scope.songs.length > 0) {
          for (var s in $scope.songs) {
            session.add($scope.songs[s]);
          }
          links.formUrl('savePlaylist').then(function (url) {
            session.resetPlaylistName();
            session.savePlaylist(url, user.getId()).then(function (success) {
              //success is boolean
            });
          });
        }
      };

      $scope.showAlbum = function () {
        directory.setContext($scope.model.xipath);
        $state.go('app.album', {reload: true});
      };

      //Load album metadata
      links.formUrl('albumMetaData').then(function (url) {
        albumCovers.fetchAlbumMetaData(url, $scope.model.xipath).then(function (cover) {
          $scope.meta = cover;
        });
      });

      //load album songs
      links.formUrl('getDirectories').then(function (url) {
        browseAlbum.getAtXipath(url, $scope.model.xipath).then(function (songs) {
          $scope.songs = songs;
        });
      });

    }]);

angular.module('audiodio.directives.artist', ['angular-inview'])
.directive('artist', [function () { /* side menu */
  return {
    restrict: 'EA',
    scope: {
      model: '=',
      position: '='
    },
    controller: 'ArtistCtrl as vm',
    templateUrl: 'app/directives/artist.html'
  };
}])
.controller('ArtistCtrl', ArtistCtrl);
ArtistCtrl.$inject = ['links', '$scope', '$stateParams', 'xipath', '$state', 'session', '$timeout', 'metrics', 'user', '$rootScope', 'artistCovers'];

  function ArtistCtrl (links, $scope , $stateParams, xipath, $state, session, $timeout, metrics, user, $rootScope, artistCovers) {
    //model get/set
    var vm = this;
    var loadIndexLimit = 10; //load the first 10 artist meta data
    vm.name = $scope.model.name;
    vm.xipath = $scope.model.xipath;
    vm.showMetaData = showMetaData;

    vm.artist = {
      xipath: '',
      yearsActiveStart: '',
      yearsActiveEnd: '',
      image: "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
    };

    showMetaData($scope.position < loadIndexLimit);

    function showMetaData(visible) {
      if (visible) {
        //load artist meta data
        links.formUrl('artistMetaData').then(function (url) {
          artistCovers.fetchArtistMetaData(url, vm.xipath).then(function (artist) {
            vm.artist = artist;
          });
        });
      }
    }

  }




<!--song in playlist-->
angular.module('audiodio.directives.song', ['angular-inview'])
.directive('song', [function () { /* side menu */
  return {
    restrict: 'EA',
    scope: {
      model: '=',
      position: '='
    },
    controller: 'songCtrl as vm',
    templateUrl: 'app/directives/song.html'
  };
}])
.controller('songCtrl', ['links', '$scope', '$stateParams', 'xipath', '$state', 'session', '$timeout', 'metrics', 'user', '$rootScope', 'albumCovers',
  function (links, $scope , $stateParams, xipath, $state, session, $timeout, metrics, user, $rootScope, albumCovers) {
    //model get/set
    var vm = this;
    vm.showSong = showSong;
    vm.removeSong = removeSong;
    //audio tag controls
    vm.getCurrentTime = getCurrentTime;
    vm.currentTime = {};
    vm.currentTime.val = 0;
    vm.duration = 0;
    vm.renderThread = setInterval(function () {
      var $audio = document.getElementById(xipath.getContext());
      if ($audio) {
        $timeout(function () {
          vm.currentTime.val  = $audio.currentTime;
          vm.duration = $audio.duration;
          $scope.$apply();
        });
      }
    }, 2 * 1000);
    vm.isSongLoaded  = false;
    vm.isSongPlaying = isSongPlaying;
    vm.load = load;
    vm.play = play;
    vm.pause = pause;
    vm.togglePlayingState = togglePlayingState;
    vm.next = next;
    vm.isSongInContext = isSongInContext;
    vm.volume = 50.0;
    vm.album = {
      xipath: '',
      year: '',
      title: '',
      image: "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
    };
    vm.song = {
      "xipath": "",
      "bitrate":"",
      "duration":0,
      "name":"",
      "album":"",
      "artist":"",
      "genre":"",
      "year":"",
      "uri":""
    };
    vm.song = angular.extend(vm.song, $scope.model); //passed into directive

    showMetaData(); //get cached data or fetch GET data

    function showMetaData() {

        //load album meta data //TODO: change getDefault to fetch once we have a substantial percentage of album data inputed
        links.formUrl('albumMetaData').then(function (url) {
          albumCovers.getDefault(url, vm.song.xipath.substring(0,9)).then(function (album) {
            vm.album = album;
          });
        });

        //Load song into context
        if (!vm.song.uri ||vm.song.uri.length === 0) {
          links.formUrl('loadSong').then(function (url) {
            xipath.fetchSongByXipath(url, vm.song.xipath).then(function (song) {
              setTimeout(function () {
                $scope.$apply(function () {
                  vm.song = song;

                  vm.isSongLoaded = true;
                });
              }, 1);
            });
          });
        } else {
          vm.isSongLoaded = true;
        }
    }
    //playlist methods
    function showSong (s) {
      xipath.setContext(s.xipath);
    }

    function removeSong (s) {
      session.removeSongByXipath(s.xipath);

      links.formUrl('savePlaylist').then(function (url) {
        session.resetPlaylistName();
        session.savePlaylist(url, user.getId()).then(function (success) {
          //success is boolean
        });
      });

      clearInterval(vm.renderThread);
    }

    function getCurrentTime () {
      var $audio = document.getElementById(xipath.getContext());
      if (vm.isSongInContext()) {
        return $audio.currentTime;
      } else {
        return 0;
      }
    }


    function isSongPlaying () {
      var $audio = document.getElementById(xipath.getContext());
      if ($audio) {
        return !$audio.paused;
      } else {
        return false;
      }
    }

    function load () {
      var $audio = document.getElementById(xipath.getContext());
      if ($audio) {
        $audio.load();
        $audio.play();
        $audio.addEventListener('ended', vm.next);
      }

      $rootScope.$broadcast('radio:continue');

      links.formUrl('recordPlay').then(function (url) {
        metrics.recordSongPlayedByXipath(url, vm.song.xipath, user.getId()).then(function (success) {
          if (success) {
            console.log('recording song being played'); //TESTING!!!
          } else {
            console.log('could not record song being played'); //TESTING!!!
          }
        })
      });
    }
    function play () {
      var $audio = document.getElementById(xipath.getContext());
      $audio.volume = vm.volume / 100.0;
      if ($audio && $audio.currentTime === 0) {
        vm.load();
      } else if ($audio) {
        $audio.play();
      }
    }
    function pause () {
      var $audio = document.getElementById(xipath.getContext());
      if ($audio) {
        $audio.pause();
      }
    }
    function togglePlayingState () {
      if (vm.isSongPlaying()) {
        vm.pause();
      } else {
        vm.play();
      }
    }
    function next () {
      console.log('attempting to skip to next song'); //TESTING!!!
      var nxt = session.getNextXipath(xipath.getContext());

      $timeout(function () {
        xipath.setContext(nxt);
        $scope.$apply();
        vm.load();
      });
    }

    function isSongInContext (xi) {
      return xipath.getContext() === xi;
    }

  }])
  .filter('encodeReservedCharacters', function () {
    return function (uri) {
      return encodeURIComponent(uri);
    };
  })
  .filter('artistNameFilter', function () {
    return function (model) {
      return model.artist.substring(3, model.artist.length);
    };
  })
  .filter('albumNameFilter', function () {
    return function (model) {
      return model.album.substring(3, model.album.length);
    };
  });

angular.module('audiodio.directives.song-info', [])
  .directive('songinfo', [function () {
    return {
      restrict: 'EA',
      scope: {
        model: '=',
        position: '='
      },
      controller: 'songInfoCtrl as vm',
      templateUrl: 'app/directives/songInfo.html'
    };
  }])
  .controller('songInfoCtrl', ['links', '$scope', '$stateParams', 'xipath', '$state', 'session', '$timeout', 'metrics', 'user', '$rootScope', 'artistCovers',
    function (links, $scope , $stateParams, xipath, $state, session, $timeout, metrics, user, $rootScope, artistCovers) {
      //model get/set
      var vm = this;
      var loadIndexLimit = 5; //load the first few songs in either albums or playlist
      vm.song = {
        "xipath": "",
        "bitrate":"",
        "duration":0,
        "name":"",
        "album":"",
        "artist":"",
        "genre":"",
        "year":"",
        "uri":""
      };
      vm.getArtistName = getArtistName; //deprecated
      vm.getAlbumName = getAlbumName; //deprecated
      vm.getYear = getYear;

      vm.showMetaData = showMetaData;
      vm.artist = {
        xipath: '',
        image: "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
      };

      vm.song = angular.extend(vm.song, $scope.model); //passed into directive

      showMetaData($scope.position < loadIndexLimit);

      function showMetaData(visible) {
        if (visible) {

          //load artist meta data
          links.formUrl('artistMetaData').then(function (url) {
            artistCovers.fetchArtistMetaData(url, vm.song.xipath.substring(0,6)).then(function (artist) {
              vm.artist = artist;
            });
          });

          //Load song into context
          if (!vm.song.uri ||vm.song.uri.length === 0) {
            links.formUrl('loadSong').then(function (url) {
              xipath.fetchSongByXipath(url, vm.song.xipath).then(function (song) {
                setTimeout(function () {
                  $scope.$apply(function () {
                    vm.song = song;

                    vm.isSongLoaded = true;
                  });
                }, 1);
              });
            });
          } else {
            vm.isSongLoaded = true;
          }
        }
      }

      function getArtistName () {
        return vm.song.artist;
      }

      function getAlbumName () {
        return vm.song.album;
      }

      function getYear () {
        return vm.song.year;
      }
    }]);
