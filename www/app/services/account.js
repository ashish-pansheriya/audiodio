var user = {
  id: 'will',
  token: null
};

angular.module('account', [])
.factory('user', ['$http', '$q', function ($http, $q) {
    var profile = {};

    profile.getId = function () {
      return user.id;
    };

    profile.login     = function () {
      //TODO:
    };

    profile.logout    = function () {
      //TODO:
    };
    return profile;
}]);
