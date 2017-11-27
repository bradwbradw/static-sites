var WW = angular.module('ww', ['ui.router']);

WW.controller('mainController', function ($scope, $state) {
  console.log('state', $state.current);

  var bodyClass = function(){
    return [$state.current.name];
  };
  var showNav = function () {
    return !$state.is('home') || !$state.abstract;
  };

  $scope.bodyClass = bodyClass;
  $scope.showNav = showNav;
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
      templateUrl: 'views/contact.html'
    },
    shop: {
      name: 'shop',
      url: '/shop',
      templateUrl: 'views/shop.html'
    }
  };

  _.each(states, function (state, name) {
    $stateProvider.state(name, state);
  });


  $urlRouterProvider.otherwise('/');


});
