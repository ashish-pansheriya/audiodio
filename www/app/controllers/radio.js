angular.module('radioStuff', [])
.controller('channelsCtrl', ChannelsCtrl);

  ChannelsCtrl.$inject = ['$rootScope', '$scope', 'links', '$state', 'radioService', 'user', 'session', 'xipath'];
  function ChannelsCtrl ($rootScope, $scope, links, $state, radioService, user, session, xipath) {

  $scope.channelOptions = [
  ];
  $scope.channel = {
    url: 'b'
  };

  $scope.changeChannel = function (val) {
    radioService.changeChannel(val);
    $rootScope.$broadcast('radio:continue');
  };

  links.formUrl('radioChannels').then(function (url) {
    radioService.fetchChannels(url).then(function (channels) {
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
}