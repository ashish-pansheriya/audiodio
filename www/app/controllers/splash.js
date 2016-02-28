angular.module('splash', [
  'account'
])

.controller('splashCtrl', SplashCtrl);

SplashCtrl.$inject = ['$scope', 'user'];

function SplashCtrl ($scope, user) {
  var vm = this;
  vm.username = user.getId();
}