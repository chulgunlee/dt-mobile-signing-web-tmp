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

    $api.getDealJacketInfo().then(function(response) {
        var data = response.data;

        $scope.signers = data.signers;

        docService.refresh(response.data.docs);
        docTypeService.init();
        signerService.init($scope.signers);
    });

    // provide API for native client to reload the doclust
    webViewBridge.registerFunction('reload', function() {
        docService.refresh();
    });

});

