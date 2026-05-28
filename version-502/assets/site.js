(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  var toggle = qs(".mobile-toggle");
  var panel = qs(".mobile-panel");

  if (toggle && panel) {
    toggle.addEventListener("click", function () {
      var open = panel.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  qsa("[data-search-form]").forEach(function (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var input = qs("input[name='q']", form);
      var query = input ? input.value.trim() : "";
      var url = "./search.html";

      if (query) {
        url += "?q=" + encodeURIComponent(query);
      }

      window.location.href = url;
    });
  });

  var carousel = qs("[data-hero-carousel]");

  if (carousel) {
    var slides = qsa(".hero-slide", carousel);
    var dots = qsa(".hero-dot", carousel);
    var index = 0;

    function showSlide(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        showSlide(Number(dot.getAttribute("data-hero-dot") || 0));
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }
  }

  var filterRoot = qs("[data-filter-list]");

  if (filterRoot) {
    var filterInput = qs(".filter-input", filterRoot);
    var yearSelect = qs(".filter-year", filterRoot);
    var cards = qsa(".movie-filter-item");
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";

    if (filterInput && initialQuery) {
      filterInput.value = initialQuery;
    }

    function applyFilters() {
      var query = normalize(filterInput ? filterInput.value : "");
      var year = yearSelect ? yearSelect.value : "";

      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute("data-search"));
        var cardYear = card.getAttribute("data-year") || "";
        var matchesQuery = !query || haystack.indexOf(query) !== -1;
        var matchesYear = !year || cardYear === year;
        card.classList.toggle("hidden", !(matchesQuery && matchesYear));
      });
    }

    if (filterInput) {
      filterInput.addEventListener("input", applyFilters);
    }

    if (yearSelect) {
      yearSelect.addEventListener("change", applyFilters);
    }

    applyFilters();
  }
})();
