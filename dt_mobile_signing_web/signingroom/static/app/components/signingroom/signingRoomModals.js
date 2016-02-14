var signature_pad_dialog = require('./signature_pad_dialog.html');
var confirm_signer_dialog = require('./confirm_signer_dialog.html');

angular.module('dc.components.signingroom.signingRoomModals', []).

/**
 * Signing Room Dialogs Service. Service
 * provides modal components to the application.
 */

provider('signingRoomModals', function() {

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

            signaturePad: function (signer) {

               if (!signer) {
                   throw "You must provide signer instance as a first parameter" +
                         "in show(signer) function for person that is going to " +
                         "provide signature and initials"
               }

               return $mdDialog.show({
                  disableParentScroll: false,
                  clickOutsideToClose: false,
                  templateUrl: signature_pad_dialog,
                  controller: function ($scope, $mdDialog) {

                    $scope.signer =  signer;

                    $scope.closeDialog = function() {
                      $mdDialog.hide();
                    };

                    $scope.applyAction = function(){
                      if (!$scope.signature){
                          $scope.error = 'Please draw your signature';
                      } else if ($scope.signature.length < 5000) {
                          $scope.signature = null;
                          $scope.error = "The Signature entered was too short." +
                              " Please try again with a longer signature.";
                      } else if(!$scope.initials) {
                          $scope.error = "Please draw your initials";
                      } else if ($scope.initials.length < 3000) {
                          $scope.initials = null;
                          $scope.error = "The Initials entered was too short." +
                              " Please try again with a longer initials.";
                      } else {
                          service.signatureData = $scope.signature;
                          service.initialsData = $scope.initials;
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
            getSigData: function(){
                 return {
                     'signature': service.signatureData,
                     'initials': service.initialsData
                 }
            },

            /**
             * Call this method to display and receive confirmation about
             * signer that is going to sign now a document.
             * Displays modal window with one button on it "Sign"
             */
            confirmSigner: function(signer){
               return $mdDialog.show({
                  disableParentScroll: false,
                  clickOutsideToClose: false,
                  templateUrl: confirm_signer_dialog,
                  controller: function ($scope, $mdDialog) {
                      $scope.signer = signer;
                      $scope.closeDialog = function() {
                          $mdDialog.hide();
                      };
                  }
               })
            }
        };

        return service;
    }

});
