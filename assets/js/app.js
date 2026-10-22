/**
 * IQBAL STUDY CENTRE (ISC) — ULTRA-FAST APPLICATION SCRIPT
 * High graphics, zero-lag, 60-120fps smooth scrolling, full bilingual support
 */

window.currentLang = localStorage.getItem('isc_lang') || 'en';
window.currentTheme = localStorage.getItem('isc_theme') || 'dark';

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initLanguage();
  initFastCursor();
  initAmbientAudio();
  initNavbarScroll();
  initMobileMenu();
  initLightbox();
  initEventsRenderer();
  initLeadershipRenderer();
  initJoinForm();
  initViewRouter();
});

/* ==========================================================================
   1. THEME ENGINE (DARK / LIGHT MODE)
   ========================================================================== */
function initTheme() {
  if (window.currentTheme === 'light') {
    document.body.classList.add('light-mode');
  } else {
    document.body.classList.remove('light-mode');
  }
  updateThemeIcons();

  const themeBtns = document.querySelectorAll('.theme-toggle-btn');
  themeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (document.body.classList.contains('light-mode')) {
        document.body.classList.remove('light-mode');
        window.currentTheme = 'dark';
      } else {
        document.body.classList.add('light-mode');
        window.currentTheme = 'light';
      }
      localStorage.setItem('isc_theme', window.currentTheme);
      updateThemeIcons();
    });
  });
}

function updateThemeIcons() {
  const isLight = document.body.classList.contains('light-mode');
  const themeIcons = document.querySelectorAll('.theme-toggle-icon');
  themeIcons.forEach(icon => {
    if (isLight) {
      icon.innerHTML = `<svg class="w-4 h-4 text-slate-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>`;
    } else {
      icon.innerHTML = `<svg class="w-4 h-4 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>`;
    }
  });
}

/* ==========================================================================
   2. BILINGUAL LANGUAGE ENGINE (ENGLISH <-> BENGALI)
   ========================================================================== */
function initLanguage() {
  applyLanguage(window.currentLang);

  const langToggles = document.querySelectorAll('.lang-btn');
  langToggles.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetLang = btn.dataset.lang;
      if (targetLang && targetLang !== window.currentLang) {
        window.currentLang = targetLang;
        localStorage.setItem('isc_lang', targetLang);
        applyLanguage(targetLang);
      }
    });
  });
}

function applyLanguage(lang) {
  if (!window.ISC_DATA || !window.ISC_DATA.i18n) return;
  const dict = window.ISC_DATA.i18n[lang] || window.ISC_DATA.i18n.en;

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict[key]) {
      el.textContent = dict[key];
    }
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (dict[key]) {
      el.placeholder = dict[key];
    }
  });

  document.querySelectorAll('.lang-btn').forEach(btn => {
    if (btn.dataset.lang === lang) {
      btn.classList.add('bg-amber-500', 'text-black', 'font-bold');
      btn.classList.remove('text-slate-400');
    } else {
      btn.classList.remove('bg-amber-500', 'text-black', 'font-bold');
      btn.classList.add('text-slate-400');
    }
  });

  if (typeof renderEventsList === 'function') renderEventsList();
  if (typeof renderLeadershipList === 'function') renderLeadershipList();
}

/* ==========================================================================
   3. ZERO-LAG HARDWARE ACCELERATED CUSTOM CURSOR (using translate3d)
   ========================================================================== */
function initFastCursor() {
  const dot = document.querySelector('.custom-cursor-dot');
  const outline = document.querySelector('.custom-cursor-outline');
  if (!dot || !outline || window.innerWidth <= 1024) return;

  let mouseX = -100, mouseY = -100;
  let outlineX = -100, outlineY = -100;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.transform = `translate3d(${mouseX - 3.5}px, ${mouseY - 3.5}px, 0)`;
  }, { passive: true });

  function renderCursor() {
    outlineX += (mouseX - outlineX) * 0.2;
    outlineY += (mouseY - outlineY) * 0.2;
    outline.style.transform = `translate3d(${outlineX - 16}px, ${outlineY - 16}px, 0)`;
    requestAnimationFrame(renderCursor);
  }
  requestAnimationFrame(renderCursor);

  document.addEventListener('mouseover', (e) => {
    if (e.target.closest('a, button, input, select, textarea, .cursor-pointer')) {
      outline.classList.add('hovered');
    }
  }, { passive: true });

  document.addEventListener('mouseout', (e) => {
    if (e.target.closest('a, button, input, select, textarea, .cursor-pointer')) {
      outline.classList.remove('hovered');
    }
  }, { passive: true });
}

/* ==========================================================================
   4. LIGHTWEIGHT AMBIENT AUDIO SYNTHESIZER
   ========================================================================== */
let audioCtx = null;
let isAudioPlaying = false;
let oscillators = [];
let masterGain = null;

function initAmbientAudio() {
  const widget = document.getElementById('audio-widget');
  const widgetText = document.getElementById('audio-status-text');
  if (!widget) return;

  widget.addEventListener('click', () => {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContext();
    }
    if (audioCtx.state === 'suspended') audioCtx.resume();

    if (isAudioPlaying) {
      if (masterGain) {
        masterGain.gain.linearRampToValueAtTime(0.001, audioCtx.currentTime + 0.8);
        setTimeout(() => {
          oscillators.forEach(o => o.stop());
          oscillators = [];
        }, 800);
      }
      widget.classList.add('sound-paused');
      if (widgetText) widgetText.textContent = window.currentLang === 'bn' ? "অ্যাম্বিয়েন্ট সাউন্ড: বন্ধ" : "Atmosphere: Paused";
      isAudioPlaying = false;
    } else {
      masterGain = audioCtx.createGain();
      masterGain.gain.setValueAtTime(0.001, audioCtx.currentTime);
      masterGain.gain.linearRampToValueAtTime(0.06, audioCtx.currentTime + 1.5);
      masterGain.connect(audioCtx.destination);

      const filter = audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400, audioCtx.currentTime);
      filter.connect(masterGain);

      const frequencies = [73.42, 110.0, 146.83, 220.0];
      oscillators = frequencies.map((freq, idx) => {
        const osc = audioCtx.createOscillator();
        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        const oscGain = audioCtx.createGain();
        oscGain.gain.setValueAtTime(0.15 / frequencies.length, audioCtx.currentTime);
        osc.connect(oscGain);
        oscGain.connect(filter);
        osc.start();
        return osc;
      });

      widget.classList.remove('sound-paused');
      if (widgetText) widgetText.textContent = window.currentLang === 'bn' ? "সুফি মেডিটেশন অডিও চলমান" : "Atmosphere: Meditative Drone";
      isAudioPlaying = true;
    }
  });
}

/* ==========================================================================
   5. NAVBAR & MOBILE MENU
   ========================================================================== */
function initNavbarScroll() {
  const header = document.getElementById('main-header');
  if (!header) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
      header.classList.add('navbar-scrolled');
    } else {
      header.classList.remove('navbar-scrolled');
    }
  }, { passive: true });
}

function initMobileMenu() {
  const toggleBtn = document.getElementById('mobile-menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');

  if (!toggleBtn || !mobileMenu) return;

  toggleBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
  });

  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.add('hidden');
    });
  });
}

/* ==========================================================================
   6. LIGHTBOX MODAL
   ========================================================================== */
function initLightbox() {
  const overlay = document.getElementById('lightbox-modal');
  const imgEl = document.getElementById('lightbox-img');
  const titleEl = document.getElementById('lightbox-title');
  const venueEl = document.getElementById('lightbox-venue');
  const descEl = document.getElementById('lightbox-desc');
  const closeBtn = document.getElementById('lightbox-close');

  if (!overlay || !imgEl) return;

  window.openLightbox = function(imgSrc, title, venue, desc) {
    imgEl.src = imgSrc;
    if (titleEl) titleEl.textContent = title || '';
    if (venueEl) venueEl.textContent = venue || '';
    if (descEl) descEl.textContent = desc || '';
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  function closeLightbox() {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeLightbox();
  });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('active')) closeLightbox();
  });
}

/* ==========================================================================
   7. DOCUMENTED ACTIVITIES & EVENTS RENDERER
   ========================================================================== */
let activeEventCategory = 'all';

function initEventsRenderer() {
  const filterBtns = document.querySelectorAll('.event-filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => {
        b.classList.remove('bg-amber-500', 'text-black', 'border-amber-400');
        b.classList.add('bg-slate-900/60', 'text-slate-300', 'border-slate-700');
      });
      btn.classList.add('bg-amber-500', 'text-black', 'border-amber-400');
      btn.classList.remove('bg-slate-900/60', 'text-slate-300', 'border-slate-700');
      activeEventCategory = btn.dataset.category || 'all';
      renderEventsList();
    });
  });

  renderEventsList();
}

function renderEventsList() {
  const container = document.getElementById('activities-grid');
  if (!container || !window.ISC_DATA) return;

  const isBn = window.currentLang === 'bn';
  let activities = window.ISC_DATA.documentedActivities;

  if (activeEventCategory !== 'all') {
    activities = activities.filter(a => a.categoryKey === activeEventCategory);
  }

  container.innerHTML = activities.map((act, idx) => {
    const title = isBn ? act.titleBn : act.titleEn;
    const date = isBn ? act.dateBn : act.dateEn;
    const venue = isBn ? act.venueBn : act.venueEn;
    const category = isBn ? act.categoryBn : act.categoryEn;
    const summary = isBn ? act.summaryBn : act.summaryEn;
    const speakers = isBn ? act.speakersBn : act.speakersEn;
    const awards = isBn ? act.awardsBn : act.awardsEn;

    return `
      <div class="glass-panel overflow-hidden flex flex-col justify-between">
        <!-- Event Image with Aspect Ratio & Expand Trigger -->
        <div class="relative luxury-image-frame h-64 sm:h-72 cursor-pointer group" onclick="openLightbox('${act.image}', '${escapeHtml(title)}', '${escapeHtml(venue)}', '${escapeHtml(summary)}')">
          <img src="${act.image}" alt="${title}" loading="lazy" decoding="async" class="w-full h-full object-cover">
          <div class="absolute inset-0 bg-gradient-to-t from-[#040812] via-transparent to-transparent opacity-80 group-hover:opacity-40 transition-opacity"></div>
          
          <div class="absolute top-3 left-3 z-10">
            <span class="gold-badge text-[11px]">${category}</span>
          </div>

          <div class="absolute bottom-3 left-3 right-3 z-10 flex items-center justify-between">
            <div class="flex items-center gap-1.5 text-xs text-amber-300 font-mono bg-black/70 px-3 py-1 rounded-full border border-amber-400/30">
              <svg class="w-3.5 h-3.5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              <span>${date}</span>
            </div>
            <div class="opacity-0 group-hover:opacity-100 transition-opacity bg-amber-500 text-black px-2.5 py-1 rounded-full text-xs font-bold font-cinzel flex items-center gap-1">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"></path></svg>
              ${isBn ? 'ছবি বড় করুন' : 'Expand'}
            </div>
          </div>
        </div>

        <!-- Event Body -->
        <div class="p-6 md:p-7 flex-1 flex flex-col justify-between">
          <div>
            <h3 class="text-xl font-bold font-cinzel text-slate-100 mb-2 leading-snug">
              ${title}
            </h3>
            
            <p class="text-xs text-teal-400 font-semibold flex items-center gap-1.5 mb-3 font-mono">
              <svg class="w-4 h-4 text-teal-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
              <span>${venue}</span>
            </p>

            <p class="text-sm text-slate-300 leading-relaxed mb-5 font-sans">
              ${summary}
            </p>
          </div>

          <!-- Speakers Section -->
          ${speakers && speakers.length > 0 ? `
            <div class="border-t border-slate-800 pt-3.5 mt-auto">
              <div class="text-[11px] uppercase tracking-wider text-amber-400 font-bold mb-2">
                ${isBn ? 'বিশিষ্ট বক্তা ও আলোচকবৃন্দ:' : 'Distinguished Speakers / Key Participants:'}
              </div>
              <ul class="text-xs text-slate-300 space-y-1 font-sans">
                ${speakers.map(spk => `<li class="flex items-start gap-1.5"><span class="text-amber-500">✦</span><span>${spk}</span></li>`).join('')}
              </ul>
            </div>
          ` : ''}

          <!-- Awards Section (if any) -->
          ${awards && awards.length > 0 ? `
            <div class="border-t border-slate-800 pt-3 mt-3.5">
              <div class="text-[11px] uppercase tracking-wider text-teal-400 font-bold mb-2">
                ${isBn ? 'পাঠ-প্রতিক্রিয়া পুরস্কার প্রাপ্ত শিক্ষার্থী:' : 'Reading Response Prize Laureates:'}
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
                ${awards.map(aw => `
                  <div class="bg-teal-950/40 border border-teal-500/30 p-2 rounded-xl text-center">
                    <div class="text-[10px] text-teal-300 font-bold uppercase font-mono">${aw.place}</div>
                    <div class="text-xs font-semibold text-slate-100">${aw.recipient}</div>
                    <div class="text-[10px] text-slate-400 mt-0.5 truncate">${aw.project}</div>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');
}

/* ==========================================================================
   8. LEADERSHIP DIRECTORY RENDERER (ALL 47 MEMBERS EXACT DATA)
   ========================================================================== */
let activeLeadershipCat = 'all';
let activeLeadershipSearch = '';

function initLeadershipRenderer() {
  const filterBtns = document.querySelectorAll('.leadership-filter-btn');
  const searchInput = document.getElementById('leadership-search');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => {
        b.classList.remove('bg-amber-500', 'text-black', 'border-amber-400');
        b.classList.add('bg-slate-900/60', 'text-slate-300', 'border-slate-700');
      });
      btn.classList.add('bg-amber-500', 'text-black', 'border-amber-400');
      btn.classList.remove('bg-slate-900/60', 'text-slate-300', 'border-slate-700');
      activeLeadershipCat = btn.dataset.category || 'all';
      renderLeadershipList();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      activeLeadershipSearch = e.target.value.toLowerCase();
      renderLeadershipList();
    });
  }

  renderLeadershipList();
}

function renderLeadershipList() {
  const container = document.getElementById('leadership-grid');
  if (!container || !window.ISC_DATA) return;

  const isBn = window.currentLang === 'bn';
  const { advisoryCouncil, executiveCouncil, generalMembers } = window.ISC_DATA.leadership;

  let list = [];
  if (activeLeadershipCat === 'all' || activeLeadershipCat === 'advisory') {
    list.push(...advisoryCouncil.map(item => ({
      id: item.id,
      name: isBn ? item.nameBn : item.nameEn,
      role: isBn ? item.roleBn : item.roleEn,
      affiliation: isBn ? item.institutionBn : item.institutionEn,
      category: isBn ? 'উপদেষ্টা পরিষদ' : 'Advisory Council',
      badgeColor: 'border-amber-400/40 text-amber-300 bg-amber-500/10'
    })));
  }

  if (activeLeadershipCat === 'all' || activeLeadershipCat === 'executive') {
    list.push(...executiveCouncil.map(item => ({
      id: item.id,
      name: isBn ? item.nameBn : item.nameEn,
      role: isBn ? item.roleBn : item.roleEn,
      affiliation: isBn ? item.affiliationBn : item.affiliationEn,
      category: isBn ? 'কেন্দ্রীয় নির্বাহী পরিষদ' : 'Central Executive Council',
      badgeColor: 'border-teal-400/40 text-teal-300 bg-teal-500/10'
    })));
  }

  if (activeLeadershipCat === 'all' || activeLeadershipCat === 'members') {
    list.push(...generalMembers.map(item => ({
      id: item.id,
      name: isBn ? item.nameBn : item.nameEn,
      role: isBn ? (item.noteBn || 'সাধারণ পরিষদ সদস্য') : (item.noteEn || 'General Member'),
      affiliation: isBn ? (item.noteBn ? item.noteBn : 'ইকবাল চর্চা কেন্দ্র সদস্য') : (item.noteEn ? item.noteEn : 'Iqbal Study Centre Member'),
      category: isBn ? 'সাধারণ পরিষদ' : 'General Member',
      badgeColor: 'border-slate-500/40 text-slate-300 bg-slate-500/10'
    })));
  }

  if (activeLeadershipSearch.trim() !== '') {
    list = list.filter(m => 
      m.name.toLowerCase().includes(activeLeadershipSearch) ||
      m.role.toLowerCase().includes(activeLeadershipSearch) ||
      m.affiliation.toLowerCase().includes(activeLeadershipSearch)
    );
  }

  if (list.length === 0) {
    container.innerHTML = `
      <div class="col-span-full text-center py-12 text-slate-400">
        <p class="text-base">${isBn ? 'কোনো সদস্য খুঁজে পাওয়া যায়নি।' : 'No members found matching your search.'}</p>
      </div>
    `;
    return;
  }

  container.innerHTML = list.map((m) => `
    <div class="glass-panel p-5 rounded-2xl flex flex-col justify-between">
      <div>
        <div class="flex items-center justify-between mb-3">
          <span class="text-[10px] uppercase font-mono tracking-wider px-2.5 py-0.5 rounded-full border ${m.badgeColor}">${m.category}</span>
          <span class="text-xs font-mono text-slate-500">#${m.id.toString().padStart(2, '0')}</span>
        </div>
        <div class="w-11 h-11 rounded-full bg-slate-900 border border-amber-500/30 flex items-center justify-center mb-3 text-amber-300 font-bold font-cinzel text-sm">
          ${getInitials(m.name)}
        </div>
        <h4 class="text-base font-bold font-cinzel text-slate-100 mb-1 leading-snug">
          ${m.name}
        </h4>
        <p class="text-xs font-semibold text-amber-400/90 mb-2 leading-relaxed">
          ${m.role}
        </p>
      </div>
      <div class="border-t border-slate-800 pt-2.5 mt-3 text-xs text-slate-400 flex items-center gap-1.5">
        <svg class="w-3.5 h-3.5 text-teal-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
        <span class="truncate">${m.affiliation}</span>
      </div>
    </div>
  `).join('');
}

/* ==========================================================================
   9. JOIN FORM SUBMIT
   ========================================================================== */
function initJoinForm() {
  const form = document.getElementById('join-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const isBn = window.currentLang === 'bn';
    const name = document.getElementById('join-name')?.value || 'Friend';
    const uni = document.getElementById('join-university')?.value || 'University';

    alert(isBn 
      ? `অভিনন্দন ${name}! ইকবাল চর্চা কেন্দ্রে আপনার আবেদন সফলভাবে গৃহীত হয়েছে। আমাদের কেন্দ্রীয় সমন্বয়ক শিগগিরই আপনার সাথে যোগাযোগ করবেন।`
      : `Congratulations ${name} (${uni})! Your membership application has been received. Our campus coordinators will contact you soon via WhatsApp.`
    );
    form.reset();
  });
}

/* ==========================================================================
   10. VIEW ROUTER
   ========================================================================== */
function initViewRouter() {
  const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
  function handleHash() {
    const hash = window.location.hash || '#home';
    const targetSection = document.querySelector(hash);
    if (targetSection) {
      targetSection.scrollIntoView({ behavior: 'smooth' });
    }
    navLinks.forEach(link => {
      if (link.getAttribute('href') === hash) link.classList.add('active');
      else link.classList.remove('active');
    });
  }
  window.addEventListener('hashchange', handleHash);
  if (window.location.hash) setTimeout(handleHash, 300);
}

function getInitials(name) {
  if (!name) return 'ISC';
  const parts = name.split(' ').filter(p => !['dr.', 'dr', 'md.', 'md', 'ড.', 'মো.'].includes(p.toLowerCase()));
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/'/g, "\\'").replace(/"/g, '&quot;');
}
