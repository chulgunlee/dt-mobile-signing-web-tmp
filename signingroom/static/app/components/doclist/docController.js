angular.module('dc.components.doclist.docCtrl', [
    'dc.components.doclist.docService',
    'dc.components.doclist.ui',
    'dc.components.doclist.filters',
]).


/**
 * Controller for document list
 */
controller('DocListCtrl', function($scope, docService) {

    $scope.data = docService;

    docService.refresh(packageId);

});

