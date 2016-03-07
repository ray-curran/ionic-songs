angular.module('songhop.controllers', ['ionic', 'songhop.services'])


/*
Controller for the discover page
*/
.controller('DiscoverCtrl', function($scope, $ionicLoading, $timeout, User, Recommendations) {


  var showLoading = function() {
    $ionicLoading.show({
      template: '<i class="ion-loading-c"></i>',
      noBackdrop: true
    });
  }

  var hideLoading = function() {
    $ionicLoading.hide();
  }

  showLoading();

  Recommendations.init()
    .then(function() {
      $scope.currentSong = Recommendations.queue[0];
      Recommendations.playCurrentSong();
      $scope.queue = Recommendations.queue;
      })
    .then(function(){
      hideLoading();
      $scope.currentSong.loaded = true;
    })

  $scope.sendFeedback = function(bool, index) {
    if (bool) User.addSongToFavorites(Recommendations.queue[index]);

    Recommendations.queue[index].rated = bool;
    Recommendations.queue[index].hide = true;

    Recommendations.nextSong();
    $scope.queue = Recommendations.queue;

    $timeout(function() {

      $scope.currentSong = Recommendations.queue[0];
      $scope.currentSong.loaded = false;
    }, 250);

    Recommendations.playCurrentSong().then(function() {
      $scope.currentSong.loaded = true;
    });
  };

  $scope.nextAlbumImg = function() {
    if (Recommendations.queue.length > 1) {
      return Recommendations.queue[1].image_large;
    }

    return '';
  };


})


/*
Controller for the favorites page
*/
.controller('FavoritesCtrl', function($scope, User, $window, $ionicActionSheet, $timeout) {
  $scope.favorites = User.favorites;
  $scope.username = User.username;

  $scope.removeSong = function(song, index) {
    User.removeSongFromFavorites(song, index);
  }

  $scope.openSong = function(song) {
    $window.open(song.open_url, "_system");
  }

   $scope.show = function(song) {

   // Show the action sheet
   var hideSheet = $ionicActionSheet.show({
     buttons: [
       { text: 'Twitter' },
       { text: 'Facebook' }
     ],
     titleText: 'Share "' + song.title + '"',
     cancelText: 'Cancel',
     cancel: function() {
          // add cancel code..
        },
     buttonClicked: function(index) {
       return true;
     }
   });

   // For example's sake, hide the sheet after two seconds
   $timeout(function() {
     hideSheet();
   }, 5000);

 };

})


/*
Controller for our tab bar
*/
.controller('TabsCtrl', function($scope, User, Recommendations, $window) {

  $scope.favCount = User.favoriteCount;

  $scope.enteringFavorites = function() {
    User.newFavorites = 0;
    Recommendations.haltAudio();
  };

  $scope.leavingFavorites = function() {
    Recommendations.init();
  };

  $scope.logout = function() {
    User.destroySession();
    $window.location.href = 'index.html';
  }
})

.controller('SplashCtrl', function($scope, $state, User) {

  $scope.submitForm = function(username, signingUp) {
    User.auth(username, signingUp).then(function() {
      $state.go('tab.discover');
    }, function() {
      alert('Hmm... try another username.');
    });
  };

});