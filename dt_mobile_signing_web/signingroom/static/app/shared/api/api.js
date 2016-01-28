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

        var getUrl = function(uri) {
            return apiUri + pathBase + uri;
        };
        
        var request = function(method, uri, data) {
            
            loadingIndicatorService.show('Loading data...');

            var deferred = $q.defer();

            $http({
                method: method.toUpperCase(),
                url: getUrl(uri),
                data: data,
                headers: {
                    'User-Code': $rootScope.userCode,
                    'Dealer-Code': $rootScope.dealerCode,
                    'Tenant-Code': $rootScope.tenantCode,
                    'Fusion-Prod-Code': $rootScope.fusionProdCode,
                },
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

            // expose url generator, mainly for webviewbridge to provide api url to native
            url: function(uri) {
                return getUrl(uri);
            },

            // return absolute url with scheme and host name
            absUrl: function(uri) {
                return location.protocol + '//' + location.host + this.url(uri);
            },

            getDealJacketInfo: function() {
                return request('GET', '/');
            },

            getDocList: function() {
                return request('GET', '/docs/');
            },

            submitDocs: function(docIds) {
                return request('POST', '/submit/', { docIds: docIds });
            },

            getDocTypes: function() {
                return request('GET', '/doctypes/');
            },

            updateDoc: function(docId, data) {
                return request('PUT', '/docs/' + docId + '/', data);
            },

            getDocPreview: function(docId, version) {
                return request('GET', '/docs/' + docId + '/?version=' + version);
            },

            deleteDoc: function(docId) {
                return request('DELETE', '/docs/' + docId + '/');
            },

        };

        return service;
    }
});
