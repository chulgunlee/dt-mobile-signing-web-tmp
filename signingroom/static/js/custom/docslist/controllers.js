
/* Controllers declarations */
var myApp = angular.module('docListApp', ['ngResource', 'ngRoute', 'ngAnimate', 'mgcrea.ngStrap']).

/* Constant definitions */
constant('DOC_STATUS_MAPPING', {
    'not-signed': 'Not Signed',
    'signed': 'Signed',
    'partially-signed': 'Partially Signed',
    'submitted': 'Submitted'
}).

constant('SIGNER_TYPE_MAPPING', {
    buyer: 'Buyer',
    cobuyer: 'Co-Buyer',
    dealer: 'Dealer'
}).


/* Data Services */
factory('DocService', ['$http', 'DOC_STATUS_MAPPING', 'SIGNER_TYPE_MAPPING', function($http, DOC_STATUS_MAPPING, SIGNER_TYPE_MAPPING) {

    var service = {

        docs: [],
        signers: [],

        refresh: function(packageId) {
            
            $http.get(apiUri + 'packages/' + packageId).success(function(data, status) {
                if (status == 302) {
                    // TODO: session time out
                    return;
                }
                
                // process docs data for easy use
                service.docs = data.docs.map(function(doc) {
                    // fill the `statusText` for the status badge
                    doc.statusText = DOC_STATUS_MAPPING[doc.status] || '';

                    // fill the `signers` field which will be used by the status badge popover
                    doc.signers = {};
                    Object.keys(doc.requiredSigners).forEach(function(signer) {
                        if (doc.requiredSigners[signer]) {
                            doc.signers[signer] = {
                                name: data.signers[signer] + ((signer == 'dealer') ? '' : ' (' + SIGNER_TYPE_MAPPING[signer] + ')'),
                                signed: doc.signStatus[signer]
                            };
                        }
                    });

                    return doc;
                });

                service.signers = data.signers;
            });

            // extract data from response and save it to DocService
        },
        
        fundingDocs: function() {
            return this.docs.filter(function(doc) { return doc.type == 'funding' });
        },

        otherDocs: function() {
            return this.docs.filter(function(doc) { return doc.type == 'other' });
        },

        hasSelected: function() {        // TODO: not good name
            return _.some(this.docs, function(doc) { return doc.isSelected });
        },

        selectedDocs: function() {
            return this.docs.filter(function(doc) { return doc.isSelected; })
        },

    };

    return service;

}]).


/* Controllers */

controller('DocListCtrl', ['$scope', 'DocService', function($scope, docService) {

    $scope.data = docService;
    docService.refresh(packageId);

}]).


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


