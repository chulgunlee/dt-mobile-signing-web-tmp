/**
 * The server API wrapper.
 */

angular.module('dc.shared.api.api', [
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

        getDocList: function(packageId) {
            return request('GET', 'packages/' + packageId);
        },

        submitDocs: function(packageId, docIds) {
            return request('GET', 'packages/' + packageId + '/submit/', { docIds: docIds });
        },

        getDocTypes: function() {
            return request('GET', 'doctypes/');
        },

        updateDoc: function(docId, data) {
            return request('PUT', 'docs/' + docId, data);
        },

        getDocPreview: function(docId) {
            return request('GET', 'docs/' + docId + '/preview');
        },

    };

    return service;
});
