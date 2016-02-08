
// libraries
var FastClick = require('fastclick');
require('lodash');
var SignaturePad = require('signature_pad');
require('angular');
require('angular-animate');
require('angular-route');
require('angular-aria');
require('angular-material');
require('../assets/libs/js/webviewbridge');

// app components
require('./signingroom.route.js');
require('./components/signingroom/signingRoomController.js');
require('./components/signingroom/signaturePadDialog.js');
require('./components/signingroom/signingService.js');
require('./components/signingroom/signature.js');
require('./components/signingroom/ui.js');
require('./shared/api/api.js');
require('./shared/api/api_mock.js');
require('./shared/loading/loadingDirective.js');
require('./shared/loading/loadingService.js');
require('./shared/ui/uiDirective.js');
require('./shared/ui/uiService.js');
require('./shared/webviewbridge/webviewbridge.js');

// include stylesheets
require('../assets/libs/css/angular-motion.css');
require('../assets/css/signingroom.scss');


// define main app
angular.module('dc.signingroom', [
    'ngAnimate',
    'ngMaterial',
    'dc.signingroom.route',
    'dc.components.signingroom.signingService',
    'dc.components.signingroom.signature',
    'dc.shared.webviewbridge.webviewbridge'
]).

config(function($mdThemingProvider, $apiMockProvider) {
    // config the mashup API base uri, default='/api/'
    // $apiProvider.setApiUri('/api/');

    // config webviewbridge debug, default=false
    // webViewBridgeProvider.enableWebViewBridgeDebug(true);

    // this is temporary solution to fill document placeholder
    $apiMockProvider.setDocPage(require('../images/doc_page.png'));

   var signingRoomTheme = $mdThemingProvider.extendPalette('grey', {});

    $mdThemingProvider.definePalette('signingRoomTheme', signingRoomTheme);

    $mdThemingProvider.theme('default')
        .primaryPalette('signingRoomTheme');
}).

config(function(signaturePadConfigProvider){
        signaturePadConfigProvider.setSignaturePad(SignaturePad)
}).


// initialize
run(function() {
    // remove 300ms click delay on iPad
    FastClick.attach(document.body);

});
