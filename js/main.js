document.addEventListener('DOMContentLoaded', () => {
  Navigation.init();
  if (typeof Animations !== 'undefined') {
    Animations.init();
  }
  I18n.init();
});
