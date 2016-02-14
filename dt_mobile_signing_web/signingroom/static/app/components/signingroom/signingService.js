angular.module('dc.components.signingroom.signingService', [
    'dc.shared.api.api_mock',
    'dc.components.signingroom.signingRoomModals'
]).

/**
 * Define Signer class
 */
factory('Signer', function(signingRoomModals) {

    function Signer(signerData) {

        if(!signerData.name) {
            throw "signerData should contain `name` attribute"
        }

        if(!signerData.type) {
            throw "signerData should contain `type` attribute " +
            "that is equal to one of the following values: buyer, cobuyer or dealer"
        }

        _.extend(this, signerData);

        this.confirmed = false;
    }

    Signer.prototype = {

        /**
         * Will display modal window to prompt signer for signature and
         * initials. After signer press sign button it will store collected
         * base64 encoded data. Will return promise, that will resolve after
         * user click "Apply" button on signature pad dialog.
         */

        collectSignatureData: function() {
            return signingRoomModals.signaturePad(this)
        },

        /**
         * Will display modal window to confirm signer
         * that is going to be signing document next. Return promise.
         * After user clicks "Sign" will set this.confirmed to true
         * and promise will be resolve.
         */
        confirm: function() {
            return signingRoomModals.confirmSigner(this)
        },

        /**
         * @returns {*|{signature, initials}}
         */
        getData: function() {
            return signingRoomModals.getSigData()
        }


    };

    return Signer;
}).

/**
 * Define Signing Service. Signing service going to keep
 * state of the signing process also it's going to provide methods
 * for controlling singin process
 */

factory('documentsCache', function($cacheFactory){
        return $cacheFactory('documentsCache')
    }).

provider('signingService', function() {

    this.$get = function($apiMock, $location, documentsCache, Signer) {

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

                // for development purposes we hard code signers list here..
                // The way we receive initial data is to be decided.
                this.signers = [new Signer({'name': 'Steve Jobs', type: 'buyer'})];
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
