/*global angular, console, require */
var templates = {
    'display_document.html': require('./display_document.html'),
    'sidebar.html': require('./sidebar.html'),
};

angular.module('dc.components.signingroom.ui', [])

/**
 * Directive to retrieve and display documents in to sidenav.
 */
    .directive('signingroomSideBar', function ($apiMock, documentsCache) {
        return {
            restrict: 'E',
            templateUrl: templates['sidebar.html'],
            scope: {
                docIds: '=',
                masterIndexId: '='
            },
            link: function (scope, element, attrs) {
                $apiMock.getDocuments(scope.masterIndexId, scope.docIds)
                    .then(function (documents) {
                        scope.documents = documents;
                        // lets also put documents retrieved in to a cache
                        for (var i in documents) {
                            documentsCache.put(documents[i].document_id, documents[i])
                        }
                    });
            }
        };
    })

/**
 * Directive to detect when scroll reaches bottom.
 */
    .directive('srScrollEnd', function ($parse) {
        return {
            restrict: 'A',
            compile: function ($element, attrs) {
                var fn = $parse(attrs.srScrollEnd, /* interceptorFn */  null, /* expensiveChecks */ true);
                return function ngEventHandler (scope, element) {
                    element.on('scroll', function (event) {
                        var scH = element.prop('scrollHeight');
                        var scT = element.prop('scrollTop');
                        var offH = element.prop('offsetHeight');
                        if (scH == scT + offH) {
                            var callback = function() {
                                fn(scope, {$event:event});
                            };
                            scope.$apply(callback);
                        }
                    })
                };
            }
        };
    });



