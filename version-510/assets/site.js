document.addEventListener('DOMContentLoaded', function () {
    var toggle = document.querySelector('[data-mobile-toggle]');
    var menu = document.querySelector('[data-mobile-menu]');

    if (toggle && menu) {
        toggle.addEventListener('click', function () {
            menu.classList.toggle('open');
        });
    }

    var slider = document.querySelector('[data-hero-slider]');

    if (slider) {
        var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
        var next = slider.querySelector('[data-hero-next]');
        var prev = slider.querySelector('[data-hero-prev]');
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5600);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                start();
            });
        });

        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                start();
            });
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                start();
            });
        }

        slider.addEventListener('mouseenter', stop);
        slider.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    var searchInput = document.querySelector('[data-card-search]');

    if (searchInput) {
        var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
        var empty = document.querySelector('[data-empty-result]');
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q') || '';

        if (searchInput.hasAttribute('data-query-fill') && query) {
            searchInput.value = query;
        }

        function filterCards() {
            var value = searchInput.value.trim().toLowerCase();
            var visibleCount = 0;

            cards.forEach(function (card) {
                var text = (card.getAttribute('data-search') || card.textContent || '').toLowerCase();
                var match = !value || text.indexOf(value) !== -1;

                card.style.display = match ? '' : 'none';

                if (match) {
                    visibleCount += 1;
                }
            });

            if (empty) {
                empty.classList.toggle('show', visibleCount === 0);
            }
        }

        searchInput.addEventListener('input', filterCards);
        filterCards();
    }
});
