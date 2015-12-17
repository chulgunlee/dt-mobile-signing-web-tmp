var templates = {
    'signingroom.html': require('./components/signingroom/signingroom.html')
};

angular.module('dc.signingroom.route', [
    'ngRoute',
    'dc.components.signingroom.SigningRoomCtrl'
]).

/* route config */
config(function($routeProvider) {

    $routeProvider.
        when('/', {
            templateUrl: templates['signingroom.html'],
            controller: 'SigningRoomCtrl'
        }).

        otherwise({
            redirectTo: '/'
        });

});
