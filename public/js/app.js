'use strict';

// Declare app level module which depends on filters, and services

angular.module('myApp', [
  'myApp.controllers',
  'firebase'
])
.config(function ($routeProvider, $locationProvider) {
  $routeProvider.
    when('/home', {
      templateUrl: 'partials/home',
      controller: 'HomeCtrl'
    }).
    when('/points', {
      templateUrl: 'partials/points',
      controller: 'PointsCtrl',
      authRequired: true
    }).
    when('/admin', {
      templateUrl: 'partials/admin',
      controller: 'AdminCtrl',
      authRequired: true
    }).
    otherwise({
      redirectTo: '/home'
    });

  $locationProvider.html5Mode(true);
})
.constant('FIREBASE_URL', 'https://my-points.firebaseio.com')
.run(['$rootScope', 'angularFireAuth', 'FIREBASE_URL', function($rootScope, angularFireAuth, FIREBASE_URL) {
  angularFireAuth.initialize(new Firebase(FIREBASE_URL), {scope: $rootScope, name: 'user'});
}]);
