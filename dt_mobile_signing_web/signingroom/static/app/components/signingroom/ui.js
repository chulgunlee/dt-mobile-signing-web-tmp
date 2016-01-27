var templates = {
    'display_document.html': require('./display_document.html'),
    'sidebar.html': require('./sidebar.html'),
    'header.html': require('./header.html'),
    'control_panel.html': require('./control_panel.html'),
    'signer_modal.html': require('./signer_modal.html'),
    'sig_cap_modal.html': require('./sig_cap_modal.html')
};

angular.module('dc.components.signingroom.ui', [])

.directive('signingroomHeader', function() {
  return {
    restrict: 'E',
    templateUrl: templates['header.html']
  };
})

.directive('signingroomSideBar', function($apiMock) {
  return {
    restrict: 'E',
    templateUrl: templates['sidebar.html'],
    scope: {
        docIds: '=',
        masterIndexId: '='
    },

    link: function(scope, element, attrs){

        $apiMock.getDocuments(scope.masterIndexId, scope.docIds)
            .then(function(documents){
                scope.documents = documents;
                console.log(documents);
                // scope.currentDocument['title'] = documents[0]['title'];
            });
    }

  };
})

.directive('signingroomControlPanel', function() {
  return {
    restrict: 'E',
    templateUrl: templates['control_panel.html']
  };
})

.directive('signingroomDisplayDocument', function() {
  return {
    restrict: 'E',
    templateUrl: templates['display_document.html']
  };
});



