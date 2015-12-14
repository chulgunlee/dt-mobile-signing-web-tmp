angular.module('dc.components.doclist.filters', [
    'dc.components.doclist.constants',
]).


filter('signerTypeName', function(SIGNER_TYPE_MAPPING) {
    return function(input) {
        return SIGNER_TYPE_MAPPING[input];
    };
}).

filter('docStatusName', function(DOC_STATUS_MAPPING) {
    return function(input) {
        return DOC_STATUS_MAPPING[input];
    };
});



