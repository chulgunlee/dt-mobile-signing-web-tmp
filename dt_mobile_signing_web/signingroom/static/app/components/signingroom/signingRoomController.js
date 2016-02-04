angular.module('dc.components.signingroom.SigningRoomCtrl', [
    'ngRoute',
    'dc.components.signingroom.ui',
    'dc.components.signingroom.signingService',
    'dc.shared.api.api',
    'dc.shared.api.api_mock'
]).

/**
 * Controller for signing room
 */

controller('SigningRoomCtrl', function($scope, $routeParams, $mdSidenav, signingService) {

        $scope.toggleSide = function(){
            $mdSidenav('left').toggle()
        };

        // Here we are going to keep the state of currently loaded document
        // for now current document should have following fields: title, pages, id

        console.log($routeParams.docId);

        $scope.currentDocument = signingService.getDocument($routeParams.docId);

        console.log($scope.currentDocument);

        signingService.getDocumentImages($routeParams.docId)
            .then(function(documentPages){
                $scope.currentDocument['pages'] = documentPages;
        });

        $scope.checked = true;

        $scope.toggle = function(){
            $scope.checked = !$scope.checked
        }

});
