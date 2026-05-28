(function () {
    var mobileButton = document.querySelector('[data-mobile-menu-button]');
    var mobileMenu = document.querySelector('[data-mobile-menu]');

    if (mobileButton && mobileMenu) {
        mobileButton.addEventListener('click', function () {
            mobileMenu.classList.toggle('is-open');
        });
    }

    var backToTop = document.querySelector('[data-back-to-top]');

    if (backToTop) {
        window.addEventListener('scroll', function () {
            if (window.scrollY > 460) {
                backToTop.classList.add('is-visible');
            } else {
                backToTop.classList.remove('is-visible');
            }
        });

        backToTop.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    function setupHero() {
        var hero = document.querySelector('[data-hero]');

        if (!hero) {
            return;
        }

        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var previous = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var current = 0;
        var timer;

        function show(index) {
            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function autoPlay() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5000);
        }

        if (slides.length <= 1) {
            return;
        }

        if (previous) {
            previous.addEventListener('click', function () {
                show(current - 1);
                autoPlay();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                autoPlay();
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
                autoPlay();
            });
        });

        show(0);
        autoPlay();
    }

    function normalizeText(value) {
        return String(value || '').trim().toLowerCase();
    }

    function setupMovieFilters() {
        var scopes = Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]'));

        scopes.forEach(function (scope) {
            var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-movie-card]'));
            var searchInput = scope.querySelector('[data-card-search]');
            var filterButtons = Array.prototype.slice.call(scope.querySelectorAll('[data-filter]'));
            var resultCount = scope.querySelector('[data-result-count]');
            var emptyState = scope.querySelector('[data-empty-state]');
            var activeFilter = 'all';

            function render() {
                var keyword = normalizeText(searchInput ? searchInput.value : '');
                var visibleCount = 0;

                cards.forEach(function (card) {
                    var text = normalizeText(card.getAttribute('data-search'));
                    var cardRegion = card.getAttribute('data-region') || '';
                    var cardType = card.getAttribute('data-type') || '';
                    var matchesKeyword = !keyword || text.indexOf(keyword) !== -1;
                    var matchesFilter = activeFilter === 'all' || cardRegion === activeFilter || cardType === activeFilter;
                    var isVisible = matchesKeyword && matchesFilter;

                    card.style.display = isVisible ? '' : 'none';

                    if (isVisible) {
                        visibleCount += 1;
                    }
                });

                if (resultCount) {
                    resultCount.textContent = visibleCount + ' 部影片';
                }

                if (emptyState) {
                    emptyState.classList.toggle('is-visible', visibleCount === 0);
                }
            }

            if (searchInput) {
                searchInput.addEventListener('input', render);
            }

            filterButtons.forEach(function (button) {
                button.addEventListener('click', function () {
                    activeFilter = button.getAttribute('data-filter') || 'all';
                    filterButtons.forEach(function (item) {
                        item.classList.toggle('is-active', item === button);
                    });
                    render();
                });
            });

            render();
        });
    }

    function setupSearchPage() {
        var searchPage = document.querySelector('[data-search-page]');

        if (!searchPage) {
            return;
        }

        var input = searchPage.querySelector('[data-card-search]');
        var params = new URLSearchParams(window.location.search);
        var keyword = params.get('q') || '';

        if (input && keyword) {
            input.value = keyword;
            input.dispatchEvent(new Event('input', { bubbles: true }));
        }
    }

    function setupIndexSearch() {
        var form = document.querySelector('[data-index-search]');

        if (!form) {
            return;
        }

        form.addEventListener('submit', function (event) {
            event.preventDefault();
            var input = form.querySelector('input');
            var keyword = input ? input.value.trim() : '';
            var url = keyword ? 'search.html?q=' + encodeURIComponent(keyword) : 'search.html';
            window.location.href = url;
        });
    }

    setupHero();
    setupMovieFilters();
    setupSearchPage();
    setupIndexSearch();
})();
