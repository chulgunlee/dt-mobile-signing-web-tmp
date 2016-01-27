
// libraries
var FastClick = require('fastclick');
require('lodash');
require('angular');
require('angular-animate');
require('angular-route');
require('angular-aria');
require('angular-material');

require('../assets/libs/js/webviewbridge');

// app components
require('./signingroom.route.js');
//require('./components/doclist/constants.js')
require('./components/signingroom/signingRoomController.js');
require('./components/signingroom/signingService.js');
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
require('../assets/css/icon-sprite.css');


// define main app
angular.module('dc.signingroom', [
    'ngAnimate',
    'ngMaterial',
    'dc.signingroom.route',
    'dc.components.signingroom.signingService',
    'dc.shared.webviewbridge.webviewbridge'
]).

config(function($mdThemingProvider, $apiMockProvider) {
    // config the mashup API base uri, default='/api/'
    // $apiProvider.setApiUri('/api/');

    // config webviewbridge debug, default=false
    // webViewBridgeProvider.enableWebViewBridgeDebug(true);

    // figure out the a to load svg icons or use font awesome
    // $mdIconProvider.icon("menu", require('../assets/img/icons/svg/menu.svg'), 24)

    $apiMockProvider.setDocThumb(require('../images/document_thumb.png'));
    $apiMockProvider.setDocPage(require('../images/doc_page.png'));

    $mdThemingProvider.theme('default')
        .primaryPalette('blue')
        .accentPalette('red');
}).


// initialize
run(function() {
    // remove 300ms click delay on iPad
    FastClick.attach(document.body);

});
