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

    controller('SigningRoomCtrl', function ($scope, $routeParams, $window, $mdSidenav, signingService) {

        $scope.reviewed = false;

        $scope.signingService = signingService;

        // this should probably go signingroomSideBar directive, however since
        // sidenaw is out of scope of the current contr
        $scope.toggleSide = function () {
            $mdSidenav('left').toggle();
        };

        $scope.showSignaturePad = function () {
            $scope.signingService.signers[0].showConsent().then(function () {
                var data = signingService.signers[0].getData();
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
