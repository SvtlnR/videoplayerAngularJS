var videoApp = angular.module('videoApp', []);
videoApp.service("videoplayerService", function($window) {
  var storedVideos = sessionStorage.getItem("videos");
  var videos = storedVideos ? JSON.parse(storedVideos) : [];
  var lastId = 0;
  this.setCurrentTime = function(id, currentTime) {
    videos.find(x => x.id === id).data.currentTime = currentTime;
    writeInStorage();
  }
  this.setCurrentDuration = function(id, currentDuration) {
    videos.find(x => x.id === id).data.currentDuration = currentDuration;
    writeInStorage();
  }
  this.setCurrentVolume = function(id, currentVolume) {
    videos.find(x => x.id === id).data.currentVolume = currentVolume;
    writeInStorage();
  }
  this.getCurrrentTime = function(id) {
    return videos.find(x => x.id === id).data.currentTime;
  }
  this.getCurrentDuration = function(id) {
    return videos.find(x => x.id === id).data.currentDuration;
  }
  this.getCurrentVolume = function(id) {
    return videos.find(x => x.id === id).data.currentVolume;
  }
  this.getVideo = function(id) {
    return videos.find(x => x.id === id);
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
    writeInStorage();
  }
  this.generId = function() {
    return lastId++;
  }

  function writeInStorage() {
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
      var id = "video_" + videoplayerService.generId();
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
        scope.timer = timeTransform(videoplayerService.getCurrrentTime(id));
        scope.duration = timeTransform(videoplayerService.getCurrentDuration(id));
        scope.rewind = videoplayerService.getCurrrentTime(id) * 100 / videoplayerService.getCurrentDuration(id);
        video.currentTime = videoplayerService.getCurrrentTime(id);
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
      scope.rewindVideo = function() {
        pauseVideo(video);
        var newTime = scope.rewind * video.duration / 100;
        video.currentTime = newTime;
        playVideo(video);
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
        if (Math.abs(this.currentTime - videoplayerService.getCurrrentTime(id)) > 5) {
          videoplayerService.setCurrentTime(id, this.currentTime);
        }
        if (videoplayerService.getCurrentDuration(id) === 0) {
          videoplayerService.setCurrentDuration(id, video.duration);
        }
        onTrackedVideoFrame(this.currentTime, this.duration);
      });

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