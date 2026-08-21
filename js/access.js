/* ============================================================
   Ahmed AI Academic — access-code gating (manual/WhatsApp payments)
   Added at the founder's request: paid courses are still sold
   manually over WhatsApp; this module just turns a code the founder
   hands out into unlocked lessons on the student's device.

   HONESTY NOTE (also explained in the chat + README): this is a
   friction layer, not real security. The site is fully static —
   there is no server to verify anything against. Anyone who opens
   DevTools → Network can see any JSON file the site can fetch,
   whether or not they typed a valid code. Do not put content here
   you are not comfortable with a technically curious visitor seeing.
   Treat the code as "makes casual sharing/skipping payment
   inconvenient", not as DRM.
   ============================================================ */

const AccessGate = (function () {
  const STORAGE_KEY = 'academy:unlocked-lessons';
  let codesCache = null;

  async function loadCodes() {
    if (codesCache) return codesCache;
    const res = await fetch('data/access/access-codes.json');
    const json = await res.json();
    codesCache = json.codes || [];
    return codesCache;
  }

  function getUnlocked() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (err) {
      console.warn('AccessGate: could not read localStorage.', err);
      return [];
    }
  }

  function persistUnlocked(list) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(new Set(list))));
    } catch (err) {
      console.warn('AccessGate: could not write localStorage (storage full or disabled).', err);
    }
  }

  function isUnlocked(lessonId) {
    return getUnlocked().includes(lessonId);
  }

  async function redeemCode(rawCode) {
    const code = (rawCode || '').trim().toUpperCase();
    if (!code) return { ok: false, reason: 'empty' };
    const codes = await loadCodes();
    const match = codes.find((c) => (c.code || '').trim().toUpperCase() === code);
    if (!match) return { ok: false, reason: 'not-found' };
    const current = getUnlocked();
    persistUnlocked(current.concat(match.unlocks || []));
    return { ok: true, unlocks: match.unlocks || [], studentName: match.studentName || null };
  }

  function renderGateForm(lessonId, opts) {
    opts = opts || {};
    const wrap = document.createElement('div');
    wrap.className = 'assignment-box';
    wrap.style.textAlign = 'center';
    wrap.innerHTML = `
      <h3 style="margin-bottom:10px;">🔒 الدرس ده جزء من محتوى مدفوع</h3>
      <p style="margin-bottom:18px;">تواصل معانا على واتساب لمعرفة تفاصيل الدفع، وهيبعتلك المؤسس كود فتح خاص بيك.</p>
      <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-bottom:14px;">
        <input type="text" class="gate-code-input" placeholder="اكتب الكود هنا" aria-label="كود الفتح"
          style="max-width:220px;background:var(--obsidian);border:1px solid var(--line);border-radius:10px;color:var(--text);padding:10px 14px;font-family:var(--font-body);">
        <button type="button" class="btn btn-gold btn-sm gate-submit-btn">فتح الدرس</button>
      </div>
      <p class="gate-message" style="font-size:0.85rem;color:var(--text-dim-2);min-height:1.2em;"></p>
      <a href="https://wa.me/201157356164" target="_blank" rel="noopener" class="btn btn-outline btn-sm" style="margin-top:6px;">تواصل واتساب لشراء الدورة</a>
    `;
    const input = wrap.querySelector('.gate-code-input');
    const btn = wrap.querySelector('.gate-submit-btn');
    const msg = wrap.querySelector('.gate-message');

    async function attempt() {
      msg.textContent = 'بيتحقق من الكود...';
      msg.style.color = 'var(--text-dim-2)';
      const result = await redeemCode(input.value);
      if (result.ok && result.unlocks.includes(lessonId)) {
        msg.textContent = 'تم فتح الدرس ✓';
        msg.style.color = 'var(--success)';
        if (typeof opts.onUnlock === 'function') setTimeout(() => opts.onUnlock(), 500);
      } else if (result.ok && !result.unlocks.includes(lessonId)) {
        msg.textContent = 'الكود ده صحيح لكنه مش بيفتح الدرس ده تحديدًا.';
        msg.style.color = 'var(--warn)';
      } else {
        msg.textContent = 'الكود مش صحيح — تأكد منه أو تواصل معانا واتساب.';
        msg.style.color = 'var(--danger)';
      }
    }
    btn.addEventListener('click', attempt);
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') attempt(); });
    return wrap;
  }

  return { isUnlocked, redeemCode, renderGateForm, getUnlocked };
})();
