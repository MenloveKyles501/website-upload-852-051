document.addEventListener("DOMContentLoaded", function () {
  const navToggle = document.querySelector("[data-nav-toggle]");
  const navLinks = document.querySelector("[data-nav-links]");
  if (navToggle && navLinks) {
    navToggle.addEventListener("click", function () {
      navLinks.classList.toggle("is-open");
    });
  }

  const sliders = document.querySelectorAll("[data-hero-slider]");
  sliders.forEach(function (slider) {
    const slides = Array.from(slider.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(slider.querySelectorAll("[data-hero-dot]"));
    if (!slides.length) {
      return;
    }
    let index = 0;
    function showSlide(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        showSlide(dotIndex);
      });
    });
    window.setInterval(function () {
      showSlide(index + 1);
    }, 5200);
  });

  const filterInputs = document.querySelectorAll("[data-filter-input]");
  filterInputs.forEach(function (input) {
    const targetSelector = input.getAttribute("data-filter-target");
    const target = targetSelector ? document.querySelector(targetSelector) : null;
    if (!target) {
      return;
    }
    const cards = Array.from(target.querySelectorAll("[data-card]"));
    input.addEventListener("input", function () {
      const keyword = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        const haystack = (card.getAttribute("data-search") || "").toLowerCase();
        card.classList.toggle("is-filter-hidden", keyword && !haystack.includes(keyword));
      });
    });
  });

  const globalSearch = document.getElementById("global-search");
  const globalResults = document.getElementById("search-results");
  if (globalSearch && globalResults && Array.isArray(window.SITE_MOVIES)) {
    function renderResults() {
      const keyword = globalSearch.value.trim().toLowerCase();
      const source = keyword
        ? window.SITE_MOVIES.filter(function (movie) {
            return movie.search.toLowerCase().includes(keyword);
          })
        : window.SITE_MOVIES.slice(0, 24);
      const results = source.slice(0, 96);
      globalResults.innerHTML = results.map(function (movie) {
        return [
          '<a class="movie-card" href="' + movie.url + '" data-card>',
          '  <span class="poster-wrap">',
          '    <img src="' + movie.cover + '" alt="' + movie.title + '" loading="lazy">',
          '    <span class="poster-shade"></span>',
          '    <span class="poster-play">▶</span>',
          '    <span class="badge badge-primary">' + movie.type + '</span>',
          '    <span class="badge badge-secondary">' + movie.region + '</span>',
          '  </span>',
          '  <span class="movie-info">',
          '    <strong>' + movie.title + '</strong>',
          '    <span class="movie-meta">' + movie.year + ' · ' + movie.region + ' · ' + movie.type + '</span>',
          '    <span class="movie-genre">' + movie.genre + '</span>',
          '    <span class="movie-desc">' + movie.desc + '</span>',
          '    <span class="tag-line">进入详情</span>',
          '  </span>',
          '</a>'
        ].join('');
      }).join('');
    }
    globalSearch.addEventListener("input", renderResults);
    renderResults();
  }
});
