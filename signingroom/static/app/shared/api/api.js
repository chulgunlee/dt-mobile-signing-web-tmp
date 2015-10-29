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
provider('$api', function() {
    
    var apiUri = '/api/';

    this.setApiUri = function(value) {
        apiUri = value;
    }

    this.$get = function($http, $rootScope, $q, loadingIndicatorService) {
    
        // the path base for assemble the api uri
        var pathBase = 'dealjackets/' + $rootScope.dealJacketId + '/deals/' + $rootScope.dealId;
        
        var request = function(method, uri, data) {
            
            loadingIndicatorService.show('Loading data...');

            var deferred = $q.defer();

            $http({
                method: method.toUpperCase(),
                url: apiUri + pathBase + uri,
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

            getDealJacketInfo: function() {
                return request('GET', '/');
            },

            getDocList: function() {
                return request('GET', '/docs/');
            },

            submitDocs: function(packageId, docIds) {
                return request('POST', '/submit/', { docIds: docIds });
            },

            getDocTypes: function(packageId) {
                return request('GET', '/doctypes/');
            },

            updateDoc: function(packageId, docId, data) {
                return request('PUT', '/docs/' + docId, data);
            },

            getDocPreview: function(packageId, docId) {
                return request('GET', '/docs/' + docId);
            },

        };

        return service;
    }
});
