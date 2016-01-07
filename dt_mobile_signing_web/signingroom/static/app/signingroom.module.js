
// libraries
var FastClick = require('fastclick');
require('lodash');
require('angular');
require('angular-touch');
require('angular-animate');
require('angular-route');
require('../assets/libs/js/angular-strap.js');
require('../assets/libs/js/angular-strap.tpl.js');
require('../assets/libs/js/webviewbridge');

// app components
require('./signingroom.route.js');
//require('./components/doclist/constants.js')
require('./components/signingroom/signingRoomController.js');
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
require('../assets/css/reset.css');
require('../assets/css/style.scss');
require('../assets/css/icon-sprite.css');


// define main app
angular.module('dc.signingroom', [
    'ngTouch',
    'ngAnimate',
    'mgcrea.ngStrap',

    'dc.signingroom.route',
    'dc.shared.webviewbridge.webviewbridge'
]).

config(function($apiProvider, webViewBridgeProvider) {
    // config the mashup API base uri, default='/api/'
    // $apiProvider.setApiUri('/api/');

    // config webviewbridge debug, default=false
    // webViewBridgeProvider.enableWebViewBridgeDebug(true);

}).


// initialize
run(function() {
    // remove 300ms click delay on iPad
    FastClick.attach(document.body);

});
