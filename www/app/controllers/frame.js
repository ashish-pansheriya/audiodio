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
