angular.module('starter.controllers', [])

.controller('AppCtrl', function ($scope, $ionicModal, $timeout) {
    // Form data for the login modal
    $scope.loginData = {};

    // Create the login modal that we will use later
    $ionicModal.fromTemplateUrl('templates/login.html', {
        scope: $scope
    }).then(function (modal) {
        $scope.modal = modal;
    });

    // Triggered in the login modal to close it
    $scope.closeLogin = function () {
        $scope.modal.hide();
    };

    // Open the login modal
    $scope.login = function () {
        $scope.modal.show();
    };

    // Perform the login action when the user submits the login form
    $scope.doLogin = function () {
        console.log('Doing login', $scope.loginData);

        // Simulate a login delay. Remove this and replace with your login
        // code if using a login system
        $timeout(function () {
            $scope.closeLogin();
        }, 1000);
    };
})

.controller('PlaylistsCtrl', function ($scope) {
        $scope.playlists = [
            {
                title: 'Deers',
                id: 'deer.json'
        }
  ];
    })
    .controller('PlaylistCtrl', function ($ionicSideMenuDelegate, $scope, $stateParams, JSON, REMEMBER) {

        $ionicSideMenuDelegate.canDragContent(false)
        console.log($stateParams);
        $scope.deer = 0;


        JSON($stateParams.playlistId, function (data) {
            console.log(data);
            $scope.header = data.header;
            $scope.id = $stateParams.playlistId;
            $scope.length = data.records.length;
            $scope.records = data.records;
            getRandomRecord();
        });

        function getRandomRecord() {
            var num = REMEMBER.pick($scope.id, $scope.records.length);
            $scope.thisRecord = $scope.records[num];
            $scope.index = num;
            $scope.forgotTimes = REMEMBER.howManyTimesForgot($scope.id, num);
            $scope.currentLevel = REMEMBER.currentLevel($scope.id);
            $scope.forgot = null;
        }

        function spotADeer() {
            $scope.deer=$scope.deer+1;
        }

        $scope.onSwipeLeft = function () {
            console.log('onSwipeLeft');
            getRandomRecord();
        }
        $scope.onSwipeRight = function () {
            console.log('onSwipeRight');
            getRandomRecord();
            spotADeer();
        }


    });