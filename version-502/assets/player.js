(function () {
  window.initMoviePlayer = function (videoId, sourceUrl, coverId, buttonId) {
    var video = document.getElementById(videoId);
    var cover = document.getElementById(coverId);
    var button = document.getElementById(buttonId);
    var loaded = false;
    var hlsInstance = null;

    if (!video || !sourceUrl) {
      return;
    }

    function loadVideo() {
      if (loaded) {
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = sourceUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsInstance.loadSource(sourceUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = sourceUrl;
      }

      loaded = true;
    }

    function hideCover() {
      if (cover) {
        cover.classList.add("is-hidden");
      }
      video.setAttribute("controls", "controls");
    }

    function startPlayback() {
      loadVideo();
      hideCover();

      var playResult = video.play();

      if (playResult && typeof playResult.catch === "function") {
        playResult.catch(function () {
          video.setAttribute("controls", "controls");
        });
      }
    }

    if (button) {
      button.addEventListener("click", function (event) {
        event.stopPropagation();
        startPlayback();
      });
    }

    if (cover) {
      cover.addEventListener("click", startPlayback);
      cover.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          startPlayback();
        }
      });
    }

    video.addEventListener("click", function () {
      if (!loaded || video.paused) {
        startPlayback();
      } else {
        video.pause();
      }
    });

    video.addEventListener("play", hideCover);

    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
      }
    });
  };
})();
