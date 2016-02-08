var templates = {
    'doclist.html': require('./components/doclist/doclist.html'),
    'doc_preview.html': require('./components/preview/doc_preview.html'),
    'dummy_signingroom.html': require('./components/dummysigningroom/dummy_signingroom.html'),
};

angular.module('dc.doclist.route', [
    'ngRoute',

    'dc.components.doclist.docCtrl',
    'dc.components.preview.previewCtrl',
    'dc.components.dummysigningroom.dummySigningRoomCtrl',
]).  
/* route config */
config(function($routeProvider) {

    $routeProvider.
        when('/docs/', {
            templateUrl: templates['doclist.html'],
            controller: 'DocListCtrl'
        }).

        when('/docs/:docId/:version/preview/', {
            templateUrl: templates['doc_preview.html'],
            controller: 'DocPreviewCtrl'
        }).

        when('/signingroom/', {
            templateUrl: templates['dummy_signingroom.html'],
            controller: 'DummySigningRoomCtrl'
        }).

        otherwise({
            redirectTo: '/docs/'
        });

});
