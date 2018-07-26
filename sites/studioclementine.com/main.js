
var SC = angular.module('StudioClementine', ['ui.router']);

SC.controller('mainController', function ($scope, $state) {

});

SC.config(function ($locationProvider, $stateProvider, $urlRouterProvider) {

  $locationProvider.html5Mode(true);

  var states = {
    about: {
      name: 'about',
      url: '/about',
      templateUrl: 'views/about.html'
    },
    branding: {
      name: 'branding',
      url: '/branding',
      templateUrl: 'views/branding.html'
    },
    contact: {
      name: 'contact',
      url: '/contact',
      templateUrl: 'views/contact.html'
    },
    design: {
      name: 'design',
      url: '/design',
      templateUrl: 'views/design.html'
    },
    home: {
      name: 'home',
      url: '/',
      templateUrl: 'views/home.html'
    },
    shop: {
      name: 'shop',
      url: '/shop',
      templateUrl: 'views/shop.html'
    },
    tattoos: {
      name: 'tattoos',
      url: '/tattoos',
      templateUrl: 'views/tattoos.html'
    },
  };


  _.each(states, function (state) {
    $stateProvider.state(state);
  });

  $urlRouterProvider.otherwise('/');

});
