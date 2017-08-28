angular.module('brad')
  .component('projectInfo', {

    templateUrl: 'components/project-info.html',
    controller: function ($scope, $element, $attrs, $state) {

      $scope.project = _.get($state, 'current.data.project');

    }
  });