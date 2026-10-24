/**
 * IQBAL STUDY CENTRE (ISC) — CINEMATIC PRELOADER CONTROLLER
 * Full sequence on the first visit of a session; returning page loads
 * skip straight to the arrival curtain. Fires `isc:ready` when the
 * stage is clear so motion.js can start the entrance choreography.
 */

document.addEventListener('DOMContentLoaded', () => {
  const root = document.documentElement;
  const preloader = document.getElementById('preloader');
  const counterText = document.getElementById('preloader-counter-text');
  const circleBar = document.querySelector('.preloader-circle-bar');
  const quoteEl = document.getElementById('preloader-quote');
  const quoteAuthorEl = document.getElementById('preloader-author');

  function signalReady() {
    window.ISC_READY = true;
    window.dispatchEvent(new Event('isc:ready'));
  }

  function markVisited() {
    try { sessionStorage.setItem('isc_visited', '1'); } catch (err) {}
  }

  // Returning within the session: the preloader is hidden by CSS
  if (!preloader || root.classList.contains('isc-return')) {
    if (preloader) preloader.style.display = 'none';
    markVisited();
    setTimeout(signalReady, root.classList.contains('isc-arrive') ? 420 : 60);
    return;
  }

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

  const iqbalQuotesBn = [
    {
      text: "আপন খুদিকে এমন উচ্চে তোলো, যেন প্রতিটি নিয়তি লেখার আগে স্বয়ং খোদা বান্দাকে শুধান — বলো, কী তোমার অভিলাষ?",
      author: "আল্লামা ইকবাল — বাল-ই-জিবরিল"
    },
    {
      text: "ঢেউ বেঁচে থাকে সাগরের বুকে; সাগরের বাইরে সে শূন্য। ব্যক্তির অস্তিত্বও সমষ্টির বন্ধনে।",
      author: "আল্লামা ইকবাল — রুমুজ-ই-বেখুদি"
    }
  ];

  if (quoteEl && quoteAuthorEl) {
    const pool = localStorage.getItem('isc_lang') === 'bn' ? iqbalQuotesBn : iqbalQuotes;
    const quote = pool[Math.floor(Math.random() * pool.length)];
    quoteEl.textContent = `“${quote.text}”`;
    quoteAuthorEl.textContent = quote.author;
    quoteEl.classList.add('active');
  }

  const totalLength = 471;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const duration = reduceMotion ? 300 : 1500;
  const startTime = performance.now();
  // Hold at 90% until the window (images, fonts) has actually loaded
  let pageLoaded = document.readyState === 'complete';
  window.addEventListener('load', () => { pageLoaded = true; });
  const hardStop = startTime + 4000;

  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function updateLoader(currentTime) {
    const t = Math.min(1, (currentTime - startTime) / duration);
    let progress = easeInOutCubic(t) * 100;
    const canFinish = pageLoaded || currentTime > hardStop;
    if (!canFinish) progress = Math.min(progress, 90);

    if (counterText) {
      counterText.textContent = Math.floor(progress).toString().padStart(2, '0');
    }

    if (circleBar) {
      circleBar.style.strokeDashoffset = totalLength - (totalLength * progress) / 100;
    }

    if (progress < 100) {
      requestAnimationFrame(updateLoader);
    } else {
      setTimeout(dismissPreloader, 280);
    }
  }

  function dismissPreloader() {
    preloader.classList.add('loaded');
    document.body.classList.remove('overflow-hidden');
    markVisited();

    // Let the curtain clear the fold before the entrance choreography begins
    setTimeout(signalReady, 380);

    setTimeout(() => {
      preloader.style.display = 'none';
    }, 1100);
  }

  requestAnimationFrame(updateLoader);
});
