angular.module('dc.shared.ui.uiDirective', [
]).

/**
 * icon-button directive
 *
 * Usage:
 *
 *   <butotn icon-button="icn_add" width="44" height="44">Add</button>
 *
 * NOTE:
 *   The icon button is 44px wide, 44px high by default.  `width` and `height` parameters are optional.
 *   The icon-button attribute should be one of the class name in icon-sprite.css.
 */
directive('iconButton', function() {

    var defaultWidth = 44,
        defaultHeight = 44;

    return {
        restrict: 'EA',
        scope: {
            iconButton: '@',
            width: '@',
            height: '@',
        },

        template: '<button class="icon-button"><ng-transclude></ng-transclude></button>',
        transclude: true,
        replace: true,

        link: function(scope, element, attr) {

            var width = parseInt(scope.width) || defaultWidth,
                height = parseInt(scope.height) || defaultHeight;

            element.addClass('icon-' + scope.iconButton);

            element.css({
                'width': width + 'px',
                'height': height + 'px',
            });
        },

    };

});
