var signature_pad_dialog = require('./signature_pad_dialog.html');

angular.module('dc.components.signingroom.signaturePadDialog', []).

/**
 * Signature Pad Dialog Service. Service is responsible for
 * collecting and validating signatures and initials.
 */

provider('signaturePadDialog', function() {

    this.$get = function($mdDialog) {

        var service = {

            signatureData: null,
            initialsData: null,

            /**
             * Call this method to display signing pad dialog.
             * Be advised to call this method you have to provide
             * object as a first argument that contains a name of a
             * signer like so:
             *          signaturePadDialog.show({'name': 'Food Bar'})
             */

            show: function (signer) {

               if (!signer) {
                   throw "You must provide signer instance as a first parameter" +
                         "in show(signer) function for person that is going to " +
                         "provide signature and initials"
               }

               return $mdDialog.show({
                  disableParentScroll: false,
                  clickOutsideToClose: true,
                  templateUrl: signature_pad_dialog,
                  controller: function DialogController($scope, $mdDialog) {

                    $scope.signer =  signer;

                    $scope.closeDialog = function() {
                      $mdDialog.hide();
                    };

                    $scope.applyAction = function(){
                      var signature = $scope.acceptSignature();
                      var initials = $scope.acceptInitials();
                      if (signature.isEmpty){
                          $scope.error = 'Please draw your signature';
                      } else if (signature.dataUrl.length < 5000) {
                          $scope.clearSignature();
                          $scope.error = "The Signature entered was too short." +
                              " Please try again with a longer signature.";
                      } else if(initials.isEmpty) {
                          $scope.error = "Please draw your initials";
                      } else if (initials.dataUrl.length < 3000) {
                          $scope.clearInitials();
                          $scope.error = "The Initials entered was too short." +
                              " Please try again with a longer initials.";
                      } else {
                          service.signatureData = signature.dataUrl;
                          service.initialsData = initials.dataUrl;
                          $scope.closeDialog();
                      }
                    }
                  }
               });
            },

            /**
             * Call this method to retrieve signature and initials data as object that
             * contain base64 encoded strings as following attributes: signature and initials
             */
            getData: function(){
                 return {
                     'signature': service.signatureData,
                     'initials': service.initialsData
                 }

            }


        };

        return service;
    }

});
