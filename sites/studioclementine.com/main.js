var SC = angular.module('StudioClementine', ['ui.router']);

SC.controller('mainController', function ($scope, $state) {

});

SC.config(function ($locationProvider, $stateProvider, $urlRouterProvider) {

  $locationProvider.html5Mode(true);

  var states = {
    home: {
      name: 'home',
      url: '/',
      templateUrl: 'views/home.html'
    },
    contact: {
      name: 'contact',
      url: '/contact',
      templateUrl: 'views/contact.html'
    },
  };


  _.each(states, function (state) {
    $stateProvider.state(state);
  });

  $urlRouterProvider.otherwise('/');

});
