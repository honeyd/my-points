'use strict';

/* Controllers */

angular.module('myApp.controllers', []).
  controller('AppCtrl', function ($scope, angularFireAuth, $location) {

    $scope.login = function() {
      angularFireAuth.login("facebook");
      $location.path('/points');
    };

    $scope.logout = function() {
      angularFireAuth.logout();
      $location.path('/home');
    };

  }).

  controller('HomeCtrl', function ($scope) {

  }).

  controller('PointsCtrl', function ($scope, $rootScope, angularFire, angularFireCollection, FIREBASE_URL) {
    $scope.date = new Date();
    $scope.date.setHours(0,0,0,0);
    $scope.secondsSinceEpochStart = $scope.date / 1000;
    $scope.secondsSinceEpochEnd = $scope.secondsSinceEpochStart + 86399;
    $scope.history = [];
    $scope.points = [];
    $scope.possiblePoints = 0;
    $scope.totalPoints = 0;

    var historyRef = '';
    var pointsRef = '';

    // watch the user for the logged in event, essentially
    $rootScope.$watch('user', function(newVal, oldVal) {
      if (newVal) {

        // set up Firebase refs
        historyRef = new Firebase(FIREBASE_URL + '/history/' + newVal.id);
        pointsRef = new Firebase(FIREBASE_URL + '/points/' + newVal.id);

        $scope.history = angularFireCollection(historyRef.startAt($scope.secondsSinceEpochStart).endAt($scope.secondsSinceEpochEnd));
        $scope.points = angularFireCollection(pointsRef);

      }
    });

    $scope.$watch('history.length', function(newVal, oldVal) {
      $scope.totalPoints = 0;
      $scope.history.forEach(function(i) {
        $scope.totalPoints += parseInt(i.points);
      });
    });

    $scope.$watch('points.length', function(newVal, oldVal) {
      $scope.possiblePoints = 0;
      $scope.points.forEach(function(i) {
        $scope.possiblePoints += parseInt(i.points);
      });
    });

    $scope.progress = function() {
      if ($scope.possiblePoints == 0 || $scope.totalPoints == 0) {
        return 0;
      }
      return $scope.totalPoints / $scope.possiblePoints * 100;
    };

    $scope.goBack = function() {
      $scope.date.setDate($scope.date.getDate()-1);
      $scope.secondsSinceEpochStart -= 86400;
      $scope.secondsSinceEpochEnd -= 86400;
      $scope.history = angularFireCollection(historyRef.startAt($scope.secondsSinceEpochStart).endAt($scope.secondsSinceEpochEnd));
    };

    $scope.goForward = function() {
      $scope.date.setDate($scope.date.getDate()+1);
      $scope.secondsSinceEpochStart += 86400;
      $scope.secondsSinceEpochEnd += 86400;
      $scope.history = angularFireCollection(historyRef.startAt($scope.secondsSinceEpochStart).endAt($scope.secondsSinceEpochEnd));
    };

    $scope.isChecked = function(point) {
      var isChecked = false;
      $scope.history.forEach(function(snap) {
        if (snap.pointId == point.$id) {
          isChecked = true;
        }
      });
      return isChecked;
    };

    $scope.checkit = function(point) {

      var removed = false;

      $scope.history.forEach(function(snap) {
        if (snap.pointId == point.$id) {
          $scope.history.remove(snap);
          removed = true;
        }
      });

      if (!removed) {
        var ref = $scope.history.add({pointId: point.$id, points: point.points, secondsSinceEpoch: $scope.secondsSinceEpochStart});
        ref.setPriority($scope.secondsSinceEpochStart);
      }

    };
  }).

  controller('AdminCtrl', function ($scope, angularFire, $rootScope, FIREBASE_URL) {

    angular.extend($scope, {
      points: [],
      new: {
        description: '',
        points: 0
      },
      editting: false,
      edit: {
        $$hashKey: '',
        description: '',
        points: 0
      },
      editIndex: -1
    });

    $rootScope.$watch('user', function(newVal, oldVal) {
      if (newVal) {
        var ref = new Firebase(FIREBASE_URL + '/points/' + newVal.id);
        angularFire(ref, $scope, 'points');
      }
    });

    $scope.create = function() {
      $scope.points.push($scope.new);
      $scope.new = {};
    };

    $scope.delete = function(index) {
      $scope.points.splice(index, 1);
    };

  });
