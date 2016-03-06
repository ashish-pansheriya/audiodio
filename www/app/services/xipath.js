angular.module('audiodio.xipath', [])
.service('xipath',  ['$http', '$q',
  function ($http, $q) {
    var service  = {
      context: '',
      setContext : setContext,
      getContext: getContext,
      fetchSongByXipath: getSongMetaData,
      cache: {}
    };

    function setContext (xi) {
      service.context = xi;
    }
    function getContext () {
      return service.context || '';
    }

    function getSongMetaData (link, xipath) {
      var cb = $q.defer();

      link += '?xipath=' + xipath;
      var mock = {
        "xipath":"000000000000",
        "bitrate":"N/A",
        "duration":0,
        "name":"00 N_A.mp3",
        "album":"001 N_A",
        "artist":"000 N_A",
        "genre":"002 N_A",
        "year":"N_A ",
        "uri":""
      };
      if (service.cache[xipath]) {
        cb.resolve(service.cache[xipath]);
      } else {
        $http.get(link).then(function (response) {
            service.cache[xipath] = response.data;
            cb.resolve(response.data);
          },
          function (err) {
            cb.resolve(mock);
          }
        );
      }
      return cb.promise;
    }

    return service;
  }]);
