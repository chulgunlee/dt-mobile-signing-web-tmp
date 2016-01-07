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
provider('$api_mock', function() {
    
    var apiUri = '/api/';

    this.setApiUri = function(value) {
        apiUri = value;
    }


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
                        'document_id': 12345
                    },
                    {
                        'title': 'Test Document',
                        'document_id': 12346
                    },
                    {
                        'title': 'Test 2',
                        'document_id': 12347
                    },
                    {
                        'title': 'Test 2',
                        'document_id': 12347
                    }
                ];
                return request('GET', '/documents', return_data);
            },

            // this api is going toe be used to render initial document and consequent documents as wel
            getDocumentImages: function(document_id) {
                return_data = [
                    {'PageNo': 1,'Value': 'iVBORw0KGgoAAAANSUhEUgAAAM4AAAEMCAMAAAC7lnn9AAAAA3NCSVQICAjb4U/gAAAA2FBMVEX///+rq6urq6urq6urq6urq6vb29urq6urq6urq6urq6urq6u9vb21tbWrq6uvr6+rq6vMzMytra2rq6u3t7erq6v////39/f19fXz8/Px8fHv7+/t7e3r6+vp6enn5+fl5eXj4+Ph4eHf39/d3d3b29vZ2dnX19fV1dXT09PMzMzFxcXDw8PBwcG/v7+9vb27u7u5ubm3t7e1tbWzs7OxsbGvr6+tra2rq6upqamnp6elpaWjo6OhoaGZmZmRkZGPj4+NjY2Li4uHh4eEhISBgYF+fn54eHi6b/ZvAAAASHRSTlMAESIzRFVmZneImaq7u7vMzN3d3e7u//////////////////////////////////////////////////////////////////9xVLDnAAAACXBIWXMAAAsSAAALEgHS3X78AAAAFXRFWHRDcmVhdGlvbiBUaW1lADEwLzMvMTSj68NVAAAAHHRFWHRTb2Z0d2FyZQBBZG9iZSBGaXJld29ya3MgQ1M26LyyjAAAIABJREFUeJztfQtj4ziS3iR7l01yye1mbweEJEgUKBGkCwQJPiTqYXF29+6S//+PUh8ou21Jbrs9M9vu3kG39aBAkEUUCl8Vqgo//MDl93/4cfdhyj//8PPK7/7059VEfIxSMj3/9POo+TH72kR8KsWu3/34s+j50weihsnx9W73u/dT8/s/f20SnpZiV+nt7t/e3z9/WH1tEp4WJkcl7e7H//pecnYfRQqEAnLUmvvnvfy2+9oUPCuBHGX63R/f2T8fkRxlNu+l50OSo/Ld7l/fRc/HJEdRv/vX74gcRbvdv/yX74cc0PM/vyNyQM//+I7IUcU76PnA5CwYX//374ccpcrdj7//jsiJ/Zeqcx+aHLVovxBef2xylK6/TJ374OSoZPNF8Pqjk6OSbvdvb4dvH54clW6+gJ6PT45Kd29XF74BcpTZ7v71jXD0S8iZVKkgyWhqXSphpVZmMR7RtHYzIdScSClBJFZzETltO2W6tc+NMtIY6Zbchu2os8aazkh1bpZbDO/mJXIA395Iz5eQo7th+X8TvqMuHfjVaEU4ooXnI/dC+6rurRcHKoa96FfD34zoDJ1+6rwn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'}
                ];
                return request('GET', ['docs', document_id, 'images'].join('/'), return_data);
            },

            // this will be used to render signatures and date blocks on  a document
            // also data from will give information about who need to sign this document.
            get_sig_string: function(document_id){
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
            save_signing_info: function(signatures){
                alert('saved');
            },

            // this is to set signer consent
            set_consent: function(master_index_id, segue_type){
             alert('consent set')
            },

            // to check if user has consent to sign the document
            get_consent: function(master_index_id, segue_type){
             alert('consent set');
            },

            // this is to withdrow consent
            remove_consent: function(master_index, segue_type){
                alert('removed consent')
            },

            bind: function(){
                console.log('bind')
            }
        };

        return service;
    }
});
