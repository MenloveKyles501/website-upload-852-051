(function () {
    const menuButton = document.querySelector('[data-menu-toggle]');
    const mobileMenu = document.querySelector('[data-mobile-menu]');

    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', function () {
            mobileMenu.classList.toggle('is-open');
        });
    }

    const hero = document.querySelector('[data-hero]');

    if (hero) {
        const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
        const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
        const prev = hero.querySelector('[data-hero-prev]');
        const next = hero.querySelector('[data-hero-next]');
        let current = 0;
        let timer = null;

        const show = function (index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        };

        const start = function () {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5000);
        };

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                start();
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
                start();
            });
        });

        show(0);
        start();
    }

    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get('q') || '';

    document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
        const input = scope.querySelector('[data-movie-search]');
        const buttons = Array.from(scope.querySelectorAll('[data-filter-value]'));
        const container = scope.nextElementSibling;

        if (!container) {
            return;
        }

        const items = Array.from(container.querySelectorAll('.movie-card, .rank-card'));
        let typeFilter = 'all';

        const apply = function () {
            const query = input ? input.value.trim().toLowerCase() : '';
            items.forEach(function (item) {
                const text = [
                    item.dataset.title || '',
                    item.dataset.tags || '',
                    item.dataset.type || '',
                    item.dataset.year || '',
                    item.dataset.category || '',
                    item.dataset.region || ''
                ].join(' ').toLowerCase();
                const type = item.dataset.type || '';
                const matchesQuery = !query || text.indexOf(query) !== -1;
                const matchesType = typeFilter === 'all' || type.indexOf(typeFilter) !== -1 || text.indexOf(typeFilter.toLowerCase()) !== -1;
                item.classList.toggle('is-hidden', !(matchesQuery && matchesType));
            });
        };

        if (input) {
            if (initialQuery) {
                input.value = initialQuery;
            }
            input.addEventListener('input', apply);
        }

        buttons.forEach(function (button) {
            button.addEventListener('click', function () {
                buttons.forEach(function (other) {
                    other.classList.remove('is-active');
                });
                button.classList.add('is-active');
                typeFilter = button.dataset.filterValue || 'all';
                apply();
            });
        });

        apply();
    });
})();

window.initMoviePlayer = function (source, videoId, overlayId) {
    const video = document.getElementById(videoId);
    const overlay = document.getElementById(overlayId);

    if (!video || !overlay || !source) {
        return;
    }

    let prepared = false;

    const loadHls = function () {
        if (window.Hls) {
            return Promise.resolve(window.Hls);
        }
        if (window.__hlsLoading) {
            return window.__hlsLoading;
        }
        window.__hlsLoading = new Promise(function (resolve, reject) {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
            script.onload = function () {
                resolve(window.Hls);
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
        return window.__hlsLoading;
    };

    const prepare = function () {
        if (prepared) {
            return Promise.resolve();
        }
        prepared = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            return Promise.resolve();
        }

        return loadHls().then(function (Hls) {
            if (Hls && Hls.isSupported()) {
                const hls = new Hls({ enableWorker: true });
                hls.loadSource(source);
                hls.attachMedia(video);
                video._hlsInstance = hls;
            } else {
                video.src = source;
            }
        }).catch(function () {
            video.src = source;
        });
    };

    const play = function () {
        overlay.classList.add('is-hidden');
        prepare().then(function () {
            const result = video.play();
            if (result && typeof result.catch === 'function') {
                result.catch(function () {});
            }
        });
    };

    overlay.addEventListener('click', play);
    overlay.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            play();
        }
    });
    video.addEventListener('click', function () {
        if (video.paused) {
            play();
        }
    });
    video.addEventListener('play', function () {
        overlay.classList.add('is-hidden');
    });
};
