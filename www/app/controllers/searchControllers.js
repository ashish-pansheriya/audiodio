angular.module('search', [])
  .controller('artistsCtrl', ['links', '$scope', 'browseArtist', 'directory', '$state', '$ionicModal', '$filter', 'user', '$timeout', function (links, $scope, browseArtist, directory, $state, $ionicModal, $filter, user, $timeout) {
    $ionicModal.fromTemplateUrl('app/controllers/browseSettingsModal.html', {
      scope: $scope,
      animation: 'slide-in-up',
      controller: 'browseSettingsCtrl'
    }).then(function(modal) {
      $scope.browseSettingsModal = modal;
    });
    $scope.comparators = {
      sortByHeat : function (model) {
        return -1 * model.heat;
      },
      sortByName : function (model) {
        return $filter('artistTitle')(model);
      }
    };

    $scope.sortOptions = [
      { text: "Heat Value", value: 'sortByHeat' },
      { text: "Artist Name", value: 'sortByName' }
    ];
    $scope.default = {
      val: 'sortByHeat'
    };
    $scope.changeSort = function (val) {
      $scope.browseComparator =  $scope.comparators[val];
      $timeout(function () {
        $scope.$apply();
      });

    };

    $scope.browseComparator =  $scope.sortByHeat;

    $scope.setXipath = function (xi) {
      directory.setContext(xi);
      $state.go('app.albums', {reload: true});
    };
    $scope.artists = [];
    function fetchArtists() {
      links.formUrl('searchByArtist').then(function (url) {
        browseArtist.getAll(url, user.getId(), '').then(function (artists) {
          $scope.artists = artists;
        });
      });
    }

    fetchArtists();
  }])
  .controller('albumsCtrl', ['links', '$scope', 'browseAlbum', '$stateParams', 'directory', '$state', function (links, $scope, browseAlbum , $stateParams, directory, $state) {

    $scope.xipath    = directory.getContext();
    $scope.albums    = [];

    if ($scope.xipath.length > 0) {
      links.formUrl('getDirectories').then(function (url) {
        browseAlbum.getAtXipath(url, $scope.xipath).then(function (albums) {
          $scope.albums = albums;
        });
      });
    }
  }])
  .controller('songsCtrl', ['links', '$scope', 'browseAlbum', '$stateParams', 'directory', 'session', 'user', '$state', function (links, $scope, browseAlbum , $stateParams, directory, session, user, $state) {
    $scope.songs  = [];
    $scope.addSong = function (song) {
      //xipath.setContext(song.xipath);
      session.add(song);
      links.formUrl('savePlaylist').then(function (url) {
        session.resetPlaylistName();
        session.savePlaylist(url, user.getId()).then(function (success) {
          //success is boolean
        });
      });
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
  }])
  .controller('albumCtrl', ['links', '$scope', 'browseAlbum', '$stateParams', 'directory', 'session', 'user', '$controller', function (links, $scope, browseAlbum , $stateParams, directory, session, user, $controller) {
    //inherit songs controller
    $controller('songsCtrl', {$scope: $scope});

    //models
    $scope.xipath = directory.getContext();


    if ($scope.xipath.length > 0) {
      links.formUrl('getDirectories').then(function (url) {
        browseAlbum.getAtXipath(url, $scope.xipath).then(function (songs) {
          $scope.songs = songs;
        });
      });
    }
  }])
  .filter('albumNameFilter', function () {
    return function (album) {
      if (album.name) {
        return album.name.substring(3, album.name.length - 1);
      } else {
        return '';
      }

    };
  })
  .filter('artistTitle', function () {
    return function (artist) {
      if (artist.name) {
        return artist.name.substring(3, artist.name.length - 1) + ' - ' + Math.ceil(artist.heat);
      } else {
        return '';
      }

    };
  })
  .filter('songNameFilter', function () {
    return function (song) {
      if (song.name) {
        return song.name.substring(3, song.name.length - 4);
      } else {
        return '';
      }

    };
  });


