var station = {
  channel: '',
  pageSize: 25,
  isTurnedOn: true
};

angular.module('radioServices', [])
  .service('radioService',  ['$http', '$q',
    function ($http, $q) {
      var radio = {};

      radio.fetchSongs = function (link, userId) {
        var cb = $q.defer();

        link += userId;
        link += '/' + station.channel;

        $http.get(link).then(function (response) {
            cb.resolve(response.data);
          },
          function (err) {
            cb.resolve([]);
          });

        return cb.promise;
      };
      return radio;
    }])
  .service('channelTuner',  ['$http', '$q',
    function ($http, $q) {
      var tuner = {};

      tuner.turnOn = function () {
        station.isTurnedOn = true;
      };
      tuner.turnOff = function () {
        station.isTurnedOn = false;
      };

      tuner.isRadioOn = function () {
        return station.isTurnedOn;
      };

      tuner.fetchChannels = function (link) {
        var cb = $q.defer();
        $http.get(link).then(function (response) {
            cb.resolve(response.data.channels);
          },
          function (err) {
            cb.resolve([]);
          });
        return cb.promise;
      };

      tuner.changeChannel = function (channel) {
        station.channel = channel;
        console.log(channel); //TESTING!!!
      };
      tuner.tuneIn = tuner.changeChannel; //cool overload xD


      return tuner;
    }]);

