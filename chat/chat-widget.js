/* ==========================================================================
   PORTOFOLIO — Axel Alexius Latukolan
   chat-widget.js  |  Production Build
   AI Chat Widget (Gemini via Edge Function) — bilingual ID/EN
   Synced with: Language module in script.js
   ========================================================================== */

/* ==========================================================================
   1. TRANSLATIONS
   ========================================================================== */
const ChatTranslations = {
  id: {
    title:          'HEXA',
    subtitle:       'Web3 AI Assistant',
    placeholder:    'Ketik pesan...',
    send:           'Kirim',
    welcome:        'Halo! 👋 Saya HEXA, asisten AI Axel. Tanya apa saja tentang portofolio, keahlian, atau pengalaman Axel — atau pertanyaan umum lainnya!',
    thinking:       'Sedang mengetik...',
    errorNetwork:   'Koneksi gagal. Coba lagi ya.',
    errorLimit:     'Terlalu banyak pesan. Tunggu sebentar.',
    errorGeneral:   'Ups, ada kesalahan. Coba lagi.',
    closeLabel:     'Tutup chat',
    openLabel:      'Buka chat AI',
    clearLabel:     'Hapus riwayat chat',
    clearConfirm:   'Hapus semua riwayat chat?',
  },
  en: {
    title:          'HEXA',
    subtitle:       'Web3 AI Assistant',
    placeholder:    'Type a message...',
    send:           'Send',
    welcome:        'Hello! 👋 I\'m HEXA, Axel\'s AI assistant. Ask me anything about his portfolio, skills, experience — or any general questions!',
    thinking:       'Typing...',
    errorNetwork:   'Connection failed. Please try again.',
    errorLimit:     'Too many messages. Please wait a moment.',
    errorGeneral:   'Oops, something went wrong. Try again.',
    closeLabel:     'Close chat',
    openLabel:      'Open AI chat',
    clearLabel:     'Clear chat history',
    clearConfirm:   'Clear all chat history?',
  },
};

function _chatLang() {
  return localStorage.getItem('language') || 'id';
}

function _ct() {
  return ChatTranslations[_chatLang()] ?? ChatTranslations.id;
}


/* ==========================================================================
   2. CHAT WIDGET MODULE
   ========================================================================== */
const ChatWidget = (() => {

  /* -- Config --------------------------------------------------------------- */
  const API_ENDPOINT   = '/api/chat';
  const MAX_HISTORY    = 20;       // Max messages kept in memory
  const STORAGE_KEY    = 'axelal_chat_history';
  const TYPING_DELAY   = 300;      // ms before showing typing indicator

  /* -- State ---------------------------------------------------------------- */
  let _isOpen     = false;
  let _isLoading  = false;
  let _history    = [];            // { role: 'user'|'assistant', content: string }[]
  let _widgetEl   = null;
  let _messagesEl = null;
  let _inputEl    = null;


  /* ========================================================================
     3. BUILD UI
     ======================================================================== */

  function _buildWidget() {
    const s      = _ct();
    const widget = document.createElement('div');
    widget.id        = 'chatWidget';
    widget.className = 'chat-widget';
    widget.setAttribute('role',       'complementary');
    widget.setAttribute('aria-label', s.openLabel);

    widget.innerHTML = `
      <!-- Floating toggle button -->
      <button class="chat-toggle" id="chatToggleBtn" aria-label="${s.openLabel}" aria-expanded="false">
        <span class="chat-toggle__icon chat-toggle__icon--open">
          <i class="fas fa-comment-dots" aria-hidden="true"></i>
        </span>
        <span class="chat-toggle__icon chat-toggle__icon--close" aria-hidden="true">
          <i class="fas fa-xmark"></i>
        </span>
        <span class="chat-toggle__badge" id="chatBadge" aria-hidden="true"></span>
      </button>

      <!-- Chat panel -->
      <div class="chat-panel" id="chatPanel" aria-hidden="true">

        <!-- Header -->
        <div class="chat-header">
          <div class="chat-header__info">
            <div class="chat-header__avatar" aria-hidden="true">
              <img src="/logo-a.png" alt="Axel AI" width="32" height="32">
              <span class="chat-header__status" aria-label="Online"></span>
            </div>
            <div class="chat-header__text">
              <strong class="chat-header__title" id="chatTitle">${s.title}</strong>
              <span class="chat-header__subtitle" id="chatSubtitle">${s.subtitle}</span>
            </div>
          </div>
          <div class="chat-header__actions">
            <button class="chat-header__btn" id="chatClearBtn" aria-label="${s.clearLabel}" title="${s.clearLabel}">
              <i class="fas fa-trash-can" aria-hidden="true"></i>
            </button>
            <button class="chat-header__btn" id="chatCloseBtn" aria-label="${s.closeLabel}">
              <i class="fas fa-xmark" aria-hidden="true"></i>
            </button>
          </div>
        </div>

        <!-- Messages -->
        <div class="chat-messages" id="chatMessages" role="log" aria-live="polite" aria-label="Chat messages">
        </div>

        <!-- Input -->
        <div class="chat-input-area">
          <textarea
            class="chat-input"
            id="chatInput"
            placeholder="${s.placeholder}"
            rows="1"
            maxlength="500"
            aria-label="${s.placeholder}"
          ></textarea>
          <button class="chat-send" id="chatSendBtn" aria-label="${s.send}" disabled>
            <i class="fas fa-paper-plane" aria-hidden="true"></i>
          </button>
        </div>

      </div>
    `;

    document.body.appendChild(widget);
    _widgetEl   = widget;
    _messagesEl = document.getElementById('chatMessages');
    _inputEl    = document.getElementById('chatInput');

    return widget;
  }


  /* ========================================================================
     4. MESSAGES
     ======================================================================== */

  function _appendMessage(role, content, isTyping = false) {
    const s      = _ct();
    const wrap   = document.createElement('div');
    wrap.className = `chat-message chat-message--${role}${isTyping ? ' chat-message--typing' : ''}`;
    wrap.setAttribute('role', 'article');

    if (isTyping) {
      wrap.innerHTML = `
        <div class="chat-bubble">
          <span class="chat-typing-dot"></span>
          <span class="chat-typing-dot"></span>
          <span class="chat-typing-dot"></span>
        </div>
      `;
    } else {
      const time = new Date().toLocaleTimeString(_chatLang() === 'id' ? 'id-ID' : 'en-US', {
        hour: '2-digit', minute: '2-digit',
      });
      wrap.innerHTML = `
        <div class="chat-bubble">
          <p class="chat-bubble__text"></p>
          <span class="chat-bubble__time" aria-hidden="true">${time}</span>
        </div>
      `;
      // Set text safely (no XSS)
      wrap.querySelector('.chat-bubble__text').textContent = content;
    }

    _messagesEl.appendChild(wrap);
    _scrollToBottom();
    return wrap;
  }

  function _removeTypingIndicator() {
    _messagesEl.querySelector('.chat-message--typing')?.remove();
  }

  function _scrollToBottom() {
    requestAnimationFrame(() => {
      _messagesEl.scrollTop = _messagesEl.scrollHeight;
    });
  }

  function _showWelcome() {
    if (_messagesEl.children.length === 0) {
      _appendMessage('assistant', _ct().welcome);
    }
  }


  /* ========================================================================
     5. HISTORY (localStorage)
     ======================================================================== */

  function _loadHistory() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      _history = raw ? JSON.parse(raw) : [];
    } catch {
      _history = [];
    }

    // Re-render saved messages
    _history.forEach(msg => _appendMessage(msg.role, msg.content));
  }

  function _saveHistory() {
    try {
      // Keep only last MAX_HISTORY messages
      const trimmed = _history.slice(-MAX_HISTORY);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    } catch {
      // localStorage full — silently skip
    }
  }

  function _clearHistory() {
    const s = _ct();
    if (!window.confirm(s.clearConfirm)) return;

    _history = [];
    localStorage.removeItem(STORAGE_KEY);
    _messagesEl.innerHTML = '';
    _showWelcome();
  }


  /* ========================================================================
     6. SEND MESSAGE
     ======================================================================== */

  async function _sendMessage() {
    if (_isLoading) return;

    const text = _inputEl.value.trim();
    if (!text) return;

    const s = _ct();

    // Clear input
    _inputEl.value = '';
    _inputEl.style.height = 'auto';
    document.getElementById('chatSendBtn').disabled = true;

    // Add user message to UI + history
    _appendMessage('user', text);
    _history.push({ role: 'user', content: text });

    // Show typing indicator after short delay
    _isLoading = true;
    const typingTimeout = setTimeout(() => _appendMessage('assistant', '', true), TYPING_DELAY);

    try {
      const res = await fetch(API_ENDPOINT, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: _history.slice(-10), // send last 10 for context
        }),
      });

      clearTimeout(typingTimeout);
      _removeTypingIndicator();

      const data = await res.json();

      if (!res.ok) {
        const errMsg = res.status === 429 ? s.errorLimit : (data.error || s.errorGeneral);
        _appendMessage('assistant', errMsg);
        // Remove last user message from history on error
        _history.pop();
        return;
      }

      // Add assistant reply
      _appendMessage('assistant', data.reply);
      _history.push({ role: 'assistant', content: data.reply });
      _saveHistory();

    } catch {
      clearTimeout(typingTimeout);
      _removeTypingIndicator();
      _appendMessage('assistant', s.errorNetwork);
      _history.pop();
    } finally {
      _isLoading = false;
    }
  }


  /* ========================================================================
     7. OPEN / CLOSE
     ======================================================================== */

  function _open() {
    _isOpen = true;
    const panel   = document.getElementById('chatPanel');
    const toggleBtn = document.getElementById('chatToggleBtn');
    const badge   = document.getElementById('chatBadge');

    _widgetEl.classList.add('chat-widget--open');
    panel.setAttribute('aria-hidden', 'false');
    toggleBtn.setAttribute('aria-expanded', 'true');
    badge.style.display = 'none';

    _showWelcome();
    setTimeout(() => _inputEl?.focus(), 300);
  }

  function _close() {
    _isOpen = false;
    const panel     = document.getElementById('chatPanel');
    const toggleBtn = document.getElementById('chatToggleBtn');

    _widgetEl.classList.remove('chat-widget--open');
    panel.setAttribute('aria-hidden', 'true');
    toggleBtn.setAttribute('aria-expanded', 'false');
  }

  function _toggle() {
    _isOpen ? _close() : _open();
  }


  /* ========================================================================
     8. LANGUAGE SYNC
     ======================================================================== */

  function _syncLanguage() {
    const update = () => {
      setTimeout(() => {
        const s = _ct();
        const title    = document.getElementById('chatTitle');
        const subtitle = document.getElementById('chatSubtitle');
        const input    = document.getElementById('chatInput');
        const clearBtn = document.getElementById('chatClearBtn');

        if (title)    title.textContent    = s.title;
        if (subtitle) subtitle.textContent = s.subtitle;
        if (input)    input.placeholder    = s.placeholder;
        if (clearBtn) clearBtn.setAttribute('aria-label', s.clearLabel);
      }, 50);
    };

    document.getElementById('idBtn')?.addEventListener('click', update);
    document.getElementById('enBtn')?.addEventListener('click', update);
  }


  /* ========================================================================
     9. EVENT WIRING
     ======================================================================== */

  function _wireEvents() {
    // Toggle open/close
    document.getElementById('chatToggleBtn')?.addEventListener('click', _toggle);
    document.getElementById('chatCloseBtn')?.addEventListener('click',  _close);
    document.getElementById('chatClearBtn')?.addEventListener('click',  _clearHistory);

    // Send on button click
    document.getElementById('chatSendBtn')?.addEventListener('click', _sendMessage);

    // Send on Enter (Shift+Enter = new line)
    _inputEl?.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        _sendMessage();
      }
    });

    // Enable/disable send button + auto-resize textarea
    _inputEl?.addEventListener('input', () => {
      const btn = document.getElementById('chatSendBtn');
      btn.disabled = _inputEl.value.trim().length === 0;

      // Auto-resize
      _inputEl.style.height = 'auto';
      _inputEl.style.height = Math.min(_inputEl.scrollHeight, 120) + 'px';
    });

    // Close on ESC
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && _isOpen) _close();
    });

    // Close on backdrop click (mobile)
    document.addEventListener('click', e => {
      if (_isOpen && _widgetEl && !_widgetEl.contains(e.target)) _close();
    });
  }


  /* ========================================================================
     10. INIT
     ======================================================================== */

  function init() {
    _buildWidget();
    _loadHistory();
    _wireEvents();
    _syncLanguage();
  }

  return { init };

})();

/* ==========================================================================
   END OF FILE
   ========================================================================== */
