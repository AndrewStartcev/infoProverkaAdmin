class Popup {
  constructor() {
    this.triggers = document.querySelectorAll('[data-popup]');
    this.closeButtons = document.querySelectorAll('.popup__close, .popup-close');

    this._init();
  }

  _init() {
    this.triggers.forEach(trigger => {
      trigger.addEventListener('click', e => {
        e.preventDefault();
        const id = trigger.getAttribute('data-popup');
        this.open(id);
      });
    });

    this.closeButtons.forEach(btn => {
      btn.addEventListener('click', e => {
        e.preventDefault();
        this.closeAll();
      });
    });

    // Закрытие по data-close
    document.addEventListener('click', e => {
      if (e.target.closest('[data-close]')) {
        this.closeAll();
      }
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') this.closeAll();
    });

    document.addEventListener('click', e => {
      if (e.target.classList.contains('popup')) this.closeAll();
    });
  }

  _lock() {
    document.body.classList.add('--lock');
    document.documentElement.classList.add('--lock');
  }

  _unlock() {
    document.body.classList.remove('--lock');
    document.documentElement.classList.remove('--lock');
  }

  open(id) {
    const popup = document.querySelector(id);

    if (!popup) {
      console.error(`Popup с id ${id} не найден.`);
      return;
    }

    this.closeAll();
    popup.classList.add('show');
    this._lock();
  }

  closeAll() {
    document.querySelectorAll('.popup.show').forEach(popup => {
      popup.classList.remove('show');
    });
    this._unlock();
  }

  showSuccess(id = '#formSuccess') {
    this.closeAll();
    document.querySelector(id)?.classList.add('show');
    this._lock();
  }
}
new Popup();

(function () {
  const burger = document.querySelector('.header__burger');
  const menu = document.getElementById('mobileMenu');
  const overlay = document.getElementById('mobileMenuOverlay');
  const closeBtn = document.getElementById('mobileMenuClose');

  if (!burger || !menu) return;

  function openMenu() {
    menu.classList.add('is-open');
    overlay.classList.add('is-visible');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    menu.classList.remove('is-open');
    overlay.classList.remove('is-visible');
    document.body.style.overflow = '';
  }

  burger.addEventListener('click', openMenu);
  closeBtn.addEventListener('click', closeMenu);
  overlay.addEventListener('click', closeMenu);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMenu();
  });
})();
