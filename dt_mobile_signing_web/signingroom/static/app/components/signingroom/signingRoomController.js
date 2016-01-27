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

        $scope.toggle_side = function(){
            $mdSidenav('left').toggle()
        };

        // Here we are going to keep the state of currently loaded document
        // for now current document should have following fields: title, pages, id
        $scope.currentDocument = {};

        console.log($routeParams.docId);
        signingService.getDocumentImages($routeParams.docId)
            .then(function(document_pages){
                $scope.currentDocument['pages'] = document_pages;
        });

        $scope.checked = true;

        $scope.toggle = function(){
            $scope.checked = !$scope.checked
        }

});
