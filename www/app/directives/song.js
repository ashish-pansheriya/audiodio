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
  function isSongPlaying () {
    var $audio = document.getElementById(xipath.getContext());
    if ($audio) {
      return !$audio.paused;
    } else {
      return false;
    }
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
