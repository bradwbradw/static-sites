var Brad = angular.module('brad', ['ui.router']);

Brad.constant('projects', [
  {
    slug: 'xyz',
    description: ['An experimental web application that provides access to a media database that combines music from multiple providers, with the ability to arrange items spatially in two-dimensions.',
      '"Spaces" are public or private arrangements of Youtube or Soundcloud items, and the app is the interface by which users can create and browse these.  The space editor allows users to easily search across multiple providers simultaneously, and add specific items from the search results to appear in the space.',
      'XYZ seeks to re-think the idea of a music fan\'s cloud-hosted "music collection" by consolidating the interfaces to media that is traditionally locked into a specific providers, and allowing users to program sequences that span multiple providers.'],

    name: 'xyz spaces',
    color: '#083EC6',
    links: [{
      external: 'https://xyz.gs',
      label: 'xyz.gs'
    }]
  },
  {
    slug: 'seapunkdotnet',
    description: ['2011 saw the emergence of a global underground movement that underscores multiple issues surrounding contemporary media',
      'this app is an ongoing project that aims to affirm the legitimacy of the creative works that came out of the subculture, whose ',
      'I believe that the aquatic themes highlight fragility of our planet\'s ecosystems, and more popular exposure to the genre would not only help to support the artists involved, but also could have a positive impact on climate change by recognizing our oceans as perhaps the most important thing we have.',
    ],
    name: 'seapunk.net',
    links: [{
      external: 'https://seapunk.net',
      label: 'seapunk.net'
    }],
    color: '#029d7c'
  },
  {
    description: [
      'I\'m a professional web developer who excels in all aspects of creating high-performance and user-friendly applications.',
      'I also maintains experimental projects that investigate various concerns about our contemporary media landscape',
    ],
    slug: 'about',
    name: 'about me',
    color: '#26C5DB'
  },
  {
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
      }],
    color: '#F08BD3'
  },
  {
    slug: 'music',
    description: [
      'brads music collection on the web'
    ],
    name: 'brads music',
    links: [
      {
        external: 'https://music.bradwinter.ca',
        label: 'music.bradwinter.ca'
      }],
    color: '#1BA253'
  }
]);

Brad.controller('main', function ($scope, $state, projects) {

  $scope.inProjectState = function () {
    return _.get($state, 'current.data.project');
  };

  $scope.styleForProject = function () {
    return {
      'background-color': _.get($state, 'current.data.project.color')
    };
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

  _.each(projects, function (project) {

    $stateProvider.state('project-' + project.slug, {
      url: '/project/' + project.slug,
      data: {
        project: project,
        slug: project.slug
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