<!--song in playlist-->
angular.module('songs', [])
  .directive('song', [function () { /* side menu */
    return {
      restrict: 'EA',
      scope: {
        model: '='
      },
      controller: 'songCtrl as vm',
      templateUrl: 'app/directives/song.html'
    };
  }])
  .directive('songinfo', [function () {
    return {
      restrict: 'EA',
      scope: {
        model: '='
      },
      controller: 'songCtrl as vm',
      templateUrl: 'app/directives/songInfo.html'
    };
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
  })
  .controller('songCtrl', ['links', '$scope', '$stateParams', 'xipath', '$state', 'session', '$timeout', 'metrics', 'user', '$rootScope', 'albumCovers',
    function (links, $scope , $stateParams, xipath, $state, session, $timeout, metrics, user, $rootScope, albumCovers) {
      //model get/set
      var vm = this;

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

      //Load song into context
      vm.song = angular.extend(vm.song, $scope.model); //passed into directive
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

      //load album meta data
      links.formUrl('albumMetaData').then(function (url) {
        albumCovers.fetchAlbumMetaData(url, vm.song.xipath.substring(0,9)).then(function (album) {
          vm.album = album;
        });
      });

      //FOOS
      function getArtistName () {
        return vm.song.artist;
      }

      function getAlbumName () {
        return vm.song.album;
      }

      function getYear () {
        return vm.song.year;
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

        clearInterval(renderThread);
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

    }]);
