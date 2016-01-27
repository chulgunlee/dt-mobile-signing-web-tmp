/**
 * The server API wrapper mock.
 */

angular.module('dc.shared.api.api_mock', [
    'dc.shared.loading.loadingDirective',
    'dc.shared.loading.loadingService',
]).



/**
 * This mocks required server api, to be able to prototype signing room easily,
 * define clear requirements for backend and implement backend API.
 */
provider('$apiMock', function() {
    
    var docThumb = null;
    var docPage = null;

    this.setDocThumb = function(value) {
        docThumb = value;
    };

    this.setDocPage = function(value) {
        console.log(value)
        docPage = value;
    };

    this.$get = function($http, $rootScope, $q) {
    
        // the path base for assemble the api uri
        var pathBase = 'dealjackets/' + $rootScope.dealJacketId + '/deals/' + $rootScope.dealId;

        var getUrl = function(uri) {
            return apiUri + pathBase + uri;
        };
        
        var request = function(method, uri, return_data) {

            var deferred = $q.defer();

            deferred.resolve(return_data)

            return deferred.promise;
        };

        var service = {

            // expose url generator, mainly for webviewbridge to provide api url to native
            url: function(uri) {
                return getUrl(uri);
            },

            // this api will be used to render left side menu in signing room
            getDocuments: function(master_id, ids) {
                var return_data = [
                    {
                        'title': 'eContract',
                        'document_id': 12345,
                        'thumb': docThumb
                    },
                    {
                        'title': 'Test Document',
                        'document_id': 12346,
                        'thumb': docThumb
                    },
                    {
                        'title': 'Test 1',
                        'document_id': 12347,
                        'thumb': docThumb
                    },
                    {
                        'title': 'Test 2',
                        'document_id': 12347,
                        'thumb': docThumb
                    },
                    {
                        'title': 'Test 3',
                        'document_id': 12347,
                        'thumb': docThumb
                    },
                    {
                        'title': 'Test 4',
                        'document_id': 12347,
                        'thumb': docThumb
                    }

                ];
                return request('GET', '/documents', return_data);
            },

            // this api is going toe be used to render initial document and consequent documents as wel
            getDocumentImages: function(document_id) {
                return_data = [
                    {'PageNo': 1,'Value': docPage}
                ];
                return request('GET', ['docs', document_id, 'images'].join('/'), return_data);
            },

            // this will be used to render signatures and date blocks on  a document
            // also data from will give information about who need to sign this document.
            getSigString: function(document_id){
                return_data = {
                    "signature_block": [
                        {
                            "name": "BUYER_NOTICE",
                            "left_x_coord": 140,
                            "lower_y_coord": 410,
                            "height": 50,
                            "width": 100,
                            "page": 1,
                            "signer_name": "TEST SIGNA",
                            "signature_header": {
                                "sig_type": "BUYER",
                                "signature_text": "I, TEST SIGNA as the Buyer, HAVE READ and AGREE TO BE BOUND by the Terms and Conditions of the Retail Installment Contract #1750674543",
                                "value": "Contract Terms and Conditions"
                            }
                        },
                    ],
                    "text_field_block": [
                        {
                            "name": "BUYER_NOTICE_date",
                            "left_x_coord": 475,
                            "lower_y_coord": 427,
                            "height": 28,
                            "width": 150,
                            "page": 1,
                            "font": "TimesNewRoman",
                            "font_size": 10,
                            "text_type": "DATE"
                        }
                    ]
                };

                return request('GET', 'docs/sigstring/', return_data)
            },

            // this will be used to save collected signatures for document. fully and parcially
            saveSigningInfo: function(master_index_id, signatures){
                alert('saved');
            },

            // this is to set signer consent
            setConsent: function(master_index_id, signee_type){
             alert('consent set')
            },

            // to check if user has consent to sign the document
            getConsent: function(master_index_id, signee_type){
             alert('consent set');
            },

            // this is to withdrow consent
            removeConsent: function(master_index, signee_type){
                alert('removed consent')
            }
        };

        return service;
    }
});
