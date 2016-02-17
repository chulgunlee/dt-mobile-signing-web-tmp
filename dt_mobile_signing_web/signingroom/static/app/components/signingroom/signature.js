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

.directive('signatureInput', ['$window', 'signaturePadConfig',
  function ($window, signaturePadConfig) {

    return {
      restrict: 'E',
      replace: true,
      require: 'ngModel',
      template: '<div class="signature" ng-style="{height: height + \'px\', width: width + \'px\'}"><canvas height="{{ height }}" width="{{ width }}"></canvas></div>',
      scope: {
        accept: '=',
        clear: '=',
        dataurl: '=',
        height: '@',
        width: '@'
      },

      link: function (scope, element, attrs, ngModelCtrl) {

        // when we finish write a stroke than this callback will be called
        // and ng-model variable will be updated.
        var onEndCallback = function(){
            ngModelCtrl.$setViewValue(scope.signaturePad.toDataURL());
            scope.$apply();
        };

        var canvas = element.find('canvas')[0];

        // we instantiate signature pad here. Also provide callback to be trigered
        // every time stroke drawing is done.
        scope.signaturePad = new signaturePadConfig.signaturePad(canvas, {
            onEnd: onEndCallback
        });

        // render will be called when value is set from outside of the directive
        // we need to clear signaturePad if value is falsy, or draw provided value
        // on a canvas
        ngModelCtrl.$render = function(){
            if (ngModelCtrl.$isEmpty(ngModelCtrl.$viewValue)) {
                scope.signaturePad.clear();
            } else {
                scope.signaturePad.fromDataURL(ngModelCtrl.$viewValue);
            }
        };

        if (!scope.height) scope.height = 220;
        if (!scope.width) scope.width = 568;

      }
    };
  }
]);
