var FastClick = require('fastclick');
require('lodash');
require('angular');
require('angular-touch');
require('angular-animate');
require('angular-route');
require('angular-strap');


require('./app.route.js');
require('./components/doclist/constants.js');
require('./components/doclist/docController.js');
require('./components/doclist/docService.js');
require('./components/doclist/filters.js');
require('./components/doclist/ui.js');
require('./components/preview/previewController.js');
require('./shared/api/api.js');
require('./shared/debug/webViewBridgeDirective.js');
require('./shared/loading/loadingDirective.js');
require('./shared/loading/loadingService.js');
require('./shared/ui/uiDirective.js');
require('./shared/ui/uiService.js');
require('./shared/webviewbridge/webviewbridge.js');

// load templates
var templates = {
};


angular.module('dc.app', [
    'ngTouch',
    'ngAnimate',
    'mgcrea.ngStrap',

    'dc.route',
    'dc.shared.debug.webViewBridgeDirective',
    'dc.shared.webviewbridge.webviewbridge',
]).


run(function() {
    // remove 300ms click delay on iPad
    FastClick.attach(document.body);

});
