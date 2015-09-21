
myApp.

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
                
                // store signer data in signerService
                signerService.init(data.signers);

                docTypeService.init();
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
}).


factory('docTypeService', function($api) {
    var service = {
        
        init: function() {
            
            $api.getDocTypes().then(function(response) {
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


/**
 * common services
 */

/**
 * $msgbox
 *
 * Usage:
 *
 *   $msgbox.alert("message", "title"(optional), "ok title").then(...);
 *   $msgbox.alert({ templateUrl, title, ok, scope }).then(...);
 *   $msgbox.confirm("message", "title", "ok title", "cancel title").then(...);
 *   $msgbox.alert({ templateUrl, title, ok, cancel, scope }).then(...);
 * 
 * If templateUrl requires scope, use an options object to specify the scope object.
 *   TODO: $msgbox.prompt
 */
provider('$msgbox', function() {

    var defaults = {
        type: 'alert',
        msg: '',
        title: null,
        ok: 'OK',
        cancel: 'Cancel',
        templateUrl: null,
        scope: null
    };

    this.$get = function($rootScope, $q, $modal) {

        var msgbox = function(options) {

            var scope = options.scope && options.scope.$new() || $rootScope.$new(),
                deferred = $q.defer();

            _.defaults(options, defaults);

            scope.msgboxType = options.type;
            scope.okLabel = options.ok;
            scope.cancelLabel = options.cancel;
            scope.callback = function(result) {
                if (result) deferred.resolve();
                else deferred.reject();
            };
            if (options.templateUrl) {
                scope.templateUrl = options.templateUrl;
            } else {
                scope.msg = options.msg;
            }

            var dialog = $modal({
                title: options.title,
                placement: 'center',
                scope: scope,
                templateUrl: '/static/ngtemplates/msgbox.html'
            });

            return deferred.promise;
        };

        return {
            alert: function(options) {
                if (typeof options == "string") {
                    options = { msg: options, title: arguments[1], ok: arguments[2] };
                }
                options.type = 'alert';
                return msgbox(options);
            },

            confirm: function(options) {
                if (typeof options == "string") {
                    options = { msg: options, title: arguments[1], ok: arguments[2], cancel: arguments[3] };
                }
                options.type = 'confirm';
                return msgbox(options);
            },
        };
    };
}).


/**
 * $commonDialog
 *
 * Usage:
 *
 * $commonDialog(options)
 * 
 * TODO:
 * - cancen dialog by pressing Esc or clicking outside won't invoke deferred.reject()
 */
provider('$commonDialog', function() {

    var defaults = {
        title: null,
        ok: 'Continue',
        cancel: 'Cancel',
        okEnabled: null,        // function, a predicate indicates whether ok button should be enabled
        templateUrl: null,
        width: 600,
        scope: null
    };

    this.$get = function($rootScope, $q, $modal) {
        
        var CommonDialogFactory = function(options) {

            var scope = options.scope && options.scope.$new() || $rootScope.$new(),
                deferred = $q.defer();

            // deal with default values
            _.defaults(options, defaults);

            // copy properties to scope
            _.extend(scope, _.pick(options, 'ok', 'cancel', 'templateUrl', 'width', 'okEnabled'));
            scope.callback = function(result) {
                if (result) deferred.resolve();
                else deferred.reject();
            };

            var dialog = $modal({
                title: options.title,
                placement: 'center',
                scope: scope,
                templateUrl: '/static/ngtemplates/common_dialog.html'
            });

            return deferred.promise;
        };

        return CommonDialogFactory;
        
    };

}).

/**
 * Doc type selection dialog ("Add Document / Update Document")
 * @param {object} options: title -> dialog title, docTypeId, applicantType
 */
factory('docTypeDialog', function($commonDialog, $q, $rootScope, docTypeService) {

    return function(options) {

        var scope = options.scope && options.scope.$new() || $rootScope.$new(),
            deferred = $q.defer();

        scope.docTypeService = docTypeService;

        // initial values
        scope.selectedDocTypeId = options.docTypeId;
        scope.selectedApplicantType = options.applicantType;

        scope.onDocTypeSelect = function(id) {
            scope.selectedDocTypeId = id;
            scope.selectedApplicantType = null;
        };

        scope.onApplicantTypeSelect = function(type) {
            scope.selectedApplicantType = type;
        };

        
        $commonDialog({
            title: options.title,
            ok: options.ok,
            width: 500,
            templateUrl: '/static/ngtemplates/add_document_modal.html',
            scope: scope,

            okEnabled: function() {
                return !!scope.selectedDocTypeId && (docTypeService.getApplicantsByDocTypeId(scope.selectedDocTypeId) == null || scope.selectedApplicantType);
            },
        }).then(function() {
            deferred.resolve({
                docTypeId: scope.selectedDocTypeId,
                applicantType: scope.selectedApplicantType,
            });
        });

        return deferred.promise;
    };
}).


/**
 * WebViewBridge wrapper.
 */
factory('webViewBridge', function() {

    var service = {
        
        logs: [],

        call: function(func, params, callback) {
            //this.log('Calling native: func="' + func + '", params=' + JSON.stringify(params));
            window.WebViewBridge.call(func, params, callback);
        },

        registerFunction: function(key, func) {
            window.WebViewBridge.registerFunction(key, func);
        },

        log: function(text) {
            if (window.webViewBridgeDebugEnabled) {
                this.logs.push(text);
            }
        },

        _absUrl: function(url) {
            return location.protocol + '//' + location.host+ apiUri + url;
        },

        /* Native API wrappers */

        print: function(pkgId, docIds, url) {
            this.call('print', {
                method: 'POST',
                url: this._absUrl('packages/' + pkgId),
                data: JSON.stringify({ docIds: docIds }),
                pkgId: pkgId,           // for native reference only
                docIds: docIds,         // for native reference only
            });
        },

        logEvent: function(pkgId, msg) {
            this.call('logEvent', { pkgId: pkgId, msg: msg });
        },

        startPreview: function(pkgId, docId, docProps) {
            this.call('startPreview', {
                method: 'GET',
                url: this._absUrl('doclist/' + pkgId + '#/' + docId + '/preview/'),
                pkgId: pkgId,
                docId: docId,
                docProps: docProps
            });
        },
        
        startSigningRoom: function(pkgId, docIds, url) {
            this.call('startSigningRoom', { pkgId: pkgId, docIds: docIds, url: url });
        },

        startPOSCapture: function(docId, docType, applicantType) {
            this.call('startPOSCapture', { docId: docId, docType: docType, applicantType: applicantType });
        },

    };

    // inject WebViewBridge
    var makeMsg = window.WebViewBridge._makeMsg;
    window.WebViewBridge._makeMsg = function(func, params, key) {
        var msg = makeMsg(func, params, key);
        service.log('Send msg to native: ' + msg);
        return msg;
    };


    return service;
}).



factory('loadingIndicatorService', function() {

    var service = {
        visible: false,
        msg: null,

        show: function(msg) {
            this.msg = msg;
            this.visible = true;
        },
        
        hide: function() {
            this.visible = false;
        },
    };

    return service;

}).

/**
 * server API wrapper
 */
factory('$api', function($http, $q, loadingIndicatorService) {
    
    var request = function(method, uri, data) {
        
        loadingIndicatorService.show('Loading data...');

        var deferred = $q.defer();

        $http({
            method: method.toUpperCase(),
            url: apiUri + uri,
            data: data,
        }).then(function(response) {

            loadingIndicatorService.hide();
            deferred.resolve(response);

        }, function(response) {

            loadingIndicatorService.hide();
            deferred.reject(response);
        });

        return deferred.promise;
    };

    var service = {

        getDocList: function(packageId) {
            return request('GET', 'packages/' + packageId);
        },

        submitDocs: function(packageId, docIds) {
            return request('GET', 'packages/' + packageId + '/submit/', { docIds: docIds });
        },

        getDocTypes: function() {
            return request('GET', 'doctypes/');
        },

        updateDoc: function(docId, data) {
            return request('PUT', 'docs/' + docId, data);
        },

        getDocPreview: function(docId) {
            return request('GET', 'docs/' + docId + '/preview');
        },

    };

    return service;
});
