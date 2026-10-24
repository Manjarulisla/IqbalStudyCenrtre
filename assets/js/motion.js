/**
 * IQBAL STUDY CENTRE (ISC) — CINEMATIC MOTION ENGINE
 * Smooth inertial scroll, staged scroll reveals, page transitions,
 * magnetic buttons, 3D card tilt and scroll-linked chrome.
 * Loaded after app.js on every page.
 */

window.ISC_MOTION = true;

(function () {
  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const motionOn = root.classList.contains('motion-on');

  /* ==========================================================================
     1. SMOOTH INERTIAL SCROLL (Lenis)
     ========================================================================== */
  let lenis = null;
  if (!reduceMotion && typeof window.Lenis === 'function') {
    lenis = new window.Lenis({
      duration: 1.15,
      easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.95
    });
    window.ISC_LENIS = lenis;
    const raf = time => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  }

  window.iscScrollTo = function (target, immediate) {
    const el = typeof target === 'string' ? document.querySelector(target) : target;
    if (!el) return;
    if (lenis) {
      lenis.scrollTo(el, { offset: -72, duration: immediate ? 0 : 1.6, immediate: !!immediate });
    } else {
      const top = el.getBoundingClientRect().top + window.scrollY - 72;
      window.scrollTo({ top, behavior: immediate || reduceMotion ? 'auto' : 'smooth' });
    }
  };

  /* ==========================================================================
     1b. LIVE VIDEO BACKGROUND — keep it playing for the whole visit
     ========================================================================== */
  const bgVideo = document.querySelector('.bg-video');
  if (bgVideo) {
    bgVideo.muted = true;
    const markPlaying = () => bgVideo.classList.add('is-playing');
    const play = () => {
      if (reduceMotion || !bgVideo.paused) return;
      const attempt = bgVideo.play();
      if (attempt && attempt.catch) attempt.catch(() => {});
    };

    if (reduceMotion) {
      bgVideo.removeAttribute('autoplay');
      bgVideo.pause();
      markPlaying();
    } else {
      bgVideo.addEventListener('playing', markPlaying);
      // Some browsers stall or pause background media; nudge it back on
      bgVideo.addEventListener('pause', () => { if (!document.hidden) setTimeout(play, 300); });
      bgVideo.addEventListener('ended', () => { bgVideo.currentTime = 0; play(); });
      document.addEventListener('visibilitychange', () => { if (!document.hidden) play(); });
      ['pointerdown', 'touchstart', 'keydown'].forEach(evt =>
        window.addEventListener(evt, play, { passive: true }));
      play();
    }
  }

  /* ==========================================================================
     2. PAGE TRANSITIONS (departure curtain; arrival is pure CSS)
     ========================================================================== */
  function isPageLink(a, e) {
    if (!a || e.defaultPrevented || e.button !== 0) return false;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return false;
    if (a.target && a.target !== '_self') return false;
    if (a.hasAttribute('download')) return false;
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin) return false;
    return url.pathname !== location.pathname;
  }

  function leaveTo(href) {
    const curtain = document.createElement('div');
    curtain.className = 'page-curtain';
    curtain.innerHTML = '<img src="assets/images/isc-emblem.png" alt="">';
    document.body.appendChild(curtain);
    curtain.getBoundingClientRect();
    curtain.classList.add('is-active');
    setTimeout(() => { window.location.href = href; }, 780);
  }

  document.addEventListener('click', e => {
    const a = e.target.closest('a[href]');
    if (!a) return;
    const url = new URL(a.href, location.href);

    // Same-page anchors glide instead of jumping
    if (url.origin === location.origin && url.pathname === location.pathname && url.hash) {
      const target = document.querySelector(url.hash);
      if (target) {
        e.preventDefault();
        history.pushState(null, '', url.hash);
        window.iscScrollTo(target);
        updateActiveNav(url.hash);
      }
      return;
    }

    if (!reduceMotion && isPageLink(a, e)) {
      e.preventDefault();
      leaveTo(a.href);
    }
  });

  // Coming back through the bfcache must not leave a curtain over the page
  window.addEventListener('pageshow', e => {
    if (e.persisted) document.querySelectorAll('.page-curtain').forEach(c => c.remove());
  });

  /* ==========================================================================
     3. SCROLL REVEALS
     ========================================================================== */
  const revealObserver = motionOn && 'IntersectionObserver' in window
    ? new IntersectionObserver(onReveal, { rootMargin: '0px 0px -4% 0px', threshold: 0 })
    : null;
  let ready = false;
  const pending = [];

  function onReveal(entries) {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      revealObserver.unobserve(entry.target);
      reveal(entry.target);
    });
  }

  function reveal(el) {
    el.classList.add('rv-in');
    // Hand transform/transition back to the element's own hover styles
    const delay = parseFloat(el.style.getPropertyValue('--rv-delay')) || 0;
    setTimeout(() => {
      if (el.classList.contains('rv')) {
        el.classList.remove('rv', 'rv-in');
        el.style.removeProperty('--rv-delay');
      }
    }, delay + 1400);
  }

  function track(el, delay) {
    if (!revealObserver) return;
    if (delay) el.style.setProperty('--rv-delay', `${delay}ms`);
    if (ready) revealObserver.observe(el);
    else pending.push(el);
  }

  function addReveal(el, delay) {
    if (!revealObserver || el.closest('#preloader, #lightbox-modal, #main-header, #mobile-menu')) return;
    el.classList.add('rv');
    track(el, delay);
  }

  function siblingIndex(el, selector) {
    const parent = el.parentElement;
    if (!parent) return 0;
    return Array.from(parent.children).filter(c => c.matches(selector)).indexOf(el);
  }

  function setupReveals() {
    if (!revealObserver) return;

    // Hero headlines: masked line-by-line rise
    document.querySelectorAll('section h1').forEach((h1, hIdx) => {
      const spans = Array.from(h1.children).filter(c => c.tagName === 'SPAN');
      const onlySpans = Array.from(h1.childNodes).every(n => n.nodeType !== 3 || !n.textContent.trim());
      const groups = spans.length >= 2 && onlySpans ? spans : null;
      const lines = groups || [h1];
      lines.forEach((node, i) => {
        const mask = document.createElement('span');
        mask.className = 'line-mask';
        const inner = document.createElement('span');
        inner.className = 'line-inner';
        if (node === h1) {
          while (h1.firstChild) inner.appendChild(h1.firstChild);
          mask.appendChild(inner);
          h1.appendChild(mask);
        } else {
          node.parentNode.insertBefore(mask, node);
          inner.appendChild(node);
          mask.appendChild(inner);
        }
        track(mask, 150 + i * 120 + hIdx * 50);
      });
    });

    // Section titles: word-by-word rise
    document.querySelectorAll('section h2').forEach(h2 => {
      if (h2.children.length) return;
      const words = h2.textContent.trim().split(/\s+/);
      h2.textContent = '';
      words.forEach((w, i) => {
        const span = document.createElement('span');
        span.className = 'word';
        span.style.setProperty('--w', i);
        span.textContent = w;
        h2.append(span, i < words.length - 1 ? ' ' : '');
      });
      h2.classList.add('split-words');
      track(h2, 120);
    });

    document.querySelectorAll('.islamic-divider').forEach(d => {
      d.classList.add('rv-line');
      track(d, 200);
    });

    // Blocks flagged in markup
    document.querySelectorAll('.reveal-on-scroll').forEach(el => {
      const idx = Math.max(0, siblingIndex(el, '.reveal-on-scroll'));
      addReveal(el, idx * 110);
    });

    // Children of static grids stagger in
    document.querySelectorAll('.grid').forEach(grid => {
      if (grid.id === 'activities-grid' || grid.id === 'leadership-grid') return;
      const kids = Array.from(grid.children).filter(c => !c.classList.contains('reveal-on-scroll'));
      if (kids.length < 2) return;
      kids.forEach((kid, i) => addReveal(kid, 80 + i * 90));
    });

    // Stand-alone rows inside the join column and footer
    document.querySelectorAll('#join .space-y-4 > div, footer .pt-8').forEach((el, i) => addReveal(el, (i % 3) * 90));
  }

  function animateGridChildren(grid) {
    Array.from(grid.children).forEach((card, i) => {
      if (card.classList.contains('rv') || card.classList.contains('col-span-full')) return;
      addReveal(card, Math.min(i, 8) * 80);
    });
  }

  function setupDynamicGrids() {
    ['activities-grid', 'leadership-grid'].forEach(id => {
      const grid = document.getElementById(id);
      if (!grid) return;
      animateGridChildren(grid);
      new MutationObserver(() => {
        if (grid.dataset.instant === '1') return;
        animateGridChildren(grid);
      }).observe(grid, { childList: true });
    });

    // Fade the old cards out before a filter re-render
    let filterClickAt = 0;
    document.addEventListener('click', e => {
      if (e.target.closest('.event-filter-btn, .leadership-filter-btn')) filterClickAt = performance.now();
    }, true);

    [['renderEventsList', 'activities-grid'], ['renderLeadershipList', 'leadership-grid']].forEach(([fnName, gridId]) => {
      const original = window[fnName];
      const grid = document.getElementById(gridId);
      if (typeof original !== 'function' || !grid) return;
      let token = 0;
      window[fnName] = function () {
        const fromFilter = performance.now() - filterClickAt < 60;
        const fromSearch = document.activeElement && document.activeElement.id === 'leadership-search';
        if (fromSearch) {
          grid.dataset.instant = '1';
          original.apply(this, arguments);
          grid.dataset.instant = '';
          return;
        }
        if (!fromFilter || !grid.children.length || !motionOn) {
          original.apply(this, arguments);
          return;
        }
        const myToken = ++token;
        grid.style.minHeight = `${grid.offsetHeight}px`;
        grid.classList.add('grid-leaving');
        setTimeout(() => {
          if (myToken !== token) return;
          grid.classList.remove('grid-leaving');
          original.apply(this, arguments);
          setTimeout(() => { grid.style.minHeight = ''; }, 900);
          if (lenis) lenis.resize();
        }, 240);
      };
    });
  }

  /* ==========================================================================
     4. HERO EXTRAS: COUNT-UP STATS & SCROLL CUE
     ========================================================================== */
  function setupCounters() {
    const stats = document.querySelectorAll('#home .grid .text-2xl.font-cinzel');
    stats.forEach(el => {
      const raw = el.textContent.trim();
      const match = raw.match(/^(\d+)(\+?)$/);
      if (!match) return;
      const target = parseInt(match[1], 10);
      const pad = match[1].length;
      const from = target > 1000 ? target - 60 : 0;
      el.dataset.countTarget = target;
      el.dataset.countPad = pad;
      el.dataset.countFrom = from;
      el.dataset.countSuffix = match[2];
      if (motionOn) el.textContent = String(from).padStart(pad, '0') + match[2];
    });
  }

  function runCounters() {
    document.querySelectorAll('[data-count-target]').forEach((el, i) => {
      const target = +el.dataset.countTarget;
      const from = +el.dataset.countFrom;
      const pad = +el.dataset.countPad;
      const suffix = el.dataset.countSuffix;
      const duration = 1800;
      const start = performance.now() + 500 + i * 120;
      const tick = now => {
        const t = Math.min(1, Math.max(0, (now - start) / duration));
        const eased = 1 - Math.pow(1 - t, 4);
        el.textContent = String(Math.round(from + (target - from) * eased)).padStart(pad, '0') + suffix;
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }

  function setupScrollCue() {
    const hero = document.getElementById('home');
    if (!hero || !document.getElementById('about')) return;
    const cue = document.createElement('a');
    cue.href = '#about';
    cue.className = 'scroll-cue';
    cue.setAttribute('aria-label', 'Scroll to explore');
    cue.innerHTML = '<span>Scroll</span><span class="scroll-cue-line"></span>';
    hero.appendChild(cue);
    addReveal(cue, 900);
  }

  /* ==========================================================================
     5. SCROLL-LINKED CHROME: PROGRESS BAR, PARALLAX, SCROLL-SPY
     ========================================================================== */
  const progressBar = document.createElement('div');
  progressBar.className = 'scroll-progress';
  document.body.appendChild(progressBar);

  const heroVisual = document.querySelector('#home .lg\\:col-span-5 > div');
  const heroGlow = document.querySelector('#home > .absolute');

  function onScroll() {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;


    // Translated items at the very end of the page can sit below the observer's edge
    if (ready && max - y < 8) {
      document.querySelectorAll('.rv:not(.rv-in), .line-mask:not(.rv-in), .split-words:not(.rv-in), .rv-line:not(.rv-in)').forEach(el => {
        if (el.getBoundingClientRect().top < window.innerHeight) reveal(el);
      });
    }

    if (!reduceMotion && y < window.innerHeight * 1.2) {
      if (heroVisual) heroVisual.style.translate = `0 ${y * 0.18}px`;
      if (heroGlow) heroGlow.style.translate = `0 ${y * 0.35}px`;
    }
  }
  if (lenis) lenis.on('scroll', onScroll);
  else window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
  function updateActiveNav(hash) {
    navLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === hash));
  }

  function setupScrollSpy() {
    const anchors = Array.from(navLinks).filter(l => (l.getAttribute('href') || '').startsWith('#'));
    if (!anchors.length || !('IntersectionObserver' in window)) return;
    const ids = new Set(anchors.map(l => l.getAttribute('href').slice(1)));
    const spy = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && ids.has(entry.target.id)) updateActiveNav(`#${entry.target.id}`);
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    document.querySelectorAll('section[id]').forEach(s => spy.observe(s));
  }

  /* ==========================================================================
     6. POINTER MICRO-INTERACTIONS: MAGNETIC BUTTONS, TILT, SPOTLIGHT, HERO DEPTH
     ========================================================================== */
  function setupPointerEffects() {
    if (!finePointer || reduceMotion) return;

    document.querySelectorAll('.btn-gold, .btn-outline-gold, .theme-toggle-btn').forEach(btn => {
      btn.classList.add('is-magnetic');
      btn.addEventListener('mousemove', e => {
        const r = btn.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        btn.style.transform = `translate3d(${dx * 0.22}px, ${dy * 0.35}px, 0)`;
      });
      btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
    });

    // Spotlight follows the pointer on every panel (delegated, works for rendered cards)
    document.addEventListener('pointermove', e => {
      const panel = e.target.closest && e.target.closest('.glass-panel');
      if (!panel) return;
      const r = panel.getBoundingClientRect();
      panel.style.setProperty('--mx', `${e.clientX - r.left}px`);
      panel.style.setProperty('--my', `${e.clientY - r.top}px`);

      if (panel.classList.contains('tilt-card') && !panel.classList.contains('rv')) {
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        panel.classList.add('is-tilting');
        panel.style.transform = `perspective(1100px) rotateX(${(-py * 7).toFixed(2)}deg) rotateY(${(px * 7).toFixed(2)}deg) translate3d(0, -4px, 0)`;
      }
    }, { passive: true });

    document.addEventListener('pointerout', e => {
      const panel = e.target.closest && e.target.closest('.tilt-card');
      if (!panel || panel.contains(e.relatedTarget)) return;
      panel.classList.remove('is-tilting');
      panel.style.transform = '';
    }, { passive: true });

    // Hero logo drifts against the pointer for depth
    const heroImg = document.querySelector('#home img[src*="isc-logo-full"]');
    const badges = document.querySelectorAll('#home .animate-float-slow, #home .animate-float-delayed');
    const hero = document.getElementById('home');
    if (heroImg && hero) {
      let tx = 0, ty = 0, cx = 0, cy = 0, running = false;
      const loop = () => {
        cx += (tx - cx) * 0.08;
        cy += (ty - cy) * 0.08;
        heroImg.style.translate = `${cx * -18}px ${cy * -18}px`;
        badges.forEach((b, i) => { b.style.translate = `${cx * (i ? 26 : -26)}px ${cy * 20}px`; });
        if (Math.abs(tx - cx) > 0.001 || Math.abs(ty - cy) > 0.001) requestAnimationFrame(loop);
        else running = false;
      };
      hero.addEventListener('mousemove', e => {
        tx = e.clientX / window.innerWidth - 0.5;
        ty = e.clientY / window.innerHeight - 0.5;
        if (!running) { running = true; requestAnimationFrame(loop); }
      });
      hero.addEventListener('mouseleave', () => {
        tx = 0; ty = 0;
        if (!running) { running = true; requestAnimationFrame(loop); }
      });
    }
  }

  /* ==========================================================================
     7. BOOT — reveals wait until the preloader / arrival curtain has lifted
     ========================================================================== */
  function start() {
    if (ready) return;
    ready = true;
    root.classList.add('isc-ready');
    pending.splice(0).forEach(el => revealObserver && revealObserver.observe(el));
    runCounters();
  }

  document.addEventListener('DOMContentLoaded', () => {
    setupReveals();
    setupScrollCue();
    setupCounters();
    setupDynamicGrids();
    setupScrollSpy();
    setupPointerEffects();
    if (lenis) lenis.resize();

    if (window.ISC_READY) start();
    else window.addEventListener('isc:ready', start, { once: true });
    setTimeout(start, 3500);
  });
})();
