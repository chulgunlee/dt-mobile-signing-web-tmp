angular.module('dc.components.signingroom.SigningRoomCtrl', [
    'ngRoute',
    'dc.components.signingroom.ui',
    'dc.shared.api.api',
]).

/**
 * Controller for signing room
 */

controller('SigningRoomCtrl', function($scope, $routeParams, $api) {
        $scope.document_title = "eContract";
        $scope.checked = true;

        $scope.toggle = function(){
            $scope.checked = !$scope.checked
        }

});
