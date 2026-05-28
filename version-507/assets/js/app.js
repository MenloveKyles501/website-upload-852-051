(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
      return;
    }
    document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
      menuButton.addEventListener('click', function () {
        var isOpen = mobileNav.classList.toggle('open');
        menuButton.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
      var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
      var prev = hero.querySelector('[data-hero-prev]');
      var next = hero.querySelector('[data-hero-next]');
      var index = 0;
      var timer = null;

      function show(nextIndex) {
        if (!slides.length) {
          return;
        }
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle('is-active', slideIndex === index);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle('is-active', dotIndex === index);
        });
      }

      function restart() {
        if (timer) {
          clearInterval(timer);
        }
        timer = setInterval(function () {
          show(index + 1);
        }, 5000);
      }

      dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
          show(Number(dot.getAttribute('data-hero-dot')) || 0);
          restart();
        });
      });

      if (prev) {
        prev.addEventListener('click', function () {
          show(index - 1);
          restart();
        });
      }

      if (next) {
        next.addEventListener('click', function () {
          show(index + 1);
          restart();
        });
      }

      restart();
    }

    var filterPanel = document.querySelector('[data-filter-panel]');
    var filterList = document.querySelector('[data-filter-list]');

    if (filterPanel && filterList) {
      var searchInput = filterPanel.querySelector('[data-filter-search]');
      var yearSelect = filterPanel.querySelector('[data-filter-year]');
      var categorySelect = filterPanel.querySelector('[data-filter-category]');
      var clearButton = filterPanel.querySelector('[data-filter-clear]');
      var cards = Array.prototype.slice.call(filterList.querySelectorAll('[data-movie-card]'));
      var params = new URLSearchParams(window.location.search);
      var query = params.get('q');

      if (query && searchInput) {
        searchInput.value = query;
      }

      function applyFilter() {
        var keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
        var year = yearSelect ? yearSelect.value : 'all';
        var category = categorySelect ? categorySelect.value : 'all';

        cards.forEach(function (card) {
          var text = card.getAttribute('data-search') || '';
          var cardYear = card.getAttribute('data-year') || '';
          var cardCategory = card.getAttribute('data-category') || '';
          var matched = true;

          if (keyword && text.indexOf(keyword) === -1) {
            matched = false;
          }
          if (year !== 'all' && cardYear !== year) {
            matched = false;
          }
          if (category !== 'all' && cardCategory !== category) {
            matched = false;
          }

          card.hidden = !matched;
        });
      }

      ['input', 'change'].forEach(function (eventName) {
        if (searchInput) {
          searchInput.addEventListener(eventName, applyFilter);
        }
        if (yearSelect) {
          yearSelect.addEventListener(eventName, applyFilter);
        }
        if (categorySelect) {
          categorySelect.addEventListener(eventName, applyFilter);
        }
      });

      if (clearButton) {
        clearButton.addEventListener('click', function () {
          if (searchInput) {
            searchInput.value = '';
          }
          if (yearSelect) {
            yearSelect.value = 'all';
          }
          if (categorySelect) {
            categorySelect.value = 'all';
          }
          applyFilter();
        });
      }

      applyFilter();
    }

    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

    players.forEach(function (player) {
      var video = player.querySelector('video');
      var button = player.querySelector('[data-play-button]');
      var loaded = false;
      var instance = null;

      if (!video) {
        return;
      }

      function loadVideo() {
        if (loaded) {
          return;
        }

        var source = video.getAttribute('data-m3u8');
        if (!source) {
          return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          loaded = true;
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          instance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          instance.loadSource(source);
          instance.attachMedia(video);
          loaded = true;
          return;
        }

        video.src = source;
        loaded = true;
      }

      function startVideo() {
        loadVideo();
        var playResult = video.play();
        if (playResult && typeof playResult.then === 'function') {
          playResult.then(function () {
            player.classList.add('is-playing');
          }).catch(function () {});
        } else {
          player.classList.add('is-playing');
        }
      }

      if (button) {
        button.addEventListener('click', startVideo);
      }

      video.addEventListener('play', function () {
        player.classList.add('is-playing');
      });

      video.addEventListener('pause', function () {
        player.classList.remove('is-playing');
      });

      video.addEventListener('click', function () {
        if (video.paused) {
          startVideo();
        }
      });

      window.addEventListener('pagehide', function () {
        if (instance && typeof instance.destroy === 'function') {
          instance.destroy();
        }
      });
    });
  });
})();
