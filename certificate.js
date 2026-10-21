/* ============================================================
   Ahmed AI Academic — certificates
   Device-local only. No backend exists yet to issue/verify
   certificates across devices — this is explicitly NOT real
   verification, and the UI says so. It exists so the "certificate"
   step in the learning journey has something real to show once a
   path is 100% complete, and so the visual/data shape is ready to
   plug into the real backend (see ahmed-ai-academy-backend/) later.
   ============================================================ */

const Certificates = (function () {
  const STORAGE_KEY = 'academy:certificates';
  const NAME_KEY = 'academy:student-name';

  function loadAll() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (err) {
      console.warn('Certificates: could not read localStorage.', err);
      return {};
    }
  }

  function saveAll(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
      console.warn('Certificates: could not write localStorage.', err);
    }
  }

  function getStudentName() {
    try { return localStorage.getItem(NAME_KEY) || ''; } catch (err) { return ''; }
  }

  function setStudentName(name) {
    try { localStorage.setItem(NAME_KEY, name); } catch (err) { /* ignore */ }
  }

  function generateId() {
    const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
    const rand2 = Math.random().toString(36).slice(2, 6).toUpperCase();
    return `AAA-${rand}-${rand2}`;
  }

  // Issues a certificate if one doesn't already exist for this pathId
  // on this device, and returns it either way (idempotent).
  function issue(pathId, pathTitle, studentName) {
    const data = loadAll();
    if (data[pathId]) return data[pathId];
    const cert = {
      id: generateId(),
      pathId, pathTitle,
      studentName: studentName || 'طالب أكاديمية Ahmed AI',
      issuedAt: new Date().toISOString(),
    };
    data[pathId] = cert;
    saveAll(data);
    if (studentName) setStudentName(studentName);
    return cert;
  }

  function getByPathId(pathId) {
    return loadAll()[pathId] || null;
  }

  // Verification only ever checks THIS device's local records —
  // see the loud disclaimer rendered next to the verify form.
  function verifyLocally(certId) {
    const data = loadAll();
    const found = Object.values(data).find((c) => c.id.toUpperCase() === certId.trim().toUpperCase());
    return found || null;
  }

  return { issue, getByPathId, verifyLocally, getStudentName, setStudentName };
})();
