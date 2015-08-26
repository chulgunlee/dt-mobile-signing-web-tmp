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

        controller: ['$scope', '$rootScope', function($scope, $rootScope) {
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
                alert('show loading modal');
            };


            /**
             *
             * @param docIndex
             */
            $scope.onDocSelected = function(docIndex) {
                console.log('onDocSelected(' + docIndex + ')');

                // Toggle doc selected status
                $scope.doc.selected = !$scope.doc.selected;

                // update watch expressions
            };
        }],
//        require: 'docPreviewModal',
        link: function(scope, element, attrs, docPreviewModalCtrl) {
 //           alert('ok');
        }
    }
}).

directive('bottomBar', [ 'DocService', 'SignerService', '$modal', function(docService, SignerService, $modal) {
    return {
        templateUrl: '/static/ngtemplates/bottom_bar.html',
        restrict: 'E',
        scope: {
        },

        link: function(scope, element) {
            
            scope.docService = docService;

            // signer selecting modal dialog
            var signerDialog = $modal({ 
                title: 'Select Signer(s)',
                show: false,
                placement: 'center',
                scope: scope,
                templateUrl: '/static/ngtemplates/select_signer_modal.html'
            });

            scope.signerService = SignerService;

            // Toggle signer selected status when the checkbox on signers are clicked
            scope.onSignerSelected = function(signerType) {
                SignerService[signerType].selected = !SignerService[signerType].selected;
            };

            // open sign dialog
            scope.selectSigner = function() {

                // update signer required status on select docs
                _.each(['buyer', 'cobuyer', 'dealer'], function(signerType) {
                    SignerService[signerType].required = _.some(docService.selectedDocs(), function(doc) {
                        return doc.requiredSigners[signerType];
                    });
                });

                signerDialog.show();
            };
        }
    };
}]);



