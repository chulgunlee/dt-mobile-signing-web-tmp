
/* module */
var myApp = angular.module('docListApp', ['ngResource', 'ngRoute', 'ngAnimate', 'mgcrea.ngStrap']);

/* route config */
myApp.config(['$routeProvider', function($routeProvider) {

    $routeProvider.
        when('/docs/', {
            templateUrl: '/static/ngtemplates/doclist.html',
            controller: 'DocListCtrl'
        }).

        when('/:docId/preview/', {
            templateUrl: '/static/ngtemplates/doc_preview.html',
            controller: 'DocPreviewCtrl'
        }).

        otherwise({
            redirectTo: '/docs/'
        });

}]);
