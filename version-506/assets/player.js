(function () {
    function setupMoviePlayer(config) {
        var video = document.getElementById(config.videoId);
        var overlay = document.getElementById(config.overlayId);
        var source = config.source;
        var poster = config.poster;
        var hlsInstance = null;
        var loaded = false;

        if (!video || !overlay || !source) {
            return;
        }

        if (poster) {
            video.setAttribute('poster', poster);
            overlay.style.backgroundImage = 'url(' + poster + ')';
        }

        function bindSource() {
            if (loaded) {
                return;
            }

            loaded = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                video.load();
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    video.play().catch(function () {});
                });
                hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
                    if (data && data.fatal && hlsInstance) {
                        hlsInstance.destroy();
                        hlsInstance = null;
                        video.src = source;
                        video.load();
                    }
                });
                return;
            }

            video.src = source;
            video.load();
        }

        function play() {
            bindSource();
            overlay.classList.add('is-hidden');

            var result = video.play();

            if (result && typeof result.catch === 'function') {
                result.catch(function () {
                    overlay.classList.remove('is-hidden');
                });
            }
        }

        overlay.addEventListener('click', play);

        video.addEventListener('click', function () {
            if (video.paused) {
                play();
            } else {
                video.pause();
            }
        });

        video.addEventListener('play', function () {
            overlay.classList.add('is-hidden');
        });

        video.addEventListener('ended', function () {
            overlay.classList.remove('is-hidden');
        });

        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    window.setupMoviePlayer = setupMoviePlayer;
})();
