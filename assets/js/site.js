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
    number: '17',
    title: 'Landscapes shaped by the breath',
    copy: 'From Patagonia to Pù Luông, each setting brings its own pace and presence to the practice.',
    link: 'Explore every location'
  },
  spain: {
    region: 'Spain · 4 landscapes',
    number: '5',
    title: 'Atlantic edges and island light',
    copy: 'Sessions made in Camposancos, Mallorca, Galicia and La Guardia, including Spanish-language guidance and creative-flow practices.',
    link: 'View Spain locations'
  },
  germany: {
    region: 'Germany · 3 landscapes',
    number: '11',
    title: 'Home ground and open horizons',
    copy: 'Hamburg, the Elbe River and the fields around Jork became recurring spaces for calm, clarity and active breathing.',
    link: 'View Germany locations'
  },
  england: {
    region: 'England · 1 landscape',
    number: '4',
    title: 'Beginnings beside the south coast',
    copy: 'Eastbourne holds some of the earliest SpaceBreath practices in English and German.',
    link: 'View England location'
  },
  argentina: {
    region: 'Argentina · 2 landscapes',
    number: '3',
    title: 'Patagonian space and stillness',
    copy: 'El Bolsón and the wider Patagonian landscape shaped both quiet evening breathing and active morning energy.',
    link: 'View Argentina locations'
  },
  thailand: {
    region: 'Thailand · 2 landscapes',
    number: '3',
    title: 'Warmth, colour and island rhythm',
    copy: 'Ko Pha Ngan and Koh Lanta became settings for happiness, activation and grounding.',
    link: 'View Thailand locations'
  },
  vietnam: {
    region: 'Vietnam · 3 landscapes',
    number: '4',
    title: 'Valleys, ritual and everyday life',
    copy: 'Hữu Lũng, Pù Luông and Hội An frame deep journeys, calming sessions and a morning ritual.',
    link: 'View Vietnam locations'
  },
  indonesia: {
    region: 'Indonesia · 2 landscapes',
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
});

if (atlasLink) {
  atlasLink.addEventListener('click', () => {
    const selectedMarker = document.querySelector('[data-map-country][aria-pressed="true"]');
    if (selectedMarker) selectLocation(selectedMarker.dataset.mapCountry, true);
  });
}
