'use strict';

angular.module('uiATimeplanApp')
  .controller('MainCtrl', function ($scope, $http) {
    $scope.programmes = [];

    $http.get('/api/programmes').success(function(programmes) {
      $scope.programmes = programmes;
    });

  });
