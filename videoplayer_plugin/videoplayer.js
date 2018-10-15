var videoApp = angular.module('videoApp', []);
videoApp.service("videoplayerService", function($window) {
  var storedVideos = sessionStorage.getItem("videos");
  var videos = storedVideos ? JSON.parse(storedVideos) : [];
  var lastId = 0;
  this.setCurrentTime = function(id, currentTime) {
    var video = this.getVideo(id);
    if (!angular.isUndefined(video)) {
      video.data.currentTime = currentTime;
      syncStorage();
    }
  }
  this.setCurrentDuration = function(id, currentDuration) {
    var video = this.getVideo(id);
    if (!angular.isUndefined(video)) {
      video.data.currentDuration = currentDuration;
      syncStorage();
    }
  }
  this.setCurrentVolume = function(id, currentVolume) {
    var video = this.getVideo(id);
    if (!angular.isUndefined(video)) {
      video.data.currentVolume = currentVolume;
      syncStorage();
    }
  }
  this.getCurrentTime = function(id) {
    var video = this.getVideo(id);
    if (!angular.isUndefined(video)) {
      return video.data.currentTime;
    }
    return 0;
  }
  this.getCurrentDuration = function(id) {
    var video = this.getVideo(id);
    if (!angular.isUndefined(video)) {
      return video.data.currentDuration;
    }
    return 0;
  }
  this.getCurrentVolume = function(id) {
    var video = this.getVideo(id);
    if (!angular.isUndefined(video)) {
      return video.data.currentVolume;
    }
    return 0;
  }
  this.getVideo = function(id) {
    return videos.find(function(x) {
      return x.id === id;
    });
  }
  this.getVideos = function() {
    return videos;
  }
  this.addVideo = function(id) {
    videos.push({
      id: id,
      data: {
        currentTime: undefined,
        currentVolume: undefined,
        currentDuration: 0
      }
    });
    syncStorage();
  }
  this.generateId = function() {
    return lastId++;
  }

  function syncStorage() {
    sessionStorage.setItem("videos", JSON.stringify(videos));
  }
});
videoApp.directive('videoplayer', ["videoplayerService", function(videoplayerService) {
  return {
    restrict: 'E',
    scope: {
      videoSrc: '@',
      videoWidth: '@',
      autoplay: '@',
      muted: '@'
    },
    link: function(scope, element, attrs) {
      var video = element.find("video")[0];
      var id = "video_" + videoplayerService.generateId();
      scope.videoId = id;
      scope.paused = true;
      scope.soundOn = true;
      if (!videoplayerService.getVideo(id)) {
        scope.duration = "00:00";
        scope.timer = "00:00";
        videoplayerService.addVideo(id);
        setVolume(1);
        scope.rewind = 0;
        videoplayerService.setCurrentTime(id, 0);
        videoplayerService.setCurrentDuration(id, 0);
        if (!angular.isUndefined(scope.autoplay)) {
          playVideo(video);
          video.autoplay = true;
        }
        if (!angular.isUndefined(scope.muted)) {
          setVolume(0);
        }
      } else {
        pauseVideo(video);
        setVolume(videoplayerService.getCurrentVolume(id));
        var currentTime = videoplayerService.getCurrentTime(id);
        scope.timer = timeTransform(currentTime);
        scope.duration = timeTransform(videoplayerService.getCurrentDuration(id));
        var rewindValue = currentTime * 100 / videoplayerService.getCurrentDuration(id);
        scope.rewind = isNaN(rewindValue) ? 0 : rewindValue;
        video.addEventListener("loadedmetadata", function() {
          video.currentTime = currentTime;
        });
        pauseVideo(video);
      }
      scope.soundOnOff = function() {
        scope.soundOn = !scope.soundOn;
        if (scope.soundOn) {
          setVolume(1);
        } else {
          setVolume(0);
        }
      }
      scope.playPause = function() {
        if (video.paused) {
          playVideo(video);
        } else {
          pauseVideo(video);
        }
      }
      scope.changeVolume = function() {
        setVolume(scope.volume);
      }
      scope.rewindVideo = function(rewindValue) {
        angular.element(video).off("timeupdate");
        pauseVideo(video);
        var newTime = rewindValue * video.duration / 100;
        video.currentTime = newTime;
        playVideo(video);
        angular.element(video).on("timeupdate", function(event) {
          updateVideoInfo(this);
        });
      }

      function playVideo(currentVideo) {
        scope.paused = false;
        currentVideo.play();
      }

      function pauseVideo(currentVideo) {
        scope.paused = true;
        currentVideo.pause();
      }
      scope.stopPlaying = function() {
        stopVideo(video);
      }
      angular.element(video).on("timeupdate", function(event) {
        updateVideoInfo(this);
      });

      function updateVideoInfo(currentVideo) {
        if (Math.abs(currentVideo.currentTime - videoplayerService.getCurrentTime(id)) > 5) {
          videoplayerService.setCurrentTime(id, currentVideo.currentTime);
        }
        if (!videoplayerService.getCurrentDuration(id)) {
          videoplayerService.setCurrentDuration(id, video.duration);
        }
        onTrackedVideoFrame(currentVideo.currentTime, currentVideo.duration);
      }

      function onTrackedVideoFrame(currentTime, duration) {
        if (currentTime == duration) {
          stopVideo(video);
        }
        scope.timer = timeTransform(currentTime);
        scope.duration = timeTransform(duration);
        scope.rewind = currentTime * 100 / duration;
        scope.$apply();
      }

      function timeTransform(time) {
        if (!time) {
          time = 0;
        }
        var currentmin = Math.trunc(time / 60);
        var currentsec = Math.trunc(time - currentmin * 60);
        if (currentsec < 10) {
          currentsec = "0" + currentsec;
        }
        if (currentmin < 10) {
          currentmin = "0" + currentmin;
        }
        return currentmin + ":" + currentsec;
      }

      function setVolume(currentVolume) {
        video.volume = currentVolume;
        videoplayerService.setCurrentVolume(id, currentVolume);
        if (currentVolume > 0) {
          scope.soundOn = true;
          scope.volume = currentVolume;
        } else {
          scope.soundOn = false;
          scope.volume = 0;
        }
      }

      function stopVideo(currentVideo) {
        pauseVideo(currentVideo);
        currentVideo.currentTime = 0;
      }
    },
    templateUrl: "videoplayer_plugin/videoplayer.html"
  }
}]);