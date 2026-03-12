const Navigation = (() => {
  let nav, hamburger, mobileMenu, backToTop, heroBg;
  let scrollProgress, cursorGlow;
  let ticking = false;
  let parallaxEnabled = false;
  let stickyCta, cookieBanner;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function init() {
    nav = document.querySelector('.nav');
    hamburger = document.querySelector('.hamburger');
    mobileMenu = document.querySelector('.mobile-menu');
    backToTop = document.querySelector('.back-to-top');
    heroBg = document.querySelector('.hero-bg');
    scrollProgress = document.querySelector('.scroll-progress');
    stickyCta = document.getElementById('sticky-cta');
    cookieBanner = document.getElementById('cookie-banner');

    parallaxEnabled = heroBg && !reducedMotion;

    if (hamburger && mobileMenu) {
      hamburger.addEventListener('click', toggleMobileMenu);
      mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', closeMobileMenu);
      });
    }

    if (backToTop) {
      backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', (e) => {
        const targetId = link.getAttribute('href');
        if (targetId === '#') return;
        const target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          const navHeight = nav ? nav.offsetHeight : 0;
          const top = target.getBoundingClientRect().top + window.pageYOffset - navHeight;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      });
    });

    // Each feature is wrapped individually so one crash never kills the rest
    const safeCall = (fn) => { try { fn(); } catch (e) { console.warn('Feature init failed:', e); } };

    // Desktop-only features
    if (!reducedMotion && window.matchMedia('(hover: hover)').matches) {
      safeCall(initCursorGlow);
      safeCall(initMagneticButtons);
      safeCall(initCustomCursor);
      safeCall(init3DTilt);
    }

    if (!reducedMotion) safeCall(createParticles);

    // Interactive features
    safeCall(initStatsCounter);
    safeCall(initBeforeAfterSlider);
    safeCall(initTestimonials);
    safeCall(initFAQ);
    safeCall(initPageTransitions);
    safeCall(initPreloader);
    safeCall(initCookieConsent);
    safeCall(initFormToast);
    safeCall(initActiveNavHighlight);
    if (!reducedMotion) safeCall(initTypingEffect);

    // Scroll listener
    window.addEventListener('scroll', onScroll, { passive: true });
    onScrollUpdate();
  }

  /* ===== TYPING EFFECT ===== */
  function initTypingEffect() {
    const el = document.querySelector('.typing-effect');
    if (!el || window.innerWidth < 768) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          el.classList.add('is-typing');
          el.addEventListener('animationend', () => {
            el.classList.add('typing-done');
            el.classList.remove('is-typing');
          }, { once: true });
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.5 });
    observer.observe(el);
  }

  /* ===== PRELOADER ===== */
  function initPreloader() {
    const preloader = document.getElementById('preloader');
    if (!preloader) return;

    let hidden = false;
    function hide() {
      if (hidden) return;
      hidden = true;
      preloader.classList.add('is-hidden');
      setTimeout(() => { if (preloader.parentNode) preloader.remove(); }, 700);
    }

    // Hide after fill animation (1.8s) + small buffer
    setTimeout(hide, 2200);

    // Hard safety net — never stay longer than 3s
    setTimeout(hide, 3000);
  }

  /* ===== CUSTOM CURSOR ===== */
  function initCustomCursor() {
    const cursor = document.querySelector('.custom-cursor');
    if (!cursor) return;

    const dot = cursor.querySelector('.cursor-dot');
    const ring = cursor.querySelector('.cursor-ring');
    let mouseX = 0, mouseY = 0;
    let ringX = 0, ringY = 0;
    let active = false;
    let rafId = null;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.left = mouseX + 'px';
      dot.style.top = mouseY + 'px';
      if (!active) {
        active = true;
        cursor.classList.add('is-active');
        ringX = mouseX;
        ringY = mouseY;
        animateCursor();
      }
    });

    document.addEventListener('mouseleave', () => {
      active = false;
      cursor.classList.remove('is-active');
      if (rafId) cancelAnimationFrame(rafId);
    });

    document.addEventListener('mouseenter', () => {
      cursor.classList.add('is-active');
    });

    function animateCursor() {
      if (!active) return;
      ringX += (mouseX - ringX) * 0.15;
      ringY += (mouseY - ringY) * 0.15;
      ring.style.left = ringX + 'px';
      ring.style.top = ringY + 'px';
      rafId = requestAnimationFrame(animateCursor);
    }

    // Hover states
    const hoverables = 'a, button, .service-card, .team-card, .faq-question, input, textarea';
    document.querySelectorAll(hoverables).forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('is-hovering'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('is-hovering'));
    });
  }

  /* ===== 3D TILT ON SERVICE CARDS ===== */
  function init3DTilt() {
    document.querySelectorAll('.service-card').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(800px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateY(-4px)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  /* ===== CURSOR GLOW ===== */
  function initCursorGlow() {
    cursorGlow = document.querySelector('.cursor-glow');
    if (!cursorGlow) return;

    let mouseX = 0, mouseY = 0, glowX = 0, glowY = 0;
    let glowActive = false, rafId = null;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX; mouseY = e.clientY;
      if (!glowActive) { glowActive = true; cursorGlow.classList.add('is-active'); animateGlow(); }
    });

    document.addEventListener('mouseleave', () => {
      glowActive = false; cursorGlow.classList.remove('is-active');
      if (rafId) cancelAnimationFrame(rafId); rafId = null;
    });

    function animateGlow() {
      if (!glowActive) return;
      glowX += (mouseX - glowX) * 0.08; glowY += (mouseY - glowY) * 0.08;
      cursorGlow.style.left = glowX + 'px'; cursorGlow.style.top = glowY + 'px';
      rafId = requestAnimationFrame(animateGlow);
    }
  }

  function createParticles() {
    const container = document.querySelector('.hero-particles');
    if (!container) return;
    for (let i = 0; i < 15; i++) {
      const p = document.createElement('div'); p.className = 'particle';
      const size = Math.random() * 4 + 2;
      p.style.width = size + 'px'; p.style.height = size + 'px';
      p.style.left = Math.random() * 100 + '%'; p.style.bottom = '-10%';
      const dur = (Math.random() * 12 + 10) + 's';
      const del = (Math.random() * 10) + 's';
      p.style.animation = `${i % 2 === 0 ? 'float-particle' : 'float-particle-reverse'} ${dur} ${del} infinite linear`;
      container.appendChild(p);
    }
  }

  function initMagneticButtons() {
    document.querySelectorAll('.magnetic').forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const r = btn.getBoundingClientRect();
        btn.style.transform = `translate(${(e.clientX - r.left - r.width/2) * 0.15}px, ${(e.clientY - r.top - r.height/2) * 0.15}px)`;
      });
      btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
    });
  }

  /* ===== STATS COUNTER ===== */
  function initStatsCounter() {
    const els = document.querySelectorAll('.stat-number[data-count]');
    if (!els.length) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { animateCount(e.target, parseInt(e.target.dataset.count, 10), e.target.dataset.suffix || ''); obs.unobserve(e.target); }});
    }, { threshold: 0.2 });
    els.forEach(el => obs.observe(el));
  }

  function animateCount(el, target, suffix) {
    if (reducedMotion) { el.textContent = formatNumber(target) + suffix; return; }
    const dur = 2000, start = performance.now();
    function update(now) {
      const p = Math.min((now - start) / dur, 1);
      const current = Math.round((1 - Math.pow(1 - p, 3)) * target);
      el.textContent = formatNumber(current) + (p >= 1 ? suffix : '');
      if (p < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  function formatNumber(n) { return n >= 1000 ? n.toLocaleString('fr-CA') : n.toString(); }

  /* ===== BEFORE/AFTER SLIDER ===== */
  function initBeforeAfterSlider() {
    const slider = document.querySelector('.ba-slider');
    if (!slider) return;
    const before = slider.querySelector('.ba-before');
    const handle = slider.querySelector('.ba-handle');
    let dragging = false;

    function update(x) {
      const r = slider.getBoundingClientRect();
      const pct = Math.max(2, Math.min(98, ((x - r.left) / r.width) * 100));
      before.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
      handle.style.left = pct + '%';
    }

    slider.addEventListener('mousedown', (e) => { dragging = true; update(e.clientX); });
    window.addEventListener('mousemove', (e) => { if (dragging) { e.preventDefault(); update(e.clientX); }});
    window.addEventListener('mouseup', () => { dragging = false; });
    slider.addEventListener('touchstart', (e) => { dragging = true; update(e.touches[0].clientX); }, { passive: true });
    slider.addEventListener('touchmove', (e) => { if (dragging) update(e.touches[0].clientX); }, { passive: true });
    slider.addEventListener('touchend', () => { dragging = false; });
  }

  /* ===== TESTIMONIALS ===== */
  function initTestimonials() {
    const track = document.querySelector('.testimonial-track');
    if (!track) return;
    const cards = track.querySelectorAll('.testimonial-card');
    const dots = document.querySelectorAll('.testimonial-dot');
    let current = 0, autoId = null, touchStartX = 0;

    function goTo(i) {
      cards[current].classList.remove('is-active'); dots[current].classList.remove('is-active');
      current = i;
      cards[current].classList.add('is-active'); dots[current].classList.add('is-active');
    }

    dots.forEach((d, i) => d.addEventListener('click', () => { goTo(i); reset(); }));

    track.addEventListener('touchstart', (e) => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
    track.addEventListener('touchend', (e) => {
      const diff = touchStartX - e.changedTouches[0].screenX;
      if (Math.abs(diff) > 50) { goTo(diff > 0 ? (current + 1) % cards.length : (current - 1 + cards.length) % cards.length); reset(); }
    }, { passive: true });

    function start() { autoId = setInterval(() => goTo((current + 1) % cards.length), 5000); }
    function reset() { clearInterval(autoId); start(); }
    start();
  }

  /* ===== FAQ ===== */
  function initFAQ() {
    const items = document.querySelectorAll('.faq-item');
    items.forEach(item => {
      item.querySelector('.faq-question').addEventListener('click', () => {
        const isOpen = item.classList.contains('is-open');
        items.forEach(o => { if (o !== item) { o.classList.remove('is-open'); o.querySelector('.faq-question').setAttribute('aria-expanded', 'false'); o.querySelector('.faq-answer').setAttribute('aria-hidden', 'true'); }});
        item.classList.toggle('is-open', !isOpen);
        item.querySelector('.faq-question').setAttribute('aria-expanded', !isOpen);
        item.querySelector('.faq-answer').setAttribute('aria-hidden', isOpen);
      });
    });
  }

  /* ===== PAGE TRANSITIONS ===== */
  function initPageTransitions() {
    const overlay = document.querySelector('.page-transition');
    if (!overlay || reducedMotion) return;
    document.querySelectorAll('a[href]').forEach(link => {
      const href = link.getAttribute('href');
      if (href && href.endsWith('.html') && !link.target) {
        link.addEventListener('click', (e) => { e.preventDefault(); overlay.classList.add('is-active'); setTimeout(() => { window.location.href = href; }, 400); });
      }
    });
    if (overlay.classList.contains('is-active')) requestAnimationFrame(() => overlay.classList.remove('is-active'));
  }

  /* ===== COOKIE CONSENT ===== */
  function initCookieConsent() {
    if (!cookieBanner) return;
    if (localStorage.getItem('cookie-consent')) return;

    setTimeout(() => cookieBanner.classList.add('is-visible'), 2000);

    const accept = document.getElementById('cookie-accept');
    const decline = document.getElementById('cookie-decline');

    if (accept) accept.addEventListener('click', () => { localStorage.setItem('cookie-consent', 'accepted'); cookieBanner.classList.remove('is-visible'); });
    if (decline) decline.addEventListener('click', () => { localStorage.setItem('cookie-consent', 'declined'); cookieBanner.classList.remove('is-visible'); });
  }

  /* ===== FORM TOAST ===== */
  function initFormToast() {
    const form = document.querySelector('form[action*="formspree"]');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = form.querySelector('.btn-submit');
      const originalText = btn.textContent;
      btn.textContent = '...';
      btn.disabled = true;

      try {
        const res = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { 'Accept': 'application/json' } });
        if (res.ok) {
          showToast('Message envoyé avec succès!', 'success');
          form.reset();
        } else {
          showToast('Erreur lors de l\'envoi. Réessayez.', 'error');
        }
      } catch {
        showToast('Erreur de connexion. Réessayez.', 'error');
      }

      btn.textContent = originalText;
      btn.disabled = false;
    });
  }

  function showToast(message, type) {
    let toast = document.querySelector('.form-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'form-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.className = `form-toast is-${type}`;
    requestAnimationFrame(() => toast.classList.add('is-visible'));
    setTimeout(() => { toast.classList.remove('is-visible'); }, 4000);
  }

  /* ===== ACTIVE NAV HIGHLIGHT ===== */
  function initActiveNavHighlight() {
    const sections = document.querySelectorAll('section[id]');
    if (!sections.length) return;

    const navLinks = document.querySelectorAll('.footer-links a[href^="#"], .mobile-nav-link a[href^="#"]');
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach(link => {
            link.classList.toggle('is-active-section', link.getAttribute('href') === '#' + id);
          });
        }
      });
    }, { threshold: 0.3, rootMargin: '-20% 0px -60% 0px' });

    sections.forEach(s => obs.observe(s));
  }

  /* ===== MOBILE MENU ===== */
  function toggleMobileMenu() {
    const isOpen = mobileMenu.classList.toggle('is-open');
    hamburger.classList.toggle('is-active');
    hamburger.setAttribute('aria-expanded', isOpen);
    mobileMenu.setAttribute('aria-hidden', !isOpen);
    document.documentElement.style.overflow = isOpen ? 'hidden' : '';
  }

  function closeMobileMenu() {
    mobileMenu.classList.remove('is-open');
    hamburger.classList.remove('is-active');
    hamburger.setAttribute('aria-expanded', 'false');
    mobileMenu.setAttribute('aria-hidden', 'true');
    document.documentElement.style.overflow = '';
  }

  /* ===== SCROLL HANDLER ===== */
  function onScroll() {
    if (!ticking) { requestAnimationFrame(() => { onScrollUpdate(); ticking = false; }); ticking = true; }
  }

  function onScrollUpdate() {
    const scrollY = window.pageYOffset;

    if (nav && document.querySelector('.hero')) {
      nav.classList.toggle('is-scrolled', scrollY > 50);
    }

    if (backToTop) {
      backToTop.classList.toggle('is-visible', scrollY > window.innerHeight);
    }

    if (scrollProgress) {
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      scrollProgress.style.width = (docH > 0 ? (scrollY / docH) * 100 : 0) + '%';
    }

    if (parallaxEnabled && scrollY < window.innerHeight) {
      heroBg.style.transform = `translate3d(0, ${scrollY * 0.3}px, 0)`;
    }

    // Sticky mobile CTA — show after hero
    if (stickyCta) {
      stickyCta.classList.toggle('is-visible', scrollY > window.innerHeight * 0.8);
    }
  }

  return { init };
})();
