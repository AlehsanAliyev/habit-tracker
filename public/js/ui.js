document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('[data-nav-toggle]');
  const menu = document.querySelector('[data-nav-menu]');

  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      menu.classList.toggle('is-open');
    });
  }

  const path = window.location.pathname;
  document.querySelectorAll('.nav-link').forEach((link) => {
    const href = link.getAttribute('href');
    if (!href) return;
    if (href === '/' && path === '/') {
      link.classList.add('is-active');
    } else if (href !== '/' && path.startsWith(href)) {
      link.classList.add('is-active');
    }
  });

  document.querySelectorAll('.flash').forEach((flash) => {
    setTimeout(() => {
      flash.classList.add('is-hidden');
    }, 4500);
  });

  document.querySelectorAll('[data-date]').forEach((el) => {
    const raw = el.getAttribute('data-date');
    const parsed = new Date(raw);
    if (Number.isNaN(parsed.getTime())) return;
    el.textContent = parsed.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: '2-digit',
      year: 'numeric'
    });
  });
});
