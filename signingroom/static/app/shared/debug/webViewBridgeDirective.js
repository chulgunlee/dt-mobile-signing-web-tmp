var templates = {
    'webviewbridge_debug.html': require('./webviewbridge_debug.html'),
};

angular.module('dc.shared.debug.webViewBridgeDirective', [
    'dc.shared.webviewbridge.webviewbridge',
]).

/**
 * A directive used to debug WebViewBridge (integration with native).
 * Put this directive right after the <body> tag.
 */
directive('webViewBridgeDebug', function($templateCache) {
    return {
        restrict: 'EA',
        templateUrl: templates['webviewbridge_debug.html'],
        replace: true,
        scope: true,

        controller: function($scope, webViewBridge) {
            $scope.logs = webViewBridge.logs;
        },
    };
});
