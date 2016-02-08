angular.module('dc.components.signingroom.SigningRoomCtrl', [
    'ngRoute',
    'dc.components.signingroom.ui',
    'dc.components.signingroom.signingService',
    'dc.components.signingroom.signaturePadDialog',
    'dc.shared.api.api',
    'dc.shared.api.api_mock'
]).

/**
 * Controller for signing room
 */

controller('SigningRoomCtrl', function($scope, $routeParams, $mdSidenav, signingService, signaturePadDialog) {

        $scope.toggleSide = function(){
            $mdSidenav('left').toggle()
        };

        $scope.showSignaturePad = function(){
          signaturePadDialog.show({'name': 'Rogesrs Johnson'}).then(function(){
              console.log(signaturePadDialog.getData());
          });
        };

        $scope.collectData = function(){
            console.log(signaturePadDialog.getData());
        };

        // Here we are going to keep the state of currently loaded document
        // for now current document should have following fields: title, pages, id
        $scope.currentDocument = signingService.getDocument($routeParams.docId);

        signingService.getDocumentImages($routeParams.docId)
            .then(function(documentPages){
                $scope.currentDocument['pages'] = documentPages;
        });

        $scope.checked = true;

        $scope.toggle = function(){
            $scope.checked = !$scope.checked
        }

});
