(() => {
  const menuButton = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.main-nav');

  if (menuButton && nav) {
    menuButton.addEventListener('click', () => {
      const open = nav.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  document.querySelectorAll('[data-carousel]').forEach((carousel) => {
    const slides = [...carousel.querySelectorAll('.hero-slide')];
    const dots = [...carousel.querySelectorAll('.hero-dot')];
    const prev = carousel.querySelector('.hero-prev');
    const next = carousel.querySelector('.hero-next');
    let current = 0;
    let timer = null;

    const show = (index) => {
      if (!slides.length) return;
      current = (index + slides.length) % slides.length;
      slides.forEach((slide, idx) => slide.classList.toggle('is-active', idx === current));
      dots.forEach((dot, idx) => dot.classList.toggle('is-active', idx === current));
    };

    const start = () => {
      stop();
      timer = window.setInterval(() => show(current + 1), 5200);
    };

    const stop = () => {
      if (timer) window.clearInterval(timer);
    };

    prev && prev.addEventListener('click', () => {
      show(current - 1);
      start();
    });

    next && next.addEventListener('click', () => {
      show(current + 1);
      start();
    });

    dots.forEach((dot, idx) => {
      dot.addEventListener('click', () => {
        show(idx);
        start();
      });
    });

    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    show(0);
    start();
  });

  document.querySelectorAll('[data-library-controls]').forEach((controls) => {
    const section = controls.closest('section');
    const grid = section ? section.querySelector('[data-movie-grid]') : null;
    const cards = grid ? [...grid.querySelectorAll('.movie-card')] : [];
    const search = controls.querySelector('[data-search-input]');
    const year = controls.querySelector('[data-year-filter]');
    const type = controls.querySelector('[data-type-filter]');
    const sortButtons = [...controls.querySelectorAll('[data-sort]')];

    const apply = () => {
      const keyword = (search && search.value || '').trim().toLowerCase();
      const yearValue = year && year.value || '';
      const typeValue = type && type.value || '';

      cards.forEach((card) => {
        const text = [card.dataset.title, card.dataset.region, card.dataset.year, card.dataset.type, card.dataset.category].join(' ').toLowerCase();
        const yearMatch = !yearValue || card.dataset.year === yearValue;
        const typeMatch = !typeValue || (card.dataset.type || '').includes(typeValue);
        const textMatch = !keyword || text.includes(keyword);
        card.classList.toggle('is-filtered-out', !(yearMatch && typeMatch && textMatch));
      });
    };

    const sortCards = (key) => {
      if (!grid) return;
      const sorted = [...cards].sort((a, b) => {
        if (key === 'title') return (a.dataset.title || '').localeCompare(b.dataset.title || '', 'zh-CN');
        const av = Number(a.dataset[key] || 0);
        const bv = Number(b.dataset[key] || 0);
        return bv - av;
      });
      sorted.forEach((card) => grid.appendChild(card));
      apply();
    };

    search && search.addEventListener('input', apply);
    year && year.addEventListener('change', apply);
    type && type.addEventListener('change', apply);
    sortButtons.forEach((button) => button.addEventListener('click', () => sortCards(button.dataset.sort)));
    apply();
  });

  window.initMoviePlayer = (videoId, coverId, source) => {
    const video = document.getElementById(videoId);
    const cover = document.getElementById(coverId);
    if (!video || !cover || !source) return;

    let ready = false;
    let hls = null;

    const play = () => {
      if (!ready) {
        ready = true;
        cover.classList.add('is-hidden');

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          video.play().catch(() => {});
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, () => {
            video.play().catch(() => {});
          });
          return;
        }

        video.src = source;
      }

      video.play().catch(() => {});
    };

    cover.addEventListener('click', play);
    video.addEventListener('click', () => {
      if (video.paused) play();
    });
    video.addEventListener('play', () => cover.classList.add('is-hidden'));
    window.addEventListener('pagehide', () => {
      if (hls) hls.destroy();
    });
  };
})();
