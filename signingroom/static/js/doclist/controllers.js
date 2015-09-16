myApp.

/* Controllers */


/**
 * Controller for document list
 */
controller('DocListCtrl', ['$scope', 'docService', function($scope, docService) {

    $scope.data = docService;

}]).



/**
 * Controller for document preview
 */
controller('DocPreviewCtrl', ['$scope', '$routeParams', '$http', function($scope, $routeParams, $http) {

    $http.get(apiUri + 'docs/' + $routeParams.docId + '/preview/').success(function(data, status) {

        if (status == 302) {
            // TODO: session timeout
            return;
        };

        $scope.title = data.title;
        $scope.id = data.id;
        $scope.pages = data.pages;
    });


}]);


