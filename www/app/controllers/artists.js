angular.module('audiodio.search.artists', [])

  .controller('ArtistsCtrl', ArtistsCtrl);

ArtistsCtrl.$inject = ['links', '$scope', 'browseArtist', 'directory', '$state', '$ionicModal', '$filter', 'user', '$timeout'];

function ArtistsCtrl (links, $scope, browseArtist, directory, $state, $ionicModal, $filter, user, $timeout) {
  var vm = this;
  vm.artists = [];
  vm.setXipath = setXipath;
  vm.doRefresh = fetchArtists;
  vm.toggleSort = toggleComparator;
  vm.isSortByHeat = true;

  vm.sortPopup = null;
  vm.comparators = {
    sortByHeat : function (model) {
      return -1 * model.heat;
    },
    sortByName : function (model) {
      return $filter('artistTitle')(model);
    }
  };

  function toggleComparator() {
    vm.isSortByHeat = !vm.isSortByHeat;
    if (vm.isSortByHeat) {
      vm.browseComparator =  vm.comparators.sortByHeat;
    } else {
      vm.browseComparator =  vm.comparators.sortByName;
    }

    //force re render
    $timeout(function () {
      $scope.$apply();
    });
  }

  function setXipath (xi) {
    directory.setContext(xi);
    $state.go('app.albums', {reload: true});
  }

  function fetchArtists() {
    links.formUrl('searchByArtist').then(function (url) {
      browseArtist.getAll(url, user.getId(), '').then(function (artists) {
        vm.artists = artists;
        $scope.$broadcast('scroll.refreshComplete');
      });
    });
  }

  fetchArtists();
}