var templates = {
    'signingroom.html': require('./components/signingroom/signingroom.html')
};

angular.module('dc.signingroom.route', [
    'ngRoute',
    'dc.components.signingroom.SigningRoomCtrl'
]).

/* route config */
config(function($routeProvider, $locationProvider) {

    $routeProvider.
        when('/', {
            templateUrl: templates['signingroom.html'],
            controller: 'SigningRoomCtrl'
        }).

        when('/document/:documentId/', {
            templateUrl: templates['signingroom.html'],
            controller: 'SigningRoomCtrl'
        }).

        otherwise({
            redirectTo: '/'
        });

});
