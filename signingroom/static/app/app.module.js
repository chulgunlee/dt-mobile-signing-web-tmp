angular.module('dc.app', [
    'ngResource', 
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

    //docService.refresh(packageId);      // TODO: this need to be done in the doclist screen
});
