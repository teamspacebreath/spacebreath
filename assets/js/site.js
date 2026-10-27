// Keep directly entered /index.html addresses visually consistent with the
// clean directory URLs used throughout the site.
if (window.location.pathname.endsWith('/index.html')) {
  const cleanPath = window.location.pathname.slice(0, -'index.html'.length);
  window.history.replaceState(null, '', `${cleanPath}${window.location.search}${window.location.hash}`);
}

const header = document.querySelector('[data-header]');
const menuButton = document.querySelector('[data-menu-toggle]');
const menu = document.querySelector('[data-menu]');

const setHeaderState = () => header.classList.toggle('scrolled', window.scrollY > 24);
const closeMenu = () => {
  menu.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.querySelector('.sr-only').textContent = 'Open menu';
  document.body.classList.remove('menu-open');
};

menuButton.addEventListener('click', () => {
  const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!isOpen));
  menuButton.querySelector('.sr-only').textContent = isOpen ? 'Open menu' : 'Close menu';
  menu.classList.toggle('open', !isOpen);
  document.body.classList.toggle('menu-open', !isOpen);
});

menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeMenu();
});
window.addEventListener('resize', () => {
  if (window.innerWidth > 900) closeMenu();
});
window.addEventListener('pageshow', closeMenu);
window.addEventListener('scroll', setHeaderState, { passive: true });
setHeaderState();

const revealObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('visible');
    observer.unobserve(entry.target);
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));

const sessionFilters = document.querySelectorAll('[data-session-filter]');
const sessionCards = document.querySelectorAll('[data-session-card]');
const noSessionResults = document.querySelector('[data-no-session-results]');

if (sessionCards.length) {
  document.querySelectorAll('[data-session-count]').forEach((element) => {
    element.textContent = String(sessionCards.length);
  });
} else if (document.querySelector('[data-session-count]')) {
  fetch('/sessions/')
    .then((response) => response.ok ? response.text() : Promise.reject(new Error('Sessions page unavailable')))
    .then((html) => {
      const documentCopy = new DOMParser().parseFromString(html, 'text/html');
      const currentSessionCount = documentCopy.querySelectorAll('[data-session-card]').length;
      if (!currentSessionCount) return;
      document.querySelectorAll('[data-session-count]').forEach((element) => {
        element.textContent = String(currentSessionCount);
      });
    })
    .catch(() => {
      // Keep the server-rendered fallback when the archive cannot be reached.
    });
}

sessionFilters.forEach((button) => {
  button.addEventListener('click', () => {
    const selectedFilter = button.dataset.sessionFilter;
    let visibleCount = 0;

    sessionFilters.forEach((filterButton) => {
      const isActive = filterButton === button;
      filterButton.classList.toggle('active', isActive);
      filterButton.setAttribute('aria-pressed', String(isActive));
    });

    sessionCards.forEach((card) => {
      const tags = card.dataset.tags.split(' ');
      const isVisible = selectedFilter === 'all' || tags.includes(selectedFilter);
      card.classList.toggle('is-hidden', !isVisible);
      card.setAttribute('aria-hidden', String(!isVisible));
      if (isVisible) visibleCount += 1;
    });

    if (noSessionResults) noSessionResults.hidden = visibleCount !== 0;
  });
});

const locationFilters = document.querySelectorAll('[data-location-filter]');
const locationCards = document.querySelectorAll('[data-location-card]');
const mapMarkers = document.querySelectorAll('[data-map-country]');
const noLocationResults = document.querySelector('[data-no-location-results]');
const atlasRegion = document.querySelector('[data-atlas-region]');
const atlasNumber = document.querySelector('[data-atlas-number]');
const atlasTitle = document.querySelector('[data-atlas-title]');
const atlasCopy = document.querySelector('[data-atlas-copy]');
const atlasLink = document.querySelector('[data-atlas-link]');

const atlasCountries = {
  all: {
    region: 'Our evolving atlas',
    number: '14',
    title: 'Landscapes shaped by the breath',
    copy: 'From Patagonia to Pù Luông, each setting brings its own pace and presence to the practice.',
    link: 'Explore every location'
  },
  spain: {
    region: 'Spain · 2 locations',
    number: '8',
    title: 'Atlantic edges and island light',
    copy: 'Sessions made on the Galician coast at A Guarda and Camposancos, and in Mallorca, including Spanish-language guidance, coherent breathing and psychedelic breathing.',
    link: 'View Spain locations'
  },
  germany: {
    region: 'Germany · 2 locations',
    number: '11',
    title: 'Home ground and open horizons',
    copy: 'Hamburg, the Elbe River and the fields around Jork became recurring spaces for calm, clarity and active breathing.',
    link: 'View Germany locations'
  },
  england: {
    region: 'England · 1 location',
    number: '4',
    title: 'Beginnings beside the south coast',
    copy: 'Eastbourne holds some of the earliest SpaceBreath practices in English and German.',
    link: 'View England location'
  },
  argentina: {
    region: 'Argentina · 2 locations',
    number: '3',
    title: 'Patagonian space and stillness',
    copy: 'El Bolsón and the wider Patagonian landscape shaped both quiet evening breathing and active morning energy.',
    link: 'View Argentina locations'
  },
  thailand: {
    region: 'Thailand · 2 locations',
    number: '3',
    title: 'Warmth, colour and island rhythm',
    copy: 'Ko Pha Ngan and Koh Lanta became settings for happiness, activation and grounding.',
    link: 'View Thailand locations'
  },
  vietnam: {
    region: 'Vietnam · 3 locations',
    number: '4',
    title: 'Valleys, ritual and everyday life',
    copy: 'Hữu Lũng, Pù Luông and Hội An frame deep journeys, calming sessions and a morning ritual.',
    link: 'View Vietnam locations'
  },
  indonesia: {
    region: 'Indonesia · 2 locations',
    number: '2',
    title: 'Island practices in balance and flow',
    copy: 'Gili Air and Lombok bring tropical openness to box breathing and rhythmic energy work.',
    link: 'View Indonesia locations'
  }
};

const selectLocation = (country, shouldScroll = false) => {
  let visibleCount = 0;

  locationFilters.forEach((button) => {
    const isActive = button.dataset.locationFilter === country;
    button.classList.toggle('active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });

  mapMarkers.forEach((marker) => {
    marker.setAttribute('aria-pressed', String(marker.dataset.mapCountry === country));
  });

  locationCards.forEach((card) => {
    const isVisible = country === 'all' || card.dataset.country === country;
    card.classList.toggle('is-hidden', !isVisible);
    card.setAttribute('aria-hidden', String(!isVisible));
    if (isVisible) visibleCount += 1;
  });

  if (noLocationResults) noLocationResults.hidden = visibleCount !== 0;

  const details = atlasCountries[country] || atlasCountries.all;
  if (atlasRegion) atlasRegion.textContent = details.region;
  if (atlasNumber) atlasNumber.textContent = details.number;
  if (atlasTitle) atlasTitle.textContent = details.title;
  if (atlasCopy) atlasCopy.textContent = details.copy;
  if (atlasLink) atlasLink.textContent = details.link;

  if (shouldScroll) {
    document.querySelector('#location-stories')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

locationFilters.forEach((button) => {
  button.addEventListener('click', () => selectLocation(button.dataset.locationFilter));
});

mapMarkers.forEach((marker) => {
  marker.addEventListener('click', () => selectLocation(marker.dataset.mapCountry));
  marker.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    selectLocation(marker.dataset.mapCountry);
  });
});

if (atlasLink) {
  atlasLink.addEventListener('click', () => {
    const selectedMarker = document.querySelector('[data-map-country][aria-pressed="true"]');
    if (selectedMarker) selectLocation(selectedMarker.dataset.mapCountry, true);
  });
}

document.querySelectorAll('[data-location-carousel]').forEach((carousel) => {
  const slides = [...carousel.querySelectorAll('[data-location-slide]')];
  const currentLabel = carousel.querySelector('[data-carousel-current]');
  const previousButton = carousel.querySelector('[data-carousel-prev]');
  const nextButton = carousel.querySelector('[data-carousel-next]');
  let currentIndex = 0;
  let touchStartX = 0;

  const showSlide = (nextIndex) => {
    currentIndex = (nextIndex + slides.length) % slides.length;
    slides.forEach((slide, index) => {
      slide.hidden = index !== currentIndex;
      slide.setAttribute('aria-hidden', String(index !== currentIndex));
    });
    if (currentLabel) currentLabel.textContent = String(currentIndex + 1);
  };

  previousButton?.addEventListener('click', () => showSlide(currentIndex - 1));
  nextButton?.addEventListener('click', () => showSlide(currentIndex + 1));

  carousel.addEventListener('touchstart', (event) => {
    touchStartX = event.changedTouches[0].clientX;
  }, { passive: true });
  carousel.addEventListener('touchend', (event) => {
    const distance = event.changedTouches[0].clientX - touchStartX;
    if (Math.abs(distance) < 45) return;
    showSlide(currentIndex + (distance < 0 ? 1 : -1));
  }, { passive: true });

  showSlide(0);
});

// Click-to-load YouTube player: nothing loads from YouTube until the visitor presses play.
document.querySelectorAll('.video-facade').forEach((button) => {
  button.addEventListener('click', () => {
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.youtube-nocookie.com/embed/${button.dataset.videoId}?rel=0&autoplay=1`;
    iframe.title = button.dataset.videoTitle || 'SpaceBreath session video';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    iframe.allowFullscreen = true;
    button.replaceWith(iframe);
    iframe.focus();
  }, { once: true });
});

// If a grid ends with a single card on its own row, turn that card into a full-width feature card.
// Works out the rows arithmetically (so it never feeds back on itself) and re-runs when filters change
// or the window is resized, so it keeps working as new sessions and locations are added.
(() => {
  const grids = [...document.querySelectorAll('.sessions-grid, .location-grid')];
  if (!grids.length) return;
  const fill = (grid) => {
    const items = [...grid.children];
    const cs = getComputedStyle(grid);
    const tracks = cs.gridTemplateColumns.split(' ').filter(Boolean).map(parseFloat);
    const cols = tracks.length;
    const gap = parseFloat(cs.columnGap) || 0;
    const visible = items.filter((el) => getComputedStyle(el).display !== 'none');
    let target = null;
    if (cols >= 2 && visible.length >= 2) {
      const spanOf = (el) => { if (el.classList.contains('is-fill')) return 1; const m = /span (\d+)/.exec(getComputedStyle(el).gridColumnEnd); return m ? +m[1] : 1; };
      let pos = 0, lastStartsRow = false;
      visible.forEach((el, i) => {
        const s = Math.min(spanOf(el), cols);
        if (pos + s > cols) pos = 0;
        if (i === visible.length - 1) lastStartsRow = pos === 0;
        pos = (pos + s) % cols;
      });
      const last = visible[visible.length - 1];
      if (lastStartsRow && spanOf(last) < cols) target = last;
    }
    items.forEach((el) => { const want = el === target; if (el.classList.contains('is-fill') !== want) el.classList.toggle('is-fill', want); });
  };
  const run = () => grids.forEach(fill);
  let t;
  const schedule = () => { clearTimeout(t); t = setTimeout(run, 60); };
  window.addEventListener('resize', schedule);
  grids.forEach((g) => new MutationObserver((muts) => {
    if (muts.some((m) => !(m.attributeName === 'class' && m.target.classList.contains('is-fill') !== m.oldValue?.includes('is-fill')))) schedule();
  }).observe(g, { attributes: true, subtree: true, attributeFilter: ['class', 'hidden'], attributeOldValue: true }));
  run();
})();

// Keep a single word from sitting alone on the last line of headings and short text.
// Measures on the real screen: joins the last two words only when they fit, and re-checks on resize.
(() => {
  const SEL = 'h1, h2, h3, h4, .article-deck, .session-intention-lead, .text-link, .location-card-copy > p, .process-card p, .intro-copy p';
  const NB = ' ';
  const lastWords = (el) => {
    const nodes = [];
    const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = w.nextNode())) nodes.push(n);
    // find the last two word boundaries across text nodes, stopping at a <br>
    for (let i = nodes.length - 1; i >= 0; i--) {
      const node = nodes[i];
      const text = node.data.replace(/\s+$/, '');
      const idx = Math.max(text.lastIndexOf(' '), text.lastIndexOf(NB));
      if (idx > 0) return { node, idx, isNb: text[idx] === NB };
      if (text.trim()) {
        // last word starts at the beginning of this node; the gap is at the end of a previous node
        let prev = node.previousSibling || node.parentNode.previousSibling;
        if (prev && prev.nodeName === 'BR') return null;
        for (let j = i - 1; j >= 0; j--) {
          const d = nodes[j].data;
          if (/[  ]$/.test(d)) return { node: nodes[j], idx: d.length - 1, isNb: d.endsWith(NB) };
          if (d.trim()) return null;
        }
        return null;
      }
    }
    return null;
  };
  const top = (node, i) => { const r = document.createRange(); r.setStart(node, i); r.setEnd(node, i + 1); const rects = r.getClientRects(); return rects.length ? rects[0].top : null; };
  const fix = (el) => {
    if (el.dataset.nbJoined) { // undo previous join before re-measuring
      const s = JSON.parse(el.dataset.nbJoined); delete el.dataset.nbJoined;
      const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT); let k = 0, n;
      while ((n = w.nextNode())) { if (k++ === s.k) { n.data = n.data.slice(0, s.i) + ' ' + n.data.slice(s.i + 1); break; } }
    }
    const lw = lastWords(el);
    if (!lw || lw.isNb) return;
    const node = lw.node, i = lw.idx;
    const before = top(node, Math.max(0, i - 1)), after = top(node, i + 1 <= node.data.length - 1 ? i + 1 : i);
    // last word on its own line? (compare the char before the gap with the end of the element)
    const endR = document.createRange(); endR.selectNodeContents(el); const rects = endR.getClientRects();
    if (!rects.length || before === null) return;
    const lastTop = rects[rects.length - 1].top;
    if (Math.abs(lastTop - before) < 4) return; // already on the same line
    const original = node.data;
    const wBefore = el.getBoundingClientRect().width;
    const docBefore = document.documentElement.scrollWidth;
    node.data = original.slice(0, i) + NB + original.slice(i + 1);
    if (el.scrollWidth > el.clientWidth + 1 || el.getBoundingClientRect().width > wBefore + 1 || document.documentElement.scrollWidth > docBefore) { node.data = original; return; }
    const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT); let k = 0, n;
    while ((n = w.nextNode())) { if (n === node) break; k++; }
    el.dataset.nbJoined = JSON.stringify({ k, i });
  };
  const run = () => document.querySelectorAll(SEL).forEach((el) => { if (el.offsetParent !== null) fix(el); });
  let t;
  window.addEventListener('resize', () => { clearTimeout(t); t = setTimeout(run, 150); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(run); else window.addEventListener('load', run);
})();
