
angular.module('audiodio.services.radio', [])

  .service('radioService', radio);
radio.$inject = ['$http', '$q'];

function radio ($http, $q) {
  var service = {
    station: {
      channel: '',
      pageSize: 25, //coupled to backend
      isTurnedOn: false
    },
    fetchSongs: fetchSongs,
    turnOn: turnOn,
    turnOff: turnOff,
    isRadioOn: isRadioOn,
    fetchChannels: fetchChannels,
    changeChannel: changeChannel,
    tuneIn: changeChannel
  };



  function fetchSongs (link, userId) {
    var cb = $q.defer();

    link += userId;
    link += '/' + service.station.channel;

    $http.get(link).then(function (response) {
        cb.resolve(response.data);
      },
      function (err) {
        cb.resolve([]);
      });

    return cb.promise;
  }
  function turnOn () {
    service.station.isTurnedOn = true;
  }
  function turnOff () {
    service.station.isTurnedOn = false;
  }
  function isRadioOn () {
    return service.station.isTurnedOn;
  }
  function fetchChannels (link) {
    var cb = $q.defer();
    $http.get(link).then(function (response) {
        cb.resolve(response.data.channels);
      },
      function (err) {
        cb.resolve([]);
      });
    return cb.promise;
  }
  function changeChannel (channel) {
    service.station.channel = channel;
  }
  return service;
}
