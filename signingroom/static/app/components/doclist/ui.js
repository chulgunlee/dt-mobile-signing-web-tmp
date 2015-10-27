var templates = {
    'add_document_modal.html': require('./add_document_modal.html'),
    'doclist_doc.html': require('./doclist_doc.html'),
    'bottom_bar.html': require('./bottom_bar.html'),
    'select_signer_modal.html': require('./select_signer_modal.html'),
    'submit_docs_confirm.html': require('./submit_docs_confirm.html'),
    'signstatus_popover.html': require('./signstatus_popover.html'),
    'more_popover.html': require('./more_popover.html'),
}

angular.module('dc.components.doclist.ui', [
    'dc.shared.ui.uiService',
    'dc.shared.ui.uiDirective',
    'dc.components.doclist.docService',
    'dc.shared.webviewbridge.webviewbridge',
]).

/**
 * Doc type selection dialog ("Add Document / Update Document")
 * @param {object} options: title -> dialog title, docTypeId, applicantType
 */
factory('docTypeDialog', function($commonDialog, $q, $rootScope, docTypeService) {

    return function(options) {

        var scope = options.scope && options.scope.$new() || $rootScope.$new(),
            deferred = $q.defer();

        scope.docTypeService = docTypeService;

        // initial values
        scope.selectedDocTypeId = options.docTypeId;
        scope.selectedApplicantType = options.applicantType;

        scope.onDocTypeSelect = function(id) {
            scope.selectedDocTypeId = id;
            scope.selectedApplicantType = null;
        };

        scope.onApplicantTypeSelect = function(type) {
            scope.selectedApplicantType = type;
        };

        
        $commonDialog({
            title: options.title,
            ok: options.ok,
            width: 500,
            templateUrl: templates['add_document_modal.html'],
            scope: scope,

            okEnabled: function() {
                return !!scope.selectedDocTypeId && (docTypeService.getApplicantsByDocTypeId(scope.selectedDocTypeId) == null || scope.selectedApplicantType);
            },
        }).then(function() {
            deferred.resolve({
                docTypeId: scope.selectedDocTypeId,
                applicantType: scope.selectedApplicantType,
            });
        });

        return deferred.promise;
    };
}).


/* Directives */
directive('doc', function() {
    return {
        templateUrl: templates['doclist_doc.html'],
        restrict: 'E',

        scope: {
            doc: '=',
        },

        controller: function($scope, $api, docService, webViewBridge, SIGNER_TYPE_MAPPING, docTypeDialog, $msgbox) {
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
                        docTypeName: doc.templateName,
                        applicantType: doc.scanApplicant,
                        applicantTypeName: doc.scanApplicant ? SIGNER_TYPE_MAPPING[doc.scanApplicant] : undefined,
                    };
                    webViewBridge.startPreview(docService.id, doc.id, docProps);
                }
            };

            /**
             * Invoke the POS Capture when user clicked the placeholder
             */
            $scope.addDoc = function(doc) {
                if (doc.isPlaceholder) {
                    webViewBridge.startPOSCapture(doc.id, doc.docType, doc.scanApplicant);
                }
            };

            /**
             * Move doc to Others or to Funding Package
             */
            $scope.moveDoc = function() {
                var data = { requiredForFunding: !$scope.doc.requiredForFunding };

                $api.updateDoc(docService.id, $scope.doc.id, data).then(function(response) {
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

                    // TODO: set update data
                    $api.updateDoc($scope.doc.id, {}).then(function(response) {

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

            /**
             *
             * @param docIndex
             */
            $scope.onDocSelected = function(docIndex) {

                // Toggle doc selected status
                $scope.doc.selected = !$scope.doc.selected;
            };
        },

        link: function(scope, element, attrs, docPreviewModalCtrl) {
            scope.$on('morePopover.moveDoc', function(e) {
                scope.moveDoc();
            });
            scope.$on('morePopover.editDoc', function(e) {
                scope.editDoc();
            });
            scope.$on('morePopover.deleteDoc', function(e) {
                scope.deleteDoc();
            });
        }
    }
}).

directive('bottomBar', function() {
    return {
        templateUrl: templates['bottom_bar.html'],
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
                    templateUrl: templates['select_signer_modal.html'],
                    scope: $scope,
                    okEnabled: function() {
                        return $scope.signerService.selectedSigners.length > 0;
                    },
                }).then(function() {
                    var selectedDocIds = _.pluck(docService.selectedDocs, 'id'),
                        selectedSigners = signerService.selectedSigners;

                    webViewBridge.startSigningRoom($scope.docService.id, selectedDocIds, selectedSigners);
                });
            };

            /**
             * Open submit docs dialog
             */
            $scope.submitDocs = function() {
                $msgbox.confirm({
                    templateUrl: templates['submit_docs_confirm.html'],
                    scope: $scope,
                    title: 'Submit Documents',
                    ok: 'Submit'
                }).then(function() {
                    docService.submitSignedDocs().then(function(result) {
                        $msgbox.alert('Document(s) have been successfully submitted to lender.');
                    });
                });
            };

            $scope.printDocs = function() {
                var docIds = _.pluck(docService.selectedDocs, 'id'),
                    data = JSON.stringify({ docIds: docIds });
                
                webViewBridge.print(docService.id, _.pluck(docService.selectedDocs, 'id'));
            };


            $scope.addDocument = function() {

                // show doc type selection dialog
                docTypeDialog({ title: 'Add Document' }).then(function(result) {
                    console.log(result.docTypeId + ',' + result.applicantType);

                    webViewBridge.startPOSCapture(null, result.docTypeId, result.applicantType);
                });
            };
        },

    };
}).

/**
 * signerPopover
 * This is a patch to popover directive to add a black mask to the background.
 */
directive('signerPopover', function($popover, $document, $animate) {

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
                templateUrl: templates['signstatus_popover.html'],
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

}).


directive('morePopover', function($popover, $document, $animate) {
    return {
        restrict: 'EA',
        scope: true,

        controller: function($scope) {

            $scope.moveDoc = function() {
                $scope.$emit('morePopover.moveDoc');
            };

            $scope.editDoc = function() {
                $scope.$emit('morePopover.editDoc');
            };

            $scope.deleteDoc = function() {
                $scope.$emit('morePopover.deleteDoc');
            };

        },

        link: function(scope, element, attr) {
            var options = {
                scope: scope,
                templateUrl: templates['more_popover.html'],
                container: 'body',
                placement: 'top',
                autoClose: true,
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

            element.children().eq(0).css({ left: '75%' });
        }
    };
});


