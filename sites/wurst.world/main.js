var WW = angular.module('ww', ['ui.router', 'simple-sprite']);

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
    contact: {
      name: 'contact',
      url: '/contact',
      templateUrl: 'views/contact.html'
    },
    shop: {
      name: 'shop',
      url: '/shop',
      templateUrl: 'views/shop.html',
      controller: function ($scope, $state) {

        $scope.animationStarted = false;
        var stateWhenAnimationDone = null;
        if ($state.current.name === 'shop') {

          $scope.wallStillStanding = true;
          $scope.$on('wall destroyed', function () {
            console.log('wall is destroyed');
            $scope.wallStillStanding = false;
            if(stateWhenAnimationDone){
              $state.go(stateWhenAnimationDone);
            }
          })
        } else {

          $scope.wallStillStanding = false;

        }



          $scope.go = function (state) {
            console.log(state);
            if ($scope.wallStillStanding) {
              stateWhenAnimationDone = state;
              $scope.animationStarted = true;
            } else {
              $state.go(state);
            }
          }

      }
    },
    scrap: {
      name: '/scrap',
      url: '/scrap',
      templateUrl: 'views/scrap.html'
    }
  };

  var shopStates = 'enamel-pins prints shirts tote-bags'.split(' ');

  _.each(states, function (state) {
    $stateProvider.state(state);
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
