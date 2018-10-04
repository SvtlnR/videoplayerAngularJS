var videoApp = angular.module('videoApp', []);
videoApp.factory("videoplayerService", function($window) {
  var arr = sessionStorage.getItem("videos");
  var videos = arr ? JSON.parse(arr) : [];
  return {
    setCurTime: function(id, curTime) {
      videos.find(x => x.id === id).data["curTime"] = curTime;
      sessionStorage.setItem("videos", JSON.stringify(videos));
    },
    setCurDur: function(id, curDur) {
      videos.find(x => x.id === id).data["curDur"] = curDur;
      sessionStorage.setItem("videos", JSON.stringify(videos));
    },
    setCurVol: function(id, curVol) {
      videos.find(x => x.id === id).data["curVol"] = curVol;
      sessionStorage.setItem("videos", JSON.stringify(videos));
    },
    getCurTime: function(id) {
      return videos.find(x => x.id === id).data["curTime"];
    },
    getCurDur: function(id) {
      return videos.find(x => x.id === id).data["curDur"];
    },
    getCurVol: function(id) {
      return videos.find(x => x.id === id).data["curVol"];
    },
    getVideo: function(id) {
      return videos.find(x => x.id === id);
    },
    getVideos: function() {
      return videos;
    },
    isSet: function(id) {
      return videos.find(x => x.id === id);
    },
    addVideo: function(id) {
      videos.push({
        id: id,
        data: {
          curTime: undefined,
          curVolume: undefined,
          curDur: 0
        }
      });
      sessionStorage.setItem("videos", JSON.stringify(videos));
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
      var video = element.find("video")[0];
      var id = "video_" + scope.$id;
      scope.videoId = id;
      scope.paused = true;
      scope.soundOn = true;
      if (videoplayerService.getVideos().length === 0 || angular.isUndefined(videoplayerService.isSet(id))) {
        scope.duration = "00:00";
        scope.timer = "00:00";
        videoplayerService.addVideo(id);
        setVolume(1);
        scope.rewind = 0;
        videoplayerService.setCurTime(id, 0);
        videoplayerService.setCurDur(id, 0);
        if (!angular.isUndefined(scope.autoplay)) {
          playVideo(video);
          video.autoplay = true;
        }
        if (!angular.isUndefined(scope.muted)) {
          setVolume(0);
        }
      } else {
        pauseVideo(video);
        setVolume(videoplayerService.getCurVol(id));
        scope.timer = timeTransform(videoplayerService.getCurTime(id));
        scope.duration = timeTransform(videoplayerService.getCurDur(id));
        scope.rewind = videoplayerService.getCurTime(id) * 100 / videoplayerService.getCurDur(id);
        video.currentTime = videoplayerService.getCurTime(id);
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
        if (Math.abs(this.currentTime - videoplayerService.getCurTime(id)) > 5) {
          videoplayerService.setCurTime(id, this.currentTime);
        }
        if (videoplayerService.getCurDur(id) === 0) {
          videoplayerService.setCurDur(id, video.duration);
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

      function setVolume(curVolume) {
        video.volume = curVolume;
        videoplayerService.setCurVol(id, curVolume);
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