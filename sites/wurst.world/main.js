var WW = angular.module('ww', ['ui.router']);

WW.controller('mainController', function ($scope, $state) {
  console.log('state', $state.current);

  var bodyClass = function () {
    return $state.current.name.split('.');
  };
  var showNav = function () {
    return !$state.is('home') || !$state.abstract;
  };

  $scope.bodyClass = bodyClass;
  $scope.showNav = showNav;
});

WW.config(function ($locationProvider, $stateProvider, $urlRouterProvider) {

  $locationProvider.html5Mode(false);

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
    },
  };

  var shopStates = 'enamel-pins prints shirts tote-bags'.split(' ');

  _.each(states, function (state, name) {
    $stateProvider.state(name, state);
  });

  _.each(shopStates, function (name) {

    $stateProvider.state({
      name: 'shop.' + name,
      url: '/' + name,
      views: {
        product: {
          templateUrl: 'views/products/' + name + '.html',
          controller: function ($scope) {
          }
        }
      },
    });
  });

  $urlRouterProvider.otherwise('/');


});
