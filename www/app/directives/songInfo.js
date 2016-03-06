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
