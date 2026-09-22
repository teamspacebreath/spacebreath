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
