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
