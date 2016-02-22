/*global angular, console */

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

        $scope.signingService = signingService;

        // this should probably go signingroomSideBar directive
        $scope.toggleSide = function () {
            $mdSidenav('left').toggle();
        };

        $scope.showSignaturePad = function () {
            $scope.signingService.signers[0].showConsent().then(function () {
                var data = signingService.signers[0].getData();
                console.log(data);
            });
        };

        // Here we are going to keep the state of currently loaded document
        // for now current document should have following fields: title, pages, id
        $scope.currentDocument = $scope.signingService.getDocument($routeParams.docId);

        $scope.currentDocument.getImages();

        $scope.checked = true;

        $scope.toggle = function () {
            $scope.checked = !$scope.checked;
        };


});
