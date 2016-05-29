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
  'radioStuff', //radio view
  'audiodio.services.radio',
  'album.covers',
  'meta-data',
  'audiodio.search.artists',
  'audiodio.search.albums',
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
        controller: 'frameCtrl as vm',
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
            controller: 'albumsCtrl as vm'
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
            controller: 'channelsCtrl as vm'
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

angular.module('audiodio.search.albums', [])
.controller('albumsCtrl', AlbumsCtrl);
AlbumsCtrl.$inject = ['links', 'browseAlbum', 'directory', 'albumCovers'];

function AlbumsCtrl (links, browseAlbum , directory, albumCovers) {
  var vm = this;
  vm.xipath    = directory.getContext();
  vm.albums    = [];

  if (vm.xipath.length > 0) {
    links.formUrl('getDirectories').then(function (url) {
      browseAlbum.getAtXipath(url, vm.xipath).then(function (albums) {
        //load meta data for each album SEQUENTIALLY
        var a = 0;
        iterate();
        function iterate () {
          links.formUrl('albumMetaData').then(function (url) {
            albumCovers.fetchAlbumMetaData(url, albums[a].xipath, albums[a].name).then(function (album) {

              vm.albums.push(album);


              if (a + 1 < albums.length) {
                a++;
                iterate();
              }
            });
          });
        }

      });
    });
  }
}


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
  .controller('frameCtrl', FrameCtrl);
  FrameCtrl.$inject = ['$rootScope', '$scope', '$ionicModal', 'session', 'xipath', 'links', 'user', '$ionicHistory', '$location', '$state', 'radioService'];
  function FrameCtrl ($rootScope, $scope, $ionicModal, session, xipath, links, user, $ionicHistory, $location, $state, radioService) {
    var vm = this;
    vm.playlist = {
      songs: [],
      playlistName: ''
    };
    vm.playlist.songs = session.getSongs; //bind to playlist collection
    vm.playlist.playlistName = session.getPlaylistName();//bind playlist recording
    vm.savePlaylist = savePlaylist;
    vm.clearPlaylist = clearPlaylist;
    vm.goBack = goBack;

    vm.listenToRadio = false;
    vm.isRadioOn = isRadioOn; //has the service been configured yet? channel set yet?
    vm.toggleRadio = toggleRadio; //continuous play after radio is turned on
    vm.shufflePlaylist = shufflePlaylist;

    $scope.$on('song:load', function (e) {
        listenToRadio();
    });


    function shufflePlaylist () {
      //TODO: shuffle playlist
    }
    function isRadioOn () {
      return radioService.isRadioOn();
    }
    function toggleRadio () {
      listenToRadio();
    }
    function savePlaylist () {
      //TODO: show popup
/*      links.formUrl('savePlaylist').then(function (url) {
        session.setPlaylistName($scope.playlist.playlistName);
        session.savePlaylist(url, user.getId()).then(function (success) {
          //success is boolean
        });
      });*/
    }


    function clearPlaylist () {
      session.clearSongs();
    }


    function goBack () {
      $ionicHistory.goBack();
    }

    function listenToRadio () {
      //determine if need to fetch more songs
      if (vm.listenToRadio && session.playlist.length - session.indexOfSongByXipath(xipath.getContext()) <= 1) {
        links.formUrl('radio').then(function (url) {
          radioService.fetchSongs(url, user.getId()).then(function (songs) {
            for (var s in songs) {
              session.add(songs[s]);
            }
          });
        });
      }
    }

  }

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
.controller('channelsCtrl', ChannelsCtrl);

  ChannelsCtrl.$inject = ['$rootScope', '$scope', 'links', '$state', 'radioService', 'user', 'session', 'xipath'];
  function ChannelsCtrl ($rootScope, $scope, links, $state, radioService, user, session, xipath) {
    var vm = this;
    vm.channelOptions = [];
    vm.changeChannel = changeChannel;

  links.formUrl('radioChannels').then(function (url) {
    radioService.fetchChannels(url).then(function (channels) {
      vm.channelOptions = channels;
    });
  });

  function changeChannel (val) {
    radioService.turnOn();
    radioService.changeChannel(val);
    //$rootScope.$broadcast('radio:continue');
  }


}
angular.module('search', [])

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
angular.module('album.covers', [])
  .directive('albumSleeve', [function () {
    return {
      restrict: 'EA',
      scope: {
        model: '='
      },
      controller: 'sleeveCtrl as vm',
      templateUrl: 'app/directives/albumArt.html'
    };
  }])
  .controller('sleeveCtrl', AlbumSleeve);

  AlbumSleeve.$inject = [ '$scope', '$state', 'directory'];

    function AlbumSleeve ( $scope, $state, directory) {
      var vm = this;
      vm.getAlbumName = getAlbumName;
      vm.getAlbumYear = getAlbumYear;

      vm.showAlbum = gotoAlbum;
      vm.isExpanded = false;

      vm.meta = $scope.model;

      function getAlbumName() {

        return vm.meta.title;

      }
      function getAlbumYear () {
        if (vm.meta.year !== '0000') {
          return vm.meta.year;
        } else {
          return '';
        }
      }

      function gotoAlbum () {
        directory.setContext(vm.meta.xipath);
        $state.go('app.album', {reload: true});
      }
    }
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
.controller('songCtrl', SongCtrl)
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

SongCtrl.$inject = ['links', '$scope', 'xipath', 'session', '$timeout', 'metrics', 'user', 'artistCovers', '$ionicScrollDelegate'];
function SongCtrl (links, $scope , xipath, session, $timeout, metrics, user, artistCovers, $ionicScrollDelegate) {
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

  vm.artist = {
    xipath: '',
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
  //playlist methods
  function showSong (s) {
    xipath.setContext(s.xipath);
    togglePlayingState();

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

    $scope.$emit('song:load');

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

}

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
  .controller('songInfoCtrl', ['links', '$scope', '$stateParams', 'xipath', '$state', 'session', '$timeout', 'metrics', 'user', '$rootScope', 'albumCovers',
    function (links, $scope , $stateParams, xipath, $state, session, $timeout, metrics, user, $rootScope, albumCovers) {
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
      vm.album = {
        xipath: '',
        year: '',
        title: '',
        image: "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
      };

      vm.song = angular.extend(vm.song, $scope.model); //passed into directive

      showMetaData($scope.position < loadIndexLimit);

      function showMetaData(visible) {
        if (visible) {

          //load artist meta data
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
      function (err) {
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
    //TODO: put this in a config file somewhere
    var MOCKALBUMCOVER = {
      "year" : "",
      "image" : "data:image/png;base64,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"
    };
    function fetchAlbumMetaData (link, xipath, title) {
      var cb = $q.defer();
      link += '/' + xipath;

      if (service.albums[xipath]) {
        cb.resolve(service.albums[xipath]);
      } else {
        $http.get(link).then(function (res) {
          if (typeof res.data.xipath == 'undefined') {
            var placeholder = angular.copy(MOCKALBUMCOVER);
            placeholder.title = title;
            placeholder.xipath = xipath;
            service.albums[xipath] = placeholder;
          } else {
            service.albums[xipath] = res.data;
          }

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
    session.playlistName = 'Recently Played'; //DEPRECATED
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




angular.module('audiodio.services.radio', [])

.service('radioService', radio);
radio.$inject = ['$http', '$q'];

function radio ($http, $q) {
  var service = {
    station: {
      channel: '',
      pageSize: 25, //coupled to backend
      isTurnedOn: false
    },
    fetchSongs: fetchSongs,
    turnOn: turnOn,
    turnOff: turnOff,
    isRadioOn: isRadioOn,
    fetchChannels: fetchChannels,
    changeChannel: changeChannel,
    tuneIn: changeChannel
  };



  function fetchSongs (link, userId) {
    var cb = $q.defer();

    link += userId;
    link += '/' + service.station.channel;

    $http.get(link).then(function (response) {
        cb.resolve(response.data);
      },
      function (err) {
        cb.resolve([]);
      });

    return cb.promise;
  }
  function turnOn () {
    service.station.isTurnedOn = true;
  }
  function turnOff () {
    service.station.isTurnedOn = false;
  }
  function isRadioOn () {
    return service.station.isTurnedOn;
  }
  function fetchChannels (link) {
    var cb = $q.defer();
    $http.get(link).then(function (response) {
        cb.resolve(response.data.channels);
      },
      function (err) {
        cb.resolve([]);
      });
    return cb.promise;
  }
  function changeChannel (channel) {
    service.station.channel = channel;
  }
  return service;
}

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
