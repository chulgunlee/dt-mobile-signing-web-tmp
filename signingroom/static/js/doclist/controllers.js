myApp.

/* Controllers */


/**
 * Controller for document list
 */
controller('DocListCtrl', ['$scope', 'DocService', function($scope, docService) {

    $scope.data = docService;

}]).



/**
 * Controller for document preview
 */
controller('DocPreviewCtrl', ['$scope', function($scope) {


}]).



/**
 * Global controller for loading document list data
 */
controller('DocListDataCtrl', ['$scope', 'DocService', function($scope, docService) {
    docService.refresh(packageId);
}]);
