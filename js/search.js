/* ============================================================
   Ahmed AI Academic — hub search (home page cards)
   Behavior unchanged from the original academy.html inline script,
   plus: pressing Enter jumps to the full Global Search page (#search)
   carrying the typed term along.
   ============================================================ */
function initHubSearch() {
  const input = document.getElementById('hubSearch');
  if (!input) return;
  const cards = document.querySelectorAll('[data-searchable]');
  input.addEventListener('input', () => {
    const term = input.value.trim().toLowerCase();
    cards.forEach((card) => {
      const text = card.textContent.toLowerCase();
      card.style.display = term === '' || text.includes(term) ? '' : 'none';
    });
  });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && input.value.trim()) {
      try { sessionStorage.setItem('academy:pending-search', input.value.trim()); } catch (err) { /* ignore */ }
      location.hash = 'search';
    }
  });
}
