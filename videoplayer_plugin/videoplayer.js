angular.module('videoApp', []).directive('videoplayer', function() {
  return {
    restrict: 'E',
    link: function(scope, element, attrs) {
      angular.element(document).find('head').prepend('<link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.3.1/css/all.css" integrity="sha384-mzrmE5qonljUremFsqc01SB46JvROS7bZs3IO2EmfFsd15uHvIt+Y8vEf7N7fWAU" crossorigin="anonymous">');
      angular.element(document).find('head').prepend('<link href="./videoplayer_plugin/videoplayer.css" rel="stylesheet" type="text/css">');
      var video = element[0].querySelector(".videoplayer");
      var controls = element[0].querySelector(".controls_videoplayer");
      video.src = attrs.videoSrc;
      video.width = attrs.videoWidth;
      controls.style.width = attrs.videoWidth + 'px';
      var playBtn = element[0].querySelector(".playBtn");
      var playBtnIcon = playBtn.querySelector("i");
      var timer = element[0].querySelector(".timer");
      var durationDiv = element[0].querySelector(".duration");
      var rewind = element[0].querySelector(".rewind");
      var sound = element[0].querySelector(".sound");
      var soundIcon = sound.querySelector("i");
      var volume = element[0].querySelector(".volume");
      var resize = element[0].querySelector(".resize");
      var stopBtn = element[0].querySelector(".stopBtn");
      if (attrs.autoplay !== undefined) {
        playVideo(video);
      }
      if (attrs.muted !== undefined) {
        setVolume(0);
      }
      angular.element(video).on("timeupdate", function(event) {
        onTrackedVideoFrame(this.currentTime, this.duration);
      });
      angular.element(playBtn).on('click', function() {
        if (video.paused) {
          playVideo(video);
        } else {
          pauseVideo(video);
        }
      });
      angular.element(stopBtn).on('click', function() {
        pauseVideo(video);
        video.currentTime = 0;
      });
      angular.element(volume).on("change", function(event) {
        setVolume(volume.value);
      });
      angular.element(sound).on("click", function() {
        if (video.volume == 0) {
          setVolume(1);
        } else {
          setVolume(0);
        }
      });
      angular.element(rewind).on("input", function(event) {
        pauseVideo(video);
        var newTime = rewind.value * video.duration / 100;
        video.currentTime = newTime;
        playVideo(video);
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
        angular.element(timer).text(currentmin + ":" + currentsec);
        var durationMin = Math.trunc(duration / 60);
        var durationSec = Math.trunc(duration - durationMin * 60);
        if (durationMin < 10) {
          durationMin = "0" + durationMin;
        }
        if (durationSec < 10) {
          durationSec = "0" + durationSec;
        }
        angular.element(durationDiv).text(durationMin + ":" + durationSec);
        angular.element(rewind).val(currentTime * 100 / duration);
      }

      function setVolume(curVolume) {
        video.volume = curVolume;
        if (curVolume > 0) {
          angular.element(soundIcon).removeClass("fas fa-volume-off");
          angular.element(soundIcon).addClass("fas fa-volume-up");
          volume.value = curVolume;
        } else {
          angular.element(soundIcon).removeClass("fas fa-volume-up");
          angular.element(soundIcon).addClass("fas fa-volume-off");
          volume.value = 0;
        }
      }

      function playVideo(curVideo) {
        curVideo.play();
        angular.element(playBtnIcon).removeClass("fas fa-play");
        angular.element(playBtnIcon).addClass("fas fa-pause");
      }

      function pauseVideo(curVideo) {
        curVideo.pause();
        angular.element(playBtnIcon).removeClass("fas fa-pause");
        angular.element(playBtnIcon).addClass("fas fa-play");
      }
    },
    template: '<div class=\"plugin_videoplayer\"><video class="videoplayer"></video><div class=\"controls_videoplayer\"><div class=\"playBtn\" ><i class=\"fas fa-play\"></i></div><div class=\"stopBtn\" ><i class=\"fas fa-stop\"></i></div><span class=\"timer\">00:00</span><input type=\"range\" step=\"0.1\" min=\"0\" max=\"100\" value=\"0\" class=\"rewind\"/><span class=\"duration\">00:00</span><div class=\"sound\"><i class=\"fas fa-volume-up\"></i></div><input type=\"range\" step=\"0.1\" min=\"0\" max=\"1\" value=\"1\" class=\"volume\"/></div></div>'
  }
});