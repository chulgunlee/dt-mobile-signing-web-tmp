angular.module('dc.components.preview.previewCtrl', [
    'ngRoute',

    'dc.shared.api.api',
]).


/**
 * Controller for document preview
 */
controller('DocPreviewCtrl', function($scope, $routeParams, $api) {

    $api.getDocPreview($routeParams.docId, $routeParams.version).then(function(response) {

        if (response.status == 302) {
            // TODO: session timeout
            return;
        };

        var data = response.data;

        $scope.title = data.title;
        $scope.id = data.id;
        $scope.version = data.version;
        $scope.pages = data.pages;
    });


});


