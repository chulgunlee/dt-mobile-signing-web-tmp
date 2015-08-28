myApp.

/* Controllers */

controller('DocListCtrl', ['$scope', 'DocService', function($scope, docService) {

    $scope.data = docService;
    docService.refresh(packageId);

}]);


