(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    initMobileMenu();
    initHeroCarousel();
    initLocalFilters();
    initPlayers();
    initSearchPage();
  });

  function initMobileMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-mobile-menu]');

    if (!toggle || !menu) {
      return;
    }

    toggle.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function initHeroCarousel() {
    var carousel = document.querySelector('[data-hero-carousel]');

    if (!carousel) {
      return;
    }

    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var prev = carousel.querySelector('[data-hero-prev]');
    var next = carousel.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    start();
  }

  function initLocalFilters() {
    var input = document.querySelector('[data-filter-input]');
    var count = document.querySelector('[data-filter-count]');

    if (!input) {
      return;
    }

    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));

    function applyFilter() {
      var keyword = input.value.trim().toLowerCase();
      var visible = 0;

      cards.forEach(function (card) {
        var text = (card.getAttribute('data-search') || card.textContent || '').toLowerCase();
        var matched = !keyword || text.indexOf(keyword) !== -1;
        card.classList.toggle('is-hidden-card', !matched);
        if (matched) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = visible + ' 部影片';
      }
    }

    input.addEventListener('input', applyFilter);
  }

  function initPlayers() {
    var boxes = Array.prototype.slice.call(document.querySelectorAll('[data-player-box]'));

    boxes.forEach(function (box) {
      var video = box.querySelector('video[data-src]');
      var button = box.querySelector('[data-player-start]');
      var hlsInstance = null;

      if (!video || !button) {
        return;
      }

      function loadAndPlay() {
        var src = video.getAttribute('data-src');

        if (!src) {
          return;
        }

        if (!video.getAttribute('src') && !hlsInstance) {
          if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true
            });
            hlsInstance.loadSource(src);
            hlsInstance.attachMedia(video);
          } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = src;
          } else {
            video.src = src;
          }
        }

        button.classList.add('is-hidden');
        video.play().catch(function () {
          button.classList.remove('is-hidden');
        });
      }

      button.addEventListener('click', loadAndPlay);
      video.addEventListener('play', function () {
        button.classList.add('is-hidden');
      });
      video.addEventListener('pause', function () {
        if (video.currentTime === 0 || video.ended) {
          button.classList.remove('is-hidden');
        }
      });
    });
  }

  function initSearchPage() {
    var form = document.querySelector('[data-search-form]');
    var input = document.querySelector('[data-search-input]');
    var results = document.querySelector('[data-search-results]');
    var title = document.querySelector('[data-search-title]');
    var count = document.querySelector('[data-search-count]');

    if (!form || !input || !results || !window.MOVIE_SEARCH_DATA) {
      return;
    }

    function escapeHtml(value) {
      return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    function render(items) {
      if (!items.length) {
        results.innerHTML = '<div class="empty-state">没有找到匹配影片，请更换关键词。</div>';
        if (count) {
          count.textContent = '0 条结果';
        }
        return;
      }

      results.innerHTML = items.slice(0, 120).map(function (movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
          return '<span class="tag">' + escapeHtml(tag) + '</span>';
        }).join('');

        return '' +
          '<article class="movie-card">' +
            '<a class="poster-link" href="' + escapeHtml(movie.url) + '" aria-label="观看' + escapeHtml(movie.title) + '">' +
              '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
              '<span class="poster-overlay">立即观看</span>' +
            '</a>' +
            '<div class="movie-card-body">' +
              '<div class="movie-meta-line"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>' +
              '<h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>' +
              '<p>' + escapeHtml(movie.one_line) + '</p>' +
              '<div class="card-tags">' + tags + '</div>' +
              '<div class="card-foot"><span>' + escapeHtml(movie.category) + '</span><span>推荐 ' + escapeHtml(movie.rating) + '</span></div>' +
            '</div>' +
          '</article>';
      }).join('');

      if (count) {
        count.textContent = items.length + ' 条结果';
      }
    }

    function doSearch(keyword) {
      var query = keyword.trim().toLowerCase();

      if (!query) {
        render(window.MOVIE_SEARCH_DATA.slice(0, 24));
        if (title) {
          title.textContent = '热门片单';
        }
        return;
      }

      var words = query.split(/\s+/).filter(Boolean);
      var matched = window.MOVIE_SEARCH_DATA.filter(function (movie) {
        var haystack = movie.search.toLowerCase();
        return words.every(function (word) {
          return haystack.indexOf(word) !== -1;
        });
      });

      render(matched);
      if (title) {
        title.textContent = '搜索结果：' + keyword;
      }
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      doSearch(input.value);
    });

    input.addEventListener('input', function () {
      doSearch(input.value);
    });

    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    input.value = initial;
    doSearch(initial);
  }
})();
