var WW = angular.module('ww', ['ui.router'/*, 'simple-sprite'*/]);

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
    projects: {
      name: 'projects',
      url: '/projects',
      templateUrl: 'views/projects.html',
      controller: function ($scope) {
        $scope.images = [
          {url: 'http://res.cloudinary.com/marchienveen/image/upload/v1522964494/vabf-portfolio/web6_wv6h5n.jpg'},
          {url: 'http://res.cloudinary.com/marchienveen/image/upload/v1522964489/vabf-portfolio/web2_eqvhxi.jpg'},
          {url: 'http://res.cloudinary.com/marchienveen/image/upload/v1522979694/vabf-portfolio/web2-new_juxbwu.jpg'},
          {url: 'http://res.cloudinary.com/marchienveen/image/upload/v1522964485/vabf-portfolio/web1_cuzaor.jpg'},
          {url: 'http://res.cloudinary.com/marchienveen/image/upload/v1522970570/vabf-portfolio/web9_xgdwmx.jpg'},
          {url: 'http://res.cloudinary.com/marchienveen/image/upload/v1522979695/vabf-portfolio/web1-new_qmihkb.jpg'},
          {url: 'http://res.cloudinary.com/marchienveen/image/upload/v1522965954/vabf-portfolio/web7_krm3bs.jpg'},
          {url: 'http://res.cloudinary.com/marchienveen/image/upload/v1522970528/vabf-portfolio/web8_jszzji.jpg'},
          {url: 'http://res.cloudinary.com/marchienveen/image/upload/v1522996811/vabf-portfolio/web10_l14vvz.jpg'}
        ];

        $scope.style = function (image) {
          return {
            'background-image': 'url(\'' + image.url + '\')'
          }
        }
      }
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
            if (stateWhenAnimationDone) {
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
      }
    });
  });

  $urlRouterProvider.otherwise('/');


});
