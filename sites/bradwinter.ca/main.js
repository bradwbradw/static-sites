var Brad = angular.module('brad', ['ui.router']);

Brad.constant('projects', {
  xyz: {
    description: ['xyz description'],
    slug: 'xyz',
    name: 'xyz.gs',
    link: 'https://xyz.gs'
  },
  seapunkdotnet: {
    description: ['seapunk.net description'],
    link: 'https://seapunk.net',
    name: 'seapunk.net',
    slug: 'seapunkdotnet'
  },
  about: {
    description: [
      'I\'m a professional web developer who excels in all aspects of creating high-performance and user-friendly applications.',
      'I also maintains experimental projects that investigate various concerns about our contemporary media landscape',
    ],
    slug: 'about',
    name: 'about me',
    links: [
      {
        state: 'xyz',
        label: 'xyz.gs'
      },
      {
        state: 'seapunkdotnet',
        label: 'seapunk.net'
      }
    ]
  },
  profiles: {
    description: ['profiles'],
    name: 'profiles',
    slug: 'profiles',
    links: [
      {
        external: 'https://www.linkedin.com/in/brad-winter-05534123',
        label: 'Linked in'
      },
      {
        external: 'https://soundcloud.com/braddjwinter',
        label: 'Soundcloud'
      }]
  },
  music: {
    description: [
      'brads music collection on the web'
    ],
    name: 'brads music',
    slug: 'music'
  }
});

Brad.controller('main', function ($scope, $state, projects) {
  $scope.hi = 'hello';
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


  function makeLinks(links) {

    if (!_.isArray(links)) {
      links = [];
    }

    _.each(links, function (link, i) {
      links[i] = makeLink(link);
    });

    return '<ul><li></li>' + links.join('</li><li>') + '</li></ul>';
  }

  _.each(projects, function (project, slug) {

    $stateProvider.state('project-' + slug, {
      url: '/project/' + slug,
      data: {
        project: project
      },
      views: {
        panel: {
          template: '<project-info ></project-info>'
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
})
;