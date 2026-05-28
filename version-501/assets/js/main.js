(function () {
  var navButton = document.querySelector('[data-nav-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (navButton && mobileNav) {
    navButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }

      current = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, index) {
        slide.classList.toggle('is-active', index === current);
      });

      dots.forEach(function (dot, index) {
        dot.classList.toggle('is-active', index === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
      });
    });

    window.setInterval(function () {
      showSlide(current + 1);
    }, 5600);
  }

  var searchInput = document.querySelector('[data-search-input]');
  var regionFilter = document.querySelector('[data-filter-region]');
  var typeFilter = document.querySelector('[data-filter-type]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function applyFilters() {
    if (!cards.length) {
      return;
    }

    var query = normalize(searchInput ? searchInput.value : '');
    var region = normalize(regionFilter ? regionFilter.value : '');
    var type = normalize(typeFilter ? typeFilter.value : '');

    cards.forEach(function (card) {
      var text = normalize(card.getAttribute('data-search'));
      var cardRegion = normalize(card.getAttribute('data-region'));
      var cardType = normalize(card.getAttribute('data-type'));
      var queryMatched = !query || text.indexOf(query) !== -1;
      var regionMatched = !region || cardRegion === region;
      var typeMatched = !type || cardType === type;

      card.classList.toggle('is-hidden', !(queryMatched && regionMatched && typeMatched));
    });
  }

  if (searchInput || regionFilter || typeFilter) {
    var params = new URLSearchParams(window.location.search);
    var keyword = params.get('q');

    if (keyword && searchInput) {
      searchInput.value = keyword;
    }

    [searchInput, regionFilter, typeFilter].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });

    applyFilters();
  }

  var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

  function beginPlayback(player) {
    var video = player.querySelector('video');
    var source = player.getAttribute('data-hls');

    if (!video || !source) {
      return;
    }

    if (!player.dataset.ready) {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls();
        hls.loadSource(source);
        hls.attachMedia(video);
        player.hls = hls;
      } else {
        video.src = source;
      }

      player.dataset.ready = '1';
    }

    player.classList.add('is-playing');

    var playPromise = video.play();

    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {});
    }
  }

  players.forEach(function (player) {
    var overlay = player.querySelector('[data-play-button]');
    var video = player.querySelector('video');

    if (overlay) {
      overlay.addEventListener('click', function () {
        beginPlayback(player);
      });
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          beginPlayback(player);
        }
      });
    }
  });
}());
