var Brad = angular.module('brad', ['ui.router']);

var projects = [

  {
    slug: 'about',
    description: [
      'I\'m a full-stack web developer who excels in all aspects of creating high-performance and user-friendly applications.',
      'Feel free to explore my site to learn more. Thanks for stopping by!'
    ],
    name: 'About Me',
    color: '#26C5DB',
    links:[{
      state:'contact',
      label:'Contact Info'
    }],
    x: 67,
    y: 30
  },
  {
    slug: 'xyz',
    description: ['App that features user-contributed playlists that combine music from multiple providers (currently Youtube and Soundcloud), with the ability to arrange items spatially in two-dimensions.',
     'The motivation is to re-think the idea of a cloud-hosted so-called "music collection" by consolidating media that is locked to specific providers.'],

    name: 'XYZ Spaces',
    color: '#083EC6',
    links: [{
        external: 'https://xyz.gs',
        label: 'xyz.gs'
      } 
    ],
    x: 7,
    y: 40
  },
  {
    slug: 'music-project',
    description: [
      'As Dj Bee, I have some experimental house / club music on my soundcloud page. I also have some content on the Datafruits radio station'
    ],
    name: 'DJ B Music',
    links: [
      {
        external: 'https://soundcloud.com/braddjwinter',
        label: 'DJB music'
      },
      {
        external: 'https://datafruits.fm/djs/djb',
        label: 'Datafruits DJ sets'
      }
    ],
    color: '#1BA253',
    x: 40,
    y: 56
  },
  {
    slug: 'pizza-stop',
    description: ['Cryptocurrency is an obvious mega-trend that is sometimes tiring to keep up with, but the space merits creative development to improve user safety and relevence.',
      'Pizza Stop is a dev playground / demo / experiment to host some of what I\'m working on in this space'
    ],
    name: 'Pizza Stop (Crypto)',
    links: [{
      external: 'https://pizza-stop.glitch.me/',
      label: 'pizza-stop'
    }],
    color: '#ee0000',
    x:20,
    y:80
  },
  {
    slug:'scramples',
    description:['Audio file slicer / dicer / scrambler for creative music production.'],
    name: 'Scramples',
    links:[
      {
        external:'https://scramples.xyz.gs',
        label:'scramples.xyz.gs'
      }
    ],
    color:'#777777',
    x:80,
    y:85
  },
  {
    slug: 'contact',
    description: [''],
    name: 'Contact',
    links: [
      {
        external:'https://github.com/bradwbradw',
        label:'GitHub Page'
      },
      {
        external: 'mailto:hello@bradwinter.ca',
        label: 'Email'
      }
    ],
    color: '#F08BD3',
    x: 66,
    y: 74
  }
];
Brad.constant('projects', _.filter(projects, 'x'));

Brad.controller('main', function ($scope, $state, projects) {

  $scope.inProjectState = function () {
    return _.get($state, 'current.data.project');
  };

  $scope.styleForProject = function () {
    return {
      'background-color': _.get($state, 'current.data.project.color')
    };
  };

  $scope.projectLinkStyle = function (project) {
    return {
      color: project.color,
      'border-color': project.color
    }
  };

  $scope.linkPosition = function (project) {

    return {
      left: project.x + '%',
      top: project.y + '%'
    }

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
