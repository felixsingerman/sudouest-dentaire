const Animations = (() => {
  function init() {
    // Add js-animated to html — this enables the hidden start states in CSS.
    // Without this class, all content stays visible (safe fallback).
    document.documentElement.classList.add('js-animated');

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      document.querySelectorAll('[data-animate]').forEach(el => {
        el.classList.add('is-visible');
      });
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1
    });

    document.querySelectorAll('[data-animate]').forEach(el => {
      observer.observe(el);
    });
  }

  return { init };
})();
