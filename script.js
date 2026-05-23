/* ==========================================================================
   PORTOFOLIO — Axel Alexius Latukolan
   script.js  |  Production Build
   Architecture: Config → DOM → Performance → Modules → Init
   ========================================================================== */

/* ==========================================================================
   1. CONFIG & CONSTANTS
   ========================================================================== */
const CONFIG = {
  loader: {
    speedMin:      2,
    speedMax:      5,
    intervalMobile: 40,
    intervalDesktop: 60,
    hideDelay:     400,
    displayDelay:  800,
    introDelay:    1800,
  },
  particles: {
    countUltraLow: 10,
    countLow:      18,
    countMobile:   25,
    countDesktop:  85,
    connectDist:   140,
    mouseRadius:   160,
    speed:         0.4,
    lineWidth:     1.2,
    lowEndThrottle: 40,
  },
  cursor: {
    glowLerp:  0.2,
    auraLerp:  0.08,
    trailLerp: 0.35,
    rippleDuration: 600,
  },
  nav: {
    scrollThreshold: 50,
    activeDelay:     150,
    scrollOffset:    10,
  },
  skill: {
    staggerDelay: 150,
    threshold:    0.2,
  },
  wa: {
    animInterval: 2000,
    scaleUp:      'scale(1.05)',
    scaleDown:    'scale(1)',
    duration:     300,
  },
  typing: {
    speedLow:  28,
    speedFast: 18,
  },
};


/* ==========================================================================
   2. DEVICE & PERFORMANCE DETECTION
   ========================================================================== */
const Device = (() => {
  const cpuCores = navigator.hardwareConcurrency || 4;
  const ram      = navigator.deviceMemory        || 4;

  return {
    isMobile:            window.innerWidth < 768,
    isTouch:             'ontouchstart' in window,
    lowEnd:              cpuCores <= 4 || ram <= 4,
    ultraLowEnd:         cpuCores <= 2 || ram <= 2,
    prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  };
})();


/* ==========================================================================
   3. DOM REFERENCES
   ========================================================================== */
const DOM = {
  // Nav
  navbar:       document.querySelector('.navbar'),
  menuToggle:   document.getElementById('menuToggle'),
  navLinks:     document.getElementById('navLinks'),
  overlay:      document.querySelector('.nav-overlay'),

  // Theme
  themeBtn:     document.getElementById('themeToggle'),

  // Lang
  idBtn:        document.getElementById('idBtn'),
  enBtn:        document.getElementById('enBtn'),

  // Hero
  typingEl:     document.getElementById('typing'),

  // Loader
  progressBar:  document.querySelector('.loader-progress'),
  percentText:  document.getElementById('loadPercent'),
  loader:       document.querySelector('.loader'),

  // Cursor
  cursorGlow:   document.querySelector('.cursor-glow'),
  cursorAura:   document.querySelector('.cursor-aura'),
  cursorTrail:  document.querySelector('.cursor-trail'),

  // Sections
  sections:     document.querySelectorAll('section, header'),
  links:        document.querySelectorAll('.nav-links a'),
  skillCards:   document.querySelectorAll('.skill-card'),
  revealEls:    document.querySelectorAll('.reveal, .reveal-left, .reveal-right'),
  footer:       document.querySelector('.footer'),
  waBtn:        document.querySelector('.wa-btn'),
  allImgs:      document.querySelectorAll('img'),
  allLinks:     document.querySelectorAll('a'),
};


/* ==========================================================================
   4. LOADER — Web3 Fake Progress
   ========================================================================== */
const Loader = (() => {
  let progress = 0;

  function tick() {
    const speed = Math.random() * CONFIG.loader.speedMax + CONFIG.loader.speedMin;
    progress = Math.min(progress + speed, 100);

    const display = Math.floor(progress);
    if (DOM.percentText) DOM.percentText.innerText = `SYNC ${display}%`;
    if (DOM.progressBar) DOM.progressBar.style.width = `${progress}%`;

    if (progress >= 100) {
      _finish();
      return;
    }

    const delay = Device.isMobile
      ? CONFIG.loader.intervalMobile
      : CONFIG.loader.intervalDesktop;

    setTimeout(tick, delay);
  }

  function _finish() {
    if (DOM.percentText) DOM.percentText.innerText = '100%';
    if (DOM.progressBar) DOM.progressBar.style.width = '100%';

    setTimeout(() => {
      DOM.loader?.classList.add('hide');
      document.body.classList.add('intro-active');

      setTimeout(() => {
        if (DOM.loader) DOM.loader.style.display = 'none';
        document.body.classList.remove('loading');
      }, CONFIG.loader.displayDelay);

      setTimeout(() => {
        document.body.classList.remove('intro-active');
      }, CONFIG.loader.introDelay);

    }, CONFIG.loader.hideDelay);
  }

  return { init: () => window.addEventListener('load', tick) };
})();


/* ==========================================================================
   5. NAVIGATION — Menu, Overlay, Active State, Scroll
   ========================================================================== */
const Nav = (() => {

  // --- Mobile menu toggle ---
  function _closeMenu() {
    DOM.navLinks?.classList.remove('active');
    DOM.menuToggle?.classList.remove('active');
    DOM.overlay?.classList.remove('active');
    document.body.classList.remove('menu-open');
  }

  function _initMenuToggle() {
    if (!DOM.menuToggle || !DOM.navLinks) return;

    DOM.menuToggle.addEventListener('click', () => {
      const isOpen = DOM.navLinks.classList.toggle('active');
      DOM.menuToggle.classList.toggle('active', isOpen);
      DOM.overlay?.classList.toggle('active', isOpen);
      document.body.classList.toggle('menu-open', isOpen);

      // Reset active link highlight when opening
      if (isOpen) {
        DOM.links.forEach(l => l.classList.remove('active'));
      }
    });

    // Close on nav link click
    DOM.links.forEach(link => {
      link.addEventListener('click', () => {
        _closeMenu();
        setTimeout(_updateActiveLink, CONFIG.nav.activeDelay);
      });
    });
  }

  // --- Overlay click to close ---
  function _initOverlay() {
    DOM.overlay?.addEventListener('click', _closeMenu);
  }

  // --- ESC key to close ---
  function _initEscClose() {
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') _closeMenu();
    });
  }

  // --- Active link highlight based on scroll position ---
  function _updateActiveLink() {
    const navHeight = DOM.navbar?.offsetHeight ?? 80;
    let current = '';

    DOM.sections.forEach(sec => {
      if (window.scrollY >= sec.offsetTop - navHeight &&
          window.scrollY <  sec.offsetTop + sec.offsetHeight - navHeight) {
        current = sec.id;
      }
    });

    DOM.links.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
    });
  }

  // --- Navbar scroll state & scroll-margin ---
  function _updateScrollState() {
    if (!DOM.navbar) return;
    DOM.navbar.classList.toggle('scrolled', window.scrollY > CONFIG.nav.scrollThreshold);
  }

  function _updateScrollMargin() {
    const navHeight = DOM.navbar?.offsetHeight ?? 80;
    document.querySelectorAll('section').forEach(sec => {
      sec.style.scrollMarginTop = `${navHeight + CONFIG.nav.scrollOffset}px`;
    });
  }

  // --- Scroll handler (throttled, passive) ---
  let _scrollRaf = null;
  function _onScroll() {
    if (_scrollRaf) return;
    _scrollRaf = requestAnimationFrame(() => {
      _updateScrollState();
      _updateActiveLink();
      _scrollRaf = null;
    });
  }

  function init() {
    _initMenuToggle();
    _initOverlay();
    _initEscClose();
    _updateScrollMargin();
    _updateActiveLink();

    window.addEventListener('scroll', _onScroll, { passive: true });
    window.addEventListener('resize', _updateScrollMargin, { passive: true });
    window.addEventListener('load',   _updateActiveLink);
  }

  return { init };
})();


/* ==========================================================================
   6. PARTICLES — Canvas Animation
   ========================================================================== */
const Particles = (() => {

  function init() {
    const canvas = document.getElementById('particles');
    if (!canvas) return;

    canvas.style.transform  = 'translateZ(0)';
    canvas.style.willChange = 'transform';

    const ctx = canvas.getContext('2d');
    let running = true;

    document.addEventListener('visibilitychange', () => {
      running = !document.hidden;
    });

    // Responsive resize
    function resize() {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize, { passive: true });

    // Adaptive counts based on device capability
    const isMob = window.innerWidth < 768;
    const C = CONFIG.particles;

    const COUNT = Device.ultraLowEnd ? C.countUltraLow
                : Device.lowEnd     ? C.countLow
                : isMob             ? C.countMobile
                :                     C.countDesktop;

    const CONNECT = (Device.lowEnd || isMob) ? 0 : C.connectDist;
    const MOUSE_R = Device.lowEnd            ? 0 : C.mouseRadius;

    // Build particles
    const particles = Array.from({ length: COUNT }, () => ({
      x:     Math.random() * canvas.width,
      y:     Math.random() * canvas.height,
      vx:    (Math.random() - 0.5) * C.speed,
      vy:    (Math.random() - 0.5) * C.speed,
      base:  Math.random() * 1.8 + 0.6,
      size:  0,
      pulse: Math.random() * Math.PI * 2,
    }));

    const mouse = { x: null, y: null };
    window.addEventListener('mousemove', e => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    }, { passive: true });

    function getColor() {
      return document.body.classList.contains('light-mode')
        ? [14, 165, 233]
        : [56, 189, 248];
    }

    function draw() {
      if (!running) { requestAnimationFrame(draw); return; }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const [r, g, b] = getColor();

      // Update & draw particles
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        // Wrap edges
        if (p.x < 0)             p.x = canvas.width;
        if (p.x > canvas.width)  p.x = 0;
        if (p.y < 0)             p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        // Pulse size
        p.pulse += 0.05;
        p.size = Math.max(0.5, p.base + Math.sin(p.pulse) * 0.7);

        // Mouse repel
        if (mouse.x !== null && MOUSE_R > 0) {
          const dx   = p.x - mouse.x;
          const dy   = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MOUSE_R) {
            const force = (MOUSE_R - dist) / MOUSE_R;
            p.x += dx * force * 0.03;
            p.y += dy * force * 0.03;
          }
        }

        // Neon glow
        const radius = Math.max(1, p.size * 6);
        const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius);
        glow.addColorStop(0,   `rgba(${r},${g},${b},1)`);
        glow.addColorStop(0.3, `rgba(${r},${g},${b},0.6)`);
        glow.addColorStop(1,   `rgba(${r},${g},${b},0)`);

        ctx.beginPath();
        ctx.fillStyle = glow;
        ctx.arc(p.x, p.y, p.size * 6, 0, Math.PI * 2);
        ctx.fill();

        // Core dot
        ctx.beginPath();
        ctx.fillStyle = `rgba(${r},${g},${b},1)`;
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // Connection lines (desktop only)
      if (!isMob && CONNECT > 0) {
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const dx   = particles[i].x - particles[j].x;
            const dy   = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < CONNECT) {
              const opacity  = 1 - dist / CONNECT;
              const gradient = ctx.createLinearGradient(
                particles[i].x, particles[i].y,
                particles[j].x, particles[j].y
              );
              gradient.addColorStop(0, `rgba(${r},${g},${b},${opacity})`);
              gradient.addColorStop(1, `rgba(${r},${g},${b},0)`);

              ctx.beginPath();
              ctx.strokeStyle = gradient;
              ctx.lineWidth   = C.lineWidth;
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.stroke();
            }
          }
        }
      }

      // Throttle on low-end devices
      if (Device.lowEnd) {
        setTimeout(() => requestAnimationFrame(draw), C.lowEndThrottle);
      } else {
        requestAnimationFrame(draw);
      }
    }

    draw();
  }

  return { init };
})();


/* ==========================================================================
   7. PARALLAX — Background scroll offset
   ========================================================================== */
const Parallax = (() => {
  function init() {
    if (Device.lowEnd || Device.prefersReducedMotion) return;

    window.addEventListener('scroll', () => {
      document.body.style.setProperty('--bg-y', `${window.scrollY * 0.2}px`);
    }, { passive: true });
  }

  return { init };
})();


/* ==========================================================================
   8. ANIMATIONS — Reveal & Skill Stagger
   ========================================================================== */
const Animations = (() => {

  function _initReveal() {
    if (!DOM.revealEls.length) return;

    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('active');
      });
    }, { threshold: 0.2 });

    DOM.revealEls.forEach(el => observer.observe(el));
  }

  function _initSkillStagger() {
    if (!DOM.skillCards.length) return;

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        DOM.skillCards.forEach((card, i) => {
          setTimeout(() => {
            card.style.opacity   = '1';
            card.style.transform = 'translateY(0)';
          }, i * CONFIG.skill.staggerDelay);
        });
      });
    }, { threshold: CONFIG.skill.threshold });

    observer.observe(DOM.skillCards[0]);
  }

  function _initFooterReveal() {
    if (!DOM.footer) return;

    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('active');
      });
    }, { threshold: 0.2 });

    observer.observe(DOM.footer);
  }

  function init() {
    _initReveal();
    _initSkillStagger();
    _initFooterReveal();
  }

  return { init };
})();


/* ==========================================================================
   9. MAGNETIC BUTTONS — Hover attraction effect
   ========================================================================== */
const MagneticButtons = (() => {
  function init() {
    if (Device.isMobile || Device.lowEnd || Device.prefersReducedMotion) return;

    const magnets = document.querySelectorAll('.btn, .contact-btn, .social-btn');

    magnets.forEach(el => {
      function onMove(e) {
        const rect = el.getBoundingClientRect();
        const x    = e.clientX - rect.left - rect.width  / 2;
        const y    = e.clientY - rect.top  - rect.height / 2;
        el.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px) scale(1.05)`;
      }

      function onLeave() {
        el.style.transform = 'translate(0, 0) scale(1)';
      }

      el.addEventListener('mousemove',  onMove);
      el.addEventListener('mouseleave', onLeave);
    });
  }

  return { init };
})();


/* ==========================================================================
   10. WA BUTTON — Pulse animation
   ========================================================================== */
const WAButton = (() => {
  let interval = null;

  function init() {
    if (!DOM.waBtn) return;

    interval = setInterval(() => {
      if (document.hidden) return;
      DOM.waBtn.style.transform = CONFIG.wa.scaleUp;
      setTimeout(() => {
        DOM.waBtn.style.transform = CONFIG.wa.scaleDown;
      }, CONFIG.wa.duration);
    }, CONFIG.wa.animInterval);
  }

  // Cleanup if needed (e.g. SPA navigation)
  function destroy() {
    clearInterval(interval);
    interval = null;
  }

  return { init, destroy };
})();


/* ==========================================================================
   11. THEME — Dark / Light mode
   ========================================================================== */
const Theme = (() => {
  const ICON_LIGHT = '<span class="toggle-circle"></span><i class="fas fa-sun"></i>';
  const ICON_DARK  = '<span class="toggle-circle"></span><i class="fas fa-moon"></i>';

  function _apply(mode) {
    const isLight = mode === 'light';
    document.body.classList.toggle('light-mode', isLight);
    if (DOM.themeBtn) DOM.themeBtn.innerHTML = isLight ? ICON_LIGHT : ICON_DARK;
  }

  function init() {
    // Restore saved theme
    const saved = localStorage.getItem('theme') || 'dark';
    _apply(saved);

    DOM.themeBtn?.addEventListener('click', () => {
      const isNowLight = document.body.classList.toggle('light-mode');
      const mode       = isNowLight ? 'light' : 'dark';
      localStorage.setItem('theme', mode);
      if (DOM.themeBtn) DOM.themeBtn.innerHTML = isNowLight ? ICON_LIGHT : ICON_DARK;
    });
  }

  return { init };
})();


/* ==========================================================================
   12. CURSOR — Multi-layer smooth cursor (desktop only)
   ========================================================================== */
const Cursor = (() => {
  function init() {
    const { cursorGlow: glow, cursorAura: aura, cursorTrail: trail } = DOM;

    // Remove cursor elements on mobile / low-end
    if (Device.isMobile || Device.lowEnd || Device.prefersReducedMotion) {
      glow?.remove();
      aura?.remove();
      trail?.remove();
      return;
    }

    if (!glow || !aura || !trail) return;

    let mouseX = 0, mouseY = 0;
    let glowX  = 0, glowY  = 0;
    let auraX  = 0, auraY  = 0;
    let trailX = 0, trailY = 0;

    const C = CONFIG.cursor;

    window.addEventListener('mousemove', e => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    }, { passive: true });

    function animate() {
      glowX  += (mouseX - glowX)  * C.glowLerp;
      glowY  += (mouseY - glowY)  * C.glowLerp;
      auraX  += (mouseX - auraX)  * C.auraLerp;
      auraY  += (mouseY - auraY)  * C.auraLerp;
      trailX += (mouseX - trailX) * C.trailLerp;
      trailY += (mouseY - trailY) * C.trailLerp;

      glow.style.left  = `${glowX}px`;
      glow.style.top   = `${glowY}px`;
      aura.style.left  = `${auraX}px`;
      aura.style.top   = `${auraY}px`;
      trail.style.left = `${trailX}px`;
      trail.style.top  = `${trailY}px`;

      requestAnimationFrame(animate);
    }

    animate();

    // Scale on interactive elements
    document.querySelectorAll('a, button, .btn, .contact-btn').forEach(el => {
      el.addEventListener('mouseenter', () => {
        glow.style.transform  = 'translate(-50%, -50%) scale(1.4)';
        aura.style.transform  = 'translate(-50%, -50%) scale(1.6)';
      });
      el.addEventListener('mouseleave', () => {
        glow.style.transform  = 'translate(-50%, -50%) scale(1)';
        aura.style.transform  = 'translate(-50%, -50%) scale(1)';
      });
    });

    // Click ripple (throttled — max 1 per 100ms)
    let lastRipple = 0;
    window.addEventListener('click', e => {
      const now = Date.now();
      if (now - lastRipple < 100) return;
      lastRipple = now;

      const ripple       = document.createElement('div');
      ripple.className   = 'cursor-click';
      ripple.style.left  = `${e.clientX}px`;
      ripple.style.top   = `${e.clientY}px`;
      document.body.appendChild(ripple);
      setTimeout(() => ripple.remove(), C.rippleDuration);
    });
  }

  return { init };
})();


/* ==========================================================================
   13. TYPING — Animated text with HTML highlight spans
   ========================================================================== */
const Typing = (() => {
  let timeout = null;

  function start(lang) {
    if (!DOM.typingEl) return;
    clearTimeout(timeout);

    const fullText = Translations.get(lang).typingText;
    let index = 0;
    DOM.typingEl.innerHTML = '';

    function tick() {
      DOM.typingEl.innerHTML = fullText.slice(0, index);
      index++;
      if (index <= fullText.length) {
        timeout = setTimeout(tick, Device.lowEnd ? CONFIG.typing.speedLow : CONFIG.typing.speedFast);
      }
    }

    tick();
  }

  return { start };
})();


/* ==========================================================================
   14. TRANSLATIONS — i18n content
   ========================================================================== */
const Translations = (() => {
  const data = {

    en: {
      navHome:       'Home',
      navAbout:      'About Me',
      navExperience: 'Experience',
      navSkills:     'Skills',
      navContact:    'Contact',

      contactBtn: 'Contact Me',
      downloadCv: 'Download CV',

      aboutTitle: 'About Me',
      aboutText: `
        I have professional experience in the hospitality industry as a Housekeeping staff member and restaurant Waiter,
        which has helped me develop strong discipline, attention to detail, and excellent customer service skills.
        I am accustomed to working under high standards, managing time effectively, and collaborating efficiently within a team environment.
        <br><br>
        In addition, I have technical expertise in programming languages such as Python and PHP, along with database management using SQL.
        I am capable of developing and managing web-based systems as well as handling structured and efficient data processing.
      `,

      experienceTitle: 'Experience',
      skillsTitle:     'Skills',
      contactTitle:    'Contact',
      socialTitle:     'Social Media',

      footerText:  'Copyright © 2026–present • Axel Alexius Latukolan. All Rights Reserved',
      footerBuilt: 'Built with passion ⚡',

      typingText: `
  <span class="highlight">Web3 Enthusiast</span>
  •
  <span class="highlight-green">Digital Analyst</span>
  •
  <span class="highlight-white">Future-Driven Hospitality</span>
`,
    },

    id: {
      navHome:       'Beranda',
      navAbout:      'Tentang Saya',
      navExperience: 'Pengalaman',
      navSkills:     'Keahlian',
      navContact:    'Kontak',

      contactBtn: 'Hubungi Saya',
      downloadCv: 'Unduh CV',

      aboutTitle: 'Tentang Saya',
      aboutText: `
        Saya memiliki pengalaman kerja di bidang perhotelan sebagai Housekeeping dan restoran sebagai Waiter,
        yang membentuk saya menjadi pribadi yang disiplin, teliti, dan memiliki kemampuan pelayanan yang baik.
        Terbiasa bekerja dengan standar tinggi, manajemen waktu yang baik, serta mampu bekerja sama dalam tim.
        <br><br>
        Selain itu, saya memiliki keahlian di bidang teknologi dengan penguasaan bahasa pemrograman Python dan PHP,
        serta pengelolaan database menggunakan SQL.
        Saya mampu membuat dan mengelola sistem berbasis web maupun pengolahan data secara terstruktur dan efisien.
      `,

      experienceTitle: 'Pengalaman',
      skillsTitle:     'Keahlian',
      contactTitle:    'Kontak',
      socialTitle:     'Media Sosial',

      footerText:  'Hak Cipta © 2026–sekarang • Axel Alexius Latukolan. Seluruh Hak Dilindungi',
      footerBuilt: 'Dibuat dengan passion ⚡',

      typingText: `
  <span class="highlight">Antusias Web3</span>
  •
  <span class="highlight-green">Analis Digital</span>
  •
  <span class="highlight-white">Hospitality Berorientasi Masa Depan</span>
`,
    },

  };

  return { get: lang => data[lang] ?? data.id };
})();


/* ==========================================================================
   15. LANGUAGE SYSTEM ( ID & EN )
   ========================================================================== */
const Language = (() => {

  function apply(lang) {
    localStorage.setItem('language', lang);
    document.documentElement.lang = lang;

    // Update all [data-id] elements
    document.querySelectorAll('[data-id]').forEach(el => {
      const key   = el.getAttribute('data-id');
      const value = Translations.get(lang)[key];
      if (value !== undefined) el.innerHTML = value;
    });

    // Active button state
    DOM.idBtn?.classList.toggle('active', lang === 'id');
    DOM.enBtn?.classList.toggle('active', lang === 'en');

    // Restart typing animation
    Typing.start(lang);
  }

  function init() {
    const saved = localStorage.getItem('language') || 'id';
    apply(saved);

    DOM.idBtn?.addEventListener('click', () => apply('id'));
    DOM.enBtn?.addEventListener('click', () => apply('en'));
  }

  return { init };
})();


/* ==========================================================================
   16. CONTENT PROTECTION ( Protection System + Popup Notification )
   ========================================================================== */
const Protection = (() => {
   // Custom Toast Notification for Copy Block.
  function showCopyToast(message = '') {
    let toast = document.querySelector('.copy-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'copy-toast';
      document.body.appendChild(toast);
    }
    toast.innerText = message;
    toast.classList.add('show');
    // Clear existing timeout
    if (toast._timeoutId) clearTimeout(toast._timeoutId);
    
    // Set new timeout
    toast._timeoutId = setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  }
   
  function init() {
    // Block right-click context menu
    document.addEventListener('contextmenu', e => {
      e.preventDefault();
      showCopyToast('⚠ Sorry, right-click access has been blocked!');
    });

    // Block DevTools shortcuts
    document.addEventListener('keydown', e => {
      const isF12 = e.key === 'F12';
      const isCtrlShiftI = e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'i';
      const isCtrlShiftJ = e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'j';
      const isCtrlU      = e.ctrlKey && e.key.toLowerCase() === 'u';

      if (isF12 || isCtrlShiftI || isCtrlShiftJ || isCtrlU) {
        e.preventDefault();
        showCopyToast('⚠ Sorry, DevTools access has been blocked!');
      }
    });

    // Block copy event (CTRL+C, right-click > Copy, browser menu, etc)
    document.addEventListener('copy', e => {
      e.preventDefault();
      showCopyToast('⚠ Sorry, copy access has been blocked!');
    });

    // Block image drag
    DOM.allImgs.forEach(img => {
      img.setAttribute('draggable', 'false');
      img.addEventListener('dragstart', e => e.preventDefault());
    });

    // Remove target="_blank" (keep navigation in same tab)
    DOM.allLinks.forEach(link => link.removeAttribute('target'));

    // Block middle-click (open in new tab)
    document.addEventListener('mousedown', e => {
      if (e.button === 1) {
         e.preventDefault();
         showCopyToast('⚠ Sorry, access to Open a new tab has been blocked!');
      }
    });
  }

  return { init };
})();


/* ==========================================================================
   17. LOW-END OPTIMIZATION
   ========================================================================== */
const Performance = (() => {
  function init() {
    if (Device.lowEnd || Device.prefersReducedMotion) {
      document.body.classList.add('reduce-motion');
    }
  }

  return { init };
})();


/* ==========================================================================
   18. BOOTSTRAP — Initialize all modules
   ========================================================================== */
(function bootstrap() {
  Performance.init();
  Theme.init();
  Loader.init();
  Nav.init();
  Particles.init();
  Parallax.init();
  Animations.init();
  MagneticButtons.init();
  WAButton.init();
  Cursor.init();
  Language.init();
  Protection.init();
  UpdateManager.init();
})();

/* ==========================================================================
   END OF FILE
   ========================================================================== */
