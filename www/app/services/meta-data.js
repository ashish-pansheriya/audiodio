angular.module('meta-data', [])
  .factory('artistCovers', ['$q', '$http', function ($q, $http) {
    var service = {};
    service.artists = {}; //album cache

    service.fetchArtistMetaData = function (link, xipath) {
      var cb = $q.defer();
      link += '/' + xipath;

      if (service.artists[xipath]) {
        cb.resolve(service.artists[xipath]);
      } else {
        $http.get(link).then(function (res) {
            service.artists[xipath] = res.data;

            cb.resolve(service.artists[xipath]);
          },
          function (err) {
            cb.resolve({});
          });
      }

      return cb.promise;
    };
    return service;
  }])
  .factory('albumCovers', ['$q', '$http', function ($q, $http) {
    var service = {
      albums: {},
      fetchAlbumMetaData: fetchAlbumMetaData,
      getDefault: fetchDefaultAlbumMetaData
    };

    function fetchDefaultAlbumMetaData (link) {
      var cb = $q.defer();
      link += '/' + 'null';

      if (service.albums['null']) {
        cb.resolve(service.albums['null']);
      } else {
        $http.get(link).then(function (res) {
            service.albums['null'] = res.data;
            cb.resolve(service.albums['null']);
          },
          function (err) {
            cb.resolve({});
          });
      }

      return cb.promise;
    }
    function fetchAlbumMetaData (link, xipath) {
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
    }
    return service;
  }]);