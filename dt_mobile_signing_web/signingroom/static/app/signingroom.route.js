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
        //when('/', {
        //    template: 'Loading...',
        //    controller: function($location, signingService){
        //        $location.path('/');
        //    }
        //}).

        when('/document/:docId/', {
            templateUrl: templates['signingroom.html'],
            controller: 'SigningRoomCtrl'
        }).

        otherwise({
            redirectTo: '/'
        });

});
