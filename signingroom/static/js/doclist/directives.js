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
                $scope.doc.isSelected = !$scope.doc.isSelected;

                // update watch expressions
            };
        }],
//        require: 'docPreviewModal',
        link: function(scope, element, attrs, docPreviewModalCtrl) {
 //           alert('ok');
        }
    }
}).

directive('bottomBar', [ 'DocService', 'SIGNER_TYPE_MAPPING', '$modal', function(docService, SIGNER_TYPE_MAPPING, $modal) {
    return {
        templateUrl: '/static/ngtemplates/bottom_bar.html',
        restrict: 'E',
        scope: {
        },

        link: function(scope, element) {
            scope.data = docService;

            // signer selecting modal dialog
            var signerDialog = $modal({ 
                title: 'Select Signer(s)',
                show: false,
                placement: 'center',
                scope: scope,
                templateUrl: '/static/ngtemplates/select_signer_modal.html'
            });

            // open sign dialog
            scope.selectSigner = function() {

                // aggregate required signers from each document
                var signerKeys = ['buyer', 'cobuyer', 'dealer'],
                    required = _.map(signerKeys, function(signerKey) {
                        return {
                            name: scope.data.signers[signerKey],
                            type: SIGNER_TYPE_MAPPING[signerKey],
                            required: _.some(scope.data.selectedDocs(), function(doc) { return doc.requiredSigners[signerKey]; }),
                            isSelected: false
                        };
                    });

                scope.requiredSigners = _.object(signerKeys, required);

                scope.onSignerSelected = function(signerKey) {
                    // Toggle signer selected status
                    scope.requiredSigners[signerKey].isSelected = !scope.requiredSigners[signerKey].isSelected;
                };

                signerDialog.show();
            };
        }
    };
}]);



