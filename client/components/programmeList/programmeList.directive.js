'use strict';

angular.module('uiAtimeplanApp')
  .directive('programmeList', function () {
    return {
      template: '<div></div>',
      restrict: 'EA',
      link: function (scope, element, attrs) {
        element.text('this is the programmeList directive');
      }
    };
  });