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
