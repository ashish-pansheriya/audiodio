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
