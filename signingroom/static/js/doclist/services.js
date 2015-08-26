myApp.


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

}]);


