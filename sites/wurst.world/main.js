var WW = angular.module('ww', ['ui.router']);

WW.controller('main', function ($scope, $state) {
  console.log('state', $state.current);
  $scope.showNav = function () {

    return !$state.is('home') || !$state.abstract;
  }
});

WW.config(function ($locationProvider, $stateProvider, $urlRouterProvider) {

  $locationProvider.html5Mode(true);

  var states = {
    home: {
      name: 'home',
      url: '/',
      templateUrl: 'views/home.html'
    },
    about: {
      name: 'about',
      url: '/about',
      templateUrl: 'views/about.html'
    },
    contact: {
      name: 'contact',
      url: '/contact',
      templateUrl: 'views/contact.html',
    }
  };

  _.each(states, function (state, name) {
    $stateProvider.state(name, state);
  });


  $urlRouterProvider.otherwise('/');


});
