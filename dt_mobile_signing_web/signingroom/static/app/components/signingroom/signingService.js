angular.module('dc.components.signingroom.signingService', [
    'dc.shared.api.api_mock'
]).

/**
 * Define Signing Service. Signing service going to keep
 * state of the signing process also it's going to provide methods
 * for controlling singin process
 */

factory('documentsCache', function($cacheFactory){
        return $cacheFactory('documentsCache')
    }).

provider('signingService', function() {

    this.$get = function($apiMock, $location, documentsCache) {

        var service = {

            // initial parameters that are set during initialisation of
            // the application
            signers: null,
            masterIndex: null,
            docIds: null,

            /**
             * This will initialise application with attributes
             * provided by document list application through query params
             * query params is subject to change
             */
            init: function (initData) {
                this.docIds = initData.docIds;
                this.masterIndex = parseInt(initData.masterIndex);
                this.signers = initData.signers;
            },


            /**
             * start method will redirect to the appropriate
             * starting point for the application
             */
            start: function () {
                $location.path('/document/' + this.docIds[0]);
            },

            /**
             * Will use REST api to retrieve background images for
             * document is provided.
             */
            getDocumentImages: function (docId) {
                return $apiMock.getDocumentImages(docId);
            },

            /**
             * Returns a document information by document id
             * it will try to retrieve document from cache, if it can not
             * find then it will fetch it from the server using $api service
             * (for now it's just retrieves from cache, because documentsCache
             * is already populated on initial load of the app)
             */
            getDocument: function(docId) {
                return documentsCache.get(docId);
            }
        };

        return service;
    }

});
