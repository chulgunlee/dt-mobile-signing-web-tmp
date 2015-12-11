var signModule = angular.module('signModule',[]);





/* storeController - Controller for T shirts display and function to add to cart*/
signModule.controller('doclistController', function($scope)
{
			$scope.doclist = [{
				"Doc_master_index_id" : 13647,
				"Doc_index_id" : 22423,
				"SigType" : "BUYER",
				"Signatre" : "sign-null",
				"Initial" : "initial-null",
				"BlcokSigned" : false,
				"SigBlock" : [{
					"SigName" : "BUYER_NOTICE",
					"SortOrder" : 0,
					"Collected" : false,
					"IsInitial" : false,
					"SigneeName" : "MARSHALL RAMIREZ",
					"SigStyle" : "position:absolute;left:125px;top:5012px;width:138px;height:48pxopacity:0.4;filter:alpha(opacity=80)",
					"SigArrowStyle" : "position:absolute;left:125px;top:5042px;width:138px;height:48pxopacity:0.4;filter:alpha(opacity=80)"
				}, {
					"SigName" : "BUYER_ACK",
					"SortOrder" : 0,
					"Collected" : false,
					"IsInitial" : false,
					"SigneeName" : "MARSHALL RAMIREZ",
					"SigStyle" : "position:absolute;left:495px;top:4843px;width:138px;height:48pxopacity:0.4;filter:alpha(opacity=80)",
					"SigArrowStyle" : "position:absolute;left:495px;top:4873px;width:138px;height:48pxopacity:0.4;filter:alpha(opacity=80)"
				}],
				"TextFieldBlock" : []
			}]; 
	
 		$scope.textFieldBlock  = $scope.doclist.TextFieldBlock;

     $scope.addToCart = function(_index,_imageurl,_sizes,_price)
    {
     $("#okIcon"+_index).removeClass('ng-hide');           
     Purchased.purchased_ts.push({index:_index,imageurl:_imageurl,sizes:_sizes,price:_price});
    };

  
});
