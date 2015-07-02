var defaults = {
    'docListHeader': 'Contract Documents',
    'apiUri': apiUri,
    ajaxTimeout: ajaxTimeout,
    'http_config': {
        headers: {
            'Authorization': 'Basic Y2FkbmFsbDpkdGRldnVzcjg4',
            'Cookie': 'SMCHALLENGE=YES'
        }
    }
};

/* Controllers declarations */
var myApp = angular.module('docsListApp', [])
    .directive('docsRepeatCompleted', onDocsRepeatCompleted)
    .service('headerService', ['$rootScope', HeaderSvc])
    .controller('HeaderCtrlr', ['$scope', 'headerService', HeaderCtrlr])
    .controller('DocsListCtrlr', ['$scope', '$http', 'headerService', DocsListCtrlr]);

/* Header Service */
function HeaderSvc($rootScope) {
    var headerText = defaults.docListHeader;
    var documentsSelected = 0;
    var signableDocsCount = 0;
    var selectedDocIndxs = [];
    //var signedDocsFoundInSelectionCount = 0;

    var setHeaderText = function (text) {
        headerText = text;
        $rootScope.$broadcast('HEADER_TEXT_UPDATED', headerText);
    };

    var getHeaderText = function () {
        return documentsSelected > 0 ? headerText : defaults.docListHeader;
    };

    //var fireSignedDocsFoundInSelectionCountChanged = function () {
    //    $rootScope.$broadcast('SIGNED_DOCS_IN_SELECTION_COUNT_CHANGED');
    //};

    //var getSignedDocsFoundInSelection = function () {
    //    return signedDocsFoundInSelectionCount;
    //};

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
        //signedDocAddedToSelection: function () {
        //    signedDocsFoundInSelectionCount++;
        //    fireSignedDocsFoundInSelectionCountChanged();
        //},
        //signedDocRemovedFromSelection: function () {
        //    signedDocsFoundInSelectionCount--;
        //    fireSignedDocsFoundInSelectionCountChanged();
        //},
        //getSignedDocsFoundInSelection: getSignedDocsFoundInSelection
    };
}

/* Header Controller */
function HeaderCtrlr($scope, headerService) {
    $scope.headerText = headerService.getHeaderText();
    //$scope.isDebug = dbgFlag;
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
    //$scope.$on('SIGNED_DOCS_IN_SELECTION_COUNT_CHANGED', function () {
    //    $scope.isSignedDocsInSelectionFound = headerService.getSignedDocsFoundInSelection() > 0;
    //});
    $scope.onSelectSigners = function () {

        //if ($scope.isSignedDocsInSelectionFound) {
        //    $('#doc-mix-warning').on('hidden.bs.modal', function (e) {
        //        $('#signers-container').modal('show');
        //    });
        //    $('#doc-mix-warning').modal('show');
        //}
        //else
        $('#signers-container').modal('show');
    };
    $scope.onPrintClicked = function() {
        var indxs = $scope.selectedDocIndxs.map(function (doc) {
            return doc.DocIndexId;
        });
        var printoutApiUrl = defaults.apiUri + 'printouts/' + indxs.join(';') + '?docMstrIndxId=' + masterIndxId;
        //alert('Click OK to call WebviewBridge now. (url: '+printoutApiUrl+')');
        WebViewBridge.call('print', { 'url': printoutApiUrl });
    };
}


/* DocsList Controller */
function DocsListCtrlr($scope, $http, headerService) {
    var apiUri = defaults.apiUri + 'contractdetails/' + masterIndxId;
    var setPreviewOverlay = function (imgUrls, docType) {
        $('#doc-preview-overlay .modal-body img').fadeOut(function () {
            $('#doc-preview-overlay .modal-header').fadeIn(function () {
                $('#doc-preview-overlay .modal-header h4').text(docType);
                $('#doc-preview-overlay .modal-header h4').fadeIn();
            });
            $('#doc-preview-overlay .modal-body h3').fadeOut(function () {
                //if (mode == 'window') {
                //    $('#docPreviewOverlay .modal-body h3').html('Click <a href="' + pdfUrl + '" target="_blank">here</a> to view <strong>' + docType + '</strong><h5><em>New window will be open</em></h5>');
                //    $('#docPreviewOverlay .modal-body h3 a').bind('click', function () {
                //        $('#docPreviewOverlay').modal('hide');
                //    });
                //} else {
                $('#doc-preview-overlay').addClass('preview-loaded');
                $('#doc-preview-overlay button.close').show();
                //$('#docPreviewOverlay .modal-body h3').html('<iframe style="width:100%;" scrolling="no" src="' + pdfUrl + '" onload="resizeIt(this, ' + pagesCount + ');" />');
                //var height = resizeIt(null, pagesCount);
                var imgsHtml = '';
                var i;
                for (i in imgUrls) {
                    imgsHtml += '<img src="' + imgUrls[i] + '" />';
                }
                //$('#docPreviewOverlay .modal-body h3').html('<embed style="width:100%; height:' + height + ';margin-left:25px;" src="' + pdfUrl + '" type="application/pdf"/>');
                $('#doc-preview-overlay .modal-body h3').html(imgsHtml);
                //;}
                $('#doc-preview-overlay .modal-body h3').fadeIn();
            });
        });
    };
    var initPreviewOverlay = function (docType) {
        $('#doc-preview-overlay').removeClass('preview-loaded');
        $('#doc-preview-overlay button.close').hide();
        $('#doc-preview-overlay .modal-header h4').text("");
        $('#doc-preview-overlay .modal-header').hide();
        $('#doc-preview-overlay .modal-body').html('<img src="assets/images/loading-tr.gif" /><h3>Downloading <strong>' + docType + '</strong> preview...</h3>');
    };
    $http.get(apiUri, {timeout: defaults.ajaxTimeout}).success(function (data, status) {
        if (status == 302) {
            WebViewBridge.call('exitSigningRoom', { status: 'SessionTimeout' });
            return;
        }
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
    }).error(function (data, status, headers, config) {
        $scope.apiCallFailed = true;
    });
    $scope.initSelectedSigners = function () {
        var dx, sx;
        $scope.selectedSigners = [];
        for (dx in $scope.selectedDocs) {
            if ($scope.selectedDocs[dx].SigningStatus == 'Signed')
                continue;
            for (sx in $scope.selectedDocs[dx].Signers) {
                if ($scope.selectedDocs[dx].Signers[sx].SignStatus == 'Signed')
                    continue;
                //if ($scope.selectedSigners.indexOf($scope.selectedDocs[dx].Signers[sx]) < 0)
                //    $scope.selectedSigners.push($scope.selectedDocs[dx].Signers[sx]);
                var seen = false;
                $.each($scope.selectedSigners, function (i, el) {
                    if (el.Type == $scope.selectedDocs[dx].Signers[sx].Type) {
                        seen = true;
                        //return;
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
        //debugger;
    };
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
        //PageMethods.ProcessRequest(JSON.stringify($scope.selectedDocs), function(result) {});
    };
    $scope.isDocRemovalReqd = function () {
        var retVal = false;
        $.each($scope.selectedDocs, function (i, selDoc) {
            if (selDoc.IsSignable && !selDoc.anyReqdSignerSelected)
                retVal = true;
        });
        return retVal;
    };
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
    $scope.onFormSubmit = function(docs, signers) {
        var sessionObj = { 'documents': docs, 'signers': signers };
        //var sessionData = JSON.stringify(sessionObj).toString();
        $http.post(defaults.apiUri + 'doclist/session', sessionObj, {timeout: defaults.ajaxTimeout}).success(function (data, status, headers, config) {
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
//		alert('Will be calling `lock` now...');
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
    $scope.onDocSelected = function (docIndex) {
        //alert(docIndex);
        //if (typeof docIndex !== 'undefined')
        $scope.documents[docIndex].IsSelected = !$scope.documents[docIndex].IsSelected;
        //$('#doc-' + docIndex + '-cbx').prop('checked', $scope.documents[docIndex].IsSelected);
        if ($scope.documents[docIndex].IsSelected) {
            if ($scope.documents[docIndex].SigningStatus === 'Signed')
                //headerService.signedDocAddedToSelection();
                $scope.$broadcast('SIGNED_DOC_ADDED_TO_SELECTION');
            else {
                $scope.selectedDocs.push($scope.documents[docIndex]);
                if ($scope.documents[docIndex].IsSignable)
                    headerService.addSignableDoc();
            }
        } else {
            if ($scope.documents[docIndex].SigningStatus === 'Signed')
                //headerService.signedDocRemovedFromSelection();
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
    $scope.$on('SIGNED_DOC_ADDED_TO_SELECTION', function () {
        $scope.signedDocsInSelectionCount++;
    });
    $scope.$on('SIGNED_DOC_REMOVED_FROM_SELECTION', function () {
        $scope.signedDocsInSelectionCount--;
    });
    $scope.isSignedDocFoundInSelection = function () {
        return $scope.signedDocsInSelectionCount > 0;
    };
    $scope.onRibbonClicked = function (index) {
        DismissPopoverByIx(index);
    };
    $scope.onDocBodyClicked = function (docIndexId, docType) {
        initPreviewOverlay(docType);
        apiUri = defaults['apiUri'] + 'docpreviews/' + docIndexId + '?docMstrIndxId=' + masterIndxId;
        //var pdfUrl = 'data:application/pdf;base64,';
        $('#doc-preview-overlay').addClass('doc-preview-modal-' + docIndexId);
        $('#doc-preview-overlay').modal('show');
        if ($scope.docsPreview[docIndexId] == null) {
            $http.get(apiUri, {timeout: defaults.ajaxTimeout}).success(function (data, status) {
                if (status == 302) {
                    WebViewBridge.call('exitSigningRoom', { status: 'SessionTimeout' });
                    return;
                }
                var key = Object.keys(data)[0];
                //alert(data[key].length);
                //$scope.docsPreview[key] = data[key].Pdf;
                $scope.docsPreview[key] = data[key];
                //var pdfUrl = $scope.docsPreview[key];
                setPreviewOverlay($scope.docsPreview[key], docType);
            }).error(function () {
                //alert('The document preview you requested cannot be retrived at this time! Please, try again later.');
                $('#remote-call-failed-msg-box .modal-body').html('The document preview you requested is not available at this time. Please, try again later.');
                $('#remote-call-failed-msg-box').modal('show');
                $('#doc-preview-overlay').modal('hide');
            });
        } else {
            setPreviewOverlay($scope.docsPreview[docIndexId], docType);
        }
    };
    $scope.dataLoaded = false;
    $scope.apiCallFailed = false;
    $scope.docsPreview = {};
    $scope.selectedDocs = [];
    $scope.selectedSigners = [];
    $scope.signedDocsInSelectionCount = 0;
}
/**** Directives *******/
function onDocsRepeatCompleted() {
    return function (scope, element, attrs) {
        //debugger;
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
/**** Helper functions ****/
function DismissPopoverByIx(index) {
    $('[id*=signing-status-for]').each(function (ix) {
        if (index != ix)
            $(this).popover('hide');
    });
}


