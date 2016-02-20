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
  .filter('artistNameFilter', function () {
    return function (model) {
      return model.artist.substring(3, model.artist.length);
    };
  })
  .filter('albumTitleFilter', function () {
    return function (model) {
      return model.album.substring(3, model.album.length);
    };
  })
  .controller('songCtrl', ['links', '$scope', '$stateParams', 'xipath', '$state', 'session', '$timeout', 'metrics', 'user', '$rootScope',
    function (links, $scope , $stateParams, xipath, $state, session, $timeout, metrics, user, $rootScope) {
      //model get/set
      var vm = this;

      vm.song = {
        "xipath":"",
        "bitrate":"",
        "duration":0,
        "name":"",
        "album":"",
        "artist":"",
        "genre":"",
        "year":"",
        "uri":""
      };
      vm.getArtistName = getArtistName;
      vm.getAlbumName = getAlbumName;
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
      vm.next = next;
      vm.isSongInContext = isSongInContext;



      //Load song into context
      if (!vm.song.uri) {
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


      //FOOS
      function getArtistName () {
        console.log($scope.model); //TESTING!!!
        return $scope.model.artist;
      }

      function getAlbumName () {
        return $scope.model.album;
      }

      function getYear () {
        return $scope.model.year;
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
        if ($scope.isSongInContext()) {
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
          $audio.addEventListener('ended', $scope.next);
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
        if ($audio && $audio.currentTime === 0) {
          $scope.load();
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
      function next () {
        console.log('attempting to skip to next song'); //TESTING!!!
        var nxt = session.getNextXipath(xipath.getContext());

        $timeout(function () {
          xipath.setContext(nxt);
          $scope.$apply();
          $scope.load();
        });
      }

      function isSongInContext (xi) {
        return xipath.getContext() === xi;
      }

    }]);
