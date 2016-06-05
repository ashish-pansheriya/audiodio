angular.module('audiodio.metrics', [])
  .factory('metrics', ['$http', '$q',
    function ($http, $q) {
      var metrics = {};

      metrics.recordSongPlayedByXipath = function (link, xipath, userId) {
        var cb = $q.defer();
        var payload = {
          xipath: xipath,
          userId: userId
        };

        $http.post(link, payload).then(function (res) {
            cb.resolve(true);
          },
          function (err) {
            cb.resolve(false);
          });

        return cb.promise;
      };
      return metrics;
    }]);