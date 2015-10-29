angular.module('dc.shared.webviewbridge.webviewbridge', []).

/**
 * WebViewBridge wrapper.
 */
provider('webViewBridge', function() {

    var webViewBridgeDebugEnabled = false;

    this.enableWebViewBridgeDebug = function(value) {
        webViewBridgeDebugEnabled = !!value;
    ;}

    this.$get = function() {
        var service = {
            
            logs: [],

            call: function(func, params, callback) {
                //this.log('Calling native: func="' + func + '", params=' + JSON.stringify(params));
                window.WebViewBridge.call(func, params, callback);
            },

            registerFunction: function(key, func) {
                window.WebViewBridge.registerFunction(key, func);
            },

            log: function(text) {
                if (webViewBridgeDebugEnabled) {
                    this.logs.push(text);
                }
            },

            debugEnabled: function() {
                return webViewBridgeDebugEnabled;
            },

            _absUrl: function(url) {
                return location.protocol + '//' + location.host + '/' + url;
            },

            /* Native API wrappers */

            print: function(pkgId, docIds, url) {
                this.call('print', {
                    method: 'POST',
                    url: this._absUrl('packages/' + pkgId),
                    data: JSON.stringify({ docIds: docIds }),
                    pkgId: pkgId,           // for native reference only
                    docIds: docIds,         // for native reference only
                });
            },

            logEvent: function(pkgId, msg) {
                this.call('logEvent', { pkgId: pkgId, msg: msg });
            },

            startPreview: function(pkgId, docId, docProps) {
                this.call('startPreview', {
                    method: 'GET',
                    url: this._absUrl('doclist/' + pkgId + '#/packages/' + pkgId + '/docs/' + docId + '/preview/'),
                    pkgId: pkgId,
                    docId: docId,
                    docProps: docProps
                });
            },
            
            startSigningRoom: function(pkgId, docIds, signers, url) {
                this.call('startSigningRoom', { pkgId: pkgId, docIds: docIds, signers: signers, url: url });
            },

            startPOSCapture: function(docId, docType, applicantType) {
                this.call('startPOSCapture', { docId: docId, docType: docType, applicantType: applicantType });
            },

        };

        // inject WebViewBridge
        var makeMsg = window.WebViewBridge._makeMsg;
        window.WebViewBridge._makeMsg = function(func, params, key) {
            var msg = makeMsg(func, params, key);
            service.log('Send msg to native: ' + msg);
            return msg;
        };


        return service;
    };
}).


/**
 * A directive used to debug WebViewBridge (integration with native).
 * Put this directive right after the <body> tag.
 */
directive('webViewBridgeDebug', function(webViewBridge) {
    return webViewBridge.debugEnabled() ? {
        restrict: 'EA',
        template: '<div class="debug-log"><p ng-repeat="log in logs track by $index">{{log}}</p></div>',
        replace: true,
        scope: true,

        controller: function($scope, webViewBridge) {
            $scope.logs = webViewBridge.logs;
        },
    } : {
        restrict: 'EA',
        template: '',
        replace: true
    };
});
