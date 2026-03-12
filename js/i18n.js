const I18n = (() => {
  let currentLang = 'fr';
  const cache = {};

  // Detect if we're in a subdirectory (e.g., /services/ or /blog/)
  const pathParts = window.location.pathname.split('/').filter(Boolean);
  const fileName = pathParts[pathParts.length - 1] || '';
  const isSubdir = pathParts.length > 1 && fileName.endsWith('.html');
  const basePath = isSubdir ? '../' : '';

  function init() {
    const urlParams = new URLSearchParams(window.location.search);
    const urlLang = urlParams.get('lang');
    if (urlLang === 'en' || urlLang === 'fr') {
      currentLang = urlLang;
    } else {
      currentLang = localStorage.getItem('lang') || 'fr';
    }

    setupSwitcher();

    if (currentLang !== 'fr') {
      loadAndApply(currentLang);
    }
    updateActiveLangButton();
  }

  function setupSwitcher() {
    document.querySelectorAll('[data-lang-switch]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const lang = btn.getAttribute('data-lang-switch');
        if (lang !== currentLang) {
          switchTo(lang);
        }
      });
    });
  }

  function switchTo(lang) {
    currentLang = lang;
    localStorage.setItem('lang', lang);
    loadAndApply(lang);
    updateActiveLangButton();
    updateURL(lang);
  }

  async function loadAndApply(lang) {
    try {
      if (!cache[lang]) {
        const resp = await fetch(`${basePath}lang/${lang}.json`);
        if (!resp.ok) throw new Error(`Failed to load ${lang}.json`);
        cache[lang] = await resp.json();
      }
      apply(cache[lang]);
    } catch (err) {
      console.warn('i18n: Failed to load language file, keeping current text.', err);
    }
  }

  function apply(strings) {
    // Text content
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (strings[key] !== undefined) {
        el.textContent = strings[key];
      }
    });

    // Rich text content (for elements with embedded links — strings from local JSON only)
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      const key = el.getAttribute('data-i18n-html');
      if (strings[key] !== undefined) {
        el.innerHTML = strings[key];
      }
    });

    // Href attributes
    document.querySelectorAll('[data-i18n-href]').forEach(el => {
      const key = el.getAttribute('data-i18n-href');
      if (strings[key] !== undefined) {
        el.setAttribute('href', strings[key]);
      }
    });

    // Placeholder attributes
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (strings[key] !== undefined) {
        el.setAttribute('placeholder', strings[key]);
      }
    });

    // Alt attributes
    document.querySelectorAll('[data-i18n-alt]').forEach(el => {
      const key = el.getAttribute('data-i18n-alt');
      if (strings[key] !== undefined) {
        el.setAttribute('alt', strings[key]);
      }
    });

    // Meta tags
    document.documentElement.setAttribute('lang', currentLang);
    if (strings['meta.title']) {
      document.title = strings['meta.title'];
    }
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && strings['meta.description']) {
      metaDesc.setAttribute('content', strings['meta.description']);
    }
  }

  function updateActiveLangButton() {
    document.querySelectorAll('[data-lang-switch]').forEach(btn => {
      const lang = btn.getAttribute('data-lang-switch');
      btn.classList.toggle('is-active', lang === currentLang);
    });
  }

  function updateURL(lang) {
    const url = new URL(window.location);
    if (lang === 'fr') {
      url.searchParams.delete('lang');
    } else {
      url.searchParams.set('lang', lang);
    }
    window.history.replaceState({}, '', url);
  }

  function getLang() {
    return currentLang;
  }

  return { init, getLang, switchTo };
})();
