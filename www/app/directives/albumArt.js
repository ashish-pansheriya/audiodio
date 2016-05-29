angular.module('album.covers', [])
  .directive('albumSleeve', [function () {
    return {
      restrict: 'EA',
      scope: {
        model: '='
      },
      controller: 'sleeveCtrl as vm',
      templateUrl: 'app/directives/albumArt.html'
    };
  }])
  .controller('sleeveCtrl', AlbumSleeve);

  AlbumSleeve.$inject = [ '$scope', '$state', 'directory'];

    function AlbumSleeve ( $scope, $state, directory) {
      var vm = this;
      vm.getAlbumName = getAlbumName;
      vm.getAlbumYear = getAlbumYear;

      vm.showAlbum = gotoAlbum;
      vm.isExpanded = false;

      vm.meta = $scope.model;

      function getAlbumName() {

        return vm.meta.title;

      }
      function getAlbumYear () {
        if (vm.meta.year !== '0000') {
          return vm.meta.year;
        } else {
          return '';
        }
      }

      function gotoAlbum () {
        directory.setContext(vm.meta.xipath);
        $state.go('app.album', {reload: true});
      }
    }