myApp.

/* Directives */
directive('doc', function() {
    return {
        templateUrl: '/static/ngtemplates/doclist_doc.html',
        restrict: 'E',

        scope: {
            doc: '=',
        },

        controller: ['$scope', '$location', function($scope, $location) {
            // used for caching a document preview
            $scope.preview = null;


            /**
             * Loads preview from webservice
             *
             *
             * Note: No more caching.  Preview pages are sent from the server as URLs to images so the browser will cache the images.
             *
             * @param docIndexId
             * @param templateDescription
             */
            $scope.showPreview = function(doc) {
                
                // check if this document is previewable. scannable but not scanned documents cannot be previewed.
                if (!doc.scannable || doc.scanned) {

                    // Show loading modal
                    $location.path('/' + doc.id + '/preview/');
                }
            };


            /**
             *
             * @param docIndex
             */
            $scope.onDocSelected = function(docIndex) {

                // Toggle doc selected status
                $scope.doc.selected = !$scope.doc.selected;
            };
        }],
//        require: 'docPreviewModal',
        link: function(scope, element, attrs, docPreviewModalCtrl) {
 //           alert('ok');
        }
    }
}).

directive('bottomBar', function() {
    return {
        templateUrl: '/static/ngtemplates/bottom_bar.html',
        restrict: 'E',
        scope: true,

        controller: function($scope, docService, signerService, $modal, $msgbox, $commonDialog) {

            $scope.docService = docService;
            $scope.signerService = signerService;

            /**
             * Toggle signer selected status when the checkbox on signers are clicked
             * @param {string} signerType Signer type string indicates which signer is checked 
             */
            $scope.onSignerSelected = function(signerType) {
                signerService[signerType].selected = !signerService[signerType].selected;
            };

            /**
             * Open sign dialog
             */
            $scope.selectSigner = function() {
                $commonDialog({
                    title: 'Select Signer(s)',
                    ok: 'Continue',
                    cancel: 'Cancel',
                    width: 526,
                    templateUrl: '/static/ngtemplates/select_signer_modal.html',
                    scope: $scope,
                }).then(function() {
                    var selectedDocIds = _.pluck(docService.selectedDocs, 'id'),
                        selectedSigners = signerService.selectedSigners;
                    console.log('selected docs = ' + selectedDocIds + ', selected signers = ' + selectedSigners);
                });
            };

            /**
             * Open submit docs dialog
             */
            $scope.submitDocs = function() {
                $msgbox.confirm({
                    templateUrl: '/static/ngtemplates/submit_docs_confirm.html',
                    scope: $scope,
                    title: 'Submit Documents',
                    ok: 'Submit'
                }).then(function() {
                    docService.submitSignedDocs().then(function(reslut) {
                        $msgbox.alert('Document(s) have been successfully submitted to lender.');
                    });
                });
            };

            $scope.printDocs = function() {
                var url = location.protocol + '//' + location.host + apiUri + 'packages/' + docService.id + '/print/',
                    docIds = _.pluck(docService.selectedDocs, 'id'),
                    data = JSON.stringify({ docIds: docIds });
                
                WebViewBridge.call('print', { method: 'POST', url: url, data: data });
            };
        },

    };
}).

/**
 * signerPopover
 * This is a patch to popover directive to add a black mask to the background.
 */
directive('signerPopover', ['$popover', '$document', '$animate', function($popover, $document, $animate) {

    return {
        restrict: 'EA',
        scope: true,
        controller: function($scope, signerService) {
            $scope.signerName = function(signerType) {
                return signerService[signerType].name;
            };
        },

        link: function(scope, element, attr) {

            // popover options
            var options = {
                scope: scope,
                templateUrl: '/static/ngtemplates/signstatus_popover.html',
                container: 'body',
                placement: 'top',
                autoClose: true,
                viewport: { selector: 'body', padding: 10 }
            };

            // init mask
            var  mask = angular.element('<div>').addClass('am-fade').addClass('signstatus-popover-mask'),
                 body = $document.find('body'),
                 after = angular.element(body[0].lastChild);

            // initialize popover
            var popover = $popover(element, options);

            // show/hide mask when popover shows/hides
            scope.$on('tooltip.show.before', function() {
                $animate.enter(mask, body, after);
            });
            scope.$on('tooltip.hide.before', function() {
                $animate.leave(mask);
            });


            // clean up after destroy
            scope.$on('$destroy', function() {
                if (popover) popover.destroy();
                options = null;
                popover = null;
            });
        }
    };

}]).


/**
 * icon-button directive
 *
 * Usage:
 *
 *   <button icon-button="ib_sign.png">Sign</button>
 *
 * NOTE:
 *   The icon button is 44px wide, 44px high. 
 *   The icon-button attribute should specify a sprite image located under /static/images/,
 *   having the following order (each part is 44px wide):
 *
 *     +--------+-------+--------+
 *     | Normal | Hover | Active |
 *     +--------+-------+--------+
 */
directive('iconButton', function() {

    return {
        restrict: 'EA',
        scope: {
            iconButton: '@'
        },

        template: '<button class="icon-button"><ng-transclude></ng-transclude></button>',
        transclude: true,
        replace: true,

        link: function(scope, element, attr) {
            element.css({ 'background-image': 'url(/static/images/' + scope.iconButton + ')' });
        },

    };

});


