angular.module('dc.shared.ui.uiService', [
    'mgcrea.ngStrap',
]).

/**
 * common services
 */

/**
 * $msgbox
 *
 * Usage:
 *
 *   $msgbox.alert("message", "title"(optional), "ok title").then(...);
 *   $msgbox.alert({ templateUrl, title, ok, scope }).then(...);
 *   $msgbox.confirm("message", "title", "ok title", "cancel title").then(...);
 *   $msgbox.alert({ templateUrl, title, ok, cancel, scope }).then(...);
 * 
 * If templateUrl requires scope, use an options object to specify the scope object.
 *   TODO: $msgbox.prompt
 */
provider('$msgbox', function() {

    var defaults = {
        type: 'alert',
        msg: '',
        title: null,
        ok: 'OK',
        cancel: 'Cancel',
        templateUrl: null,
        scope: null
    };

    this.$get = function($rootScope, $q, $modal) {

        var msgbox = function(options) {

            var scope = options.scope && options.scope.$new() || $rootScope.$new(),
                deferred = $q.defer();

            _.defaults(options, defaults);

            scope.msgboxType = options.type;
            scope.okLabel = options.ok;
            scope.cancelLabel = options.cancel;
            scope.callback = function(result) {
                if (result) deferred.resolve();
                else deferred.reject();
            };
            if (options.templateUrl) {
                scope.templateUrl = options.templateUrl;
            } else {
                scope.msg = options.msg;
            }

            var dialog = $modal({
                title: options.title,
                placement: 'center',
                scope: scope,
                templateUrl: '/static/app/shared/ui/msgbox.html'
            });

            return deferred.promise;
        };

        return {
            alert: function(options) {
                if (typeof options == "string") {
                    options = { msg: options, title: arguments[1], ok: arguments[2] };
                }
                options.type = 'alert';
                return msgbox(options);
            },

            confirm: function(options) {
                if (typeof options == "string") {
                    options = { msg: options, title: arguments[1], ok: arguments[2], cancel: arguments[3] };
                }
                options.type = 'confirm';
                return msgbox(options);
            },
        };
    };
}).


/**
 * $commonDialog
 *
 * Usage:
 *
 * $commonDialog(options)
 * 
 * TODO:
 * - cancen dialog by pressing Esc or clicking outside won't invoke deferred.reject()
 */
provider('$commonDialog', function() {

    var defaults = {
        title: null,
        ok: 'Continue',
        cancel: 'Cancel',
        okEnabled: null,        // function, a predicate indicates whether ok button should be enabled
        templateUrl: null,
        width: 600,
        scope: null
    };

    this.$get = function($rootScope, $q, $modal) {
        
        var CommonDialogFactory = function(options) {

            var scope = options.scope && options.scope.$new() || $rootScope.$new(),
                deferred = $q.defer();

            // deal with default values
            _.defaults(options, defaults);

            // copy properties to scope
            _.extend(scope, _.pick(options, 'ok', 'cancel', 'templateUrl', 'width', 'okEnabled'));
            scope.callback = function(result) {
                if (result) deferred.resolve();
                else deferred.reject();
            };

            var dialog = $modal({
                title: options.title,
                placement: 'center',
                scope: scope,
                templateUrl: '/static/app/shared/ui/common_dialog.html'
            });

            return deferred.promise;
        };

        return CommonDialogFactory;
        
    };

});

