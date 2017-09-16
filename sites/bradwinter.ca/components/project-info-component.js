angular.module('brad')
  .component('projectInfo', {

    templateUrl: 'components/project-info.html',
    controller: function ($scope, $element, $attrs, $state, $sce, projects) {

      var project = _.get($state, 'current.data.project');

      $scope.project = project;

      $scope.sanitize = function(input){
        return $sce.trustAsHtml(input);
      }

      $scope.nextPageSlug = function () {
        var i = _.findIndex(projects, {slug: project.slug});
        var nextProjslug = _.get(projects[i + 1], 'slug', projects[0].slug);
        return nextProjslug;
      }
    }

  });