/* ============================================================
   Ahmed AI Academic — Favorites system
   Device-local only (localStorage), same honesty pattern as
   comments/access-codes: no cross-device sync without a backend.
   Generic across 4 content types: course, lesson, tool, prompt.
   ============================================================ */

const Favorites = (function () {
  const STORAGE_KEY = 'academy:favorites';

  function loadAll() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : { course: [], lesson: [], tool: [], prompt: [] };
    } catch (err) {
      console.warn('Favorites: could not read localStorage.', err);
      return { course: [], lesson: [], tool: [], prompt: [] };
    }
  }

  function saveAll(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
      console.warn('Favorites: could not write localStorage.', err);
    }
  }

  function isFavorite(type, id) {
    const data = loadAll();
    return (data[type] || []).includes(id);
  }

  function toggle(type, id) {
    const data = loadAll();
    if (!data[type]) data[type] = [];
    const idx = data[type].indexOf(id);
    if (idx >= 0) {
      data[type].splice(idx, 1);
    } else {
      data[type].push(id);
    }
    saveAll(data);
    return data[type].includes(id);
  }

  function getAll(type) {
    const data = loadAll();
    return type ? (data[type] || []) : data;
  }

  function count() {
    const data = loadAll();
    return Object.values(data).reduce((sum, arr) => sum + arr.length, 0);
  }

  return { isFavorite, toggle, getAll, count };
})();
