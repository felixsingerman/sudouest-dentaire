document.addEventListener('DOMContentLoaded', () => {
  // Each init is wrapped in try-catch so one failure doesn't break the others
  try { Navigation.init(); } catch (e) { console.error('Navigation init failed:', e); }
  try { if (typeof Animations !== 'undefined') Animations.init(); } catch (e) { console.error('Animations init failed:', e); }
  try { I18n.init(); } catch (e) { console.error('I18n init failed:', e); }

  // Safety net: if animations JS fails, reveal all content after 500ms
  setTimeout(() => {
    document.querySelectorAll('[data-animate]').forEach(el => {
      if (!el.classList.contains('is-visible')) {
        el.classList.add('is-visible');
      }
    });
  }, 500);
});
