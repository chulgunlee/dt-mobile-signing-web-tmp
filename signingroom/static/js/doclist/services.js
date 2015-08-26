myApp.


/* Data Services */
factory('DocService', ['$http', 'SignerService', 'DOC_STATUS_MAPPING', 'SIGNER_TYPE_MAPPING', function($http, SignerService, DOC_STATUS_MAPPING, SIGNER_TYPE_MAPPING) {

    var service = {

        docs: [],

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

                    // fill other fields
                    doc.selected = false;

                    return doc;
                });

                // store signer data in SignerService
                SignerService.init(data.signers);
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
            return _.some(this.docs, function(doc) { return doc.selected });
        },

        selectedDocs: function() {
            return this.docs.filter(function(doc) { return doc.selected; })
        },

    };

    return service;

}]).


factory('SignerService', function(SIGNER_TYPE_MAPPING) {
    
    var Signer = function(name, type) {
        this.name = name;
        this.type = type;
        this.typeName = SIGNER_TYPE_MAPPING[type];
        this.required = false;
        this.selected = false;
    },

    service = {

        buyer: null,
        cobuyer: null,
        dealer: null,

        /**
         * init `SignerService`.
         * @param {Object} signers An object with k-v = type:name
         */
        init: function(signers) {
            this.buyer = new Signer(signers.buyer, 'buyer');
            this.cobuyer = new Signer(signers.cobuyer, 'cobuyer');
            this.dealer = new Signer(signers.dealer, 'dealer');
        },

        /**
         * Get a list of selected signers
         */
        selectedSigners: function() {
            var selected = [];
            _.each(['buyer', 'cobuyer', 'dealer'], function(signerType) {
                if (service[signerType].selected) {
                    selected.push(signerType);
                }
            });
            return selected;
        },

    };

    return service;
});


