angular.module('meta-data', [])
.factory('albumCovers', ['$q', '$http', function ($q, $http) {
    var service = {};
    service.albums = {}; //album cache

    service.fetchAlbumMetaData = function (link, xipath) {
      var cb = $q.defer();
      link += '/' + xipath;

      if (service.albums[xipath]) {
        cb.resolve(service.albums[xipath]);
      } else {
        $http.get(link).then(function (res) {
            service.albums[xipath] = res.data;
            cb.resolve(service.albums[xipath]);
          },
          function (err) {
            cb.resolve({});
          });
      }

      return cb.promise;
    };
    return service;
}]);