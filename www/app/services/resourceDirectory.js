var resourceLocale = 'http://192.168.2.203:8080/resources/public/resource-directory';//window.location.origin + '/resources/public/resource-directory';
var resources = {
  resourceDirectory: []
};
angular.module('resourceDirectory', [])
  .factory('links', ['$http', '$q',
    function ($http, $q) {

      var resourceLinks = {};
      resourceLinks.findResourceLink = function (title, links) {
        return links[title] || '';
      };

      resourceLinks.formUrl = function (resourceName) {
        var cb = $q.defer();
        if (resources.resourceDirectory.length === 0) { //keep singleton
          $http.get(resourceLocale).then(function (response) {
              resources.resourceDirectory = response.data || {};
              var link = resourceLinks.findResourceLink(resourceName, resources.resourceDirectory);
              cb.resolve(link);
            },
            function (err) {
              cb.resolve('');
            });
        } else {
          var link = resourceLinks.findResourceLink(resourceName, resources.resourceDirectory);
          cb.resolve(link);
        }

        return cb.promise;
      };

      return resourceLinks;
    }]);
