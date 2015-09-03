myApp.

/* Directives */
directive('doc', function() {
    return {
        templateUrl: '/static/ngtemplates/doclist_doc.html',
        restrict: 'E',

        scope: {
            doc: '=',
            masterIndexId: '='
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

directive('bottomBar', [ 'DocService', 'SignerService', '$modal', function(docService, signerService, $modal) {
    return {
        templateUrl: '/static/ngtemplates/bottom_bar.html',
        restrict: 'E',
        scope: {
        },

        link: function(scope, element) {
            
            scope.docService = docService;
            scope.signerService = signerService;

            // signer selecting modal dialog
            var signerDialog = $modal({ 
                title: 'Select Signer(s)',
                show: false,
                placement: 'center',
                scope: scope,
                templateUrl: '/static/ngtemplates/select_signer_modal.html'
            });

            // submit dialog
            var submitDialog = $modal({
                title: 'Submit Document(s)',
                show: false,
                placement: 'center',
                scope: scope,
                templateUrl: '/static/ngtemplates/submit_docs_modal.html',
            });

            /**
             * Toggle signer selected status when the checkbox on signers are clicked
             * @param {string} signerType Signer type string indicates which signer is checked 
             */
            scope.onSignerSelected = function(signerType) {
                signerService[signerType].selected = !signerService[signerType].selected;
            };

            /**
             * Continue button click handler
             */
            scope.onContinueSign = function() {
                var selectedDocIds = _.pluck(this.docService.selectedDocs, 'id'),
                    selectedSigners = this.signerService.selectedSigners;
                console.log('selected docs = ' + selectedDocIds + ', selected signers = ' + selectedSigners);
            };

            /**
             * Open sign dialog
             */
            scope.selectSigner = function() {
                signerDialog.show();
            };

            /**
             * Open submit docs dialog
             */
            scope.submitDocs = function() {
                submitDialog.show();
            };

            scope.onContinueSubmit = function() {
                submitDialog.hide();
                docService.submitSignedDocs().then(function(reslut) {
                    console.log('submitted');
                });
            };

            /**
             * Submit document
             */
            scope.onSubmit = function() {
            };
        }
    };
}]).

/**
 * signerPopover
 * This is a patch to popover directive to add a black mask to the background.
 */
directive('signerPopover', ['$popover', '$document', '$animate', function($popover, $document, $animate) {

    return {
        restrict: 'EA',
        scope: true,
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

}]);

;



