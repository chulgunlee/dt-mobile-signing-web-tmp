angular.module('dc.components.dummysigningroom.dummySigningRoomCtrl', [

]).

controller('DummySigningRoomCtrl', function($scope, webViewBridge) {

    console.log('loaded');
    $scope.exitSigningRoom = function(msg) {
        window.WebViewBridge.call('exitSigningRoom', { status: msg });
    };

});
