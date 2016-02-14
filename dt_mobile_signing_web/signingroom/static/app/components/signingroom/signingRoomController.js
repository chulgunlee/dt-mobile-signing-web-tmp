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

        signingService.signers[0].confirm();

        $scope.toggleSide = function(){
            $mdSidenav('left').toggle()
        };

        $scope.showSignaturePad = function(){
          signingService.signers[0].collectSignatureData().then(function(){
                  console.log(signingService.signers[0].getData());
              }
          )
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
