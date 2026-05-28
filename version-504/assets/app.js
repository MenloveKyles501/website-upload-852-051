(function () {
    var heroSlider = document.querySelector('[data-hero-slider]');

    if (heroSlider) {
        var slides = Array.prototype.slice.call(heroSlider.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(heroSlider.querySelectorAll('[data-hero-dot]'));
        var prev = heroSlider.querySelector('[data-hero-prev]');
        var next = heroSlider.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function showSlide(index) {
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
        }

        function startAutoPlay() {
            stopAutoPlay();
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5000);
        }

        function stopAutoPlay() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
                startAutoPlay();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(current - 1);
                startAutoPlay();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(current + 1);
                startAutoPlay();
            });
        }

        heroSlider.addEventListener('mouseenter', stopAutoPlay);
        heroSlider.addEventListener('mouseleave', startAutoPlay);
        showSlide(0);
        startAutoPlay();
    }

    document.querySelectorAll('img').forEach(function (image) {
        image.addEventListener('error', function () {
            image.style.display = 'none';
            if (image.parentElement) {
                image.parentElement.classList.add('image-missing');
            }
        });
    });

    document.querySelectorAll('.site-search-form').forEach(function (form) {
        form.addEventListener('submit', function (event) {
            var input = form.querySelector('input[name="q"]');
            if (input && !input.value.trim()) {
                event.preventDefault();
                window.location.href = form.getAttribute('action') || 'search.html';
            }
        });
    });

    var backToTop = document.querySelector('.back-to-top');
    if (backToTop) {
        window.addEventListener('scroll', function () {
            backToTop.classList.toggle('is-visible', window.scrollY > 520);
        });

        backToTop.addEventListener('click', function () {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    if (window.MOVIE_DATA && document.getElementById('search-results')) {
        initSearchPage(window.MOVIE_DATA);
    }

    function initSearchPage(movies) {
        var qInput = document.getElementById('filter-q');
        var regionSelect = document.getElementById('filter-region');
        var typeSelect = document.getElementById('filter-type');
        var yearSelect = document.getElementById('filter-year');
        var genreSelect = document.getElementById('filter-genre');
        var results = document.getElementById('search-results');
        var summary = document.getElementById('search-summary');
        var loadMore = document.getElementById('load-more');
        var pageSize = 40;
        var visibleCount = pageSize;
        var currentMatches = movies.slice();
        var params = new URLSearchParams(window.location.search);

        if (params.get('q')) {
            qInput.value = params.get('q');
        }

        function normalize(value) {
            return String(value || '').toLowerCase().trim();
        }

        function movieMatches(movie, query, region, type, year, genre) {
            var haystack = normalize([
                movie.title,
                movie.region,
                movie.regionGroup,
                movie.type,
                movie.year,
                movie.genreRaw,
                movie.oneLine,
                (movie.tags || []).join(' ')
            ].join(' '));

            if (query && haystack.indexOf(query) === -1) {
                return false;
            }

            if (region && movie.regionGroup !== region) {
                return false;
            }

            if (type && movie.type !== type) {
                return false;
            }

            if (year && String(movie.year) !== year) {
                return false;
            }

            if (genre && (movie.genres || []).indexOf(genre) === -1) {
                return false;
            }

            return true;
        }

        function createCard(movie) {
            var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
                return '<span>' + escapeHtml(tag) + '</span>';
            }).join('');

            return [
                '<article class="movie-card">',
                '    <a class="poster-link" href="detail/' + movie.id + '.html" aria-label="观看 ' + escapeHtml(movie.title) + '">',
                '        <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + ' 海报" loading="lazy">',
                '        <span class="poster-shade"></span>',
                '        <span class="card-badge">' + escapeHtml(movie.year) + '</span>',
                '        <span class="play-mark">▶</span>',
                '    </a>',
                '    <div class="movie-card-body">',
                '        <div class="meta-row">',
                '            <span>' + escapeHtml(movie.regionGroup) + '</span>',
                '            <span>' + escapeHtml(movie.type) + '</span>',
                '            <span>★ ' + escapeHtml(movie.score) + '</span>',
                '        </div>',
                '        <h3><a href="detail/' + movie.id + '.html">' + escapeHtml(movie.title) + '</a></h3>',
                '        <p>' + escapeHtml(movie.oneLine || '') + '</p>',
                '        <div class="tag-list">' + tags + '</div>',
                '    </div>',
                '</article>'
            ].join('');
        }

        function render() {
            var query = normalize(qInput.value);
            var region = regionSelect.value;
            var type = typeSelect.value;
            var year = yearSelect.value;
            var genre = genreSelect.value;

            currentMatches = movies.filter(function (movie) {
                return movieMatches(movie, query, region, type, year, genre);
            });

            var slice = currentMatches.slice(0, visibleCount);
            results.innerHTML = slice.map(createCard).join('');
            summary.textContent = '共找到 ' + currentMatches.length + ' 部影片，当前显示 ' + slice.length + ' 部。';
            loadMore.style.display = currentMatches.length > visibleCount ? 'inline-flex' : 'none';
        }

        function resetAndRender() {
            visibleCount = pageSize;
            render();
        }

        [qInput, regionSelect, typeSelect, yearSelect, genreSelect].forEach(function (control) {
            control.addEventListener('input', resetAndRender);
            control.addEventListener('change', resetAndRender);
        });

        loadMore.addEventListener('click', function () {
            visibleCount += pageSize;
            render();
        });

        render();
    }

    function escapeHtml(value) {
        return String(value || '').replace(/[&<>"']/g, function (char) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#039;'
            }[char];
        });
    }
}());
