/*var user = {
  id: 'will',
  token: null
};*/
angular.module('account', [
  'audiodio.constants'
])
.factory('user', ['$http', '$q', 'USER', function ($http, $q, USER) {
    var profile = {};

    profile.getId = function () {
      return USER;
    };

    profile.login     = function () {
      //TODO:
    };

    profile.logout    = function () {
      //TODO:
    };
    return profile;
}]);
