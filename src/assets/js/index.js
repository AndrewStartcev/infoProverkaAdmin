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
  new Popup();

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

      if (this.type === 'city' || this.type === 'region') {
        return null; // через DaData
      }

      return null;
    }

    _init() {
      this.input.addEventListener('input', () => {
        const query = this.input.value.trim();

        if (this.type === 'region' || this.type === 'city') {
          clearTimeout(this.debounceTimer);
          this.debounceTimer = setTimeout(() => {
            if (query.length >= 2) {
              this.type === 'city' ? this._fetchCities(query) : this._fetchRegions(query);
            } else {
              this._close();
            }
          }, 300);
        } else {
          this._filterStatic(query);
        }
      });

      this.input.addEventListener('focus', () => {
        if (this.type !== 'region' && this.type !== 'city') {
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

    async _fetchCities(query) {
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
              from_bound: { value: 'city' },
              to_bound: { value: 'city' },
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
          value: s.data.city_fias_id ?? s.data.settlement_fias_id,
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

/**
 * admins-map.js
 * Инициализация Яндекс Карт для блоков .admins-index__map
 *
 * Подключение:
 *   <script src="https://api-maps.yandex.ru/2.1/?apikey=YOUR_API_KEY&lang=ru_RU"></script>
 *   <script src="admins-map.js"></script>
 */

(function () {
  'use strict';

  function parseCoords(str) {
    if (!str) return null;
    var parts = str.split(',');
    if (parts.length !== 2) return null;
    var lat = parseFloat(parts[0].trim());
    var lon = parseFloat(parts[1].trim());
    if (isNaN(lat) || isNaN(lon)) return null;
    return [lat, lon];
  }

  function initAllMaps() {
    ymaps.ready(function () {
      var elements = document.querySelectorAll('.admins-index__map[data-coord]');

      if (!elements.length) {
        console.warn('[admins-map] Блоки .admins-index__map[data-coord] не найдены.');
        return;
      }

      elements.forEach(function (el) {
        var coords = parseCoords(el.getAttribute('data-coord'));
        if (!coords) {
          console.warn('[admins-map] Некорректные координаты:', el);
          return;
        }

        var map = new ymaps.Map(
          el,
          {
            center: coords,
            zoom: 16,
            controls: ['zoomControl', 'fullscreenControl'],
          },
          {
            suppressMapOpenBlock: true,
          },
        );

        map.behaviors.disable('scrollZoom');

        map.geoObjects.add(
          new ymaps.Placemark(
            coords,
            {},
            {
              preset: 'islands#redDotIcon',
            },
          ),
        );
      });
    });
  }

  if (typeof ymaps !== 'undefined') {
    initAllMaps();
  } else {
    document.addEventListener('DOMContentLoaded', function () {
      if (typeof ymaps !== 'undefined') {
        initAllMaps();
      } else {
        console.error('[admins-map] ymaps не найден. Подключите API до admins-map.js.');
      }
    });
  }
})();

/**
 * Datepicker — кастомный календарь
 *
 * HTML-разметка:
 * <div class="datepicker" data-datepicker>
 *   <label class="datepicker__label">Дата выезда*</label>
 *   <div class="datepicker__input-wrap">
 *     <input class="datepicker__input" type="text" placeholder="дд.мм.гггг" readonly>
 *     <button class="datepicker__icon" type="button" aria-label="Открыть календарь">
 *       <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
 *         <rect x="2" y="4" width="16" height="14" rx="2" stroke="currentColor" stroke-width="1.5"/>
 *         <path d="M2 8h16" stroke="currentColor" stroke-width="1.5"/>
 *         <path d="M6 2v4M14 2v4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
 *         <circle cx="6.5" cy="12" r="1" fill="currentColor"/>
 *         <circle cx="10" cy="12" r="1" fill="currentColor"/>
 *         <circle cx="13.5" cy="12" r="1" fill="currentColor"/>
 *         <circle cx="6.5" cy="15.5" r="1" fill="currentColor"/>
 *         <circle cx="10" cy="15.5" r="1" fill="currentColor"/>
 *       </svg>
 *     </button>
 *   </div>
 *   <div class="datepicker__calendar"></div>
 *   <input type="hidden" name="date">
 * </div>
 *
 * CSS: datepicker.css
 * Инициализация: Datepicker.initAll() или new Datepicker(el)
 */

class Datepicker {
  constructor(el) {
    this.el = el;
    this.input = el.querySelector('.datepicker__input');
    this.hidden = el.querySelector('input[type="hidden"]');
    this.calendar = el.querySelector('.datepicker__calendar');
    this.iconBtn = el.querySelector('.datepicker__icon');

    this.selected = null; // Date | null
    this.viewYear = null;
    this.viewMonth = null;

    this._init();
  }

  static initAll(root = document) {
    root.querySelectorAll('[data-datepicker]').forEach(el => new Datepicker(el));
  }

  // ─── Инициализация ───────────────────────────────────────────────────────────

  _init() {
    const today = new Date();
    this.viewYear = today.getFullYear();
    this.viewMonth = today.getMonth();

    this.iconBtn.addEventListener('click', e => {
      e.stopPropagation();
      this._toggle();
    });

    this.input.addEventListener('click', e => {
      e.stopPropagation();
      this._toggle();
    });

    document.addEventListener('click', e => {
      if (!this.el.contains(e.target)) this._close();
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') this._close();
    });
  }

  // ─── Открыть / закрыть ───────────────────────────────────────────────────────

  _toggle() {
    this.calendar.classList.contains('_open') ? this._close() : this._open();
  }

  _open() {
    // Синхронизируем вид с выбранной датой
    if (this.selected) {
      this.viewYear = this.selected.getFullYear();
      this.viewMonth = this.selected.getMonth();
    }
    this._render();
    this.calendar.classList.add('_open');
    this.el.classList.add('_active');
  }

  _close() {
    this.calendar.classList.remove('_open');
    this.el.classList.remove('_active');
  }

  // ─── Рендер ──────────────────────────────────────────────────────────────────

  _render() {
    const MONTHS = [
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
    const DAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

    const year = this.viewYear;
    const month = this.viewMonth;

    // Первый день месяца (0=Вс..6=Сб → переводим в 0=Пн..6=Вс)
    const firstDay = new Date(year, month, 1).getDay();
    const startOffset = firstDay === 0 ? 6 : firstDay - 1;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrev = new Date(year, month, 0).getDate();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Строим сетку — 6 строк × 7 столбцов
    const cells = [];
    for (let i = 0; i < 42; i++) {
      const dayNum = i - startOffset + 1;
      let date, type;

      if (dayNum < 1) {
        date = new Date(year, month - 1, daysInPrev + dayNum);
        type = 'other';
      } else if (dayNum > daysInMonth) {
        date = new Date(year, month + 1, dayNum - daysInMonth);
        type = 'other';
      } else {
        date = new Date(year, month, dayNum);
        type = 'current';
      }

      cells.push({ date, type });
    }

    // ─── HTML ─────────────────────────────────────────────────────────────────

    this.calendar.innerHTML = `
      <div class="cal">
        <div class="cal__header">
          <span class="cal__title">${MONTHS[month]} ${year}</span>
          <div class="cal__nav">
            <button class="cal__nav-btn" data-prev type="button">
              <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
                <path d="M7 1L1 7L7 13" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <button class="cal__nav-btn" data-next type="button">
              <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
                <path d="M1 1L7 7L1 13" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
        </div>

        <div class="cal__grid">
          ${DAYS.map(d => `<div class="cal__dow">${d}</div>`).join('')}
          ${cells
            .map(({ date, type }) => {
              const ts = date.getTime();
              const selTs = this.selected ? this._normalize(this.selected).getTime() : null;
              const todayTs = today.getTime();

              const cls = [
                'cal__day',
                type === 'other' ? '_other' : '',
                ts === todayTs ? '_today' : '',
                ts === selTs ? '_selected' : '',
              ]
                .filter(Boolean)
                .join(' ');

              return `<button class="${cls}" type="button" data-ts="${ts}">${date.getDate()}</button>`;
            })
            .join('')}
        </div>
      </div>
    `;

    // ─── События ──────────────────────────────────────────────────────────────

    this.calendar.querySelector('[data-prev]').addEventListener('click', e => {
      e.stopPropagation();
      this.viewMonth--;
      if (this.viewMonth < 0) {
        this.viewMonth = 11;
        this.viewYear--;
      }
      this._render();
    });

    this.calendar.querySelector('[data-next]').addEventListener('click', e => {
      e.stopPropagation();
      this.viewMonth++;
      if (this.viewMonth > 11) {
        this.viewMonth = 0;
        this.viewYear++;
      }
      this._render();
    });

    this.calendar.querySelectorAll('.cal__day').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        this._select(new Date(Number(btn.dataset.ts)));
      });
    });
  }

  // ─── Выбор даты ──────────────────────────────────────────────────────────────

  _select(date) {
    this.selected = date;
    this.input.value = this._format(date);
    this.hidden.value = this._formatISO(date);
    this._close();

    this.el.dispatchEvent(
      new CustomEvent('datepicker:change', {
        bubbles: true,
        detail: { date, formatted: this.input.value, iso: this.hidden.value },
      }),
    );
  }

  // ─── Утилиты ─────────────────────────────────────────────────────────────────

  _normalize(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  _format(date) {
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${dd}.${mm}.${yyyy}`;
  }

  _formatISO(date) {
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${yyyy}-${mm}-${dd}`;
  }
}

Datepicker.initAll();
document.querySelector('[data-datepicker]').addEventListener('datepicker:change', e => {
  console.log(e.detail.formatted); // "28.10.2025"
  console.log(e.detail.iso); // "2025-10-28"
  console.log(e.detail.date); // Date object
});
