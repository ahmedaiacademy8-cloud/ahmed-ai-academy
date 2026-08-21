/* ============================================================
   Ahmed AI Academic — hash router
   Static routes ("home") stay as plain HTML in academy.html.
   Dynamic routes (path/*, lesson/*, tool/*, prompts) are rendered
   at runtime from data/*.json into #dynamic-route.
   Includes a fallback for unknown hashes (Foundation Refactor
   requirement — the original router had no fallback).
   ============================================================ */

function pathStepMarkup(step, pathId) {
  const doneClass = '';
  const isPaid = step.accessType === 'paid';
  const unlocked = isPaid && typeof AccessGate !== 'undefined' && AccessGate.isUnlocked(step.paidLessonId || step.slug);

  if (step.locked && !(isPaid && unlocked)) {
    // Same visual as a free "coming soon" lesson, per the founder's decision —
    // paid-but-locked and not-yet-written are intentionally indistinguishable here.
    return `
      <div class="path-step locked">
        <span class="num">الدرس ${step.order}</span>
        <a href="javascript:void(0)" aria-disabled="true" tabindex="-1">
          <h4>${escapeHtml(step.title)} <span class="soon-badge">🔒 قريبًا</span></h4>
        </a>
      </div>`;
  }
  if (isPaid && unlocked && step.slug) {
    return `
      <div class="path-step">
        <span class="num">الدرس ${step.order}</span>
        <a href="#lesson/${step.slug}">
          <h4>${escapeHtml(step.title)} <span style="color:var(--gold);font-size:.78rem;">💳 متاح ليك</span></h4>
        </a>
      </div>`;
  }
  return `
    <div class="path-step ${doneClass}">
      <span class="num">الدرس ${step.order}</span>
      <a href="#lesson/${step.slug}">
        <h4>${escapeHtml(step.title)} <span style="color:var(--success);font-size:.78rem;">✅ متاح</span></h4>
      </a>
    </div>`;
}

function renderPathRoute(container, pathId, data) {
  const pathFile = data.pathsById[pathId];
  if (!pathFile) return false;
  const stepsHtml = pathFile.lessons.map((s) => pathStepMarkup(s, pathId)).join('');
  container.innerHTML = `
    <section class="a-section">
      <div class="a-section-head">
        <span class="tag">${pathId === 'ai-fundamentals' ? 'أساسيات الذكاء الاصطناعي' : 'هندسة البرومبت الاحترافية'}</span>
        <h2>${escapeHtml(pathFile.pathTitle)}</h2>
      </div>
      <div class="path-rail wrap" style="max-width:720px;">
        ${stepsHtml}
      </div>
      <p style="text-align:center;margin-top:30px;color:var(--text-dim-2);font-size:0.85rem;">🔒 الدروس المقفولة بيتم كتابتها بنفس مستوى الجودة والتفصيل، وهتتاح تباعًا في الدفعات الجاية.</p>
    </section>`;
  return true;
}

function renderLessonRoute(container, slug, data) {
  const lesson = data.lessonsBySlug[slug];
  if (!lesson) return false;

  const isPaid = lesson.accessType === 'paid';
  const unlocked = !isPaid || (typeof AccessGate !== 'undefined' && AccessGate.isUnlocked(lesson.paidLessonId || lesson.slug));
  if (isPaid && !unlocked) {
    container.innerHTML = `
      <div class="wrap" style="max-width:640px;padding:60px 6%;">
        <div class="lesson-crumb"><a href="#home">الرئيسية</a> ← <a href="#path/${lesson.pathId}">${escapeHtml(lesson.pathTitle)}</a> ← ${escapeHtml(lesson.title)}</div>
      </div>`;
    const gateWrap = document.createElement('div');
    gateWrap.className = 'wrap';
    gateWrap.style.maxWidth = '640px';
    gateWrap.style.paddingBottom = '80px';
    const gate = AccessGate.renderGateForm(lesson.paidLessonId || lesson.slug, {
      onUnlock: () => showRoute(),
    });
    gateWrap.appendChild(gate);
    container.appendChild(gateWrap);
    return true;
  }

  const tocHtml = lesson.sections.map((s) => `<a href="javascript:void(0)" data-scroll="${s.id}">${escapeHtml(s.label)}</a>`).join('');
  const sectionsHtml = lesson.sections.map((s) => {
    if (s.key === 'quiz') {
      return `<section class="lesson-section" id="${s.id}">${s.html}</section>`;
    }
    return `<section class="lesson-section" id="${s.id}">${s.html}</section>`;
  }).join('');

  const nextPager = lesson.nextLesson
    ? `<a href="#lesson/${lesson.nextLesson}"><span class="dir">الدرس التالي ←</span><br><span class="title">${escapeHtml(lesson.nextLessonTitle || '')}</span></a>`
    : `<a href="#${'path/' + lesson.pathId}"><span class="dir">باقي المسار</span><br><span class="title">دروس هتتاح قريبًا</span></a>`;

  container.innerHTML = `
    <div class="lesson-shell">
      <aside class="lesson-toc">
        <h5>محتويات الدرس</h5>
        ${tocHtml}
      </aside>
      <main class="printArea">
        <div class="lesson-crumb">
          <a href="#home">الرئيسية</a> ← <a href="#path/${lesson.pathId}">${escapeHtml(lesson.pathTitle)}</a> ← ${escapeHtml(lesson.title)}
        </div>
        <div class="lesson-head">
          <h1>${escapeHtml(lesson.title)}</h1>
        </div>
        ${sectionsHtml}
        <section class="lesson-section" id="lesson-${slug}-comments">
          <h2><span class="dot"></span> تعليقات الطلاب</h2>
          <form id="commentForm" class="comment-box" data-lesson-slug="${slug}">
            <input type="text" name="name" class="comment-name-input" placeholder="اسمك (اختياري)" aria-label="اسمك">
            <textarea name="text" placeholder="اكتب تعليقك أو سؤالك عن الدرس..." aria-label="تعليقك"></textarea>
            <p class="storage-note">💾 التعليقات محفوظة على جهازك فقط حاليًا (متصفحك)، ومش متزامنة مع أي سيرفر لسه.</p>
            <button type="submit" class="btn btn-gold btn-sm" style="margin-top:10px;">إرسال التعليق</button>
          </form>
          <div id="commentList"></div>
        </section>
        <div class="lesson-pager">
          <a href="#path/${lesson.pathId}"><span class="dir">رجوع للمسار</span><br><span class="title">${escapeHtml(lesson.pathTitle)}</span></a>
          ${nextPager}
        </div>
      </main>
    </div>`;

  // wire up interactive bits that depend on this specific DOM subtree
  container.querySelectorAll('.quiz-box').forEach((box) => {
    initQuiz(box, (score, total) => {
      if (typeof Progress !== 'undefined') {
        Progress.recordLessonComplete(lesson.id, lesson.pathId, lesson.title, score, total);
      }
    });
  });
  if (typeof Progress !== 'undefined') {
    Progress.recordLessonStarted(lesson.id, lesson.pathId, lesson.title);
  }
  container.querySelectorAll('[data-scroll]').forEach((el) => {
    el.addEventListener('click', () => {
      const target = document.getElementById(el.dataset.scroll);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
  initComments(container);
  return true;
}

function renderToolRoute(container, slug, data) {
  const tool = data.toolsBySlug[slug];
  if (!tool) return false;
  const tocHtml = tool.orderedSections.map((s) => `<a href="javascript:void(0)" data-scroll="${s.id}">${escapeHtml(s.label)}</a>`).join('');
  const sectionsHtml = tool.orderedSections.map((s) => `<section class="lesson-section" id="${s.id}">${s.html}</section>`).join('');
  container.innerHTML = `
    <div class="lesson-shell">
      <aside class="lesson-toc">
        <h5>محتويات الدليل</h5>
        ${tocHtml}
      </aside>
      <main class="printArea">
        <div class="lesson-crumb"><a href="#home">الرئيسية</a> ← دليل ${escapeHtml(tool.name)}</div>
        <div class="lesson-head"><h1>${escapeHtml(tool.title)}</h1></div>
        ${sectionsHtml}
      </main>
    </div>`;
  container.querySelectorAll('[data-scroll]').forEach((el) => {
    el.addEventListener('click', () => {
      const target = document.getElementById(el.dataset.scroll);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
  return true;
}

function toolCardMarkup(tool) {
  const isFav = typeof Favorites !== 'undefined' && Favorites.isFavorite('tool', tool.id);
  return `
    <div class="a-card tool-dir-card" data-searchable data-category="${tool.category}" data-tags="${(tool.tags || []).join(',')}">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;">
        <div class="icon-tile">${tool.icon || '🤖'}</div>
        <button class="fav-btn" data-fav-type="tool" data-fav-id="${tool.id}" aria-label="أضف للمفضلة" style="background:transparent;border:none;font-size:1.2rem;cursor:pointer;color:${isFav ? 'var(--gold)' : 'var(--text-dim-2)'};">${isFav ? '★' : '☆'}</button>
      </div>
      <h3>${escapeHtml(tool.name)}</h3>
      <p>${escapeHtml(tool.shortDescription || '')}</p>
      <div class="meta">
        <span>💳 ${escapeHtml(tool.priceLabel || '')}</span>
        ${tool.rating ? `<span>⭐ ${tool.rating}</span>` : ''}
      </div>
      <a href="#tool/${tool.id}" class="go">اقرأ الدليل ←</a>
    </div>`;
}

function renderToolsDirectory(container, data) {
  const categories = Array.from(new Set(data.tools.map((t) => t.category)));
  const filterBtns = ['<button data-filter="all" class="active">الكل</button>']
    .concat(categories.map((c) => `<button data-filter="${c}">${escapeHtml(c)}</button>`)).join('');
  const cardsHtml = data.tools.map(toolCardMarkup).join('');

  container.innerHTML = `
    <section class="a-section">
      <div class="a-section-head">
        <span class="tag">دليل الأدوات</span>
        <h2>كل أدوات الذكاء الاصطناعي في مكان واحد</h2>
        <p>ابحث، فلتر حسب التصنيف، واحفظ في المفضلة.</p>
      </div>
      <div class="a-search" role="search" style="max-width:420px;margin:0 auto 24px;">
        <span aria-hidden="true">🔎</span>
        <input id="toolsDirSearch" type="text" placeholder="دور على أداة..." aria-label="ابحث عن أداة">
      </div>
      <div class="prompt-filters" id="toolsDirFilters">${filterBtns}</div>
      <div class="a-grid" id="toolsDirGrid">${cardsHtml}</div>
    </section>`;

  const grid = container.querySelector('#toolsDirGrid');
  const cards = grid.querySelectorAll('.tool-dir-card');
  const searchInput = container.querySelector('#toolsDirSearch');
  const filterBtnEls = container.querySelectorAll('#toolsDirFilters button');

  function applyFilters() {
    const term = (searchInput.value || '').trim().toLowerCase();
    const activeBtn = container.querySelector('#toolsDirFilters button.active');
    const activeFilter = activeBtn ? activeBtn.dataset.filter : 'all';
    cards.forEach((card) => {
      const text = card.textContent.toLowerCase();
      const matchesTerm = term === '' || text.includes(term);
      const matchesFilter = activeFilter === 'all' || card.dataset.category === activeFilter;
      card.style.display = matchesTerm && matchesFilter ? '' : 'none';
    });
  }
  searchInput.addEventListener('input', applyFilters);
  filterBtnEls.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtnEls.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      applyFilters();
    });
  });
  initFavoriteButtons(container);
  return true;
}

function initFavoriteButtons(scope) {
  scope.querySelectorAll('.fav-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const type = btn.dataset.favType;
      const id = btn.dataset.favId;
      const nowFav = Favorites.toggle(type, id);
      btn.textContent = nowFav ? '★' : '☆';
      btn.style.color = nowFav ? 'var(--gold)' : 'var(--text-dim-2)';
    });
  });
}

function renderFavoritesRoute(container, data) {
  const favTools = Favorites.getAll('tool').map((id) => data.toolsBySlug[id]).filter(Boolean);
  const favPrompts = Favorites.getAll('prompt').map((id) => data.promptsFile.prompts.find((p) => p.id === id)).filter(Boolean);
  const favLessons = Favorites.getAll('lesson').map((id) => data.lessonsBySlug[id]).filter(Boolean);

  const empty = favTools.length === 0 && favPrompts.length === 0 && favLessons.length === 0;

  container.innerHTML = `
    <section class="a-section">
      <div class="a-section-head">
        <span class="tag">مفضلتي</span>
        <h2>العناصر اللي حفظتها</h2>
        <p style="font-size:0.8rem;color:var(--text-dim-2);">💾 محفوظة على جهازك فقط حاليًا.</p>
      </div>
      ${empty ? '<p style="text-align:center;color:var(--text-dim-2);">لسه مفيش حاجة في المفضلة. دوس على ☆ في أي أداة أو برومبت أو درس.</p>' : ''}
      ${favTools.length ? `<h3 style="margin:20px 0 12px;">الأدوات</h3><div class="a-grid">${favTools.map(toolCardMarkup).join('')}</div>` : ''}
      ${favLessons.length ? `<h3 style="margin:30px 0 12px;">الدروس</h3><div class="a-grid">${favLessons.map((l) => `<div class="a-card"><h3>${escapeHtml(l.title)}</h3><a href="#lesson/${l.slug}" class="go">افتح الدرس ←</a></div>`).join('')}</div>` : ''}
      ${favPrompts.length ? `<h3 style="margin:30px 0 12px;">البرومبتات</h3><div class="a-grid">${favPrompts.map((p) => `<div class="a-card"><h3>${escapeHtml(p.title)}</h3><p>${escapeHtml(p.description)}</p></div>`).join('')}</div>` : ''}
    </section>`;
  initFavoriteButtons(container);
  return true;
}

function promptCardMarkup(p, opts) {
  opts = opts || {};
  const isFav = typeof Favorites !== 'undefined' && Favorites.isFavorite('prompt', p.id);
  const tagsHtml = (p.tags || []).map((t) => `<span style="display:inline-block;background:var(--obsidian);border:1px solid var(--line);border-radius:999px;padding:2px 10px;font-size:0.72rem;color:var(--text-dim-2);margin-left:6px;">#${escapeHtml(t)}</span>`).join('');
  return `
    <div class="prompt-card" data-category="${p.category}" data-searchable-prompt data-tags="${(p.tags || []).join(',')}">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;">
        <span class="cat-tag">${escapeHtml(p.categoryLabel)}</span>
        <div style="display:flex;gap:8px;">
          <button class="share-btn" data-share-id="${p.id}" aria-label="مشاركة" title="مشاركة" style="background:transparent;border:none;font-size:1.05rem;cursor:pointer;color:var(--text-dim-2);">🔗</button>
          <button class="fav-btn" data-fav-type="prompt" data-fav-id="${p.id}" aria-label="أضف للمفضلة" style="background:transparent;border:none;font-size:1.1rem;cursor:pointer;color:${isFav ? 'var(--gold)' : 'var(--text-dim-2)'};">${isFav ? '★' : '☆'}</button>
        </div>
      </div>
      <h3>${opts.linkTitle ? `<a href="#prompt/${p.id}" style="color:inherit;">${escapeHtml(p.title)}</a>` : escapeHtml(p.title)}</h3>
      <p class="body-text">${escapeHtml(p.description)}</p>
      <div class="prompt-box" id="${p.id}">${escapeHtml(p.promptText)}</div>
      <button class="copy-btn" data-target="${p.id}">📋 نسخ البرومبت</button>
      <p class="tip">${escapeHtml(p.tip)}</p>
      <div style="margin-top:10px;">${tagsHtml}</div>
    </div>`;
}

function initShareButtons(scope) {
  scope.querySelectorAll('.share-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.shareId;
      const url = `${location.origin}${location.pathname}#prompt/${id}`;
      if (navigator.share) {
        try { await navigator.share({ title: 'برومبت من أكاديمية Ahmed AI', url }); return; } catch (err) { /* user cancelled or unsupported, fall through to clipboard */ }
      }
      try {
        await navigator.clipboard.writeText(url);
        const original = btn.textContent;
        btn.textContent = '✓';
        setTimeout(() => { btn.textContent = original; }, 1500);
      } catch (err) { /* clipboard unavailable, silently ignore */ }
    });
  });
}

function renderPromptsRoute(container, data) {
  const filtersHtml = data.promptsFile.filters
    .map((f, i) => `<button data-filter="${f.filter}" class="${i === 0 ? 'active' : ''}">${escapeHtml(f.label)}</button>`)
    .join('');
  const cardsHtml = data.promptsFile.prompts.map((p) => promptCardMarkup(p, { linkTitle: true })).join('');
  container.innerHTML = `
    <section class="a-section">
      <div class="a-section-head">
        <span class="tag">مكتبة البرومبتات</span>
        <h2>برومبتات جاهزة للاستخدام فورًا</h2>
        <p>انسخ، عدّل التفاصيل بين الأقواس [ ]، واستخدمها في أي أداة ذكاء اصطناعي.</p>
      </div>
      <div class="a-search" role="search" style="max-width:420px;margin:0 auto 24px;">
        <span aria-hidden="true">🔎</span>
        <input id="promptsSearch" type="text" placeholder="دور على برومبت... مثلاً: تسويق، كود، تلخيص" aria-label="ابحث في البرومبتات">
      </div>
      <div class="prompt-filters">${filtersHtml}</div>
      <div class="a-grid" id="promptsGrid">${cardsHtml}</div>
    </section>`;
  initCopyButtons(container);
  initPromptFilters(container);
  initFavoriteButtons(container);
  initShareButtons(container);

  const searchInput = container.querySelector('#promptsSearch');
  const cards = container.querySelectorAll('#promptsGrid .prompt-card');
  searchInput.addEventListener('input', () => {
    const term = searchInput.value.trim().toLowerCase();
    cards.forEach((card) => {
      const text = card.textContent.toLowerCase();
      card.style.display = term === '' || text.includes(term) ? '' : 'none';
    });
  });
  return true;
}

function renderPromptDetailRoute(container, id, data) {
  const p = data.promptsFile.prompts.find((x) => x.id === id);
  if (!p) return false;
  const related = data.promptsFile.prompts.filter((x) => x.category === p.category && x.id !== p.id).slice(0, 2);
  container.innerHTML = `
    <div class="wrap" style="max-width:720px;padding:50px 6% 80px;">
      <div class="lesson-crumb"><a href="#home">الرئيسية</a> ← <a href="#prompts">مكتبة البرومبتات</a> ← ${escapeHtml(p.title)}</div>
      <div style="margin-top:20px;">${promptCardMarkup(p)}</div>
      ${related.length ? `<h3 style="margin:36px 0 16px;">برومبتات مشابهة</h3><div class="a-grid">${related.map((r) => promptCardMarkup(r, { linkTitle: true })).join('')}</div>` : ''}
    </div>`;
  initCopyButtons(container);
  initFavoriteButtons(container);
  initShareButtons(container);
  return true;
}

function renderDemoPaidLesson(container) {
  const lessonId = 'demo-paid-lesson';
  const unlocked = typeof AccessGate !== 'undefined' && AccessGate.isUnlocked(lessonId);
  const wrap = document.createElement('div');
  wrap.className = 'wrap';
  wrap.style.maxWidth = '640px';
  wrap.style.padding = '60px 6% 80px';

  const intro = document.createElement('div');
  intro.innerHTML = `
    <div class="lesson-crumb"><a href="#home">الرئيسية</a> ← تجربة نظام الأكواد (Demo)</div>
    <div class="lesson-head"><h1>🧪 صفحة تجربة: نظام فتح الدروس المدفوعة</h1></div>
    <p>الصفحة دي مش درس حقيقي — هي مجرد إثبات إن آلية الكود شغالة قبل ما تضيف دورة مدفوعة حقيقية.
    جرب تكتب الكود <strong style="color:var(--gold);">DEMO-1234</strong> تحت.</p>`;
  wrap.appendChild(intro);

  if (unlocked) {
    const success = document.createElement('div');
    success.className = 'callout tip';
    success.innerHTML = '<strong>تم الفتح ✓</strong><p style="margin:8px 0 0;">لو كان ده درس حقيقي، محتواه كان هيبان هنا بدل الرسالة دي.</p>';
    wrap.appendChild(success);
  } else {
    wrap.appendChild(AccessGate.renderGateForm(lessonId, { onUnlock: () => showRoute() }));
  }
  container.innerHTML = '';
  container.appendChild(wrap);
  return true;
}

function stripHtml(html) {
  const div = document.createElement('div');
  div.innerHTML = html || '';
  return div.textContent || '';
}

function buildSearchIndex(data) {
  const index = [];

  // Lessons (published only — locked ones have no real content to search)
  Object.values(data.lessonsBySlug).forEach((l) => {
    const text = [l.title, stripHtml(l.content || ''), stripHtml(l.examples || '')].join(' ');
    index.push({
      type: 'lesson', typeLabel: 'درس', icon: '📘',
      title: l.title, snippet: (l.description || stripHtml(l.content || '').slice(0, 120)),
      route: `lesson/${l.slug}`, searchText: text.toLowerCase(),
    });
  });

  // Paths/Courses
  data.courses.forEach((c) => {
    index.push({
      type: 'course', typeLabel: 'مسار', icon: '🧭',
      title: c.title, snippet: c.description,
      route: c.route, searchText: (c.title + ' ' + c.description).toLowerCase(),
    });
  });

  // Tools
  data.tools.forEach((t) => {
    index.push({
      type: 'tool', typeLabel: 'أداة', icon: t.icon || '🤖',
      title: t.name, snippet: t.shortDescription,
      route: `tool/${t.slug}`, searchText: (t.name + ' ' + t.shortDescription + ' ' + (t.tags || []).join(' ')).toLowerCase(),
    });
  });

  // Prompts
  data.promptsFile.prompts.forEach((p) => {
    index.push({
      type: 'prompt', typeLabel: 'برومبت', icon: '📋',
      title: p.title, snippet: p.description,
      route: `prompt/${p.id}`, searchText: (p.title + ' ' + p.description + ' ' + (p.tags || []).join(' ')).toLowerCase(),
    });
  });

  // Services
  if (data.servicesFile) {
    data.servicesFile.services.forEach((s) => {
      index.push({
        type: 'service', typeLabel: 'خدمة', icon: s.icon || '🛠️',
        title: s.nameAr, snippet: s.description,
        route: 'services', searchText: (s.name + ' ' + s.nameAr + ' ' + s.description + ' ' + (s.tags || []).join(' ')).toLowerCase(),
      });
    });
  }

  return index;
}

function runGlobalSearch(index, term) {
  const t = term.trim().toLowerCase();
  if (!t) return [];
  return index.filter((item) => item.searchText.includes(t));
}

function renderSearchRoute(container, data) {
  const index = buildSearchIndex(data);
  let pending = '';
  try { pending = sessionStorage.getItem('academy:pending-search') || ''; sessionStorage.removeItem('academy:pending-search'); } catch (err) { /* ignore */ }

  container.innerHTML = `
    <section class="a-section">
      <div class="a-section-head">
        <span class="tag">بحث شامل</span>
        <h2>دور في كل حاجة في الأكاديمية</h2>
        <p>الدروس، المسارات، الأدوات، والبرومبتات — في مكان واحد.</p>
      </div>
      <div class="a-search" role="search" style="max-width:480px;margin:0 auto 30px;">
        <span aria-hidden="true">🔎</span>
        <input id="globalSearchInput" type="text" placeholder="اكتب أي كلمة... مثلاً: برومبت، Midjourney، اختبار" aria-label="بحث شامل" value="${escapeHtml(pending)}">
      </div>
      <div class="prompt-filters" id="searchTypeFilters">
        <button data-type="all" class="active">الكل</button>
        <button data-type="lesson">دروس</button>
        <button data-type="course">مسارات</button>
        <button data-type="tool">أدوات</button>
        <button data-type="prompt">برومبتات</button>
        <button data-type="service">خدمات</button>
      </div>
      <div id="searchResults" style="max-width:760px;margin:0 auto;"></div>
    </section>`;

  const input = container.querySelector('#globalSearchInput');
  const resultsEl = container.querySelector('#searchResults');
  const typeButtons = container.querySelectorAll('#searchTypeFilters button');

  function renderResults() {
    const term = input.value;
    const activeBtn = container.querySelector('#searchTypeFilters button.active');
    const activeType = activeBtn ? activeBtn.dataset.type : 'all';
    let results = runGlobalSearch(index, term);
    if (activeType !== 'all') results = results.filter((r) => r.type === activeType);

    if (!term.trim()) {
      resultsEl.innerHTML = '<p style="text-align:center;color:var(--text-dim-2);">اكتب أي كلمة فوق عشان تبدأ البحث.</p>';
      return;
    }
    if (results.length === 0) {
      resultsEl.innerHTML = `<p style="text-align:center;color:var(--text-dim-2);">مفيش نتائج لـ "${escapeHtml(term)}". جرب كلمة تانية.</p>`;
      return;
    }
    resultsEl.innerHTML = `<p style="color:var(--text-dim-2);font-size:0.85rem;margin-bottom:16px;">${results.length} نتيجة</p>` +
      results.map((r) => `
        <a href="#${r.route}" style="display:flex;gap:14px;align-items:flex-start;background:var(--obsidian-3);border:1px solid var(--line);border-radius:12px;padding:16px 18px;margin-bottom:10px;">
          <span style="font-size:1.3rem;">${r.icon}</span>
          <span>
            <span style="display:block;font-size:0.72rem;color:var(--blue);font-weight:700;">${r.typeLabel}</span>
            <span style="display:block;color:var(--text);font-weight:700;margin:2px 0 4px;">${escapeHtml(r.title)}</span>
            <span style="display:block;color:var(--text-dim);font-size:0.85rem;">${escapeHtml((r.snippet || '').slice(0, 140))}</span>
          </span>
        </a>`).join('');
  }

  input.addEventListener('input', renderResults);
  typeButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      typeButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      renderResults();
    });
  });

  renderResults();
  return true;
}

function renderDashboardRoute(container, data) {
  const stats = Progress.getOverallStats();
  const activity = Progress.getActivity();
  const allLessons = Progress.getAllLessons();

  const pathCards = data.courses.map((c) => {
    const pathId = c.id;
    const pf = data.pathsById[pathId];
    const totalPublished = pf.lessons.filter((l) => l.status === 'published').length;
    const p = Progress.getPathProgress(pathId, totalPublished);
    return `
      <div class="a-card">
        <h3>${escapeHtml(c.title)}</h3>
        <div style="background:var(--obsidian);border-radius:999px;height:10px;overflow:hidden;margin:14px 0 8px;border:1px solid var(--line);">
          <div style="background:linear-gradient(90deg,var(--gold),var(--blue));height:100%;width:${p.percent}%;"></div>
        </div>
        <p style="font-size:0.85rem;color:var(--text-dim-2);margin:0 0 14px;">${p.completed} من ${p.total} درس مكتمل (${p.percent}%)${p.started ? ` — ${p.started} درس بدأته ولسه ماخلصتوش` : ''}</p>
        <div style="display:flex;gap:10px;flex-wrap:wrap;">
          <a href="#path/${pathId}" class="go">${p.completed === p.total && p.total > 0 ? 'راجع المسار ←' : 'كمّل المسار ←'}</a>
          ${p.percent === 100 && p.total > 0 ? `<a href="#certificate/${pathId}" class="go" style="color:var(--gold);">🏆 احصل على شهادتك ←</a>` : ''}
        </div>
      </div>`;
  }).join('');

  const continueLessons = Object.entries(allLessons).filter(([, l]) => l.status === 'started');
  const completedLessons = Object.entries(allLessons).filter(([, l]) => l.status === 'completed');

  const activityHtml = activity.length
    ? activity.map((a) => {
        const date = new Date(a.when);
        const label = a.type === 'completed' ? `✅ خلّصت درس "${a.title}"${a.quizScore != null ? ` (${a.quizScore}/${a.quizTotal})` : ''}` : `▶️ بدأت درس "${a.title}"`;
        return `<div class="comment-item"><p style="margin:0;">${escapeHtml(label)}</p><div class="when">${date.toLocaleDateString('ar-EG')}</div></div>`;
      }).join('')
    : '<p style="color:var(--text-dim-2);">لسه مفيش أي نشاط مسجّل.</p>';

  container.innerHTML = `
    <section class="a-section">
      <div class="a-section-head">
        <span class="tag">لوحة تقدمي</span>
        <h2>إيه اللي وصلتله لحد دلوقتي</h2>
        <p style="font-size:0.8rem;color:var(--text-dim-2);">💾 التقدم محفوظ على جهازك فقط حاليًا — مش متزامن بين الأجهزة.</p>
      </div>

      <div class="a-stats" style="margin-bottom:50px;">
        <div class="stat"><h3>${stats.totalCompleted}</h3><span>درس مكتمل</span></div>
        <div class="stat"><h3>${stats.totalStarted}</h3><span>درس بدأته</span></div>
        <div class="stat"><h3>${stats.avgScorePercent != null ? stats.avgScorePercent + '%' : '—'}</h3><span>متوسط درجات الاختبارات</span></div>
        <div class="stat"><h3>${Favorites.count()}</h3><span>عنصر في المفضلة</span></div>
      </div>

      <h3 style="margin-bottom:16px;">تقدمك في المسارات</h3>
      <div class="a-grid cols-2" style="margin-bottom:50px;">${pathCards}</div>

      ${continueLessons.length ? `
      <h3 style="margin-bottom:16px;">كمّل من هنا</h3>
      <div class="a-grid" style="margin-bottom:50px;">
        ${continueLessons.map(([id, l]) => `<div class="a-card"><h3>${escapeHtml(l.title)}</h3><a href="#lesson/${id}" class="go">كمّل الدرس ←</a></div>`).join('')}
      </div>` : ''}

      ${completedLessons.length ? `
      <h3 style="margin-bottom:16px;">الدروس المكتملة</h3>
      <div class="a-grid" style="margin-bottom:50px;">
        ${completedLessons.map(([id, l]) => `<div class="a-card"><h3>${escapeHtml(l.title)} ✅</h3><p style="font-size:0.85rem;">${l.quizScore != null ? `نتيجة الاختبار: ${l.quizScore}/${l.quizTotal}` : ''}</p><a href="#lesson/${id}" class="go">راجع الدرس ←</a></div>`).join('')}
      </div>` : ''}

      <h3 style="margin-bottom:16px;">آخر نشاط</h3>
      <div style="max-width:600px;">${activityHtml}</div>
    </section>`;
  return true;
}

function certificateMarkup(cert) {
  const date = new Date(cert.issuedAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
  return `
    <div class="certificate-card printArea">
      <div class="cert-brand">🏆 Ahmed AI Academic</div>
      <div class="cert-subtitle">Certificate of Completion</div>
      <p style="color:var(--text-dim);">هذا يشهد بأن</p>
      <div class="cert-student-name">${escapeHtml(cert.studentName)}</div>
      <p style="color:var(--text-dim);">أكمل بنجاح مسار</p>
      <div class="cert-course-name">${escapeHtml(cert.pathTitle)}</div>
      <div class="cert-founder">Ahmed Mohamed Abdullah — Founder &amp; Instructor</div>
      <div class="cert-meta">
        تاريخ الإتمام: ${date}<br>
        رقم الشهادة: <strong style="color:var(--gold);">${cert.id}</strong>
      </div>
    </div>`;
}

function renderCertificateRoute(container, pathId, data) {
  const pf = data.pathsById[pathId];
  if (!pf) return false;
  const totalPublished = pf.lessons.filter((l) => l.status === 'published').length;
  const progress = Progress.getPathProgress(pathId, totalPublished);
  const wrap = document.createElement('div');
  wrap.className = 'wrap';
  wrap.style.maxWidth = '780px';
  wrap.style.padding = '50px 6% 80px';

  if (progress.percent < 100 || totalPublished === 0) {
    wrap.innerHTML = `
      <div class="a-section-head">
        <span class="tag">الشهادة</span>
        <h2>لسه معملتش المسار كامل</h2>
        <p>لازم تخلّص كل دروس مسار "${escapeHtml(pf.pathTitle)}" الأول (حاليًا: ${progress.completed} من ${totalPublished}).</p>
      </div>
      <div style="text-align:center;"><a href="#path/${pathId}" class="btn btn-gold">كمّل المسار</a></div>`;
    container.innerHTML = '';
    container.appendChild(wrap);
    return true;
  }

  let cert = Certificates.getByPathId(pathId);
  if (!cert) {
    const existingName = Certificates.getStudentName();
    wrap.innerHTML = `
      <div class="a-section-head">
        <span class="tag">مبروك! 🎉</span>
        <h2>خلصت مسار "${escapeHtml(pf.pathTitle)}" بالكامل</h2>
        <p>اكتب اسمك بالظبط زي ما تحب يظهر في الشهادة:</p>
      </div>
      <div style="max-width:400px;margin:0 auto;text-align:center;">
        <input id="certNameInput" type="text" value="${escapeHtml(existingName)}" placeholder="اسمك بالكامل"
          style="width:100%;background:var(--obsidian);border:1px solid var(--line);border-radius:10px;color:var(--text);padding:12px 16px;font-family:var(--font-body);margin-bottom:14px;">
        <button id="generateCertBtn" class="btn btn-gold btn-block">أنشئ الشهادة</button>
      </div>`;
    container.innerHTML = '';
    container.appendChild(wrap);
    container.querySelector('#generateCertBtn').addEventListener('click', () => {
      const name = container.querySelector('#certNameInput').value.trim();
      if (!name) return;
      Certificates.issue(pathId, pf.pathTitle, name);
      showRoute();
    });
    return true;
  }

  wrap.innerHTML = `
    <div class="cert-disclaimer" style="max-width:720px;margin:0 auto 24px;text-align:center;background:var(--obsidian-3);border:1px dashed var(--line);border-radius:12px;padding:14px 18px;font-size:0.8rem;color:var(--text-dim-2);">
      ⚠️ الشهادة دي متولّدة محليًا على جهازك، ومش متحقق منها عالميًا لأن مفيش سيرفر حقيقي لسه. مناسبة كتحفيز شخصي ومشاركة، مش كإثبات رسمي معتمد.
    </div>
    ${certificateMarkup(cert)}
    <div style="text-align:center;margin-top:24px;display:flex;gap:12px;justify-content:center;flex-wrap:wrap;">
      <button class="btn btn-outline print-cheat-btn">🖨️ طباعة / حفظ PDF</button>
      <a href="#verify" class="btn btn-outline btn-sm">جرّب صفحة التحقق ←</a>
    </div>`;
  container.innerHTML = '';
  container.appendChild(wrap);
  return true;
}

function renderVerifyRoute(container) {
  container.innerHTML = `
    <div class="wrap" style="max-width:560px;padding:50px 6% 80px;text-align:center;">
      <div class="a-section-head">
        <span class="tag">التحقق من شهادة</span>
        <h2>Verify Certificate</h2>
      </div>
      <div style="background:var(--obsidian-3);border:1px dashed var(--line);border-radius:12px;padding:16px 18px;font-size:0.82rem;color:var(--text-dim-2);margin-bottom:24px;text-align:right;">
        ⚠️ <strong>مهم:</strong> النسخة دي مفيش سيرفر ورايها — بتقدر تتحقق بس من الشهادات المتولّدة على <u>نفس الجهاز والمتصفح</u> اللي إنت فاتحه دلوقتي. تحقق حقيقي عبر أي جهاز محتاج Backend حقيقي (جاهز الكود بتاعه، لكن لسه مش شغال لايف).
      </div>
      <input id="verifyIdInput" type="text" placeholder="اكتب رقم الشهادة (مثال: AAA-XXXX-XXXX)"
        style="width:100%;background:var(--obsidian);border:1px solid var(--line);border-radius:10px;color:var(--text);padding:12px 16px;font-family:var(--font-body);margin-bottom:14px;text-align:center;">
      <button id="verifyBtn" class="btn btn-gold btn-block">تحقق</button>
      <div id="verifyResult" style="margin-top:24px;"></div>
    </div>`;
  container.querySelector('#verifyBtn').addEventListener('click', () => {
    const id = container.querySelector('#verifyIdInput').value;
    const resultEl = container.querySelector('#verifyResult');
    const found = Certificates.verifyLocally(id);
    if (found) {
      resultEl.innerHTML = `<div class="callout tip"><strong>✅ شهادة صالحة (على هذا الجهاز)</strong><p style="margin-top:8px;">${escapeHtml(found.studentName)} — ${escapeHtml(found.pathTitle)}</p></div>`;
    } else {
      resultEl.innerHTML = `<div class="callout mistake"><strong>❌ مش موجودة على هذا الجهاز</strong><p style="margin-top:8px;">إما الرقم غلط، أو الشهادة اتولدت على جهاز تاني (والتحقق الحالي محلي بس).</p></div>`;
    }
  });
  return true;
}

function pricingCardMarkup(plan) {
  const featuresHtml = plan.features.map((f) => `
    <li style="display:flex;gap:10px;align-items:flex-start;padding:8px 0;border-bottom:1px solid var(--line-soft);font-size:0.88rem;">
      <span style="color:${f.included ? 'var(--success)' : 'var(--text-dim-2)'};flex-shrink:0;">${f.included ? '✓' : '✗'}</span>
      <span style="color:${f.included ? 'var(--text)' : 'var(--text-dim-2)'};">${escapeHtml(f.label)}</span>
    </li>`).join('');

  const ctaHref = plan.ctaWhatsapp ? 'https://wa.me/201157356164' : `#${plan.ctaRoute}`;
  const ctaTarget = plan.ctaWhatsapp ? ' target="_blank" rel="noopener"' : '';

  return `
    <div class="a-card" style="${plan.badge ? 'border-color:var(--gold);position:relative;' : ''}">
      ${plan.badge ? `<span style="position:absolute;top:-12px;right:20px;background:var(--gold);color:#1a1204;font-size:0.72rem;font-weight:800;padding:4px 14px;border-radius:999px;">${escapeHtml(plan.badge)}</span>` : ''}
      <h3 style="font-size:1.4rem;">${escapeHtml(plan.name)}</h3>
      <p style="color:var(--text-dim-2);font-size:0.85rem;margin-bottom:4px;">${escapeHtml(plan.nameAr)}</p>
      <div style="font-family:var(--font-display);font-size:1.8rem;font-weight:800;color:var(--gold);margin:14px 0 2px;">${escapeHtml(plan.priceLabel)}</div>
      <p style="font-size:0.8rem;color:var(--text-dim-2);margin-bottom:20px;">${escapeHtml(plan.billingNote)}</p>
      <ul style="list-style:none;padding:0;margin:0 0 24px;text-align:right;">${featuresHtml}</ul>
      <a href="${ctaHref}"${ctaTarget} class="btn ${plan.badge ? 'btn-gold' : 'btn-outline'} btn-block">${escapeHtml(plan.ctaLabel)}</a>
    </div>`;
}

function renderPricingRoute(container, data) {
  const cardsHtml = data.plansFile.plans.map(pricingCardMarkup).join('');
  container.innerHTML = `
    <section class="a-section">
      <div class="a-section-head">
        <span class="tag">الاشتراكات</span>
        <h2>اختار الخطة المناسبة ليك</h2>
        <p style="font-size:0.8rem;color:var(--text-dim-2);">${escapeHtml(data.plansFile.note)}</p>
      </div>
      <div class="a-grid" style="align-items:start;">${cardsHtml}</div>
    </section>`;
  return true;
}

function serviceCardMarkup(s) {
  const tagsHtml = (s.tags || []).map((t) => `<span style="display:inline-block;background:var(--obsidian);border:1px solid var(--line);border-radius:999px;padding:2px 10px;font-size:0.72rem;color:var(--text-dim-2);margin-left:6px;">#${escapeHtml(t)}</span>`).join('');
  return `
    <div class="a-card" data-searchable>
      <div class="icon-tile">${s.icon}</div>
      <h3>${escapeHtml(s.nameAr)}</h3>
      <p style="font-size:0.78rem;color:var(--text-dim-2);margin-bottom:6px;">${escapeHtml(s.name)}</p>
      <p>${escapeHtml(s.description)}</p>
      <div style="margin:10px 0 16px;">${tagsHtml}</div>
      <a href="https://wa.me/201157356164" target="_blank" rel="noopener" class="btn btn-gold btn-sm btn-block">اطلب هذه الخدمة</a>
    </div>`;
}

function renderServicesRoute(container, data) {
  const cardsHtml = data.servicesFile.services.map(serviceCardMarkup).join('');
  container.innerHTML = `
    <section class="a-section">
      <div class="a-section-head">
        <span class="tag">AI Services</span>
        <h2>خدمات احترافية للأفراد والشركات</h2>
        <p style="font-size:0.8rem;color:var(--text-dim-2);">${escapeHtml(data.servicesFile.note)}</p>
      </div>
      <div class="a-grid">${cardsHtml}</div>
      <div style="text-align:center;margin-top:40px;">
        <a href="https://wa.me/201157356164" target="_blank" rel="noopener" class="btn btn-outline">مش لاقي اللي محتاجه؟ تواصل معنا</a>
      </div>
    </section>`;
  return true;
}

function renderNotFound(container) {
  container.innerHTML = `
    <section class="a-section" style="text-align:center;">
      <div class="a-section-head">
        <span class="tag">404</span>
        <h2>الصفحة دي مش موجودة</h2>
        <p>ممكن الرابط يكون قديم أو اتغيّر. جرب ترجع للرئيسية.</p>
      </div>
      <a href="#home" class="btn btn-gold">الرجوع للرئيسية</a>
    </section>`;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str == null ? '' : String(str);
  return div.innerHTML;
}

async function showRoute() {
  const hash = location.hash.replace(/^#/, '') || 'home';
  const staticEl = document.querySelector('.route[data-route="' + hash.replace(/"/g, '') + '"]');
  const dynamicEl = document.getElementById('dynamic-route');

  document.querySelectorAll('.route').forEach((el) => el.classList.remove('active'));

  if (staticEl) {
    staticEl.classList.add('active');
  } else {
    dynamicEl.classList.add('active');
    dynamicEl.innerHTML = '<p style="text-align:center;padding:60px 0;color:var(--text-dim-2);">جارِ التحميل...</p>';
    try {
      const data = await AcademyData.loadAll();
      let ok = false;
      if (hash.startsWith('path/')) {
        ok = renderPathRoute(dynamicEl, hash.replace('path/', ''), data);
      } else if (hash.startsWith('lesson/')) {
        ok = renderLessonRoute(dynamicEl, hash.replace('lesson/', ''), data);
      } else if (hash.startsWith('tool/')) {
        ok = renderToolRoute(dynamicEl, hash.replace('tool/', ''), data);
      } else if (hash.startsWith('certificate/')) {
        ok = renderCertificateRoute(dynamicEl, hash.replace('certificate/', ''), data);
      } else if (hash === 'verify') {
        ok = renderVerifyRoute(dynamicEl);
      } else if (hash === 'services') {
        ok = renderServicesRoute(dynamicEl, data);
      } else if (hash === 'pricing') {
        ok = renderPricingRoute(dynamicEl, data);
      } else if (hash === 'dashboard') {
        ok = renderDashboardRoute(dynamicEl, data);
      } else if (hash === 'search') {
        ok = renderSearchRoute(dynamicEl, data);
      } else if (hash === 'tools') {
        ok = renderToolsDirectory(dynamicEl, data);
      } else if (hash === 'favorites') {
        ok = renderFavoritesRoute(dynamicEl, data);
      } else if (hash.startsWith('prompt/')) {
        ok = renderPromptDetailRoute(dynamicEl, hash.replace('prompt/', ''), data);
      } else if (hash === 'prompts') {
        ok = renderPromptsRoute(dynamicEl, data);
      } else if (hash === 'demo/paid-example') {
        ok = renderDemoPaidLesson(dynamicEl);
      }
      if (!ok) renderNotFound(dynamicEl);
    } catch (err) {
      dynamicEl.innerHTML = '<p style="text-align:center;padding:60px 0;color:var(--danger);">حصلت مشكلة في تحميل المحتوى. جرب تحدّث الصفحة.</p>';
    }
  }

  document.querySelectorAll('.a-nav [data-nav]').forEach((a) => {
    a.classList.toggle('active', a.dataset.nav === hash || (a.dataset.nav !== 'home' && hash.indexOf(a.dataset.nav) === 0));
  });
  window.scrollTo(0, 0);
}

window.addEventListener('hashchange', showRoute);
document.addEventListener('DOMContentLoaded', () => {
  showRoute();
  initHubSearch();
  initMobileNav();
});
