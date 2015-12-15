angular.module('dc.components.doclist.docCtrl', [
    'dc.components.doclist.docService',
    'dc.components.doclist.ui',
    'dc.components.doclist.filters',
]).


/**
 * Controller for document list
 */
controller('DocListCtrl', function($scope, $api, docService, signerService, docTypeService, webViewBridge) {

    $scope.data = docService;

    docTypeService.init().then($api.getDealJacketInfo).then(function(response) {
        var data = response.data;

        $scope.signers = data.signers;

        docService.refresh(response.data.docs);
        signerService.init($scope.signers);

        webViewBridge.logEvent('doclist initialized')
    });

    // provide API for native client to reload the doclust
    webViewBridge.registerFunction('reload', function() {
        docService.refresh();
    });

});

