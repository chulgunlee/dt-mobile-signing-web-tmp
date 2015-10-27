angular.module('dc.components.doclist.docCtrl', [
    'dc.components.doclist.docService',
    'dc.components.doclist.ui',
    'dc.components.doclist.filters',
]).


/**
 * Controller for document list
 */
controller('DocListCtrl', function($scope, $api, docService, signerService, docTypeService) {

    $scope.data = docService;

    // `dealJacketId`, `dealId` are global variables from the django template
    $api.getDealJacketInfo(dealJacketId, dealId).then(function(response) {
        var data = response.data;

        $scope.packageId = data.package.id;
        $scope.signers = data.signers;

        docService.refresh($scope.packageId, response.data.docs);
        docTypeService.init($scope.packageId);
        signerService.init($scope.signers);
    });


});

