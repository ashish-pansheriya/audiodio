angular.module('frame', [])
  .controller('frameCtrl', FrameCtrl);
  FrameCtrl.$inject = ['$rootScope', '$scope', '$ionicModal', 'session', 'xipath', 'links', 'user', '$ionicHistory', '$location', '$state', 'radioService', '$filter', '$ionicTabsDelegate'];
  function FrameCtrl ($rootScope, $scope, $ionicModal, session, xipath, links, user, $ionicHistory, $location, $state, radioService, $filter, $ionicTabsDelegate) {
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
    vm.getCurrentSongName = getCurrentSongName;
    vm.listenToRadio = false;
    vm.isRadioOn = isRadioOn; //has the service been configured yet? channel set yet?
    vm.toggleRadio = toggleRadio; //continuous play after radio is turned on
    vm.shufflePlaylist = shufflePlaylist;
    vm.isPlaying = isSongPlaying;
    vm.togglePlayingState = togglePlayingState;
    vm.gotoBrowse = gotoBrowse;
    vm.stateHistory = ['app.artists']; //start off with default state for app.browse
    vm.browseStates = ['app.artists', 'app.albums', 'app.album']; //TODO: make these child states of app.browse
    $rootScope.$on('$stateChangeSuccess', function (ev, to, toParams, from, fromParams) {
      //assign the "from" parameter to something
      //console.log('recorded state change'); //TESTING!!!
      vm.stateHistory.push(from.name);
    });

    $scope.$on('song:load', function (e) {
        listenToRadio();
    });

    function gotoBrowse (index) {
      for (var b = vm.stateHistory.length - 1; b >= 0; b--) { //check state histories in reverse starting with most recent
        // TODO: once child states are defined in ui router, then look for anything matching app.browse
        if (vm.browseStates.indexOf(vm.stateHistory[b]) > -1) { //goto most recent browse state
          $state.go(vm.stateHistory[b]);
          $ionicTabsDelegate.select(index);
          return;
        }
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
      }
    }
    function play () {
      var $audio = document.getElementById(xipath.getContext());
      if ($audio && $audio.currentTime === 0) {
        load();
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
      if (isSongPlaying()) {
        pause();
      } else {
        play();
      }
    }
    function getCurrentSongName () {
      var xi = xipath.getContext();
      if (xi.length > 0) {
        var name = session.getSongByXipath(xi).name;
        return name.substring(3,name.length - 4);
      } else {
        return '';
      }
    }
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
      xipath.clearContext();
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
