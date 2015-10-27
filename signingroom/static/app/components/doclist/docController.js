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

    $api.getDealJacketInfo(dealJacketId).then(function(response) {
        var data = response.data;

        $scope.packageId = data.package.id;
        $scope.signers = data.signers;

        docService.refresh($scope.packageId);
        docTypeService.init($scope.packageId);
        signerService.init($scope.signers);
    });


});

