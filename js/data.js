/* ============================================================
   Ahmed AI Academic — data loading layer
   Fetches the JSON files under data/ once and caches them in memory.
   Added during the Foundation Refactor (content used to be hard-coded
   inline in academy.html; it now lives in data/ as agreed).
   NOTE: fetch() requires the site to be served over http(s)
   (GitHub Pages, or `python -m http.server` locally) — opening the
   HTML file directly with file:// will block these requests in most
   browsers. This is a normal limitation of static JSON fetching.
   ============================================================ */

const AcademyData = (function () {
  let cache = null;
  let loadingPromise = null;

  async function loadAll() {
    if (cache) return cache;
    if (loadingPromise) return loadingPromise;

    loadingPromise = Promise.all([
      fetch('data/site.json').then((r) => r.json()),
      fetch('data/courses.json').then((r) => r.json()),
      fetch('data/lessons/fundamentals.json').then((r) => r.json()),
      fetch('data/lessons/prompt-engineering.json').then((r) => r.json()),
      fetch('data/tools/tools.json').then((r) => r.json()),
      fetch('data/prompts/prompts.json').then((r) => r.json()),
      fetch('data/plans.json').then((r) => r.json()),
      fetch('data/services.json').then((r) => r.json()),
    ]).then(([site, courses, fundamentals, promptEngineering, tools, promptsFile, plansFile, servicesFile]) => {
      const pathsById = {
        'ai-fundamentals': fundamentals,
        'prompt-engineering': promptEngineering,
      };
      const lessonsBySlug = {};
      [fundamentals, promptEngineering].forEach((pathFile) => {
        pathFile.lessons.forEach((lesson) => {
          if (lesson.slug) lessonsBySlug[lesson.slug] = { ...lesson, pathId: pathFile.pathId, pathTitle: pathFile.pathTitle };
        });
      });
      const toolsBySlug = {};
      tools.forEach((t) => { toolsBySlug[t.slug] = t; });

      cache = { site, courses, pathsById, lessonsBySlug, tools, toolsBySlug, promptsFile, plansFile, servicesFile };
      return cache;
    }).catch((err) => {
      console.error('AcademyData: failed to load one or more data files.', err);
      throw err;
    });

    return loadingPromise;
  }

  return { loadAll };
})();
