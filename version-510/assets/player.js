document.addEventListener('DOMContentLoaded', function () {
    var player = document.querySelector('[data-player]');

    if (!player) {
        return;
    }

    var video = player.querySelector('video');
    var overlay = player.querySelector('.player-overlay');
    var source = player.getAttribute('data-source');
    var loaded = false;
    var hlsInstance = null;

    function attachSource() {
        if (loaded || !video || !source) {
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
        } else {
            video.src = source;
        }

        loaded = true;
    }

    function playVideo() {
        attachSource();

        if (overlay) {
            overlay.classList.add('hidden');
        }

        var playPromise = video.play();

        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {
                if (overlay) {
                    overlay.classList.remove('hidden');
                }
            });
        }
    }

    if (overlay) {
        overlay.addEventListener('click', playVideo);
    }

    video.addEventListener('click', function () {
        if (!loaded) {
            playVideo();
        }
    });

    video.addEventListener('play', function () {
        if (overlay) {
            overlay.classList.add('hidden');
        }
    });

    video.addEventListener('pause', function () {
        if (video.currentTime === 0 && overlay) {
            overlay.classList.remove('hidden');
        }
    });

    window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
});
