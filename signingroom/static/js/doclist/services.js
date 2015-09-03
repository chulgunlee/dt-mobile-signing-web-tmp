
myApp.

/**
 * Define Doc class
 */
factory('Doc', function(DOC_STATUS_MAPPING, SIGNER_TYPE_MAPPING, SignerService) {

    function Doc(data) {

        // copy properties
        _.extend(this, data);

        this.selected = false;
    }

    Doc.prototype = {

        get statusText() {
            return DOC_STATUS_MAPPING[this.status];
        },

        get signed() {
            return this.signable && this.status == 'signed';
        },

        get submitted() {
            return this.signable && this.status == 'submitted';
        },

        /**
         * Get the name of specified signer
         * @param {String} signerType 'buyer'|'cobuyer'|'dealer'
         */
        signerName: function(signerType) {
            return SignerService[signerType].name + ((signerType == 'dealer') ? '' : ' (' + SignerService[signerType].typeName + ')');
        },

        signerSigned: function(signerType) {
            return this.signStatus[signerType];
        },

    };

    return Doc;
}).


/* Data Services */
factory('DocService', function($http, Doc, SignerService, DOC_STATUS_MAPPING, SIGNER_TYPE_MAPPING) {

    var service = {

        id: null,
        docs: [],

        refresh: function(packageId) {
            
            $http.get(apiUri + 'packages/' + packageId).success(function(data, status) {
                if (status == 302) {
                    // TODO: session time out
                    return;
                }

                service.id = data.id;

                service.docs = data.docs.map(function(docData) {
                    return new Doc(docData);
                });
                
                // store signer data in SignerService
                SignerService.init(data.signers);
            });

            // extract data from response and save it to DocService
        },

        /**
         * Submit all the signed documents
         */
        submitSignedDocs: function() {
            var signedDocIds = _.pluck(this.signedDocs, 'id');
            console.log('submitting' + JSON.stringify(signedDocIds));

            $http.put(apiUri + 'packages/' + this.id + '/submit/', { docIds: signedDocIds }).success(function(data, status) {
                if (status == 302) {
                    // TODO: session timeout
                    return;
                }

                if (status == 206) {
                    console.log('submitted');
                }
            });
            
        },

        /**
         * Get the eContract document
         * @return {Object} eContract document, or null if not exists
         */
        get contractDoc() {
            var contracts = this.docs.filter(function(doc) { return doc.isContract });
            return (contracts.length >= 1) ? contracts[0] : null;
        },

        /**
         * Check if contract is signed
         */
        get contractSigned() {
            var contract = this.contractDoc;
            return contract.signed || contract.submitted;
        },

        /**
         * Check if contract is submitted
         */
        get contractSubmitted() {
            return this.contractDoc.submitted;
        },
        
        /**
         * Get the "Required for Funding" document list
         * @return {Array} required for funding document list
         */
        get fundingDocs() {
            return this.docs.filter(function(doc) { return doc.type == 'funding' });
        },

        /**
         * Get the "Others" document list
         * @return {Array} others document list
         */
        get otherDocs() {
            return this.docs.filter(function(doc) { return doc.type == 'other' });
        },

        /**
         * Check if any documents are selected
         * @return {bool} true if any documents are selected, false if none is selected
         */
        get hasSelected() {        // TODO: not good name
            return _.some(this.docs, function(doc) { return doc.selected });
        },

        /**
         * Get selected documents
         * @return {Array} documents that are selected
         */
        get selectedDocs() {
            return this.docs.filter(function(doc) { return doc.selected; })
        },

        /**
         * Get signed documents
         * @return {Array} documents that are signed
         */
        get signedDocs() {
            return this.docs.filter(function(doc) { return doc.signed });
        },

        /**
         * Aggregate required signers in all selected docs
         * @return {Array} a list of the signers that are required by the selected docs. NOTE: correct order is NOT promised.
         */
        get requiredSignersInSelectedDocs() {
            return _.union.apply(_, _.map(this.selectedDocs, function(doc) {
                return _.filter(doc.requiredSigners, function(signerType) { return !doc.signStatus[signerType] });
            }));
        },

        /**
         * Test for specified signer to see if he is required by selected docs.
         * @param {String} signerType signer id (buyer|cobuyer|dealer).
         * @return {bool} whether this signer is required.
         */
        isSignerRequiredBySelectedDocs: function(signerType) {
            return _.some(this.selectedDocs, function(doc) {
                return _.contains(doc.requiredSigners, signerType) && !doc.signStatus[signerType];
            });
        },

    };

    return service;

}).

factory('Signer', function(SIGNER_TYPE_MAPPING) {
    
    function Signer(name, type) {
        this.name = name;
        this.type = type;
        this.typeName = SIGNER_TYPE_MAPPING[type];
        this.selected = false;
    }

    return Signer;
}).


factory('SignerService', function(Signer) {
    
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
        get selectedSigners() {
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


