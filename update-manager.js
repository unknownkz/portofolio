/* ==========================================================================
   PORTOFOLIO — Axel Alexius Latukolan
   update-manager.js  |  Production Build
   PWA Auto-Update detector + bilingual toast with version display
   Synced with: Translations & Language modules in script.js
   ========================================================================== */

/* ==========================================================================
   1. TRANSLATIONS — Bilingual toast strings (ID / EN)
      Pattern mirrors Translations module in script.js
   ========================================================================== */
const UpdateTranslations = {
  id: {
    title:          'Pembaruan Tersedia',
    desc:           (ver) => `Versi baru ${ver} siap dipasang.`,
    btnUpdate:      'Perbarui Sekarang',
    btnLoading:     'Memuat...',
    btnDismiss:     'Tutup notifikasi',
  },
  en: {
    title:          'Update Available',
    desc:           (ver) => `Version ${ver} is ready to install.`,
    btnUpdate:      'Update Now',
    btnLoading:     'Loading...',
    btnDismiss:     'Close notification',
  },
};

/**
 * Read active language — same localStorage key & fallback as Language module.
 */
function _getCurrentLang() {
  return localStorage.getItem('language') || 'id';
}

/**
 * Get translation object for current language.
 */
function _t() {
  const lang = _getCurrentLang();
  return UpdateTranslations[lang] ?? UpdateTranslations.id;
}

/**
 * Format a raw SW_VERSION string into a human-readable label.
 * e.g. "axelal-v4" → "v4"  |  "axelal-v4.1" → "v4.1"
 * Falls back to the raw string if pattern doesn't match.
 */
function _formatVersion(raw = '') {
  const match = raw.match(/v[\d.]+$/i);
  return match ? match[0] : raw;
}


/* ==========================================================================
   2. UPDATE MANAGER MODULE
   ========================================================================== */
const UpdateManager = (() => {

  /* -- Config --------------------------------------------------------------- */
  const CHECK_INTERVAL_MS = 60 * 1000; // Poll for new SW every 60s (active tab only)

  /* -- State ---------------------------------------------------------------- */
  let _pendingSW     = null;  // The waiting ServiceWorker instance
  let _newVersion    = null;  // Raw version string received from SW message
  let _toastEl       = null;  // Cached toast DOM reference
  let _checkInterval = null;  // setInterval ID for periodic checks
  let _isReloading   = false; // Guard against double-reload


  /* ========================================================================
     3. TOAST UI
     ======================================================================== */

  /**
   * Build and mount the toast element.
   * Uses _newVersion to show the exact version string in the description.
   */
  function _createToast() {
    if (_toastEl) return _toastEl;

    const strings = _t();
    const ver     = _formatVersion(_newVersion);
    const toast   = document.createElement('div');

    toast.className = 'update-toast';
    toast.setAttribute('role',      'status');
    toast.setAttribute('aria-live', 'polite');
    toast.setAttribute('lang',      _getCurrentLang());

    toast.innerHTML = `
      <div class="update-toast__icon" aria-hidden="true">
        <i class="fas fa-arrow-rotate-right"></i>
      </div>
      <div class="update-toast__body">
        <strong class="update-toast__title">${strings.title}</strong>
        <span class="update-toast__desc">${strings.desc(ver)}</span>
      </div>
      <div class="update-toast__actions">
        <button
          class="update-toast__btn update-toast__btn--update"
          id="swUpdateBtn"
        >${strings.btnUpdate}</button>
        <button
          class="update-toast__btn update-toast__btn--dismiss"
          id="swDismissBtn"
          aria-label="${strings.btnDismiss}"
        ><i class="fas fa-xmark" aria-hidden="true"></i></button>
      </div>
    `;

    document.body.appendChild(toast);
    _toastEl = toast;

    document.getElementById('swUpdateBtn')?.addEventListener('click',  _applyUpdate);
    document.getElementById('swDismissBtn')?.addEventListener('click', _dismissToast);

    return toast;
  }

  /**
   * Re-render toast text in the newly selected language.
   * Preserves button disabled state if update is in progress.
   */
  function _updateToastText() {
    if (!_toastEl) return;

    const strings = _t();
    const ver     = _formatVersion(_newVersion);
    const title   = _toastEl.querySelector('.update-toast__title');
    const desc    = _toastEl.querySelector('.update-toast__desc');
    const btn     = document.getElementById('swUpdateBtn');
    const dismiss = document.getElementById('swDismissBtn');

    if (title)              title.textContent               = strings.title;
    if (desc)               desc.textContent                = strings.desc(ver);
    if (btn && !btn.disabled) btn.textContent               = strings.btnUpdate;
    if (dismiss)            dismiss.setAttribute('aria-label', strings.btnDismiss);

    _toastEl.setAttribute('lang', _getCurrentLang());
  }

  /** Slide toast into view. */
  function _showToast() {
    const toast = _createToast();
    requestAnimationFrame(() => {
      requestAnimationFrame(() => toast.classList.add('update-toast--visible'));
    });
  }

  /** Slide toast out and remove from DOM. */
  function _dismissToast() {
    _toastEl?.classList.remove('update-toast--visible');
    setTimeout(() => {
      _toastEl?.remove();
      _toastEl = null;
    }, 400);
  }


  /* ========================================================================
     4. LANGUAGE SYNC
     Listens to the same ID/EN buttons as the Language module in script.js.
     50ms delay ensures localStorage is written before we read it.
     ======================================================================== */

  function _syncLanguage() {
    const onSwitch = () => setTimeout(_updateToastText, 50);

    document.getElementById('idBtn')?.addEventListener('click', onSwitch);
    document.getElementById('enBtn')?.addEventListener('click', onSwitch);
  }


  /* ========================================================================
     5. UPDATE LOGIC
     ======================================================================== */

  /** Send SKIP_WAITING to the new SW, then wait for SW_ACTIVATED to reload. */
  function _applyUpdate() {
    if (_isReloading) return;
    _isReloading = true;

    const btn     = document.getElementById('swUpdateBtn');
    const strings = _t();

    if (btn) {
      btn.textContent = strings.btnLoading;
      btn.disabled    = true;
    }

    if (_pendingSW) {
      _pendingSW.postMessage({ type: 'SKIP_WAITING' });

      // Fallback: reload after 3s if SW_ACTIVATED message is never received
      setTimeout(() => {
        if (_isReloading) window.location.reload();
      }, 3000);
    } else {
      window.location.reload();
    }
  }

  /** Track the installing SW and show toast when it reaches 'installed'. */
  function _onUpdateFound(registration) {
    const newSW = registration.installing;
    if (!newSW) return;

    newSW.addEventListener('statechange', () => {
      if (newSW.state === 'installed' && navigator.serviceWorker.controller) {
        _pendingSW = newSW;
        // _newVersion already set via SW_WAITING message from install event
        _showToast();
      }
    });
  }

  /** Periodic background check — only when tab is active. */
  function _startPeriodicCheck(registration) {
    _checkInterval = setInterval(() => {
      if (!document.hidden) {
        registration.update().catch(() => {});
      }
    }, CHECK_INTERVAL_MS);

    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        registration.update().catch(() => {});
      }
    });
  }


  /* ========================================================================
     6. SW LIFECYCLE LISTENERS
     ======================================================================== */

  /**
   * Handle messages from the Service Worker:
   *
   * SW_WAITING   — new SW installed & waiting, contains version string
   *                → store version, mark pending SW, show toast
   *
   * SW_ACTIVATED — new SW took control
   *                → reload page to serve fresh content
   */
  function _listenForMessages() {
    navigator.serviceWorker.addEventListener('message', event => {
      const { type, version } = event.data ?? {};

      if (type === 'SW_WAITING') {
        // Store version from SW before toast is created
        _newVersion = version ?? null;

        if (navigator.serviceWorker.controller) {
          // Only show if there's an existing controller (not first install)
          _pendingSW = navigator.serviceWorker.controller;
          _showToast();
        }
      }

      if (type === 'SW_ACTIVATED' && !_isReloading) {
        _isReloading = true;
        window.location.reload();
      }
    });
  }

  /**
   * Handle controller change from another tab (multi-tab scenario).
   */
  function _listenForControllerChange() {
    let _refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (_refreshing) return;
      _refreshing = true;
      window.location.reload();
    });
  }


  /* ========================================================================
     7. INIT
     ======================================================================== */

  async function init() {
    if (!('serviceWorker' in navigator)) return;

    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js');

      // Case 1: SW already waiting on page load (stale/long-open tab)
      if (registration.waiting && navigator.serviceWorker.controller) {
        _pendingSW = registration.waiting;
        // Ask waiting SW for its version via postMessage
        const channel = new MessageChannel();
        channel.port1.onmessage = event => {
          _newVersion = event.data?.version ?? null;
          _showToast();
        };
        registration.waiting.postMessage({ type: 'GET_VERSION' }, [channel.port2]);

        // Fallback: show toast without version if no reply in 500ms
        setTimeout(() => {
          if (!_toastEl) _showToast();
        }, 500);
      }

      // Case 2: New SW found during this session
      registration.addEventListener('updatefound', () => _onUpdateFound(registration));

      // Case 3: Messages from SW (SW_WAITING, SW_ACTIVATED)
      _listenForMessages();

      // Case 4: Controller swapped (multi-tab)
      _listenForControllerChange();

      // Case 5: Periodic background polling
      _startPeriodicCheck(registration);

      // Sync toast language when user switches ID ↔ EN
      _syncLanguage();

    } catch {
      // SW registration failed — app still works, toast simply won't appear
    }
  }


  /* ========================================================================
     8. CLEANUP
     ======================================================================== */

  function destroy() {
    clearInterval(_checkInterval);
    _checkInterval = null;
    _dismissToast();
  }

  return { init, destroy };

})();

/* ==========================================================================
   END OF FILE
   ========================================================================== */
