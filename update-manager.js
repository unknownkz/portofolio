/* ==========================================================================
   PORTOFOLIO — Axel Alexius Latukolan
   update-manager.js  |  Production Build
   Handles PWA auto-update detection and toast notification
   ========================================================================== */

/* ==========================================================================
   1. UPDATE MANAGER MODULE
   ========================================================================== */
const UpdateManager = (() => {

  /* -- Config -------------------------------------------------------------- */
  const CHECK_INTERVAL_MS = 60 * 1000; // Check for new SW every 60 seconds
  const TOAST_DURATION_MS = 0;         // 0 = toast stays until user acts

  /* -- State --------------------------------------------------------------- */
  let _pendingSW     = null; // The waiting SW registration
  let _toastEl       = null;
  let _checkInterval = null;
  let _isReloading   = false;


  /* ========================================================================
     2. TOAST UI
     ======================================================================== */

  function _createToast() {
    if (_toastEl) return _toastEl;

    const toast = document.createElement('div');
    toast.className   = 'update-toast';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    toast.innerHTML = `
      <div class="update-toast__icon" aria-hidden="true">
        <i class="fas fa-arrow-rotate-right"></i>
      </div>
      <div class="update-toast__body">
        <strong class="update-toast__title">Update Tersedia</strong>
        <span class="update-toast__desc">Versi baru Axel A. L siap dipasang.</span>
      </div>
      <div class="update-toast__actions">
        <button class="update-toast__btn update-toast__btn--update" id="swUpdateBtn">
          Update
        </button>
        <button class="update-toast__btn update-toast__btn--dismiss" id="swDismissBtn" aria-label="Tutup notifikasi">
          <i class="fas fa-xmark" aria-hidden="true"></i>
        </button>
      </div>
    `;

    document.body.appendChild(toast);
    _toastEl = toast;

    // Wire up buttons
    document.getElementById('swUpdateBtn')?.addEventListener('click', _applyUpdate);
    document.getElementById('swDismissBtn')?.addEventListener('click', _dismissToast);

    return toast;
  }

  function _showToast() {
    const toast = _createToast();
    // Force reflow before adding active class for CSS transition
    requestAnimationFrame(() => {
      requestAnimationFrame(() => toast.classList.add('update-toast--visible'));
    });
  }

  function _dismissToast() {
    _toastEl?.classList.remove('update-toast--visible');
    setTimeout(() => {
      _toastEl?.remove();
      _toastEl = null;
    }, 400);
  }


  /* ========================================================================
     3. UPDATE LOGIC
     ======================================================================== */

  /**
   * Tell the waiting SW to activate, then reload all clients.
   */
  function _applyUpdate() {
    if (_isReloading) return;
    _isReloading = true;

    // Show loading state on button
    const btn = document.getElementById('swUpdateBtn');
    if (btn) {
      btn.textContent = 'Memuat...';
      btn.disabled    = true;
    }

    if (_pendingSW) {
      // Tell the waiting SW to skip waiting and activate
      _pendingSW.postMessage({ type: 'SKIP_WAITING' });

      // SW will send SW_ACTIVATED message back → reload triggered there
      // Fallback: reload after 3s in case message is missed
      setTimeout(() => {
        if (_isReloading) window.location.reload();
      }, 3000);
    } else {
      window.location.reload();
    }
  }

  /**
   * Called when a new SW is found waiting to activate.
   */
  function _onUpdateFound(registration) {
    const newSW = registration.installing;
    if (!newSW) return;

    newSW.addEventListener('statechange', () => {
      if (newSW.state === 'installed' && navigator.serviceWorker.controller) {
        // New SW is installed and waiting — old SW still active
        _pendingSW = newSW;
        _showToast();
      }
    });
  }

  /**
   * Periodically check for SW updates (active tab only).
   */
  function _startPeriodicCheck(registration) {
    _checkInterval = setInterval(() => {
      if (!document.hidden) {
        registration.update().catch(() => {
          // Network unavailable — silently skip
        });
      }
    }, CHECK_INTERVAL_MS);

    // Also check when tab becomes visible again
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        registration.update().catch(() => {});
      }
    });
  }


  /* ========================================================================
     4. SW LIFECYCLE LISTENERS
     ======================================================================== */

  function _listenForMessages() {
    navigator.serviceWorker.addEventListener('message', event => {
      if (event.data?.type === 'SW_ACTIVATED') {
        // New SW has activated — reload to get fresh content
        if (!_isReloading) {
          _isReloading = true;
          window.location.reload();
        }
      }
    });
  }

  /**
   * Handle edge case: SW controller changed in another tab.
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
     5. INIT
     ======================================================================== */

  async function init() {
    if (!('serviceWorker' in navigator)) return;

    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js');

      // Case 1: SW already waiting (e.g. user had tab open for a long time)
      if (registration.waiting && navigator.serviceWorker.controller) {
        _pendingSW = registration.waiting;
        _showToast();
      }

      // Case 2: New SW found during this session
      registration.addEventListener('updatefound', () => _onUpdateFound(registration));

      // Case 3: Listen for messages from SW (SW_ACTIVATED)
      _listenForMessages();

      // Case 4: Controller changed (multi-tab scenario)
      _listenForControllerChange();

      // Periodic background check
      _startPeriodicCheck(registration);

    } catch {
      // SW registration failed — site still works normally without update feature
    }
  }


  /* ========================================================================
     6. CLEANUP (for SPA / future use)
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
