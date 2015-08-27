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
            $scope.showPreview = function(docIndexId, templateDescription) {
                // Show loading modal
                $location.path('/' + docIndexId + '/preview/');
            };


            /**
             *
             * @param docIndex
             */
            $scope.onDocSelected = function(docIndex) {
                console.log('onDocSelected(' + docIndex + ')');

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
            scope.onContinue = function() {
                var selectedDocIds = _.pluck(this.docService.selectedDocs(), 'id'),
                    selectedSigners = this.signerService.selectedSigners();
                console.log('selected docs = ' + selectedDocIds + ', selected signers = ' + selectedSigners);
            };

            /**
             * Open sign dialog
             */
            scope.selectSigner = function() {

                // update signer required status on select docs
                _.each(['buyer', 'cobuyer', 'dealer'], function(signerType) {
                    signerService[signerType].required = _.some(docService.selectedDocs(), function(doc) {
                        return doc.requiredSigners[signerType];
                    });
                });

                signerDialog.show();
            };
        }
    };
}]);



