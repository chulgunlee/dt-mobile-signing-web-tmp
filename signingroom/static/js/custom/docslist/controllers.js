var defaults = {
    'docListHeader': 'Contract Documents',
    'apiUri': apiUri,
    'http_config': {
        headers: {
            'Authorization': 'Basic Y2FkbmFsbDpkdGRldnVzcjg4',
            'Cookie': 'SMCHALLENGE=YES'
        }
    }
};

/* Controllers declarations */
var myApp = angular.module('docListApp', ['ngResource', 'ngRoute', 'ngAnimate', 'mgcrea.ngStrap'])
    .directive('docsRepeatCompleted', onDocsRepeatCompleted);


/**
 * Configures the doc list app in 2 ways:
 *
 *   1. Sets a HTTP request timeout
 *   2. Configures an interceptor to handle SMSession expiration
 */
myApp.config(['$httpProvider', function($httpProvider) {
    // TODO (Paul):  Set this to a sensible value
    $httpProvider.defaults.timeout = 0;
    $httpProvider.interceptors.push(function ($q) {
        return {
            responseError: function(response) {
                // TODO (Paul):  1. Refine detection of SM redirect.  2. Figure out how to change flow of control (raise exception?)
                if (response.status === 302) {
                    alert('SiteMinder session expired (302)');
                }

                return response
            }
        }
    });
}]);


/**
 * DocList resource factory
 */
myApp.factory('DocList', ['$resource', function($resource) {
    return $resource('/api/doclist/:masterIndexId', null, {
        saveToSession: {method: 'PUT', url: '/api/doclist/:masterIndexId/session/'},
        getDocPreview: {method: 'GET', url: '/api/doclist/:masterIndexId/docs/:docIndexId/preview/'}
    });
}]);



myApp.factory('DocService', ['$http', function($http) {

    /**
     * Filter docs with docType and translate data structure
     */
    var processDocs = function(pkg, docType) {
        var docStatusMapping = {
            'not-signed': 'Not Signed',
            'signed': 'Signed',
            'partially-signed': 'Partially Signed',
            'submitted': 'Submitted'
        };
        return pkg.docs.filter(function(doc) { return doc.type == docType }).map(function(doc) {
            doc.statusText = docStatusMapping[doc.status] || '';

            // fill the `signers` field which will be used by the status badge popover
            doc.signers = {};
            Object.keys(doc.requiredSigners).forEach(function(signer) {
                if (doc.requiredSigners[signer]) {
                    doc.signers[signer] = {
                        name: pkg.signers[signer],
                        signed: doc.signStatus[signer]
                    };
                }
            });

            return doc;
        });
    };

    var service = {

        docs: [],
        otherDocs: [],
        signers: [],

        refresh: function(packageId) {
            
            $http.get(defaults.apiUri + 'packages/' + packageId).success(function(data, status) {
                if (status == 302) {
                    // TODO: session time out
                    return;
                }

                service.docs = processDocs(data, 'funding');
                service.otherDocs = processDocs(data, 'other');
                service.signers = data.signers;
            });

            // extract data from response and save it to DocService
        },

        hasSelected: function() {        // TODO: not good name
            return (this.selectedDocs().length > 0);
        },

        selectedDocs: function() {
            return service.docs.filter(function(doc) { return doc.isSelected; })
        },

    };

    return service;

}]);


myApp.controller('DocListCtrl', ['$scope', 'DocService', function($scope, docService) {

    $scope.data = docService;

    docService.refresh(packageId);

    return;


    /**
     * setPreviewOrverlay
     *
     * @param imgUrls
     * @param docType
     */
    var setPreviewOverlay = function (imgUrls, docType) {
        $('#doc-preview-overlay .modal-body img').fadeOut(function () {
            $('#doc-preview-overlay .modal-header').fadeIn(function () {
                $('#doc-preview-overlay .modal-header h4').text(docType);
                $('#doc-preview-overlay .modal-header h4').fadeIn();
            });
            $('#doc-preview-overlay .modal-body h3').fadeOut(function () {
                $('#doc-preview-overlay').addClass('preview-loaded');
                $('#doc-preview-overlay button.close').show();
                var imgsHtml = '';
                var i;
                for (i in imgUrls) {
                    imgsHtml += '<img src="' + imgUrls[i] + '" />';
                }
                $('#doc-preview-overlay .modal-body h3').html(imgsHtml);
                $('#doc-preview-overlay .modal-body h3').fadeIn();
            });
        });
    };


    /**
     * initPreviewOverlay
     *
     * @param docType
     */
    var initPreviewOverlay = function (docType) {
        $('#doc-preview-overlay').removeClass('preview-loaded');
        $('#doc-preview-overlay button.close').hide();
        $('#doc-preview-overlay .modal-header h4').text("");
        $('#doc-preview-overlay .modal-header').hide();
        $('#doc-preview-overlay .modal-body').html('<img src="/static/images/loading-tr.gif" /><h3>Downloading <strong>' + docType + '</strong> preview...</h3>');
    };


    /**
     * initSelectedSigners
     */
    $scope.initSelectedSigners = function () {
        var dx, sx;
        $scope.selectedSigners = [];


        for (dx in $scope.selectedDocs) {
            if ($scope.selectedDocs[dx].SigningStatus == 'Signed')
                continue;


            for (sx in $scope.selectedDocs[dx].Signers) {
                if ($scope.selectedDocs[dx].Signers[sx].SignStatus == 'Signed')
                    continue;
                var seen = false;
                $.each($scope.selectedSigners, function (i, el) {
                    if (el.Type == $scope.selectedDocs[dx].Signers[sx].Type) {
                        seen = true;
                    }
                });
                if (!seen) {
                    for (var s in $scope.signers) {
                        if ($scope.signers[s].Type == $scope.selectedDocs[dx].Signers[sx].Type)
                            $scope.selectedSigners.push($scope.signers[s]);
                    }
                }
            }
        }
    };


    /**
     * onSignerSelected
     *
     * @param indx
     * @param event
     */
    $scope.onSignerSelected = function(indx, event) {
        //check if signer container is disabled, then prevent action
        if ($(event.currentTarget).hasClass('signers-list-item-disabled'))
            return;
        //otherwise perform action
        $scope.signers[indx].IsSelected = !$scope.signers[indx].IsSelected;
        var ix = $scope.selectedSigners.indexOf($scope.signers[indx]);
        if ($scope.signers[indx].IsSelected)
            $scope.selectedSigners.push($scope.signers[indx]);
        else
            $scope.selectedSigners.splice(ix, 1);
        $scope.updateSelectedDocs();
    };


    /**
     * updateSelectedDocs
     *
     */
    $scope.updateSelectedDocs = function() {
        $.each($scope.selectedDocs, function (i, selDoc) {
            selDoc.anyReqdSignerSelected = false;
            $.each(selDoc.Signers, function (j, docSigner) {
                docSigner.IsSelected = false;
                $.each($scope.selectedSigners, function (k, selSigner) {
                    if (docSigner.Type === selSigner.Type)
                        docSigner.IsSelected = true;
                });
                selDoc.anyReqdSignerSelected = docSigner.IsSelected || selDoc.anyReqdSignerSelected;
            });
        });
    };


    /**
     * onContinueClick
     *
     */
    $scope.onContinueClick = function () {
        try {
            if ($scope.isDocRemovalReqd()) {
                $('#doc-removal-notice').modal('show');
                return;
            }
            var docs = $scope.selectedDocs.map(function(doc) {
                return doc.DocIndexId;
            });
            var signers = $scope.selectedSigners.map(function(signer) {
                return { FullName: signer.FullName, Type: signer.Type };
            });
            $scope.onFormSubmit(docs, signers);
        } catch (err) {
            $('#remote-call-failed-msg-box .modal-body').html('Unable to send data to Signing Room.');
            $('#remote-call-failed-msg-box').modal('show');
            WebViewBridge.call('exitSigningRoom', { 'status': 'RedirectError' });
        }
    };


    /**
     * isDocRemovalReqd
     *
     * @returns {boolean}
     */
    $scope.isDocRemovalReqd = function () {
        var retVal = false;
        $.each($scope.selectedDocs, function (i, selDoc) {
            if (selDoc.IsSignable && !selDoc.anyReqdSignerSelected)
                retVal = true;
        });
        return retVal;
    };


    /**
     * onOkToRemoveDocsWOSingers
     *
     */
    $scope.onOkToRemoveDocsWOSingers = function() {
        var idxToRemove = [];
        $.each($scope.selectedDocs, function(i, selDoc) {
            if (!selDoc.anyReqdSignerSelected)
                idxToRemove.push(i);
        });
        while (idxToRemove.length) {
            var idx = idxToRemove.pop();
            $scope.selectedDocs.splice(idx, 1);
        }
        $('#doc-removal-notice').modal('hide');
        $scope.onContinueClick();
    };


    /**
     * onFormSubmit
     *
     * @param docs
     * @param signers
     */
    $scope.onFormSubmit = function(docs, signers) {
        var sessionObj = { 'documents': docs, 'signers': signers };
        $http.post(defaults.apiUri + 'doclist/session', sessionObj).success(function (data, status) {
            // TODO (Paul): Remove SMSession expiration handling
            if (status == 302) {
                $('#remote-call-failed-msg-box .modal-body').html('Your session has expired. Please login again to continue signing.');
                $('#remote-call-failed-msg-box').modal('show');
                WebViewBridge.call('exitSigningRoom', { status: 'SessionTimeout' });
                return;
            }
            if (data) { //SaveDataToSession completed successfully
                if (lockBypassEnabled) {
                    location.href = 'SigningRoom.aspx?docmasterindexid=' + masterIndxId;
                    return;
                }
                WebViewBridge.call('lock', { '': '' }, function(params) {
                    //lock acquired (supposedly)
                    location.href = 'SigningRoom.aspx?docmasterindexid=' + masterIndxId;
                });
            } else {
                $('#remote-call-failed-msg-box .modal-body').html('Unable to send data to Signing Room.');
                $('#remote-call-failed-msg-box').modal('show');
                WebViewBridge.call('exitSigningRoom', { status: 'RedirectError' });
            }
        }).error(function(data, status, headers, config) {
            $('#remote-call-failed-msg-box .modal-body').html('Unable to send data to Signing Room.');
            $('#remote-call-failed-msg-box').modal('show');
            WebViewBridge.call('exitSigningRoom', { status: 'RedirectError' });
        });
    };


    /**
     * SelectSigners
     *
     * @constructor
     */
    $scope.SelectSigners = function () {
        var ix;
        $scope.initSelectedSigners();
        $scope.disableUnneededSigners();
        $scope.updateSelectedDocs();
        for (ix in $scope.signers) {
            $scope.signers[ix].IsSelected = false;
            var iix;
            for (iix in $scope.selectedSigners) {
                if ($scope.signers[ix].Type == $scope.selectedSigners[iix].Type) {
                    $scope.signers[ix].IsSelected = true;
                    break;
                }
            }
        }
    };


    /**
     * disableUnneededSigners
     *
     */
    $scope.disableUnneededSigners = function () {
        $('.signers-list-item').each(function () {
            if ($(this).hasClass('signers-list-item-disabled'))
                $(this).removeClass('signers-list-item-disabled');
            var ix;
            for (ix in $scope.selectedSigners) {
                if ($(this).hasClass('signer-' + $scope.selectedSigners[ix].Type.toLowerCase()))
                    return;
            }
            $(this).addClass('signers-list-item-disabled');
        });
    };


    /**
     * onDocBodyClicked
     *
     * @param docIndexId
     * @param docType
     */
    $scope.onDocBodyClicked = function (docIndexId, docType) {
        initPreviewOverlay(docType);
        apiUri = defaults['apiUri'] + 'docpreviews/' + docIndexId + '?docMstrIndxId=' + masterIndxId;
        $('#doc-preview-overlay').addClass('doc-preview-modal-' + docIndexId);
        $('#doc-preview-overlay').modal('show');
        if ($scope.docsPreview[docIndexId] == null) {
            $http.get(apiUri).success(function (data, status) {
                // TODO (Paul): Remove SMSession expiration handling
                if (status == 302) {
                    WebViewBridge.call('exitSigningRoom', { status: 'SessionTimeout' });
                    return;
                }
                var key = Object.keys(data)[0];
                $scope.docsPreview[key] = data[key];
                setPreviewOverlay($scope.docsPreview[key], docType);
            }).error(function () {
                $('#remote-call-failed-msg-box .modal-body').html('The document preview you requested is not available at this time. Please, try again later.');
                $('#remote-call-failed-msg-box').modal('show');
                $('#doc-preview-overlay').modal('hide');
            });
        } else {
            setPreviewOverlay($scope.docsPreview[docIndexId], docType);
        }
    };


    /***************************************************************************
     * Event handlers
     */

    $scope.$on('SIGNED_DOC_ADDED_TO_SELECTION', function () {
        $scope.signedDocsInSelectionCount++;
    });


    $scope.$on('SIGNED_DOC_REMOVED_FROM_SELECTION', function () {
        $scope.signedDocsInSelectionCount--;
    });


    $('#signers-container').on('show.bs.modal', function () {
        $scope.SelectSigners();
    });


    $('#signers-container').on('shown.bs.modal', function () {
        if ($scope.isSignedDocFoundInSelection())
            $('#doc-mix-warning').modal('show');
    });


    $('.child-modal').on('show.bs.modal', function () {
        $(this).css('z-index', 9999);
    });
}]);


/**** Directives *******/
// TODO: what's this? why bind directive on last doc...
function onDocsRepeatCompleted() {
    return function (scope, element, attrs) {
        if (scope.$last) {
            $('[id*=signing-status-for]').each(function () {
                if ($(this).hasClass('none')) return;
                $(this).popover({
                    html: true,
                    container: '#docs-list-container',
                    content: function () {
                        return $(this).parents('.document').children('[id*=signeesFor]').html();
                    },
                    placement: "top",
                    trigger: 'click'
                });
            });
        }
    };
}





myApp.directive('docList', function() {
    return {

    }
});


myApp.directive('docListLoadFailed', function() {
    return {
        templateUrl: '/static/ngtemplates/doclist_load_failed.html'
    }
});


myApp.directive('docPreviewModal', function() {
    return {
        templateUrl: '/static/ngtemplates/doc_preview.html',
        restrict: 'E',
        scope: {

        },
        link: function() {},
        controller: ['$scope', function($scope) {
            $scope.pageUrls = [];

            this.showPreview = function(pageUrls) {
                $scope.pageUrls = pageUrls;
                alert('showPreview');
                console.log(arguments);
            };
        }]
    }
});



myApp.directive('loadingModal', function() {
    return {
        templateUrl: '/static/ngtemplates/loading_modal.html'
    }
});


myApp.directive('selectSignerModal', function() {
    return {
        templateUrl: '/static/ngtemplates/select_signer_modal.html'
    }
});


myApp.directive('docRemovalNoticeModal', function() {
    return {
        templateUrl: '/static/ngtemplates/doc_removal_notice_modal.html'
    }
});


myApp.directive('wsCallFailedModal', function() {
    return {
        templateUrl: '/static/ngtemplates/ws_call_failed_modal.html'
    }
});


myApp.directive('doc', function() {
    return {
        templateUrl: '/static/ngtemplates/doclist_doc.html',
        restrict: 'E',

        scope: {
            doc: '=',
            masterIndexId: '='
        },

        controller: ['$scope', 'DocList', '$rootScope', function($scope, DocList, $rootScope) {
            // used for caching a document preview
            $scope.preview = null;



            /**
             *
             * @param index
             */
            $scope.onRibbonClicked = function(index) {
                // Close all pop overs whose id does not match index?? (current impl)
                // I think the desired behavior is to close all irrelevant popovers..
                alert('onRibbonClicked!');
            };


            /**
             * Loads preview from webservice
             *
             *
             * Note: No more caching.  Preview pages are sent from the server as URLs to images so the browser will cache the images.
             *
             * @param docIndexId
             * @param templateDescription
             */
            $scope.showPreview = function(docIndexId, templateDescription) {
                // Show loading modal
                alert('show loading modal');

                DocList.getDocPreview({masterIndexId: $scope.masterIndexId, docIndexId: docIndexId}, function (data) {
                    $scope.preview = data;
                }, function (response) {
                    // TODO (Paul): Implement error handling
                    alert('failed');
                });
            };


            /**
             *
             * @param docIndex
             */
            $scope.onDocSelected = function(docIndex) {
                console.log('onDocSelected(' + docIndex + ')');

                // Toggle doc selected status
                $scope.doc.isSelected = !$scope.doc.isSelected;

                // update watch expressions
            };
        }],
//        require: 'docPreviewModal',
        link: function(scope, element, attrs, docPreviewModalCtrl) {
 //           alert('ok');
        }
    }
});

myApp.directive('bottomBar', [ 'DocService', '$modal', function(docService, $modal) {
    return {
        templateUrl: '/static/ngtemplates/bottom_bar.html',
        restrict: 'E',
        scope: {
        },

        link: function(scope, element) {
            scope.data = docService;

            // signer selecting modal dialog
            var signerDialog = $modal({ 
                title: 'Select Signer(s)',
                show: false,
                placement: 'center',
                scope: scope,
                templateUrl: '/static/ngtemplates/select_signer_modal.html'
            });

            // open sign dialog
            scope.selectSigner = function() {
                
                console.log(scope.data.selectedDocs());
                signerDialog.show();
            };
        }
    };
}]);


/**** Helper functions ****/
function DismissPopoverByIx(index) {
    $('[id*=signing-status-for]').each(function (ix) {
        if (index != ix)
            $(this).popover('hide');
    });
}
