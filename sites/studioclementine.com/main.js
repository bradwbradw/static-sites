var SC = angular.module('StudioClementine', ['ui.router']);


let styles = {
  shop:{
    "background-color":"green",
    "color":"pink"
  },
  branding:{
    "background-color":"purple",
    "color":"magenta"
  },
  design:{
    "background-color":"purple",
    "color":"magenta"
  },
  tattoos:{
    "background-color":"purple",
    "color":"magenta"
  },
  about:{
    "background-color":"purple",
    "color":"magenta"
  },
  contact:{
    "background-color":"#fbf7ea",
    "color":"#d86628"
  },
  home:{
    "background-color":"#00a35d",
    "color":"#ffeae5"
  },
  "":{
    "background-color":"#00a35d",
    "color":"#ffeae5"
  }
};

SC.controller('mainController', function ($scope, $state) {

  var state = () => $state.current.name;

  let bodyClass = function () {
    return $state.current.name.split('.');
  };

  let colorStyle = function() {
    return {
      color:styles[state()]["color"]
    };
  };

  let style = function(){
    return styles[state()];
  };
  _.extend($scope, {
    bodyClass,
    colorStyle,
    style
  })
});

SC.config(function ($locationProvider, $stateProvider, $urlRouterProvider) {

  $locationProvider.html5Mode(true);

  var states = {
    about: {
      name: 'about',
      url: '/about',
    },
    branding: {
      name: 'branding',
      url: '/branding',
    },
    contact: {
      name: 'contact',
      url: '/contact',

    },
    design: {
      name: 'design',
      url: '/design',
    },
    shop: {
      name: 'shop',
      url: '/shop',
    },
    tattoos: {
      name: 'tattoos',
      url: '/tattoos',
    },
  };


  _.each(states, function (config, name) {

    _.extend(config, {
      views: {
        navigation: {
          templateUrl: 'views/navigation.html'
        },
        content: {
          templateUrl: `views/${name}.html`
        }
      }
    });


    $stateProvider.state(config);
  });

  $stateProvider.state(
    {
      name: 'home',
      url: '/',
          templateUrl: `views/home.html`
    }
  );

  $urlRouterProvider.otherwise('/');

})
;
