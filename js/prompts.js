/* ============================================================
   Ahmed AI Academic — prompt library behavior
   Same logic as the original inline script, adapted to accept a
   scope element since prompt cards are now rendered dynamically
   into #dynamic-route instead of always existing in the DOM.
   ============================================================ */

function initCopyButtons(scope) {
  scope = scope || document;
  scope.querySelectorAll('.copy-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = document.getElementById(btn.dataset.target);
      if (!target) return;
      const text = target.innerText;
      navigator.clipboard.writeText(text).then(() => {
        const original = btn.textContent;
        btn.textContent = 'تم النسخ ✓';
        btn.classList.add('copied');
        setTimeout(() => {
          btn.textContent = original;
          btn.classList.remove('copied');
        }, 1800);
      }).catch(() => {
        // Clipboard API can fail (older browsers, insecure context). Fail silently
        // rather than throw — copying is a convenience, not critical functionality.
      });
    });
  });
}

function initPromptFilters(scope) {
  scope = scope || document;
  const buttons = scope.querySelectorAll('.prompt-filters button');
  const cards = scope.querySelectorAll('.prompt-card');
  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      buttons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      cards.forEach((card) => {
        card.style.display = filter === 'all' || card.dataset.category === filter ? '' : 'none';
      });
    });
  });
}
