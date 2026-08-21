/* ============================================================
   Ahmed AI Academic — quiz engine
   Behavior unchanged from the original inline script, plus an
   optional onComplete(score, total) callback used to feed the
   progress-tracking system.
   ============================================================ */
function initQuiz(root, onComplete) {
  const questions = root.querySelectorAll('.quiz-q');
  let score = 0;
  let answered = 0;

  questions.forEach((q) => {
    const labels = q.querySelectorAll('label');
    labels.forEach((label) => {
      label.addEventListener('click', () => {
        if (label.dataset.locked) return;
        labels.forEach((l) => (l.dataset.locked = 'true'));
        const isCorrect = label.dataset.correct === 'true';
        label.classList.add(isCorrect ? 'correct' : 'wrong');
        if (!isCorrect) {
          labels.forEach((l) => { if (l.dataset.correct === 'true') l.classList.add('correct'); });
        } else {
          score++;
        }
        answered++;
        if (answered === questions.length) {
          const resultEl = root.querySelector('.quiz-result');
          if (resultEl) {
            resultEl.textContent = `نتيجتك: ${score} من ${questions.length} — ${
              score === questions.length ? 'ممتاز! 🎉' : score >= questions.length / 2 ? 'جيد، راجع الأجزاء اللي غلطت فيها 👍' : 'يفضل تراجع الدرس تاني وتحاول من جديد 💪'
            }`;
          }
          if (typeof onComplete === 'function') onComplete(score, questions.length);
        }
      });
    });
  });
}
