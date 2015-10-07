var templates = {
    'doclist.html': require('./components/doclist/doclist.html'),
    'doc_preview.html': require('./components/preview/doc_preview.html'),
};

angular.module('dc.route', [
    'ngRoute',

    'dc.components.doclist.docCtrl',
    'dc.components.preview.previewCtrl',
]).

/* route config */
config(function($routeProvider) {

    $routeProvider.
        when('/docs/', {
            templateUrl: templates['doclist.html'],
            controller: 'DocListCtrl'
        }).

        when('/:docId/preview/', {
            templateUrl: templates['doc_preview.html'],
            controller: 'DocPreviewCtrl'
        }).

        otherwise({
            redirectTo: '/docs/'
        });

});
