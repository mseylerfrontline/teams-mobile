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
});
