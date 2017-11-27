var WW = angular.module('ww');

WW.component('wwNavigation', {
    controller: 'navigationComponent',
    templateUrl:'components/navigation-component.html'
});


WW.controller('navigationComponent', function ($scope, $state) {

    console.log('nav component ctrl, state is ', $state.current);
    $scope.show = true;
});