angular.module('dc.shared.debug.webViewBridgeDirective', [
    'dc.shared.webviewbridge.webviewbridge',
]).

/**
 * A directive used to debug WebViewBridge (integration with native).
 * Put this directive right after the <body> tag.
 */
directive('webViewBridgeDebug', function() {
    return {
        restrict: 'EA',
        templateUrl: '/static/app/shared/debug/webviewbridge_debug.html',
        replace: true,
        scope: true,

        controller: function($scope, webViewBridge) {
            $scope.logs = webViewBridge.logs;
        },
    };
});
