myApp.

/* Directives */
directive('doc', function() {
    return {
        templateUrl: '/static/ngtemplates/doclist_doc.html',
        restrict: 'E',

        scope: {
            doc: '=',
        },

        controller: function($scope, docService, webViewBridge, SIGNER_TYPE_MAPPING) {
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
                if (!doc.isPlaceholder) {

                    // Show loading modal
                    var docProps = {
                        docType: doc.docType,
                        docTypeName: '',
                        applicantType: doc.scanApplicant,
                        applicantTypeName: doc.scanApplicant ? SIGNER_TYPE_MAPPING[doc.scanApplicant] : '',
                    };
                    webViewBridge.startPreview(docService.id, doc.id, docProps);
                }
            };

            $scope.addDoc = function(doc) {
                if (doc.isPlaceholder) {
                    
                    webViewBridge.startPOSCapture(doc.id, doc.docType, doc.scanApplicant);

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
        },
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

        controller: function($scope, docService, signerService, $modal, $msgbox, $commonDialog, docTypeDialog, webViewBridge) {

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
                
                webViewBridge.print(docService.id, _.pluck(docService.selectedDocs, 'id'));
            };


            $scope.addDocument = function() {

                // show doc type selection dialog
                docTypeDialog({ title: 'Add Document' }).then(function(result) {
                    console.log(result.docTypeId + ',' + result.applicantType);
                });
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
            var  mask = angular.element('<div>').addClass('am-fade').addClass('modal-backdrop'),
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


directive('morePopover', function($popover) {
    return {
        restrict: 'EA',
        scope: true,

        controller: function($scope, $http, docService, docTypeDialog) {

            /**
             * Move doc to Others or to Funding Package
             */
            $scope.moveDoc = function() {
                var data = { requiredForFunding: !$scope.doc.requiredForFunding };

                $http.put(apiUri + 'docs/' + $scope.doc.id).success(function(result) {
                    // TODO: add update data
                    docService.refresh(docService.id);
                });
            };

            /**
             * Update doc type
             */
            $scope.editDoc = function() {
                docTypeDialog({
                    title: 'Update Properties',
                    ok: 'Save',
                    docTypeId: $scope.doc.docTypeId,
                    applicantType: $scope.doc.scanApplicant
                }).then(function(result) {
                    console.log(result);

                    $http.put(apiUri + 'docs/' + $scope.doc.id).success(function(result) {
                        // TODO: add update data
                        docService.refresh(docService.id);
                    });
                });
            };

            /**
             * Delete doc (delete scanned pdf, not delete doc from package)
             */
            $scope.deleteDoc = function() {
                console.log('delete doc:' + $scope.doc.id);
            };

        },

        link: function(scope, element, attr) {
            var options = {
                scope: scope,
                templateUrl: '/static/ngtemplates/more_popover.html',
                container: 'body',
                placement: 'top',
                autoClose: true,
            };

            var popover = $popover(element, options);

            element.children().eq(0).css({ left: '75%' });
        }
    };
}).


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

}).

/**
 * A directive used to debug WebViewBridge (integration with native).
 * Put this directive right after the <body> tag.
 */
directive('webViewBridgeDebug', function() {
    return {
        restrict: 'EA',
        templateUrl: '/static/ngtemplates/webviewbridge_debug.html',
        replace: true,
        scope: true,

        controller: function($scope, webViewBridge) {
            $scope.logs = webViewBridge.logs;
        },
    };
});


