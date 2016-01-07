angular.module('dc.components.signingroom.SigningRoomCtrl', [
    'ngRoute',
    'dc.components.signingroom.ui',
    'dc.shared.api.api',
    'dc.shared.api.api_mock'
]).

/**
 * Controller for signing room
 */

controller('SigningRoomCtrl', function($scope, $routeParams, $api_mock) {

        // Here we are going to keep the state of currently loaded document
        // for now current document should have following fields: title, pages, id
        $scope.current_document = {};

        // we are going to receive this information from document list application
        // for now we just hard code it here, till the time we use real data

        var sig_context = {
            'master_index': 12345,
            'doc_ids': [1,2,3,4],
            'signers': ['signer1', 'signer2']
        };

        // here we request document list. We already have documents ids, however
        // we have no information about document titles so we are going to retrieve
        // a list of documents in following request:

        $api_mock.getDocuments(sig_context['master_index'], sig_context['doc_ids'])
            .then(function(documents){
                $scope.documents = documents;
                $scope.current_document['title'] = documents[0]['title'];
            });

        // we retrieve first document to display by default
        $api_mock.getDocumentImages(sig_context['doc_ids'][0])
            .then(function(document_pages){
                $scope.current_document['pages'] = document_pages;
        });

        $scope.checked = true;

        $scope.toggle = function(){
            $scope.checked = !$scope.checked
        }

});
