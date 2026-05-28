(function () {
    var video = document.querySelector('[data-player-video]');
    var startButton = document.querySelector('[data-player-start]');
    var shell = document.querySelector('.player-shell');

    if (!video) {
        return;
    }

    var source = video.getAttribute('data-src');
    var hlsInstance = null;
    var isAttached = false;

    function attachSource() {
        if (isAttached || !source) {
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            isAttached = true;
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });

            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
            isAttached = true;
            return;
        }

        video.src = source;
        isAttached = true;
    }

    function playVideo() {
        attachSource();

        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {
                video.controls = true;
            });
        }
    }

    if (startButton) {
        startButton.addEventListener('click', playVideo);
    }

    video.addEventListener('play', function () {
        if (shell) {
            shell.classList.add('is-playing');
        }
    });

    video.addEventListener('click', function () {
        if (!isAttached) {
            playVideo();
        }
    });

    window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}());
