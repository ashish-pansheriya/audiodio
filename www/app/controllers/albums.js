angular.module('audiodio.search.albums', [])
.controller('albumsCtrl', AlbumsCtrl);
AlbumsCtrl.$inject = ['links', 'browseAlbum', 'directory', 'albumCovers'];

function AlbumsCtrl (links, browseAlbum , directory, albumCovers) {
  var vm = this;
  vm.xipath    = directory.getContext();
  vm.albums    = [];

  if (vm.xipath.length > 0) {
    links.formUrl('getDirectories').then(function (url) {
      browseAlbum.getAtXipath(url, vm.xipath).then(function (albums) {
        //load meta data for each album SEQUENTIALLY
        var a = 0;
        iterate();
        function iterate () {
          links.formUrl('albumMetaData').then(function (url) {
            albumCovers.fetchAlbumMetaData(url, albums[a].xipath, albums[a].name).then(function (album) {

              vm.albums.push(album);

              if (a + 1 < albums.length) {
                a++;
                iterate();
              }
            });
          });
        }

      });
    });
  }
}

