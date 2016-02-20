var directory = {};
angular.module('browse', [])
  .factory('directory', ['$http', '$q',
    function ($http, $q) {
      var dir = {};
      dir.ls = function (xipath) {

      };

      return dir;
    }])
  .service('directory', function () {

    directory.context = ''; //root
    
    directory.setContext = function (xi) {
      directory.context = xi;
    };

    directory.getContext = function () {
      return directory.context;
    };

    return directory;
  })
  .factory('browseArtist', ['$http', '$q', function ($http, $q) {
    var artists = {};

    artists.getAll = function (link, user, key) {

      link += user + '?key=' + key;
      var cb = $q.defer();
      $http.get(link).then(function (response) {
          cb.resolve(response.data);
        },
        function (err) {
          cb.resolve([]);
        });

      return cb.promise;
    };

    return artists;
  }])
  .factory('browseAlbum', ['$http', '$q', function ($http, $q) {
  var albums = {};

  albums.getAtXipath = function (link, xipath) {
    link += '?xipath=' + xipath;
    var cb = $q.defer();
    $http.get(link).then(function (response) {
        cb.resolve(response.data.children);
      },
      function (err){
        cb.resolve([]);
      });

    return cb.promise;
  };

  return albums;
}]);

