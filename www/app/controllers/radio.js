angular.module('radioStuff', [])
.controller('channelsCtrl', ChannelsCtrl);

  ChannelsCtrl.$inject = ['$rootScope', '$scope', 'links', '$state', 'radioService', 'user', 'session', 'xipath'];
  function ChannelsCtrl ($rootScope, $scope, links, $state, radioService, user, session, xipath) {
    var vm = this;
    vm.channelOptions = [];
    vm.changeChannel = changeChannel;

  links.formUrl('radioChannels').then(function (url) {
    radioService.fetchChannels(url).then(function (channels) {
      vm.channelOptions = channels;
    });
  });

  function changeChannel (val) {
    radioService.turnOn();
    radioService.changeChannel(val);
    //$rootScope.$broadcast('radio:continue');
  }


}