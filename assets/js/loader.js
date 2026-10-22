/**
 * IQBAL STUDY CENTRE (ISC) — FAST PRELOADER CONTROLLER
 * Swift, elegant, and non-blocking
 */

document.addEventListener('DOMContentLoaded', () => {
  const preloader = document.getElementById('preloader');
  const counterText = document.getElementById('preloader-counter-text');
  const circleBar = document.querySelector('.preloader-circle-bar');
  const quoteEl = document.getElementById('preloader-quote');
  const quoteAuthorEl = document.getElementById('preloader-author');

  const iqbalQuotes = [
    {
      text: "Khudi ko kar buland itna ke har taqdeer se pehle, Khuda bande se khud pooche, bata teri raza kya hai?",
      author: "Allama Iqbal — Bal-i-Jibril"
    },
    {
      text: "The wave exists in the ocean; outside it, it is naught. The individual exists in relation to the community.",
      author: "Allama Iqbal — Rumuz-i-Bekhudi"
    }
  ];

  if (quoteEl && quoteAuthorEl) {
    quoteEl.textContent = `“${iqbalQuotes[0].text}”`;
    quoteAuthorEl.textContent = iqbalQuotes[0].author;
    quoteEl.classList.add('active');
  }

  const totalLength = 471;
  const minDuration = 700; // Fast 700ms duration
  const startTime = performance.now();

  function updateLoader(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(100, Math.floor((elapsed / minDuration) * 100));

    if (counterText) {
      counterText.textContent = progress.toString().padStart(2, '0');
    }

    if (circleBar) {
      const offset = totalLength - (totalLength * progress) / 100;
      circleBar.style.strokeDashoffset = offset;
    }

    if (progress < 100) {
      requestAnimationFrame(updateLoader);
    } else {
      setTimeout(dismissPreloader, 150);
    }
  }

  function dismissPreloader() {
    if (!preloader) return;
    preloader.classList.add('loaded');
    document.body.classList.remove('overflow-hidden');

    // Trigger reveal elements
    document.querySelectorAll('.reveal-on-scroll').forEach(el => {
      el.classList.add('is-visible');
    });

    setTimeout(() => {
      preloader.style.display = 'none';
    }, 600);
  }

  requestAnimationFrame(updateLoader);
});
