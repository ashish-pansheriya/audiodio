<!--song in playlist-->
angular.module('songs', [])
  .directive('song', [function () {
    return {
      restrict: 'EA',
      scope: {
        model: '='
      },
      controller: 'songCtrl',
      templateUrl: 'app/directives/song.html'
    };
  }])
  .directive('songinfo', [function () {
    return {
      restrict: 'EA',
      scope: {
        model: '='
      },
      controller: 'songCtrl',
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

      $scope.model.artist = '';
      $scope.model.album  = '';
      $scope.getArtistName = function () {
        console.log($scope.model); //TESTING!!!
        return $scope.model.artist;
      };

      $scope.getAlbumName = function () {
        return $scope.model.album;
      };

      $scope.getYear = function () {
        return $scope.model.year;
      };
      //playlist methods
      $scope.showSong = function (s) {
        xipath.setContext(s.xipath);
      };

      $scope.removeSong = function (s) {
        session.removeSongByXipath(s.xipath);

        links.formUrl('savePlaylist').then(function (url) {
          session.resetPlaylistName();
          session.savePlaylist(url, user.getId()).then(function (success) {
            //success is boolean
          });
        });

        clearInterval(renderThread);
      };

      //audio tag controls
      $scope.currentTime = {};
      $scope.currentTime.val = 0;

      $scope.duration = 0;
      var renderThread = setInterval(function () {
        var $audio = document.getElementById(xipath.getContext());
        if ($audio) {
          $timeout(function () {
            $scope.currentTime.val  = $audio.currentTime;
            $scope.duration = $audio.duration;
            $scope.$apply();
          });
        }
      }, 2 * 1000);

      $scope.getCurrentTime = function () {
        var $audio = document.getElementById(xipath.getContext());
        if ($scope.isSongInContext()) {
          return $audio.currentTime;
        } else {
          return 0;
        }
      };
      $scope.isSongLoaded  = false;
      $scope.isSongPlaying = function () {
        var $audio = document.getElementById(xipath.getContext());
        if ($audio) {
          return !$audio.paused;
        } else {
          return false;
        }
      };


      $scope.load = function () {
        var $audio = document.getElementById(xipath.getContext());
        if ($audio) {
          $audio.load();
          $audio.play();
          $audio.addEventListener('ended', $scope.next);
        }

        $rootScope.$broadcast('radio:continue');

        links.formUrl('recordPlay').then(function (url) {
          metrics.recordSongPlayedByXipath(url, $scope.model.xipath, user.getId()).then(function (success) {
            if (success) {
              console.log('recording song being played'); //TESTING!!!
            } else {
              console.log('could not record song being played'); //TESTING!!!
            }
          })
        });
      };
      $scope.play = function () {
        var $audio = document.getElementById(xipath.getContext());
        if ($audio && $audio.currentTime === 0) {
          $scope.load();
        } else if ($audio) {
          $audio.play();
        }
      };
      $scope.pause = function () {
        var $audio = document.getElementById(xipath.getContext());
        if ($audio) {
          $audio.pause();
        }
      };
      $scope.next = function () {
        console.log('attempting to skip to next song'); //TESTING!!!
        var nxt = session.getNextXipath(xipath.getContext());

        $timeout(function () {
          xipath.setContext(nxt);
          $scope.$apply();
          $scope.load();
        });
      };

      $scope.isSongInContext = function (xi) {
        return xipath.getContext() === xi;
      };

      //Load song into context
      if (!$scope.model.uri) {
        links.formUrl('loadSong').then(function (url) {
          xipath.fetchSongByXipath(url, $scope.model.xipath).then(function (song) {
            setTimeout(function () {
              $scope.$apply(function () {
                $scope.model = song;
                //overloaded fields
                $scope.uri = song.uri;

                $scope.duration = song.duration;

                $scope.isSongLoaded = true;
              });
            }, 1);


          });
        });
      } else {
        $scope.isSongLoaded = true;
        $scope.uri = $scope.model.uri;
        $scope.duration = $scope.model.duration;
      }

    }]);
