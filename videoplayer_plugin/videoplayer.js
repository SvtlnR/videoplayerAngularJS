var videoApp = angular.module('videoApp', []);
videoApp.factory("videoplayerService", function(){
  var videos=[];
  return {
    setCurTime: function(id,_curTime) {
      videos.find(x=>x.id===id).curTime=_curTime;
    },
    setCurVol: function(id,_curVol) {
      videos.find(x=>x.id===id).curVol=_curVol;
    },
    getCurTime: function(id) {
      return videos.find(x=>x.id===id).curTime;
    },
    getCurVol: function(id) {
      return videos.find(x=>x.id===id).curVol;
    },
    getVideos:function(){
      return videos;
    },
    isSet:function(id){
      return videos.find(x=>x.id===id);
    },
    addVideo:function(_id){
      videos.push({
        id:_id,
        curTime:undefined,
        curVolume:undefined
      });
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
      var id=generateId(videoplayerService);
      scope.videoId=id;
      scope.duration = "00:00";
      scope.timer = "00:00";
      scope.paused = true;
      scope.soundOn = true;
      if (angular.isUndefined(videoplayerService.getCurTime(id))) {
        setVolume(1);
        scope.rewind = 0;
        videoplayerService.setCurTime(id,0);
        if (!angular.isUndefined(scope.autoplay)) {
          playVideo(video);
          video.autoplay = true;
        }
        if (!angular.isUndefined(scope.muted)) {
          setVolume(0);
        }
      } else {
        setVolume(videoplayerService.getCurVol(id));
        scope.rewind = videoplayerService.getCurTime(id);
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
        if(this.currentTime-videoplayerService.getCurTime(id)>5){
          videoplayerService.setCurTime(id,this.currentTime);
        }
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
        videoplayerService.setCurVol(id,curVolume);
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
function generateId(videoplayerService){
  var id;
  var set=0;
  do{
    id=Math.floor(Math.random()*100);
    set=videoplayerService.isSet(id);
  }while(set<0);
  videoplayerService.addVideo(id);
  return id;
}