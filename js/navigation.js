const Navigation = (() => {
  let nav, hamburger, mobileMenu, backToTop, heroBg;
  let scrollProgress, cursorGlow;
  let ticking = false;
  let parallaxEnabled = false;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function init() {
    nav = document.querySelector('.nav');
    hamburger = document.querySelector('.hamburger');
    mobileMenu = document.querySelector('.mobile-menu');
    backToTop = document.querySelector('.back-to-top');
    heroBg = document.querySelector('.hero-bg');
    scrollProgress = document.querySelector('.scroll-progress');

    // Enable parallax only if motion is allowed
    parallaxEnabled = heroBg && !reducedMotion;

    if (hamburger && mobileMenu) {
      hamburger.addEventListener('click', toggleMobileMenu);

      // Close on link click
      mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', closeMobileMenu);
      });
    }

    // Back to top
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

    // Cursor glow (desktop only, no reduced motion)
    if (!reducedMotion && window.matchMedia('(hover: hover)').matches) {
      initCursorGlow();
    }

    // Create floating particles in hero
    if (!reducedMotion) {
      createParticles();
    }

    // Magnetic buttons (desktop only)
    if (!reducedMotion && window.matchMedia('(hover: hover)').matches) {
      initMagneticButtons();
    }

    // Stats counter
    initStatsCounter();

    // Before/After slider
    initBeforeAfterSlider();

    // Testimonials carousel
    initTestimonials();

    // FAQ accordion
    initFAQ();

    // Page transitions
    initPageTransitions();

    // Scroll listener
    window.addEventListener('scroll', onScroll, { passive: true });
    onScrollUpdate(); // Initial check
  }

  function initCursorGlow() {
    cursorGlow = document.querySelector('.cursor-glow');
    if (!cursorGlow) return;

    let mouseX = 0, mouseY = 0;
    let glowX = 0, glowY = 0;
    let glowActive = false;
    let rafId = null;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!glowActive) {
        glowActive = true;
        cursorGlow.classList.add('is-active');
        animateGlow();
      }
    });

    document.addEventListener('mouseleave', () => {
      glowActive = false;
      cursorGlow.classList.remove('is-active');
      if (rafId) cancelAnimationFrame(rafId);
      rafId = null;
    });

    function animateGlow() {
      if (!glowActive) return;
      glowX += (mouseX - glowX) * 0.08;
      glowY += (mouseY - glowY) * 0.08;
      cursorGlow.style.left = glowX + 'px';
      cursorGlow.style.top = glowY + 'px';
      rafId = requestAnimationFrame(animateGlow);
    }
  }

  function createParticles() {
    const container = document.querySelector('.hero-particles');
    if (!container) return;

    for (let i = 0; i < 15; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      const size = Math.random() * 4 + 2;
      particle.style.width = size + 'px';
      particle.style.height = size + 'px';
      particle.style.left = Math.random() * 100 + '%';
      particle.style.bottom = '-10%';
      particle.style.animationDuration = (Math.random() * 12 + 10) + 's';
      particle.style.animationDelay = (Math.random() * 10) + 's';
      particle.style.animation = (i % 2 === 0 ? 'float-particle' : 'float-particle-reverse')
        + ' ' + particle.style.animationDuration + ' ' + particle.style.animationDelay + ' infinite linear';
      container.appendChild(particle);
    }
  }

  function initMagneticButtons() {
    document.querySelectorAll('.magnetic').forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
      });

      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
      });
    });
  }

  function initStatsCounter() {
    const statNumbers = document.querySelectorAll('.stat-number[data-count]');
    if (!statNumbers.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.dataset.count, 10);
          animateCount(el, target);
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.5 });

    statNumbers.forEach(el => observer.observe(el));
  }

  function animateCount(el, target) {
    if (reducedMotion) {
      el.textContent = formatNumber(target);
      return;
    }
    const duration = 2000;
    const start = performance.now();

    function update(now) {
      const progress = Math.min((now - start) / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * target);
      el.textContent = formatNumber(current);
      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }
    requestAnimationFrame(update);
  }

  function formatNumber(n) {
    if (n >= 10000) return n.toLocaleString('fr-CA');
    return n.toString();
  }

  function initBeforeAfterSlider() {
    const slider = document.querySelector('.ba-slider');
    if (!slider) return;

    const beforeImg = slider.querySelector('.ba-before');
    const handle = slider.querySelector('.ba-handle');
    let isDragging = false;

    function updateSlider(x) {
      const rect = slider.getBoundingClientRect();
      let percent = ((x - rect.left) / rect.width) * 100;
      percent = Math.max(2, Math.min(98, percent));
      beforeImg.style.clipPath = `inset(0 ${100 - percent}% 0 0)`;
      handle.style.left = percent + '%';
    }

    // Mouse
    slider.addEventListener('mousedown', (e) => {
      isDragging = true;
      updateSlider(e.clientX);
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      e.preventDefault();
      updateSlider(e.clientX);
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
    });

    // Touch
    slider.addEventListener('touchstart', (e) => {
      isDragging = true;
      updateSlider(e.touches[0].clientX);
    }, { passive: true });

    slider.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      updateSlider(e.touches[0].clientX);
    }, { passive: true });

    slider.addEventListener('touchend', () => {
      isDragging = false;
    });
  }

  function initTestimonials() {
    const track = document.querySelector('.testimonial-track');
    if (!track) return;

    const cards = track.querySelectorAll('.testimonial-card');
    const dots = document.querySelectorAll('.testimonial-dot');
    let current = 0;
    let autoplayId = null;

    function goTo(index) {
      cards[current].classList.remove('is-active');
      dots[current].classList.remove('is-active');
      current = index;
      cards[current].classList.add('is-active');
      dots[current].classList.add('is-active');
    }

    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        goTo(i);
        resetAutoplay();
      });
    });

    // Touch swipe support for mobile
    let touchStartX = 0;
    let touchEndX = 0;

    track.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    track.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          // Swipe left — next
          goTo((current + 1) % cards.length);
        } else {
          // Swipe right — prev
          goTo((current - 1 + cards.length) % cards.length);
        }
        resetAutoplay();
      }
    }, { passive: true });

    // Autoplay
    function startAutoplay() {
      autoplayId = setInterval(() => {
        goTo((current + 1) % cards.length);
      }, 5000);
    }

    function resetAutoplay() {
      clearInterval(autoplayId);
      startAutoplay();
    }

    startAutoplay();
  }

  function initFAQ() {
    const items = document.querySelectorAll('.faq-item');
    if (!items.length) return;

    items.forEach(item => {
      const btn = item.querySelector('.faq-question');
      btn.addEventListener('click', () => {
        const isOpen = item.classList.contains('is-open');

        // Close all others
        items.forEach(other => {
          if (other !== item) {
            other.classList.remove('is-open');
            other.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
            other.querySelector('.faq-answer').setAttribute('aria-hidden', 'true');
          }
        });

        // Toggle this one
        item.classList.toggle('is-open', !isOpen);
        btn.setAttribute('aria-expanded', !isOpen);
        item.querySelector('.faq-answer').setAttribute('aria-hidden', isOpen);
      });
    });
  }

  function initPageTransitions() {
    const overlay = document.querySelector('.page-transition');
    if (!overlay || reducedMotion) return;

    // Intercept internal page links (not anchor links, not external)
    document.querySelectorAll('a[href]').forEach(link => {
      const href = link.getAttribute('href');
      if (!href) return;
      // Only intercept .html links on same domain
      if (href.endsWith('.html') && !link.target) {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          overlay.classList.add('is-active');
          setTimeout(() => {
            window.location.href = href;
          }, 400);
        });
      }
    });

    // Fade in on page load
    if (overlay.classList.contains('is-active')) {
      requestAnimationFrame(() => {
        overlay.classList.remove('is-active');
      });
    }
  }

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

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(() => {
        onScrollUpdate();
        ticking = false;
      });
      ticking = true;
    }
  }

  function onScrollUpdate() {
    const scrollY = window.pageYOffset;

    // Nav shrink (skip on pages without hero — nav starts with is-scrolled)
    if (nav && document.querySelector('.hero')) {
      nav.classList.toggle('is-scrolled', scrollY > 50);
    }

    // Back to top visibility
    if (backToTop) {
      backToTop.classList.toggle('is-visible', scrollY > window.innerHeight);
    }

    // Scroll progress bar
    if (scrollProgress) {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;
      scrollProgress.style.width = progress + '%';
    }

    // Hero parallax (0.3x speed)
    if (parallaxEnabled && scrollY < window.innerHeight) {
      heroBg.style.transform = `translate3d(0, ${scrollY * 0.3}px, 0)`;
    }
  }

  return { init };
})();
