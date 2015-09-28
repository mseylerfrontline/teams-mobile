angular.module('starter.directives', [])

.directive("zipcode", function() {
   return {
      require: "ngModel",
      link: function(scope, element, attributes, ngModel) {

         ngModel.$validators.zipcode = function(modelValue) {

            return modelValue.length === 5 && isNaN(modelValue) === false
         }
      }
   };
})

.directive("iframeOnload", function () {
   return {
      scope: {
         callBack: '&iframeOnload'
      },
      link: function(scope, element, attrs) {
         element.on('load', function()
         {
            return scope.callBack();
         })
      }
   }
});

String.prototype.capitalizeFirstLetter = function() {
   return this.charAt(0).toUpperCase() + this.slice(1);
}
