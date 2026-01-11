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

  const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

  const modal = document.querySelector('[data-log-modal]');
  if (modal) {
    const titleEl = modal.querySelector('[data-modal-title]');
    const dateEl = modal.querySelector('[data-modal-date]');
    const saveBtn = modal.querySelector('[data-modal-save]');
    const closeBtns = modal.querySelectorAll('[data-modal-close]');
    const scoreButtons = modal.querySelectorAll('.score-option');
    let activeCell = null;
    let activeHabitId = null;
    let activeDate = null;
    let selectedScore = null;

    const scoreClasses = ['is-good', 'is-warn', 'is-bad', 'is-muted', 'is-empty'];
    const applyScoreClass = (cell, score) => {
      scoreClasses.forEach((cls) => cell.classList.remove(cls));
      if (score === 2 || score === '2') cell.classList.add('is-good');
      else if (score === 1 || score === '1') cell.classList.add('is-warn');
      else if (score === 0 || score === '0') cell.classList.add('is-bad');
      else if (score === 'f') cell.classList.add('is-muted');
      else cell.classList.add('is-empty');
    };

    const setSelectedScore = (score) => {
      selectedScore = score;
      scoreButtons.forEach((btn) => {
        btn.classList.toggle('is-selected', btn.getAttribute('data-score') === score);
      });
    };

    const openModal = (cell) => {
      activeCell = cell;
      activeHabitId = cell.getAttribute('data-habit-id');
      activeDate = cell.getAttribute('data-date');
      const habitTitle = cell.getAttribute('data-habit-title');
      const currentScore = cell.getAttribute('data-score');
      titleEl.textContent = `Log ${habitTitle}`;
      dateEl.textContent = activeDate;
      setSelectedScore(currentScore && currentScore !== 'null' ? currentScore : null);
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
    };

    const closeModal = () => {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
    };

    document.querySelectorAll('.heatmap-btn').forEach((cell) => {
      cell.addEventListener('click', () => openModal(cell));
    });

    scoreButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        setSelectedScore(btn.getAttribute('data-score'));
      });
    });

    closeBtns.forEach((btn) => {
      btn.addEventListener('click', closeModal);
    });

    saveBtn.addEventListener('click', async () => {
      if (!activeHabitId || !activeDate || selectedScore === null) return;

      const response = await fetch(`/habits/${activeHabitId}/logs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(csrfToken ? { 'csrf-token': csrfToken } : {})
        },
        body: JSON.stringify({ date: activeDate, score: selectedScore })
      });

      if (!response.ok) return;
      const payload = await response.json();
      if (activeCell) {
        activeCell.setAttribute('data-score', payload.score);
        applyScoreClass(activeCell, payload.score);
      }
      closeModal();
    });
  }
});
