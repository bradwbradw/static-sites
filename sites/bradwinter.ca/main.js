var Brad = angular.module('brad', ['ui.router']);

var projects = [

  {
    slug: 'about',
    description: [
      'I\'m a professional web developer who excels in all aspects of creating high-performance and user-friendly applications.',
      'I also work on experimental projects that investigate various concerns about our contemporary media landscape.',
      'Feel free to explore my site to learn more. Thanks for stopping by!'
    ],
    name: 'about me',
    color: '#26C5DB',
    x: 67,
    y: 30
  },
  {
    slug: 'xyz',
    description: ['My largest passion project is an app that features user-contributed playlists that combine music from multiple providers (currently Youtube and Soundcloud), with the ability to arrange items spatially in two-dimensions.',
      'I plan to integrate the providers at a deeper level, so users can connect their accounts and interact with the site using readily available playlists, likes, followings, and other similar objects.',
      'The motivation is to re-think the idea of a cloud-hosted so-called "music collection" by consolidating media that is locked to specific providers.'],

    name: 'xyz.gs',
    color: '#083EC6',
    links: [{
      external: 'https://xyz.gs',
      label: 'xyz.gs'
    }],
    x: 7,
    y: 40
  },
  {
    slug: 'music-projects',
    description: [
      'As Dj Bee, I have some experimental house / club music on my soundcloud page.',
      'I also make music as Hexen, a (loosely) witch-house collaboration with <a href="https://marchienveen.com" target="_blank">my partner</a>.'],
    name: 'music projects',
    links: [
      {
        external: 'https://soundcloud.com/braddjwinter',
        label: 'DJB music'
      },
      {
        external: 'https://soundcloud.com/hexenhexen',
        label: 'Hexen music'
      }
    ],
    color: '#1BA253',
    x: 40,
    y: 56
  },
  {
    slug: 'seapunkdotnet',
    description: ['Late 2011 saw the creation of an ideology inspired by 90\'s aesthetics, followed by a ',
      'seapunk.net is an ongoing project that aims to promote music by the artists of the movement who deserve more exposure.',
      'I also believe that the aquatic themes highlight the fragility of our planet\'s ecosystems, and more popular exposure might have a positive impact on climate change by recognizing our oceans as perhaps the most important thing we have.  It might follow that seapunk is the most important genre of music that we have.',
    ],
    name: 'seapunk.net',
    links: [{
      external: 'https://seapunk.net',
      label: 'seapunk.net'
    }],
    color: '#029d7c'
  },
  {
    slug: 'resume',
    description: ['Download my resume PDF by clicking the link below:'],
    name: 'resume',
    links: [
      {
        external: 'https://drive.google.com/file/d/0B9u2nAPISw7qTjRLMlNlcThPd0E/view?usp=sharing',
        label: 'resume PDF'
      }
    ],
    color: '#F08BD3',
    x: 66,
    y: 74
  },
  {
    slug: 'profiles',
    description: ['profiles'],
    name: 'profiles',
    links: [
      {
        external: 'https://www.linkedin.com/in/brad-winter-05534123',
        label: 'Linked in'
      },
      {
        external: 'https://soundcloud.com/braddjwinter',
        label: 'Soundcloud'
      }],
    color: '#F08BD3',
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
      }]
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
      'border-color': project.color,
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
