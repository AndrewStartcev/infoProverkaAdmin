(() => {
  const sidebar = document.querySelector('.dashboard-sidebar');

  if (!sidebar) return;

  const media = window.matchMedia('(max-width: 1199px)');

  function isMobileSidebar() {
    return media.matches;
  }

  function closeAllMobileSubmenus() {
    sidebar.querySelectorAll('.dashboard-sidebar__item--current._submenu-open').forEach(item => {
      item.classList.remove('_submenu-open');
    });
  }

  sidebar.addEventListener('click', event => {
    const toggleBtn = event.target.closest('.dashboard-sidebar__submenu-toggle');
    const backBtn = event.target.closest('.dashboard-sidebar__submenu-back');
    const moreBtn = event.target.closest('.dashboard-sidebar__profile-more');

    if (toggleBtn) {
      const item = toggleBtn.closest('.dashboard-sidebar__item--current');
      if (!item) return;

      if (isMobileSidebar()) {
        event.preventDefault();
        closeAllMobileSubmenus();
        item.classList.add('_submenu-open');
      }

      return;
    }

    if (backBtn) {
      const item = backBtn.closest('.dashboard-sidebar__item--current');
      if (!item) return;

      item.classList.remove('_submenu-open');
      return;
    }

    if (moreBtn) {
      event.preventDefault();
      event.stopPropagation();

      const actions = moreBtn.closest('.dashboard-sidebar__profile-actions');
      if (!actions) return;

      const isOpen = actions.classList.contains('_open');

      sidebar.querySelectorAll('.dashboard-sidebar__profile-actions._open').forEach(el => {
        el.classList.remove('_open');
      });

      if (!isOpen) {
        actions.classList.add('_open');
      }

      return;
    }

    sidebar.querySelectorAll('.dashboard-sidebar__profile-actions._open').forEach(el => {
      if (!el.contains(event.target)) {
        el.classList.remove('_open');
      }
    });
  });

  window.addEventListener('resize', () => {
    if (!isMobileSidebar()) {
      closeAllMobileSubmenus();
    }
  });

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
  const popup = new Popup();

  class Suggest {
    constructor(el) {
      this.el = el;
      this.type = el.dataset.suggest;
      this.input = el.querySelector('.suggest__input');
      this.hidden = el.querySelector('input[type="hidden"]');
      this.dropdown = el.querySelector('.suggest__dropdown');
      this.debounceTimer = null;

      this.data = this._getStaticData();
      this._init();
    }

    _getStaticData() {
      if (this.type === 'day') {
        return Array.from({ length: 31 }, (_, i) => ({
          label: String(i + 1),
          value: String(i + 1),
        }));
      }

      if (this.type === 'month') {
        const months = [
          'Январь',
          'Февраль',
          'Март',
          'Апрель',
          'Май',
          'Июнь',
          'Июль',
          'Август',
          'Сентябрь',
          'Октябрь',
          'Ноябрь',
          'Декабрь',
        ];
        return months.map((label, i) => ({ label, value: String(i + 1) }));
      }

      if (this.type === 'year') {
        const current = new Date().getFullYear();
        return Array.from({ length: current - 1923 }, (_, i) => ({
          label: String(current - i),
          value: String(current - i),
        }));
      }

      return null; // region — через DaData
    }

    _init() {
      this.input.addEventListener('input', () => {
        const query = this.input.value.trim();

        if (this.type === 'region') {
          clearTimeout(this.debounceTimer);
          this.debounceTimer = setTimeout(() => {
            if (query.length >= 2) this._fetchRegions(query);
            else this._close();
          }, 300);
        } else {
          this._filterStatic(query);
        }
      });

      this.input.addEventListener('focus', () => {
        if (this.type !== 'region') {
          this._filterStatic(this.input.value.trim());
        }
      });

      document.addEventListener('click', e => {
        if (!this.el.contains(e.target)) this._close();
      });
    }

    _filterStatic(query) {
      const filtered = query
        ? this.data.filter(item => item.label.toLowerCase().startsWith(query.toLowerCase()))
        : this.data;

      this._render(filtered);
    }

    async _fetchRegions(query) {
      try {
        const response = await fetch(
          'https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address',
          {
            method: 'POST',
            headers: {
              Authorization: 'Token 8722211815829b5e9a9523bfa47d7ab91e764467',
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
            body: JSON.stringify({
              query,
              from_bound: { value: 'region' },
              to_bound: { value: 'region' },
              count: 7,
            }),
          },
        );

        if (!response.ok) {
          console.error(`DaData: ${response.status} ${response.statusText}`);
          return;
        }

        const data = await response.json();

        if (!data.suggestions) {
          console.error('DaData: suggestions отсутствуют', data);
          return;
        }

        const items = data.suggestions.map(s => ({
          label: s.value,
          value: s.data.region_fias_id,
        }));

        this._render(items);
      } catch (e) {
        console.error('DaData error:', e);
      }
    }

    _render(items) {
      this.dropdown.innerHTML = '';

      if (!items.length) {
        this._close();
        return;
      }

      items.forEach(item => {
        const div = document.createElement('div');
        div.className = 'suggest__option';
        div.textContent = item.label;

        div.addEventListener('click', () => {
          this.input.value = item.label;
          this.hidden.value = item.value;
          this._close();
        });

        this.dropdown.appendChild(div);
      });

      this.dropdown.classList.add('_open');
    }

    _close() {
      this.dropdown.innerHTML = '';
      this.dropdown.classList.remove('_open');
    }
  }

  // Инициализация всех suggest на странице
  document.querySelectorAll('.suggest').forEach(el => new Suggest(el));

  document.querySelectorAll('.checkbox-no-patronymic').forEach(checkbox => {
    const form = checkbox.closest('form');
    const patronymicItem = form.querySelector('.patronymic-item');

    checkbox.addEventListener('change', () => {
      const input = patronymicItem.querySelector('input');

      if (checkbox.checked) {
        patronymicItem.style.display = 'none';
        input.removeAttribute('required');
        input.value = '';
      } else {
        patronymicItem.style.display = '';
        input.setAttribute('required', '');
      }
    });
  });

  document.querySelectorAll('.toggle-content').forEach(btn => {
    const target = btn.closest('[data-toggle-wrap]').querySelector('[data-toggle-target]');

    // По умолчанию скрыт
    target.style.maxHeight = '0';
    btn.dataset.toggleOpen = 'false';

    btn.addEventListener('click', () => {
      const isOpen = btn.dataset.toggleOpen === 'true';

      if (isOpen) {
        target.style.maxHeight = '0';
        btn.dataset.toggleOpen = 'false';
        btn.textContent = btn.dataset.textShow;
      } else {
        target.style.maxHeight = '100%';
        btn.dataset.toggleOpen = 'true';
        btn.textContent = btn.dataset.textHide;
      }
    });

    // Текст кнопки по умолчанию
    btn.textContent = btn.dataset.textShow;
  });
})();
