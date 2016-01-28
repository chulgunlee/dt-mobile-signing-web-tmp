angular.module('dc.shared.webviewbridge.webviewbridge', []).

/**
 * WebViewBridge wrapper.
 */
provider('webViewBridge', function() {

    var webViewBridgeDebugEnabled = false;
    var uriRoot = '';

    this.enableWebViewBridgeDebug = function(value) {
        webViewBridgeDebugEnabled = !!value;
    };

    this.setUriRoot = function(value) {
        uriRoot = value.replace(/\/*$/, '');
    };

    this.$get = function($api, $rootScope) {
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
                console.log(text);              // always print on console
            },

            get debugEnabled() {
                return webViewBridgeDebugEnabled;
            },

            _absUrl: function(url) {
                return location.protocol + '//' + location.host + uriRoot + url;
            },

            /* Native API wrappers */

            print: function(docIds, url) {
                this.call('print', {
                    method: 'POST',
                    url: $api.absUrl('/printable/') + '?docids=' + encodeURIComponent(docIds.join(',')),         // TODO
                    docIds: docIds,         // for native reference only
                });
            },

            logEvent: function(msg) {
                this.call('logEvent', { msg: msg });
            },

            startPreview: function(docId, version, docProps) {
                this.call('startPreview', {
                    method: 'GET',
                    url: this._absUrl('/dealjackets/' + encodeURIComponent($rootScope.dealJacketId) + 
                                      '/deals/' + encodeURIComponent($rootScope.dealId) + 
                                      '/#/docs/' + encodeURIComponent(docId) + 
                                      '/' + encodeURIComponent(version) + '/preview/'),
                    docId: docId,
                    version: version,
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
    return webViewBridge.debugEnabled ? {
        restrict: 'EA',
        template: '<div class="debug-log"><p ng-repeat="log in logs track by $index">{{log}}</p></div>',
        replace: true,
        scope: true,

        // MUST annotate here since ngAnnotatePlugin won't do this automatically
        controller: ['$scope', 'webViewBridge', function($scope, webViewBridge) {
            $scope.logs = webViewBridge.logs;
        }],
    } : {
        restrict: 'EA',
        template: '',
        replace: true
    };
});
