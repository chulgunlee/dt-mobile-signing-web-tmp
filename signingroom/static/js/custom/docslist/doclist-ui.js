'use strict';

angular.module('doccenter.uiComponent', [ 'doccenter.uiComponent.signStatusPopover' ]);

angular.module('doccenter.uiComponent.signStatusPopover', [ 'mgcrea.ngStrap.popover' ])
.run([ '$templateCache', function($templateCache) {

    $templateCache.put('dc/signstatus-popover.html', '<div class="dc-signstatus-popover"></div>');

}]).directive('dcSignStatusPopover', [ '$popover', function($popover) {
    
    return {
        restrict: 'EAC',
        scope: true,
        templateUrl: 'dc/signstatus-popover.html', 

        link: function(scope, element, attrs) {
            console.log(element);

//            element.on('click', popover.toggle);

        }
    };
}]);
