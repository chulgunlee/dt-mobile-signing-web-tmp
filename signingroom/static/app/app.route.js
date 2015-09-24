angular.module('dc.route', [
    'ngRoute',

    'dc.components.doclist.docCtrl',
    'dc.components.preview.previewCtrl',
]).

/* route config */
config(function($routeProvider) {

    $routeProvider.
        when('/docs/', {
            templateUrl: '/static/app/components/doclist/doclist.html',
            controller: 'DocListCtrl'
        }).

        when('/:docId/preview/', {
            templateUrl: '/static/app/components/preview/doc_preview.html',
            controller: 'DocPreviewCtrl'
        }).

        otherwise({
            redirectTo: '/docs/'
        });

});
