/**
 * The server API wrapper.
 */

angular.module('dc.shared.api.api', [
    'dc.shared.loading.loadingDirective',
    'dc.shared.loading.loadingService',
]).



/**
 * server API wrapper
 */
factory('$api', function($http, $q, loadingIndicatorService) {
    
    var request = function(method, uri, data) {
        
        loadingIndicatorService.show('Loading data...');

        var deferred = $q.defer();

        $http({
            method: method.toUpperCase(),
            url: apiUri + uri,
            data: data,
        }).then(function(response) {

            loadingIndicatorService.hide();
            deferred.resolve(response);

        }, function(response) {

            loadingIndicatorService.hide();
            deferred.reject(response);
        });

        return deferred.promise;
    };

    var service = {

        getDealJacketInfo: function(dealJacketId, dealId) {
            return request('GET', 'dealjackets/' + dealJacketId + '/deals/' + dealId + '/');
        },

        getDocList: function(packageId) {
            return request('GET', 'packages/' + packageId);
        },

        submitDocs: function(packageId, docIds) {
            return request('POST', 'packages/' + packageId + '/submit/', { docIds: docIds });
        },

        getDocTypes: function(packageId) {
            return request('GET', 'packages/' + packageId + '/doctypes/');
        },

        updateDoc: function(packageId, docId, data) {
            return request('PUT', 'packages/' + packageId + '/docs/' + docId, data);
        },

        getDocPreview: function(packageId, docId) {
            return request('GET', 'packages/' + packageId + '/docs/' + docId);
        },

    };

    return service;
});
