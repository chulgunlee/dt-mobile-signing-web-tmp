angular.module('dc.components.signingroom.signingService', [
    'dc.shared.api.api_mock'
]).

/**
 * Define Signing Service. Signing service going to keep
 * state of the signing process also it's going to provide methods
 * for controlling singin process
 */

provider('signingService', function() {

    this.$get = function($apiMock, $location) {

        var service = {

            signers: null,
            masterIndex: null,
            docIds: null,

            init: function (initData) {
                this.docIds = initData.docIds;
                this.masterIndex = parseInt(initData.masterIndex);
                this.signers = initData.signers;
            },

            start: function () {
                $location.path('/document/' + this.docIds[0])
            },

            getDocumentImages: function (docId) {
                return $apiMock.getDocumentImages(docId)
            }
        };

        return service;
    }

});
