angular.module('dc.shared.loading.loadingService', []).

factory('loadingIndicatorService', function() {

    var service = {
        visible: false,
        msg: null,

        show: function(msg) {
            this.msg = msg;
            this.visible = true;
        },
        
        hide: function() {
            this.visible = false;
        },
    };

    return service;

});
