angular.module('dc.shared.loading.loadingDirective', [
    'dc.shared.loading.loadingService',
]).

directive('loadingIndicator', function() {

    return {
        restrict: 'E',
        replace: true,
        template: '<div class="loading" ng-show="srv.visible"><div class="loading-spinner" ng-bind="srv.msg"></div></div>',
        controller: function($scope, loadingIndicatorService) {
            $scope.srv = loadingIndicatorService;
        }
    };

});

