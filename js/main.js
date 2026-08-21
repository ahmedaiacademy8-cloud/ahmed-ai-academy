/* ============================================================
   Ahmed AI Academic — page wiring
   - Mobile nav toggle (unchanged behavior)
   - Cheat-sheet print button (delegated, works for dynamically
     rendered lessons)
   - Comments: Foundation Refactor adds localStorage persistence,
     scoped per lesson slug, and clearly labelled as device-local
     storage (see .storage-note in the rendered comment form).
     Previously comments were session-only and vanished on refresh.
   ============================================================ */

function initMobileNav() {
  const toggle = document.getElementById('navToggle');
  const nav = document.querySelector('.a-nav');
  if (!toggle || !nav) return;
  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });
}

// Delegated: works no matter how many times lesson content re-renders.
document.addEventListener('click', (e) => {
  if (e.target.closest('.print-cheat-btn')) {
    window.print();
  }
});

function escapeHtmlComment(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function commentsStorageKey(slug) {
  return `academy:comments:${slug}`;
}

function loadComments(slug) {
  try {
    const raw = localStorage.getItem(commentsStorageKey(slug));
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.warn('Could not read comments from localStorage.', err);
    return [];
  }
}

function saveComment(slug, comment) {
  try {
    const list = loadComments(slug);
    list.unshift(comment);
    localStorage.setItem(commentsStorageKey(slug), JSON.stringify(list));
  } catch (err) {
    console.warn('Could not save comment to localStorage (storage may be full or disabled).', err);
  }
}

function renderCommentItem(comment) {
  const item = document.createElement('div');
  item.className = 'comment-item';
  item.innerHTML = `<div class="who">${escapeHtmlComment(comment.name)}</div><p>${escapeHtmlComment(comment.text)}</p><div class="when">${escapeHtmlComment(comment.when)}</div>`;
  return item;
}

function initComments(scope) {
  scope = scope || document;
  const form = scope.querySelector('#commentForm');
  if (!form) return;
  const slug = form.dataset.lessonSlug || 'general';
  const list = scope.querySelector('#commentList');

  loadComments(slug).forEach((c) => list.appendChild(renderCommentItem(c)));

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = form.querySelector('[name=name]').value.trim() || 'زائر';
    const text = form.querySelector('[name=text]').value.trim();
    if (!text) return;
    const comment = { name, text, when: 'الآن' };
    list.prepend(renderCommentItem(comment));
    saveComment(slug, comment);
    form.reset();
  });
}
