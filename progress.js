/* ============================================================
   Ahmed AI Academic — progress tracking
   Device-local only (localStorage) — same honesty pattern as
   comments/access-codes/favorites: no cross-device sync without
   a real backend. Powers the "لوحة تقدمي" dashboard.
   ============================================================ */

const Progress = (function () {
  const STORAGE_KEY = 'academy:progress';

  function loadAll() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : { lessons: {}, activity: [] };
    } catch (err) {
      console.warn('Progress: could not read localStorage.', err);
      return { lessons: {}, activity: [] };
    }
  }

  function saveAll(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
      console.warn('Progress: could not write localStorage.', err);
    }
  }

  function pushActivity(data, entry) {
    data.activity.unshift({ ...entry, when: new Date().toISOString() });
    data.activity = data.activity.slice(0, 20); // keep last 20 only
  }

  function recordLessonStarted(lessonId, pathId, title) {
    const data = loadAll();
    if (!data.lessons[lessonId]) {
      data.lessons[lessonId] = { pathId, title, status: 'started', quizScore: null, quizTotal: null };
      pushActivity(data, { type: 'started', lessonId, title });
      saveAll(data);
    }
  }

  function recordLessonComplete(lessonId, pathId, title, quizScore, quizTotal) {
    const data = loadAll();
    const wasAlreadyComplete = data.lessons[lessonId] && data.lessons[lessonId].status === 'completed';
    data.lessons[lessonId] = { pathId, title, status: 'completed', quizScore, quizTotal };
    if (!wasAlreadyComplete) {
      pushActivity(data, { type: 'completed', lessonId, title, quizScore, quizTotal });
    }
    saveAll(data);
  }

  function getLessonStatus(lessonId) {
    const data = loadAll();
    return data.lessons[lessonId] || null;
  }

  function getPathProgress(pathId, totalPublished) {
    const data = loadAll();
    const entries = Object.values(data.lessons).filter((l) => l.pathId === pathId);
    const completed = entries.filter((l) => l.status === 'completed').length;
    const started = entries.filter((l) => l.status === 'started').length;
    return { completed, started, total: totalPublished, percent: totalPublished ? Math.round((completed / totalPublished) * 100) : 0 };
  }

  function getAllLessons() {
    return loadAll().lessons;
  }

  function getActivity() {
    return loadAll().activity;
  }

  function getOverallStats() {
    const data = loadAll();
    const entries = Object.values(data.lessons);
    const completed = entries.filter((l) => l.status === 'completed');
    const scored = completed.filter((l) => l.quizScore != null && l.quizTotal);
    const avgScore = scored.length
      ? Math.round((scored.reduce((sum, l) => sum + l.quizScore / l.quizTotal, 0) / scored.length) * 100)
      : null;
    return {
      totalStarted: entries.length,
      totalCompleted: completed.length,
      avgScorePercent: avgScore,
    };
  }

  return {
    recordLessonStarted, recordLessonComplete, getLessonStatus,
    getPathProgress, getAllLessons, getActivity, getOverallStats,
  };
})();
