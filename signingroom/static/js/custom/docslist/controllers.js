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
var myApp = angular.module('docsListApp', ['ngResource', 'ngRoute'])
    .directive('docsRepeatCompleted', onDocsRepeatCompleted)
    .service('headerService', ['$rootScope', HeaderSvc]);


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


/* Header Service */
function HeaderSvc($rootScope) {
    var headerText = defaults.docListHeader;
    var documentsSelected = 0;
    var signableDocsCount = 0;
    var selectedDocIndxs = [];

    var setHeaderText = function (text) {
        headerText = text;
        $rootScope.$broadcast('HEADER_TEXT_UPDATED', headerText);
    };

    var getHeaderText = function () {
        return documentsSelected > 0 ? headerText : defaults.docListHeader;
    };

    return {
        setHeaderText: setHeaderText,
        getHeaderText: getHeaderText,
        setDocumentsSelected: function (count) {
            documentsSelected = count;
            $rootScope.$broadcast('DOCUMENTS_COUNT_CHANGED', documentsSelected);
        },
        getDocumentsSelected: function () {
            return documentsSelected;
        },
        setSelectedDocIndxs: function(indxsArr) {
            selectedDocIndxs = indxsArr;
            $rootScope.$broadcast('SELECTED_DOC_INDXS_CHANGED', selectedDocIndxs);
        },
        getSelectedDocIndxs: function() {
            return selectedDocIndxs;
        },
        addSignableDoc: function() {
            signableDocsCount++;
            $rootScope.$broadcast('SIGNABLE_DOCS_COUNT_CHANGED', signableDocsCount);
        },
        removeSignableDoc: function() {
            signableDocsCount--;
            $rootScope.$broadcast('SIGNABLE_DOCS_COUNT_CHANGED', signableDocsCount);
        }
    };
}


myApp.controller('HeaderCtrlr', ['$scope', 'headerService', function ($scope, headerService) {
    $scope.headerText = headerService.getHeaderText();
    $scope.isAnyDocSelected = false;
    $scope.isNoSignableDocsFound = true;
    $scope.selectedDocIndxs = [];
    $scope.$on('HEADER_TEXT_UPDATED', function (response) {
        $scope.headerText = headerService.getHeaderText();
    });
    $scope.$on('DOCUMENTS_COUNT_CHANGED', function () {
        $scope.isAnyDocSelected = headerService.getDocumentsSelected() > 0;
    });
    $scope.$on('SELECTED_DOC_INDXS_CHANGED', function () {
        $scope.selectedDocIndxs = headerService.getSelectedDocIndxs();
    });
    $scope.$on('SIGNABLE_DOCS_COUNT_CHANGED', function(evt, signableDocsCount) {
        $scope.isNoSignableDocsFound = signableDocsCount <= 0;
    });
    $scope.onSelectSigners = function () {
        $('#signers-container').modal('show');
    };
    $scope.onPrintClicked = function() {
        var indxs = $scope.selectedDocIndxs.map(function (doc) {
            return doc.DocIndexId;
        });
        var printoutApiUrl = defaults.apiUri + 'printouts/' + indxs.join(';') + '?docMstrIndxId=' + masterIndxId;
        WebViewBridge.call('print', { 'url': printoutApiUrl });
    };
}]);


myApp.controller('DocsListCtrlr', ['$scope', '$http', 'headerService', 'DocList', function($scope, $http, headerService, DocList) {
    $scope.dataLoaded = false;
    $scope.apiCallFailed = false;
    $scope.docsPreview = {};
    $scope.selecteedSigners = [];
    $scope.signedDocsInSelectionCount = 0;

    var apiUri = defaults.apiUri + 'contractdetails/' + masterIndxId;

    // Get the doclist from the back end
    DocList.get({masterIndexId: masterIndxId}, function(data, status) {
        if (status == 302) {
            WebViewBridge.call('exitSigningRoom', { status: 'SessionTimeout' });
            return;
        }

        $scope.masterIndexId = data.Id;


        $scope.documents = data["Documents"];
        $scope.customers = data["Customers"].join(' & ');
        $scope.signers = data["Signers"];
        $scope.getSelectedDocsCount = function () {
            return $scope.documents.filter(function (el) { return el.IsSelected; }).length;
        };
        $scope.isAnyDocSelected = function () {
            return $scope.getSelectedDocsCount() > 0;
        };
        $scope.updateHeader = function () {
            var count = $scope.getSelectedDocsCount();
            headerService.setDocumentsSelected(count);
            headerService.setHeaderText($().pluralize(count+' Document') + " Selected");
        };
        for (var docIndex = 0; docIndex < $scope.documents.length; docIndex++) {
            var doc = $scope.documents[docIndex];
            if (doc.IsSignable && doc.SigningStatus !== 'Signed')
                $scope.onDocSelected(docIndex);
        }
        $scope.dataLoaded = true;
    }, function (data, status, headers, config) {
        $scope.apiCallFailed = true;
    });


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
     * onDocSelected
     *
     * @param docIndex
     */
    $scope.onDocSelected = function (docIndex) {

        // changed selected status
        $scope.documents[docIndex].IsSelected = !$scope.documents[docIndex].IsSelected;


        if ($scope.documents[docIndex].IsSelected) {
            if ($scope.documents[docIndex].SigningStatus === 'Signed')
                $scope.$broadcast('SIGNED_DOC_ADDED_TO_SELECTION');
            else {
                $scope.selectedDocs.push($scope.documents[docIndex]);
                if ($scope.documents[docIndex].IsSignable)
                    headerService.addSignableDoc();
            }
        } else {
            if ($scope.documents[docIndex].SigningStatus === 'Signed')
                $scope.$broadcast('SIGNED_DOC_REMOVED_FROM_SELECTION');
            else {
                var elIndx = $scope.selectedDocs.indexOf($scope.documents[docIndex]);
                $scope.selectedDocs.splice(elIndx, 1);
                if ($scope.documents[docIndex].IsSignable)
                    headerService.removeSignableDoc();
            }
        }
        headerService.setSelectedDocIndxs($scope.selectedDocs);
        $scope.updateHeader();
    };


    /**
     * isSignedDocFoundInSelection
     *
     * @returns {boolean}
     */
    $scope.isSignedDocFoundInSelection = function () {
        return $scope.signedDocsInSelectionCount > 0;
    };


    /**
     * onRibbonClicked
     *
     * @param index
     */
    $scope.onRibbonClicked = function (index) {
        DismissPopoverByIx(index);
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



myApp.directive('docListHeader', function() {
    return {
        templateUrl: '/static/ngtemplates/doclist_header.html'
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
        controller: ['$scope', 'DocList', function($scope, DocList) {
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
                $scope.doc.IsSelected = !$scope.doc.IsSelected;

                // TODO (Paul): Update header
                //if ($scope.documents[docIndex].IsSelected) {
                //    if ($scope.documents[docIndex].SigningStatus === 'Signed') {
                //        $scope.$broadcast('SIGNED_DOC_ADDED_TO_SELECTION');
                //    } else {
                //        $scope.selectedDocs.push($scope.documents[docIndex]);
                //        if ($scope.documents[docIndex].IsSignable) {
                //            headerService.addSignableDoc();
                //        }
                //    }
                //} else {
                //    if ($scope.documents[docIndex].SigningStatus === 'Signed') {
                //        $scope.$broadcast('SIGNED_DOC_REMOVED_FROM_SELECTION');
                //    } else {
                //        var elIndx = $scope.selectedDocs.indexOf($scope.documents[docIndex]);
                //        $scope.selectedDocs.splice(elIndx, 1);
                //        if ($scope.documents[docIndex].IsSignable) {
                //            headerService.removeSignableDoc();
                //        }
                //    }
                //}
                //headerService.setSelectedDocIndxs($scope.selectedDocs);
                //$scope.updateHeader();
            };
        }],
        require: 'docPreviewModal',
        link: function($scope, elem, attrs, docPreviewModalCtrl) {
            alert('ok');
        }
    }
});


/**** Helper functions ****/
function DismissPopoverByIx(index) {
    $('[id*=signing-status-for]').each(function (ix) {
        if (index != ix)
            $(this).popover('hide');
    });
}
