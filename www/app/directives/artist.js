angular.module('audiodio.directives.artist', ['angular-inview'])
.directive('artist', [function () { /* side menu */
  return {
    restrict: 'EA',
    scope: {
      model: '=',
      position: '='
    },
    controller: 'ArtistCtrl as vm',
    templateUrl: 'app/directives/artist.html'
  };
}])
.controller('ArtistCtrl', ArtistCtrl);
ArtistCtrl.$inject = ['links', '$scope', '$stateParams', 'xipath', '$state', 'session', '$timeout', 'metrics', 'user', '$rootScope', 'artistCovers'];

  function ArtistCtrl (links, $scope , $stateParams, xipath, $state, session, $timeout, metrics, user, $rootScope, artistCovers) {
    //model get/set
    var vm = this;
    var loadIndexLimit = 10; //load the first 10 artist meta data
    vm.name = $scope.model.name;
    vm.xipath = $scope.model.xipath;
    vm.showMetaData = showMetaData;

    vm.artist = {
      xipath: '',
      yearsActiveStart: '',
      yearsActiveEnd: '',
      image: "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
    };

    showMetaData($scope.position < loadIndexLimit);

    function showMetaData(visible) {
      if (visible) {
        //load artist meta data
        links.formUrl('artistMetaData').then(function (url) {
          artistCovers.fetchArtistMetaData(url, vm.xipath).then(function (artist) {
            vm.artist = artist;
          });
        });
      }
    }

  }



