/* ==========================================================================
   PORTOFOLIO — Axel Alexius Latukolan
   update-manager.js  |  Production Build  |  Final
   PWA Auto-Update + Manifest Reinstall System (bilingual ID/EN)
   Synced with: Translations & Language modules in script.js
   ========================================================================== */

/* ==========================================================================
   1. TRANSLATIONS (ID / EN)
   Pattern mirrors Translations module in script.js
   ========================================================================== */
const UpdateTranslations = {
  id: {
    /* -- Toast: content update -------------------------------------------- */
    contentTitle:         'Pembaruan Tersedia',
    contentDesc:          (ver) => `Versi baru ${ver} siap dipasang.`,
    contentBtn:           'Perbarui Sekarang',

    /* -- Toast: manifest update (icon / nama app) ------------------------- */
    manifestTitle:        'Pembaruan App Tersedia',
    manifestDesc:         (ver) => `Icon & nama app versi ${ver} telah diperbarui.`,
    manifestBtnReinstall: 'Reinstall App',
    manifestBtnContent:   'Perbarui Konten Saja',

    /* -- Modal: reinstall guide ------------------------------------------- */
    modalTitle:           'Cara Reinstall App',
    modalSubtitle:        'Ikuti langkah berikut agar icon & nama app terbaru tampil di home screen kamu.',
    modalStep1Title:      'Uninstall app sekarang',
    modalStep1Desc:       'Tekan & tahan icon Axel A. L di home screen → pilih "Hapus" atau "Uninstall".',
    modalStep2TitleAuto:  'Install ulang app',
    modalStep2DescAuto:   'Setelah uninstall, tap tombol di bawah untuk install versi terbaru.',
    modalStep2TitleManual:'Buka website di browser',
    modalStep2DescManual: 'Tap tombol di bawah → website terbuka di Chrome → tap ⋮ (titik tiga) → pilih "Tambahkan ke layar utama" atau "Instal aplikasi".',
    modalStep3Title:      'Selesai',
    modalStep3Desc:       'Icon & nama app terbaru akan tampil di home screen.',
    modalInstallAuto:     'Install Sekarang',
    modalInstallManual:   'Buka di Browser Chrome',
    modalLaterBtn:        'Nanti Saja',
    modalNote:            '* Konten website tetap bisa diakses normal selama proses ini.',

    /* -- Shared ----------------------------------------------------------- */
    btnLoading:           'Memuat...',
    btnDismiss:           'Tutup notifikasi',
  },

  en: {
    /* -- Toast: content update -------------------------------------------- */
    contentTitle:         'Update Available',
    contentDesc:          (ver) => `Version ${ver} is ready to install.`,
    contentBtn:           'Update Now',

    /* -- Toast: manifest update ------------------------------------------- */
    manifestTitle:        'App Update Available',
    manifestDesc:         (ver) => `App icon & name have been updated in version ${ver}.`,
    manifestBtnReinstall: 'Reinstall App',
    manifestBtnContent:   'Update Content Only',

    /* -- Modal: reinstall guide ------------------------------------------- */
    modalTitle:           'How to Reinstall the App',
    modalSubtitle:        'Follow these steps to get the new icon & app name on your home screen.',
    modalStep1Title:      'Uninstall the app',
    modalStep1Desc:       'Press & hold the Axel AL icon on your home screen → select "Remove" or "Uninstall".',
    modalStep2TitleAuto:  'Reinstall the app',
    modalStep2DescAuto:   'After uninstalling, tap the button below to install the latest version.',
    modalStep2TitleManual:'Open the website in browser',
    modalStep2DescManual: 'Tap the button below → website opens in Chrome → tap ⋮ (three dots) → select "Add to Home screen" or "Install app".',
    modalStep3Title:      'Done',
    modalStep3Desc:       'The new icon & app name will appear on your home screen.',
    modalInstallAuto:     'Install Now',
    modalInstallManual:   'Open in Chrome',
    modalLaterBtn:        'Maybe Later',
    modalNote:            '* The website content remains fully accessible during this process.',

    /* -- Shared ----------------------------------------------------------- */
    btnLoading:           'Loading...',
    btnDismiss:           'Close notification',
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
  const CHECK_INTERVAL_MS = 60 * 1000; // Poll every 60s (active tab only)

  /* -- State ---------------------------------------------------------------- */
  let _pendingSW      = null;    // Waiting ServiceWorker instance
  let _newVersion     = null;    // Raw version string from SW
  let _updateType     = 'content'; // 'content' | 'manifest'
  let _toastEl        = null;    // Cached toast DOM
  let _modalEl        = null;    // Cached modal DOM
  let _deferredPrompt = null;    // BeforeInstallPromptEvent
  let _checkInterval  = null;    // setInterval ID
  let _isReloading    = false;   // Guard double-reload


  /* ========================================================================
     3. INSTALL PROMPT — Capture early, before user needs it
     ======================================================================== */

  function _initInstallPrompt() {
    window.addEventListener('beforeinstallprompt', e => {
      e.preventDefault();      // Suppress automatic browser prompt
      _deferredPrompt = e;     // Save for reinstall button
    });

    window.addEventListener('appinstalled', () => {
      _deferredPrompt = null;  // Clear after successful install
    });
  }


  /* ========================================================================
     4. TOAST UI
     ======================================================================== */

  function _createToast() {
    if (_toastEl) return _toastEl;

    const s          = _t();
    const ver        = _formatVersion(_newVersion);
    const isManifest = _updateType === 'manifest';
    const toast      = document.createElement('div');

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
            ${s.manifestBtnReinstall}
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

    document.getElementById('swUpdateBtn')?.addEventListener('click',    _applyUpdate);
    document.getElementById('swDismissBtn')?.addEventListener('click',   _dismissToast);
    document.getElementById('swReinstallBtn')?.addEventListener('click', _showReinstallModal);

    return toast;
  }

  /** Re-render toast text when language switches */
  function _updateToastText() {
    if (!_toastEl) return;

    const s          = _t();
    const ver        = _formatVersion(_newVersion);
    const isManifest = _updateType === 'manifest';

    const title        = _toastEl.querySelector('.update-toast__title');
    const desc         = _toastEl.querySelector('.update-toast__desc');
    const updateBtn    = document.getElementById('swUpdateBtn');
    const reinstallBtn = document.getElementById('swReinstallBtn');
    const dismissBtn   = document.getElementById('swDismissBtn');

    if (title) title.textContent = isManifest ? s.manifestTitle : s.contentTitle;
    if (desc)  desc.textContent  = isManifest ? s.manifestDesc(ver) : s.contentDesc(ver);

    if (updateBtn && !updateBtn.disabled)
      updateBtn.textContent = isManifest ? s.manifestBtnContent : s.contentBtn;

    if (reinstallBtn)
      reinstallBtn.innerHTML =
        `<i class="fas fa-rotate" aria-hidden="true"></i> ${s.manifestBtnReinstall}`;

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

    const s          = _t();
    const hasPrompt  = !!_deferredPrompt;

    // Choose step 2 content based on whether native prompt is available
    const step2Title = hasPrompt ? s.modalStep2TitleAuto  : s.modalStep2TitleManual;
    const step2Desc  = hasPrompt ? s.modalStep2DescAuto   : s.modalStep2DescManual;
    const installLabel = hasPrompt ? s.modalInstallAuto   : s.modalInstallManual;

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

          <li class="reinstall-modal__step" id="reinstallStep2">
            <div class="reinstall-modal__step-num" aria-hidden="true">2</div>
            <div class="reinstall-modal__step-body">
              <strong>${step2Title}</strong>
              <span>${step2Desc}</span>
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
            ${installLabel}
          </button>
          <button class="reinstall-modal__btn reinstall-modal__btn--later" id="modalLaterBtn">
            ${s.modalLaterBtn}
          </button>
        </div>

      </div>
    `;

    document.body.appendChild(modal);
    _modalEl = modal;

    requestAnimationFrame(() =>
      requestAnimationFrame(() => modal.classList.add('reinstall-modal--visible'))
    );

    document.getElementById('modalInstallBtn')?.addEventListener('click', _triggerInstall);
    document.getElementById('modalLaterBtn')?.addEventListener('click',   _dismissModal);
    modal.querySelector('.reinstall-modal__backdrop')?.addEventListener('click', _dismissModal);
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

  /** Update modal text when language switches */
  function _updateModalText() {
    if (!_modalEl) return;
    const s = _t();

    const titleEl = document.getElementById('reinstallModalTitle');
    if (titleEl) titleEl.textContent = s.modalTitle;
    _modalEl.setAttribute('lang', _getCurrentLang());
  }


  /* ========================================================================
     6. INSTALL LOGIC
     ——————————————————————————————————————————————————————————————————————————
     PATH A — _deferredPrompt tersedia:
       Clear cache → Native install prompt → Accept → Reload bersih

     PATH B — _deferredPrompt null (browser masih ingat app):
       Clear cache → Buka Chrome tab baru dengan ?source=reinstall
       User install manual dari menu Chrome ⋮ → "Tambahkan ke layar utama"
       Menghindari loop bolak-balik standalone PWA ↔ browser
     ======================================================================== */

  async function _triggerInstall() {
    const btn = document.getElementById('modalInstallBtn');
    const s   = _t();

    if (btn) { btn.textContent = s.btnLoading; btn.disabled = true; }

    // Step 1: Bersihkan semua cache lama via SW
    await _clearCachesViaSW();

    // Step 2: Pilih PATH A atau PATH B
    if (_deferredPrompt) {
      await _runNativeInstall(btn, s);
    } else {
      _runManualInstall(btn, s);
    }
  }

  /** PATH A: Gunakan native BeforeInstallPromptEvent */
  async function _runNativeInstall(btn, s) {
    try {
      await _deferredPrompt.prompt();
      const { outcome } = await _deferredPrompt.userChoice;
      _deferredPrompt = null;

      if (outcome === 'accepted') {
        _dismissModal();
        _dismissToast();
        setTimeout(() => window.location.reload(), 800);
      } else {
        _resetInstallBtn(btn, s, true);
      }
    } catch {
      _resetInstallBtn(btn, s, true);
    }
  }

  /**
   * PATH B: Buka tab Chrome baru.
   * ?source=reinstall agar bisa dibedakan dari navigasi biasa.
   * Chrome akan tampilkan opsi install dari menu browser (bukan redirect PWA).
   */
  function _runManualInstall(btn, s) {
    const url    = `${window.location.origin}/?source=reinstall`;
    const opened = window.open(url, '_blank', 'noopener,noreferrer');

    // Fallback jika popup diblokir browser
    if (!opened) window.location.href = url;

    // Update step 2 teks ke instruksi manual
    _updateStep2ToManual(s);

    // Re-enable tombol setelah 1.5s
    setTimeout(() => _resetInstallBtn(btn, s, false), 1500);
  }

  /** Update step 2 di modal ke instruksi manual install */
  function _updateStep2ToManual(s) {
    const step2 = document.getElementById('reinstallStep2');
    if (!step2) return;

    const strong = step2.querySelector('strong');
    const span   = step2.querySelector('span');
    if (strong) strong.textContent = s.modalStep2TitleManual;
    if (span)   span.textContent   = s.modalStep2DescManual;
  }

  function _resetInstallBtn(btn, s, isAuto) {
    if (!btn) return;
    const label = isAuto ? s.modalInstallAuto : s.modalInstallManual;
    btn.innerHTML = `<i class="fas fa-download" aria-hidden="true"></i> ${label}`;
    btn.disabled  = false;
  }

  /**
   * Kirim CLEAR_CACHE ke SW via MessageChannel.
   * Resolve setelah CACHE_CLEARED reply atau 2s timeout (safety net).
   */
  function _clearCachesViaSW() {
    return new Promise(resolve => {
      const sw = navigator.serviceWorker.controller;
      if (!sw) { resolve(); return; }

      const timeout = setTimeout(resolve, 2000);
      const channel = new MessageChannel();

      channel.port1.onmessage = event => {
        if (event.data?.type === 'CACHE_CLEARED') {
          clearTimeout(timeout);
          resolve();
        }
      };

      sw.postMessage({ type: 'CLEAR_CACHE' }, [channel.port2]);
    });
  }


  /* ========================================================================
     7. LANGUAGE SYNC
     Listens to same ID/EN buttons as Language module in script.js.
     50ms delay ensures localStorage is written before we read it.
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
     8. UPDATE LOGIC (content update — reload page)
     ======================================================================== */

  function _applyUpdate() {
    if (_isReloading) return;
    _isReloading = true;

    const btn = document.getElementById('swUpdateBtn');
    if (btn) { btn.textContent = _t().btnLoading; btn.disabled = true; }

    if (_pendingSW) {
      _pendingSW.postMessage({ type: 'SKIP_WAITING' });
      // Fallback reload jika SW_ACTIVATED tidak diterima dalam 3s
      setTimeout(() => { if (_isReloading) window.location.reload(); }, 3000);
    } else {
      window.location.reload();
    }
  }

  function _onUpdateFound(registration) {
    const newSW = registration.installing;
    if (!newSW) return;

    newSW.addEventListener('statechange', () => {
      // 'installed' + existing controller = SW baru waiting, lama masih aktif
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

    // Juga check saat tab kembali aktif
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) registration.update().catch(() => {});
    });
  }


  /* ========================================================================
     9. SW LIFECYCLE LISTENERS
     ======================================================================== */

  function _listenForMessages() {
    navigator.serviceWorker.addEventListener('message', event => {
      const { type, version, updateType } = event.data ?? {};

      // SW baru selesai install → tampilkan toast
      if (type === 'SW_WAITING') {
        _newVersion = version    ?? null;
        _updateType = updateType ?? 'content';

        if (navigator.serviceWorker.controller) {
          _pendingSW = navigator.serviceWorker.controller;
          _showToast();
        }
      }

      // SW baru aktif → reload halaman
      if (type === 'SW_ACTIVATED' && !_isReloading) {
        _isReloading = true;
        window.location.reload();
      }
    });
  }

  /** Handle SW controller change dari tab lain */
  function _listenForControllerChange() {
    let _refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (_refreshing) return;
      _refreshing = true;
      window.location.reload();
    });
  }


  /* ========================================================================
     10. INIT
     ======================================================================== */

  async function init() {
    if (!('serviceWorker' in navigator)) return;

    // Tangkap install prompt sebelum user butuhkan
    _initInstallPrompt();

    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js');

      // Case 1: SW sudah waiting saat halaman dibuka (tab lama)
      if (registration.waiting && navigator.serviceWorker.controller) {
        _pendingSW = registration.waiting;

        // Tanya versi & updateType via MessageChannel
        const channel = new MessageChannel();
        channel.port1.onmessage = event => {
          _newVersion = event.data?.version    ?? null;
          _updateType = event.data?.updateType ?? 'content';
          _showToast();
        };
        registration.waiting.postMessage({ type: 'GET_VERSION' }, [channel.port2]);

        // Fallback: tampilkan toast kalau tidak ada reply dalam 500ms
        setTimeout(() => { if (!_toastEl) _showToast(); }, 500);
      }

      // Case 2: SW baru ditemukan saat sesi ini
      registration.addEventListener('updatefound', () => _onUpdateFound(registration));

      // Case 3: Pesan dari SW (SW_WAITING, SW_ACTIVATED)
      _listenForMessages();

      // Case 4: Controller change (multi-tab)
      _listenForControllerChange();

      // Case 5: Polling berkala
      _startPeriodicCheck(registration);

      // Sinkron teks saat user ganti bahasa
      _syncLanguage();

    } catch {
      // SW gagal daftar — app tetap jalan normal, toast tidak muncul
    }
  }


  /* ========================================================================
     11. CLEANUP
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
