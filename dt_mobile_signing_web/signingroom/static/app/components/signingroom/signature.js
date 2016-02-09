/*
 * https://github.com/legalthings/signature-pad-angular
 * Copyright (c) 2015 ; Licensed MIT
 */

angular.module('dc.components.signingroom.signature', [])

/**
 * Config provider for signature pad directive to be able to configure
 * signaturePad instance if it's not picked up automatically
* */

.provider('signaturePadConfig', function () {

    this.setSignaturePad = function (signaturePad) {
      this.signaturePad = signaturePad;
    };

    this.$get = function () {
      return this;
    };
  })

/**
 * Reusable and configurable directive to be able to render and manipulate signature pad.
 * Provides function bindings for cleaning and accepting drawings from signature pad.
* */

.directive('signaturePad', ['$window', 'signaturePadConfig',
  function ($window, signaturePadConfig) {

    return {
      restrict: 'EA',
      replace: true,
      template: '<div class="signature" ng-style="{height: height + \'px\', width: width + \'px\'}"><canvas height="{{ height }}" width="{{ width }}"></canvas></div>',
      scope: {
        accept: '=',
        clear: '=',
        dataurl: '=',
        height: '@',
        width: '@'
      },
      controller: ['$scope', function ($scope) {
          $scope.accept = function () {
            var signature = {};

            if (!$scope.signaturePad.isEmpty()) {
              signature.dataUrl = $scope.signaturePad.toDataURL();
              signature.isEmpty = false;
            } else {
              signature.dataUrl = 'data:image/gif;base64,R0lGODlhAQABAAAAACwAAAAAAQABAAA=';
              signature.isEmpty = true;
            }

            return signature;
          };

          $scope.clear = function () {
            $scope.signaturePad.clear();
          };
        }
      ],

      link: function (scope, element) {
        var canvas = element.find('canvas')[0];
        scope.signaturePad = new signaturePadConfig.signaturePad(canvas);

        if (!scope.height) scope.height = 220;
        if (!scope.width) scope.width = 568;

        if (scope.signature && !scope.signature.$isEmpty && scope.signature.dataUrl) {
          scope.signaturePad.fromDataURL(scope.signature.dataUrl);
        }

        scope.onResize = function() {
          var canvas = element.find('canvas')[0];
          var ratio =  Math.max($window.devicePixelRatio || 1, 1);
          canvas.width = canvas.offsetWidth * ratio;
          canvas.height = canvas.offsetHeight * ratio;
          canvas.getContext("2d").scale(ratio, ratio);
        };

        scope.onResize();

        angular.element($window).bind('resize', function() {
            scope.onResize();
        });
      }
    };
  }
]);
