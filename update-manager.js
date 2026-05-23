/* ==========================================================================
   PORTOFOLIO — Axel Alexius Latukolan
   update-manager.js  |  Production Build
   PWA Auto-Update + Manifest Reinstall System (bilingual ID/EN)
   Synced with: Translations & Language modules in script.js
   ========================================================================== */

/* ==========================================================================
   1. TRANSLATIONS
   ========================================================================== */
const UpdateTranslations = {
  id: {
    /* -- Toast: content update -------------------------------------------- */
    contentTitle:      'Pembaruan Tersedia',
    contentDesc:       (ver) => `Versi baru ${ver} siap dipasang.`,
    contentBtn:        'Perbarui',

    /* -- Toast: manifest update (icon/nama app) ---------------------------- */
    manifestTitle:     'Pembaruan App Tersedia',
    manifestDesc:      (ver) => `Icon & nama app versi ${ver} telah diperbarui.`,
    manifestBtnReinstall: 'Reinstall App',
    manifestBtnContent:  'Perbarui Konten Saja',

    /* -- Modal: reinstall guide ------------------------------------------- */
    modalTitle:        'Cara Reinstall App',
    modalSubtitle:     'Ikuti langkah berikut agar icon & nama app terbaru tampil di home screen kamu.',
    modalStep1Title:   'Uninstall app sekarang',
    modalStep1Desc:    'Tekan & tahan icon Axel A. L di home screen → pilih "Hapus" atau "Uninstall".',
    modalStep2Title:   'Install ulang app',
    modalStep2Desc:    'Setelah uninstall, tap tombol di bawah untuk install versi terbaru.',
    modalStep3Title:   'Selesai',
    modalStep3Desc:    'Icon & nama app terbaru akan tampil di home screen.',
    modalInstallBtn:   'Install Sekarang',
    modalLaterBtn:     'Nanti Saja',
    modalNote:         '* Konten website tetap bisa diakses normal selama proses ini.',

    /* -- Shared ----------------------------------------------------------- */
    btnLoading:        'Memuat...',
    btnDismiss:        'Tutup notifikasi',
  },

  en: {
    /* -- Toast: content update -------------------------------------------- */
    contentTitle:      'Update Available',
    contentDesc:       (ver) => `Version ${ver} is ready to install.`,
    contentBtn:        'Update',

    /* -- Toast: manifest update ------------------------------------------- */
    manifestTitle:     'App Update Available',
    manifestDesc:      (ver) => `App icon & name have been updated in version ${ver}.`,
    manifestBtnReinstall: 'Reinstall App',
    manifestBtnContent:   'Update Content Only',

    /* -- Modal: reinstall guide ------------------------------------------- */
    modalTitle:        'How to Reinstall the App',
    modalSubtitle:     'Follow these steps to get the new icon & app name on your home screen.',
    modalStep1Title:   'Uninstall the app',
    modalStep1Desc:    'Press & hold the Axel AL icon on your home screen → select "Remove" or "Uninstall".',
    modalStep2Title:   'Reinstall the app',
    modalStep2Desc:    'After uninstalling, tap the button below to install the latest version.',
    modalStep3Title:   'Done',
    modalStep3Desc:    'The new icon & app name will appear on your home screen.',
    modalInstallBtn:   'Install Now',
    modalLaterBtn:     'Maybe Later',
    modalNote:         '* The website content remains fully accessible during this process.',

    /* -- Shared ----------------------------------------------------------- */
    btnLoading:        'Loading...',
    btnDismiss:        'Close notification',
  },
};

/** Read active language — same key & fallback as Language module in script.js */
function _getCurrentLang() {
  return localStorage.getItem('language') || 'id';
}

/** Get translation object for current language */
function _t() {
  return UpdateTranslations[_getCurrentLang()] ?? UpdateTranslations.id;
}

/** "axelal-v4.1" → "v4.1" */
function _formatVersion(raw = '') {
  const match = raw.match(/v[\d.]+$/i);
  return match ? match[0] : raw;
}


/* ==========================================================================
   2. UPDATE MANAGER MODULE
   ========================================================================== */
const UpdateManager = (() => {

  /* -- Config --------------------------------------------------------------- */
  const CHECK_INTERVAL_MS = 60 * 1000;

  /* -- State ---------------------------------------------------------------- */
  let _pendingSW     = null;
  let _newVersion    = null;
  let _updateType    = 'content'; // 'content' | 'manifest'
  let _toastEl       = null;
  let _modalEl       = null;
  let _deferredPrompt = null; // BeforeInstallPromptEvent
  let _checkInterval = null;
  let _isReloading   = false;


  /* ========================================================================
     3. INSTALL PROMPT — Capture browser install prompt for reinstall flow
     ======================================================================== */
  function _initInstallPrompt() {
    window.addEventListener('beforeinstallprompt', e => {
      e.preventDefault();           // Suppress automatic prompt
      _deferredPrompt = e;          // Save for reinstall button
    });

    // Clear after install
    window.addEventListener('appinstalled', () => {
      _deferredPrompt = null;
    });
  }


  /* ========================================================================
     4. TOAST UI
     ======================================================================== */
  function _createToast() {
    if (_toastEl) return _toastEl;

    const s   = _t();
    const ver = _formatVersion(_newVersion);
    const isManifest = _updateType === 'manifest';
    const toast = document.createElement('div');

    toast.className = `update-toast${isManifest ? ' update-toast--manifest' : ''}`;
    toast.setAttribute('role',      'status');
    toast.setAttribute('aria-live', 'polite');
    toast.setAttribute('lang',      _getCurrentLang());

    toast.innerHTML = `
      <div class="update-toast__icon" aria-hidden="true">
        <i class="fas ${isManifest ? 'fa-mobile-screen-button' : 'fa-arrow-rotate-right'}"></i>
      </div>
      <div class="update-toast__body">
        <strong class="update-toast__title">
          ${isManifest ? s.manifestTitle : s.contentTitle}
        </strong>
        <span class="update-toast__desc">
          ${isManifest ? s.manifestDesc(ver) : s.contentDesc(ver)}
        </span>
      </div>
      <div class="update-toast__actions">
        ${isManifest ? `
          <button class="update-toast__btn update-toast__btn--reinstall" id="swReinstallBtn">
            <i class="fas fa-rotate" aria-hidden="true"></i>
            ${s.manifestBtnReinstall ?? s.manifestBtnreinstall}
          </button>
          <button class="update-toast__btn update-toast__btn--update" id="swUpdateBtn">
            ${s.manifestBtnContent}
          </button>
        ` : `
          <button class="update-toast__btn update-toast__btn--update" id="swUpdateBtn">
            ${s.contentBtn}
          </button>
        `}
        <button
          class="update-toast__btn update-toast__btn--dismiss"
          id="swDismissBtn"
          aria-label="${s.btnDismiss}"
        ><i class="fas fa-xmark" aria-hidden="true"></i></button>
      </div>
    `;

    document.body.appendChild(toast);
    _toastEl = toast;

    // Wire buttons
    document.getElementById('swUpdateBtn')?.addEventListener('click',    _applyUpdate);
    document.getElementById('swDismissBtn')?.addEventListener('click',   _dismissToast);
    document.getElementById('swReinstallBtn')?.addEventListener('click', _showReinstallModal);

    return toast;
  }

  function _updateToastText() {
    if (!_toastEl) return;

    const s   = _t();
    const ver = _formatVersion(_newVersion);
    const isManifest = _updateType === 'manifest';

    const title   = _toastEl.querySelector('.update-toast__title');
    const desc    = _toastEl.querySelector('.update-toast__desc');
    const updateBtn    = document.getElementById('swUpdateBtn');
    const reinstallBtn = document.getElementById('swReinstallBtn');
    const dismissBtn   = document.getElementById('swDismissBtn');

    if (title) title.textContent = isManifest ? s.manifestTitle : s.contentTitle;
    if (desc)  desc.textContent  = isManifest
      ? s.manifestDesc(ver)
      : s.contentDesc(ver);

    if (updateBtn && !updateBtn.disabled)
      updateBtn.textContent = isManifest ? s.manifestBtnContent : s.contentBtn;

    if (reinstallBtn)
      reinstallBtn.innerHTML = `<i class="fas fa-rotate" aria-hidden="true"></i> ${s.manifestBtnReinstall ?? s.manifestBtnreinstall}`;

    if (dismissBtn) dismissBtn.setAttribute('aria-label', s.btnDismiss);

    _toastEl.setAttribute('lang', _getCurrentLang());
  }

  function _showToast() {
    const toast = _createToast();
    requestAnimationFrame(() =>
      requestAnimationFrame(() => toast.classList.add('update-toast--visible'))
    );
  }

  function _dismissToast() {
    _toastEl?.classList.remove('update-toast--visible');
    setTimeout(() => { _toastEl?.remove(); _toastEl = null; }, 400);
  }


  /* ========================================================================
     5. REINSTALL MODAL
     ======================================================================== */

  function _showReinstallModal() {
    if (_modalEl) return;

    const s   = _t();
    const modal = document.createElement('div');
    modal.className = 'reinstall-modal';
    modal.setAttribute('role',            'dialog');
    modal.setAttribute('aria-modal',      'true');
    modal.setAttribute('aria-labelledby', 'reinstallModalTitle');
    modal.setAttribute('lang',            _getCurrentLang());

    modal.innerHTML = `
      <div class="reinstall-modal__backdrop"></div>
      <div class="reinstall-modal__box">

        <div class="reinstall-modal__header">
          <div class="reinstall-modal__icon" aria-hidden="true">
            <i class="fas fa-mobile-screen-button"></i>
          </div>
          <h2 class="reinstall-modal__title" id="reinstallModalTitle">${s.modalTitle}</h2>
          <p class="reinstall-modal__subtitle">${s.modalSubtitle}</p>
        </div>

        <ol class="reinstall-modal__steps">

          <li class="reinstall-modal__step">
            <div class="reinstall-modal__step-num" aria-hidden="true">1</div>
            <div class="reinstall-modal__step-body">
              <strong>${s.modalStep1Title}</strong>
              <span>${s.modalStep1Desc}</span>
            </div>
          </li>

          <li class="reinstall-modal__step">
            <div class="reinstall-modal__step-num" aria-hidden="true">2</div>
            <div class="reinstall-modal__step-body">
              <strong>${s.modalStep2Title}</strong>
              <span>${s.modalStep2Desc}</span>
            </div>
          </li>

          <li class="reinstall-modal__step">
            <div class="reinstall-modal__step-num" aria-hidden="true">3</div>
            <div class="reinstall-modal__step-body">
              <strong>${s.modalStep3Title}</strong>
              <span>${s.modalStep3Desc}</span>
            </div>
          </li>

        </ol>

        <p class="reinstall-modal__note">${s.modalNote}</p>

        <div class="reinstall-modal__actions">
          <button class="reinstall-modal__btn reinstall-modal__btn--install" id="modalInstallBtn">
            <i class="fas fa-download" aria-hidden="true"></i>
            ${s.modalInstallBtn}
          </button>
          <button class="reinstall-modal__btn reinstall-modal__btn--later" id="modalLaterBtn">
            ${s.modalLaterBtn}
          </button>
        </div>

      </div>
    `;

    document.body.appendChild(modal);
    _modalEl = modal;

    // Trap focus inside modal
    requestAnimationFrame(() =>
      requestAnimationFrame(() => modal.classList.add('reinstall-modal--visible'))
    );

    document.getElementById('modalInstallBtn')?.addEventListener('click', _triggerInstall);
    document.getElementById('modalLaterBtn')?.addEventListener('click',   _dismissModal);
    modal.querySelector('.reinstall-modal__backdrop')?.addEventListener('click', _dismissModal);

    // ESC to close
    document.addEventListener('keydown', _onModalEsc);
  }

  function _dismissModal() {
    _modalEl?.classList.remove('reinstall-modal--visible');
    setTimeout(() => { _modalEl?.remove(); _modalEl = null; }, 400);
    document.removeEventListener('keydown', _onModalEsc);
  }

  function _onModalEsc(e) {
    if (e.key === 'Escape') _dismissModal();
  }

  /** Trigger browser install prompt, or open site in browser as fallback */
  async function _triggerInstall() {
    const btn = document.getElementById('modalInstallBtn');
    const s   = _t();

    if (btn) { btn.textContent = s.btnLoading; btn.disabled = true; }

    if (_deferredPrompt) {
      // Browser supports install prompt (Chrome Android / Edge)
      await _deferredPrompt.prompt();
      const { outcome } = await _deferredPrompt.userChoice;
      _deferredPrompt = null;

      if (outcome === 'accepted') {
        _dismissModal();
        _dismissToast();
      } else {
        // User dismissed prompt — re-enable button
        if (btn) { btn.innerHTML = `<i class="fas fa-download" aria-hidden="true"></i> ${s.modalInstallBtn}`; btn.disabled = false; }
      }
    } else {
      // Fallback: open site in browser tab — user can install from browser menu
      window.open(window.location.origin, '_blank', 'noopener,noreferrer');
      _dismissModal();
    }
  }

  function _updateModalText() {
    if (!_modalEl) return;
    const s = _t();

    const mapping = {
      reinstallModalTitle: s.modalTitle,
    };

    Object.entries(mapping).forEach(([id, text]) => {
      const el = document.getElementById(id);
      if (el) el.textContent = text;
    });

    _modalEl.setAttribute('lang', _getCurrentLang());
  }


  /* ========================================================================
     6. LANGUAGE SYNC
     ======================================================================== */
  function _syncLanguage() {
    const onSwitch = () => {
      setTimeout(() => {
        _updateToastText();
        _updateModalText();
      }, 50);
    };

    document.getElementById('idBtn')?.addEventListener('click', onSwitch);
    document.getElementById('enBtn')?.addEventListener('click', onSwitch);
  }


  /* ========================================================================
     7. UPDATE LOGIC
     ======================================================================== */
  function _applyUpdate() {
    if (_isReloading) return;
    _isReloading = true;

    const btn = document.getElementById('swUpdateBtn');
    if (btn) { btn.textContent = _t().btnLoading; btn.disabled = true; }

    if (_pendingSW) {
      _pendingSW.postMessage({ type: 'SKIP_WAITING' });
      setTimeout(() => { if (_isReloading) window.location.reload(); }, 3000);
    } else {
      window.location.reload();
    }
  }

  function _onUpdateFound(registration) {
    const newSW = registration.installing;
    if (!newSW) return;

    newSW.addEventListener('statechange', () => {
      if (newSW.state === 'installed' && navigator.serviceWorker.controller) {
        _pendingSW = newSW;
        _showToast();
      }
    });
  }

  function _startPeriodicCheck(registration) {
    _checkInterval = setInterval(() => {
      if (!document.hidden) registration.update().catch(() => {});
    }, CHECK_INTERVAL_MS);

    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) registration.update().catch(() => {});
    });
  }


  /* ========================================================================
     8. SW LIFECYCLE LISTENERS
     ======================================================================== */
  function _listenForMessages() {
    navigator.serviceWorker.addEventListener('message', event => {
      const { type, version, updateType } = event.data ?? {};

      if (type === 'SW_WAITING') {
        _newVersion = version    ?? null;
        _updateType = updateType ?? 'content';

        if (navigator.serviceWorker.controller) {
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

  function _listenForControllerChange() {
    let _refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (_refreshing) return;
      _refreshing = true;
      window.location.reload();
    });
  }


  /* ========================================================================
     9. INIT
     ======================================================================== */
  async function init() {
    if (!('serviceWorker' in navigator)) return;

    // Capture install prompt early
    _initInstallPrompt();

    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js');

      // Case 1: SW already waiting on page load
      if (registration.waiting && navigator.serviceWorker.controller) {
        _pendingSW = registration.waiting;

        const channel = new MessageChannel();
        channel.port1.onmessage = event => {
          _newVersion = event.data?.version    ?? null;
          _updateType = event.data?.updateType ?? 'content';
          _showToast();
        };
        registration.waiting.postMessage({ type: 'GET_VERSION' }, [channel.port2]);

        // Fallback: show toast if no reply in 500ms
        setTimeout(() => { if (!_toastEl) _showToast(); }, 500);
      }

      // Case 2: New SW found during session
      registration.addEventListener('updatefound', () => _onUpdateFound(registration));

      // Case 3: Messages from SW
      _listenForMessages();

      // Case 4: Controller change (multi-tab)
      _listenForControllerChange();

      // Case 5: Periodic check
      _startPeriodicCheck(registration);

      // Sync language buttons
      _syncLanguage();

    } catch {
      // SW failed — app still works normally
    }
  }


  /* ========================================================================
     10. CLEANUP
     ======================================================================== */
  function destroy() {
    clearInterval(_checkInterval);
    _checkInterval = null;
    _dismissToast();
    _dismissModal();
  }
  return { init, destroy };
})();


/* ==========================================================================
   END OF FILE
   ========================================================================== */
