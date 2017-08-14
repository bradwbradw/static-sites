var Brad = angular.module('brad', ['ui.router']);

Brad.constant('projects', {
  xyz: {
    description: 'xyz description',
    slug:'xyz',
    name:'xyz.gs',
    link: 'https://xyz.gs'
  },
  'seapunk': {
    description: 'seapunk.net description',
    link: 'https://seapunk.net',
    name: 'seapunk.net',
    slug:'seapunkdotnet'
  },
  about: {
    description: 'Brad is a professional web developer who excels in all aspects of creating high-performance and user-friendly applications.' +
    '<br/><br/>'+
    'He also maintains experimental projects that investigate various concerns about our contemporary media landscape' +
    '',
    slug:'about',
    name:'about',
    links: ['link', 'dink', 'pink']
  },
  profiles:{
    description:'brad all around the net',
    name: 'profiles',
    slug:'profiles',
    links :['linked in', 'twitter', 'sound cloud']
  },
  music:{
    description: 'brads music collection on the web',
    name:'brads music',
    slug:'music'
  }
});

Brad.controller('main', function ($scope, $state, projects) {
  $scope.hi = 'hello';
  console.log('data:', $state.current.data);
  _.extend($scope, $state.current.data);

  $scope.inProjectState = function () {
    return _.includes($state.current.name, 'project-');
  };

  $scope.mainClick = function () {
    $state.go('home');
  };

  $scope.projects = projects;
});

Brad.config(function ($stateProvider, projects) {

  $stateProvider.state('home', {
    url: '/',
    views: {
      pane: {
        template: ' '
      }
    }
  });


  function makeLinks(links){
    if(!_.isArray(links)){
      links = [];
    }
    return '<ul><li></li>'+links.join('</li><li>')+'</li></ul>';
  }
  _.each(projects, function (project) {

    $stateProvider.state('project-' + project.slug, {
      url: '/project/' + project.slug,
      views: {
        paneTitle: {
          template: project.name,
        },
        paneDescription: {
          template: project.description
        },
        panelLinks:{
          template: makeLinks(project.links)
        }
      }
    })
  });


  $stateProvider.state('about', {
    url: '/about',
    views: {
      pane: {
        template: 'this is about'
      }
    }
  });
});