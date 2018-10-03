var videoApp = angular.module('videoApp', []);
videoApp.factory("videoplayerService", function() {
  var curTime = -1;
  var curVol = -1;
  return {
    setCurTime: function(_curTime) {
      curTime = _curTime;
    },
    setCurVol: function(_curVol) {
      curVol = _curVol;
    },
    getCurTime: function() {
      return curTime;
    },
    getCurVol: function() {
      return curVol;
    }
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
      console.log(videoplayerService.getCurVol());
      scope.duration = "00:00";
      scope.timer = "00:00";
      scope.paused = true;
      scope.soundOn = true;
      var video = element.find("video")[0];
      if (videoplayerService.getCurTime() === -1) {
        videoplayerService.setCurVol(1);
        videoplayerService.setCurTime(0);
        if (scope.autoplay !== undefined) {
          playVideo(video);
          video.autoplay = true;
        }
        if (scope.muted !== undefined) {
          setVolume(0);
          videoplayerService.setCurVol(0);
        }
        scope.rewind = 0;
      }
      else{
        setVolume(videoplayerService.getCurVol())
        scope.rewind = videoplayerService.getCurTime(); 
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

      function playVideo(curVideo) {
        scope.paused = false;
        curVideo.play();
      }

      function pauseVideo(curVideo) {
        scope.paused = true;
        curVideo.pause();
      }
      scope.stopPlaying = function() {
        stopVideo(video);
      }
      angular.element(video).on("timeupdate", function(event) {
        onTrackedVideoFrame(this.currentTime, this.duration);
      });

      function onTrackedVideoFrame(currentTime, duration) {
        var currentmin = Math.trunc(currentTime / 60);
        var currentsec = Math.trunc(currentTime - currentmin * 60);
        if (currentTime == duration) {
          stopVideo(video);
        }
        if (currentsec < 10) {
          currentsec = "0" + currentsec;
        }
        if (currentmin < 10) {
          currentmin = "0" + currentmin;
        }
        scope.timer = currentmin + ":" + currentsec;
        var durationMin = Math.trunc(duration / 60);
        var durationSec = Math.trunc(duration - durationMin * 60);
        if (durationMin < 10) {
          durationMin = "0" + durationMin;
        }
        if (durationSec < 10) {
          durationSec = "0" + durationSec;
        }
        scope.duration = durationMin + ":" + durationSec;
        scope.rewind = currentTime * 100 / duration;
        scope.$apply();
      }

      function setVolume(curVolume) {
        video.volume = curVolume;
        videoplayerService.setCurVol(curVolume);
        if (curVolume > 0) {
          scope.soundOn = true;
          scope.volume = curVolume;
        } else {
          scope.soundOn = false;
          scope.volume = 0;
        }
      }

      function stopVideo(curVideo) {
        pauseVideo(curVideo);
        curVideo.currentTime = 0;
      }
    },
    templateUrl: "videoplayer_plugin/videoplayer.html"
  }
}]);