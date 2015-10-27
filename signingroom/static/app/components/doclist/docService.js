angular.module('dc.components.doclist.docService', [
    'dc.components.doclist.constants',
    'dc.shared.api.api',
]).

/**
 * Define Doc class
 */
factory('Doc', function(DOC_STATUS_MAPPING, SIGNER_TYPE_MAPPING, signerService) {

    function Doc(data) {

        // copy properties
        _.extend(this, data);

        this.selected = false;
    }

    Doc.prototype = {

        get signed() {
            return this.signable && this.status == 'signed';
        },

        get submitted() {
            return this.signable && this.status == 'submitted';
        },

        get isPlaceholder() {
            return this.isExternal && this.status == 'initial';
        },

        get isContract() {
            return this.docType == 'contract';
        },

        /**
         * Get the name of specified signer
         * @param {String} signerType 'buyer'|'cobuyer'|'dealer'
         */
        signerName: function(signerType) {
            return signerService[signerType].name + ((signerType == 'dealer') ? '' : ' (' + signerService[signerType].type + ')');
        },

        signerSigned: function(signerType) {
            return this.signStatus[signerType];
        },


    };

    return Doc;
}).


/* Data Services */
factory('docService', function($q, $api, Doc, signerService, docTypeService, DOC_STATUS_MAPPING, SIGNER_TYPE_MAPPING) {

    var service = {

        id: null,
        docs: [],

        refresh: function(packageId) {
            
            $api.getDocList(packageId).then(function(response) {
                if (response.status == 302) {
                    // TODO: session time out
                    return;
                }

                var data = response.data;

                service.id = data.id;

                service.docs = data.docs.map(function(docData) {
                    return new Doc(docData);
                });
            });

            // extract data from response and save it to docService
        },

        /**
         * Submit all the signed documents
         */
        submitSignedDocs: function() {
            var signedDocIds = _.pluck(this.signedDocs, 'id');
            console.log('submitting' + JSON.stringify(signedDocIds));

            var deferred = $q.defer();
            
            $api.submitDocs(this.id, signedDocIds).then(function(response) {
                if (response.status == 302) {
                    // TODO: session timeout
                    return;
                }

                if (response.status == 204) {
                    deferred.resolve();
                }

            });

            return deferred.promise;
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
            return contract ? (contract.signed || contract.submitted) : false;
        },

        /**
         * Check if contract is submitted
         */
        get contractSubmitted() {
            return this.contractDoc ? this.contractDoc.submitted : false;
        },
        
        /**
         * Get the "Required for Funding" document list
         * @return {Array} required for funding document list
         */
        get fundingDocs() {
            return this.docs.filter(function(doc) { return doc.requiredForFunding });
        },

        /**
         * Get the "Others" document list
         * @return {Array} others document list
         */
        get otherDocs() {
            return this.docs.filter(function(doc) { return !doc.requiredForFunding });
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

factory('docTypeService', function($api) {
    var service = {
        
        init: function(packageId) {
            
            $api.getDocTypes(packageId).then(function(response) {
                service.docTypes = response.data.docTypes;
            });
        },

        /**
         * Returns the applicants of specified docType
         */
        getApplicantsByDocTypeId: function(id) {
            var docType = _.find(service.docTypes, function(docType) {
                return docType.id == id;
            });

            if (docType && docType.applicants) return docType.applicants;
            else return null;
        },
    }; 

    return service;
    
}).

factory('Signer', function(SIGNER_TYPE_MAPPING) {
    
    function Signer(name, type) {
        this.name = name;
        this.type = type;
        this.selected = false;
    }

    return Signer;
}).


factory('signerService', function(Signer) {
    
    var service = {

        buyer: null,
        cobuyer: null,
        dealer: null,

        /**
         * init `signerService`.
         * @param {Object} signers An object with k-v = type:name
         */
        init: function(signers) {
            this.buyer = new Signer(signers.buyer, 'buyer');
            this.cobuyer = new Signer(signers.cobuyer, 'cobuyer');
            this.dealer = new Signer('Dealer', 'dealer');
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
