/*global angular, console, require, */

angular.module('dc.components.signingroom.signingService', [
    'dc.shared.api.api_mock',
    'dc.components.signingroom.signingRoomModals'
]).

/**
 * Define Signer class
 */
    factory('Signer', function (signingRoomModals) {
        function Signer(signerData) {
            var allowedTypes = ['buyer', 'bobuyer', 'dealer'];
            if (!signerData.name) {
                throw "signerData should contain `name` attribute";
            }
            if (!signerData.type || allowedTypes.indexOf(signerData.type) === -1) {
                throw "signerData should contain `type` attribute " +
                      "that is equal to one of the following values: buyer, cobuyer or dealer. Got '" +
                      signerData.type + "' instead";
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
            collectSignatureData: function () {
                return signingRoomModals.signaturePad(this);
            },
            /**
             * Will display modal window to confirm signer
             * that is going to be signing document next. Return promise.
             */
            confirm: function () {
                return signingRoomModals.confirmSigner(this);
            },
            /**
             * Method to return signature and initials data that was captured
             * using signature pad
             * @returns {*|{signature, initials}}
             */
            getData: function () {
                return signingRoomModals.getSigData();
            },
            /**
             * Use this method to show modal window with a consent text,
             * where signer can agree or disagree to a consent. If user
             * agrees to consent, that it is persisted to backend. And
             * consentAgreed attribute will be set to true.
             */
            showConsent: function () {
                return signingRoomModals.confirmConsent(this);
            },
            /**
             * Call this method to request a consent status.
             * Will return promise. We should think when exactly do we
             * want request this information, since consent is and
             * attribute of package, than it makes sense to request this
             * information on the initial loading of signing room, in that case
             * this method will be able to return consentStatus instead of
             * promise.
             */
            getConsentStatus: function (masterIndex) {
                throw "Not implemented";
            },
            /**
             * Sets document that signer is going to be signing.
             */
            setCurentDocument: function (document) {
                throw "Not implemented";
            }
        };
        return Signer;
    }).
    /**
    * Define Document class
    */
    factory('Document', function ($apiMock) {
        function Document(docData) {
            if (!docData.title) {
                throw "docData should contain `title` attribute";
            }
            if (!docData.document_id) {
                throw "docData should contain `document_id` attribute";
            }
            _.extend(this, docData);
        }

        Document.prototype = {
          /**
             * Will use REST api to retrieve background images for
             * current document instance.
             */
            getImages: function () {
                var self = this;
                return $apiMock.getDocumentImages(this.document_id)
                    .then(function (documentPages) {
                        self.pages = documentPages;
                    });
            }
        };
        return Document;
    }).

    /**
     * Define Signing Service. Signing service going to keep
     * state of the signing process also it's going to provide methods
     * for controlling singin process
     */
    factory('documentsCache', function ($cacheFactory) {
        return $cacheFactory('documentsCache');
    }).
    provider('signingService', function () {
        this.$get = function ($apiMock, $location, documentsCache, Signer, Document, signingRoomModals) {
            var service = {
                // initial parameters that are set during initialisation of
                // the application
                signers: null,
                masterIndex: null,
                docIds: null,
                // lets keep current signer in this attribute
                currentSigner: null,
                /**
                 * This will initialise application with attributes
                 * provided by document list application through query params
                 * query params is subject to change
                 */
                init: function (initData) {
                    this.docIds = initData.docIds;
                    this.masterIndex = parseInt(initData.masterIndex, 10);
                    // for development purposes we hard code signers list here..
                    // The way we receive initial data is to be decided.
                    this.signers = [new Signer({'name': 'Steve Jobs', type: 'buyer'})];
                    // lets hard code document list here for now
                    this.documents = [new Document({'document_id': 1, 'title': 'eContract'})];
                },
                /**
                 * start method will redirect to the appropriate
                 * starting point for the application.
                 */
                start: function () {
                    $location.path('/document/' + this.docIds[0]);
                    // for now lets set first signer, however logic needs to be
                    // developed to go over each signer and select next one in order
                    this.setCurrentSigner(this.signers[0]);
                },
                /**
                 * Returns a document information by document id
                 * it will try to retrieve document from cache, if it can not
                 * find then it will fetch it from the server using $api service
                 * (for now it's just retrieves from cache, because documentsCache
                 * is already populated on initial load of the app)
                 */
                getDocument: function (docId) {
                    return new Document(documentsCache.get(docId));
                },
                /**
                 * Calling this method will display withdraw window confirmation
                 * If singer clicks Yes, than request to the backend will be made,
                 * to paresis withdrawal. Method is not fully implemented,
                 * needs to redirect once consent is withdrawn.
                 */
                withdrawConsent: function () {
                    signingRoomModals.confirmConsentWithdrawal().then(function () {
                        $apiMock.removeConsent(this.masterIndex, this.currentSigner.type);
                    });
                },
                /**
                 * Will display confirmation window, and if user clicks yes that request to
                 * server will be made to persist unsaved signatures.
                 */
                saveAndExit: function () {
                    signingRoomModals.confirmSaveAndExist().then(function () {
                        console.log('use api to save and exit');
                    });
                },
                /**
                 * use this method to set signer that has to sign document next
                 * It is responsible for displaying modal window so signer can confirm
                 * after it confirmed Singer instance will be set to this.currentSigner
                 * attribute.
                 */
                setCurrentSigner: function (signer) {
                    signer.confirm().then(function () {
                        this.currentSigner = signer;
                    });
                }
            };
            return service;
        };
    });
