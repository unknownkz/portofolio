/* ==========================================================================
   PORTOFOLIO — Axel Alexius Latukolan
   chat-widget.js  |  Production Build
   AI Chat Widget (Gemini, etc) — bilingual ID/EN
   Synced with: Language module in script.js
   ========================================================================== */

/* ==========================================================================
   1. TRANSLATIONS
   ========================================================================== */
const ChatTranslations = {
  id: {
    title:          'HEXA',
    subtitle:       'AI Assistant',
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
    subtitle:       'AI Assistant',
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
   2. MARKDOWN PARSER
   Converts Markdown output → safe HTML
   Supported: **bold**, *italic*, `code`, ```block```,
              # headings, - lists, numbered lists, line breaks
   Security: escapes HTML entities first to prevent XSS
   ========================================================================== */
function _parseMarkdown(text) {
  if (!text) return '';

  // Step 1: Escape HTML entities (XSS prevention — must be first)
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  // Step 2: Code blocks (``` ... ```) — before inline code
  html = html.replace(/```[\w]*\n?([\s\S]*?)```/g, (_, code) =>
    `<pre class="chat-code-block"><code>${code.trim()}</code></pre>`
  );

  // Step 3: Inline code (`code`)
  html = html.replace(/`([^`]+)`/g, '<code class="chat-code-inline">$1</code>');

  // Step 4: Bold+Italic (***text***)
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');

  // Step 5: Bold (**text**)
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  // Step 6: Italic (*text* or _text_)
  html = html.replace(/\*([^*\n]+)\*/g, '<em>$1</em>');
  html = html.replace(/_([^_\n]+)_/g, '<em>$1</em>');

  // Step 7: Strikethrough (~~text~~)
  html = html.replace(/~~(.+?)~~/g, '<del>$1</del>');

  // Step 8: Headings (# ## ###)
  html = html.replace(/^### (.+)$/gm, '<h4 class="chat-heading">$1</h4>');
  html = html.replace(/^## (.+)$/gm,  '<h3 class="chat-heading">$1</h3>');
  html = html.replace(/^# (.+)$/gm,   '<h2 class="chat-heading">$1</h2>');

  // Step 9: Horizontal rule (---)
  html = html.replace(/^---+$/gm, '<hr class="chat-hr">');

  // Step 10: Unordered lists (- item or * item)
  html = html.replace(/^[\-\*] (.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>)/s, '<ul class="chat-list">$1</ul>');
  // Wrap consecutive <li> in <ul>
  html = html.replace(/(<li>[\s\S]*?<\/li>)(\s*(?!<li>))/g, (match) => {
    if (match.startsWith('<ul')) return match;
    return `<ul class="chat-list">${match}</ul>`;
  });

  // Step 11: Ordered lists (1. item)
  html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');

  // Step 12: Blockquote (> text)
  html = html.replace(/^&gt; (.+)$/gm, '<blockquote class="chat-blockquote">$1</blockquote>');

  // Step 13: Line breaks — double newline = paragraph, single = <br>
  const blocks = html.split(/\n{2,}/);
  html = blocks.map(block => {
    block = block.trim();
    if (!block) return '';
    // Skip wrapping if already a block element
    if (/^<(pre|ul|ol|h[2-4]|hr|blockquote)/.test(block)) return block;
    // Convert single newlines to <br>
    block = block.replace(/\n/g, '<br>');
    return `<p>${block}</p>`;
  }).join('');

  return html;
}


/* ==========================================================================
   3. CHAT WIDGET MODULE
   ========================================================================== */
const ChatWidget = (() => {

  /* -- Config --------------------------------------------------------------- */
  const API_ENDPOINT = '/api/chat';
  const MAX_HISTORY  = 15;
  const STORAGE_KEY  = 'axelal_chat_history';
  const TYPING_DELAY = 300;

  /* Typing Animation */
  const CHARACTER_TYPING_SPEED = 12;

  /* -- State ---------------------------------------------------------------- */
  let _isOpen     = false;
  let _isLoading  = false;
  let _history    = [];
  let _widgetEl   = null;
  let _messagesEl = null;
  let _inputEl    = null;


  /* ========================================================================
     4. BUILD UI
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
              <img src="/logo-a.png" alt="HEXA AI" width="32" height="32">
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
     5. MESSAGES
     ======================================================================== */

  /* --------------------------------------------------------------------------
   AI Typing Animation Per Character
   -------------------------------------------------------------------------- */
  async function _typeAssistantMessage(element, markdownText) {

    const temp = document.createElement('div');

    // Parse markdown dulu
    temp.innerHTML = _parseMarkdown(markdownText);

    const finalHTML = temp.innerHTML;

    let current = '';
    let insideTag = false;

    for (let i = 0; i < finalHTML.length; i++) {

      const char = finalHTML[i];

      // Detect HTML tags
      if (char === '<') insideTag = true;

      current += char;

      if (char === '>') insideTag = false;

      // Render instantly if HTML tag
      if (insideTag) continue;

      element.innerHTML = current;

      _scrollToBottom();

      await new Promise(resolve =>
        setTimeout(resolve, CHARACTER_TYPING_SPEED)
      );
    }

    // Ensure final HTML perfect
    element.innerHTML = finalHTML;

    _scrollToBottom();
  }

  function _appendMessage(role, content, isTyping = false) {
    const wrap = document.createElement('div');
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
      const time = new Date().toLocaleTimeString(
        _chatLang() === 'id' ? 'id-ID' : 'en-US',
        { hour: '2-digit', minute: '2-digit' }
      );

      const bubble = document.createElement('div');
      bubble.className = 'chat-bubble';

      const textEl = document.createElement('div');
      textEl.className = 'chat-bubble__text';

      if (role === 'assistant') {
        // Typing animation handled separately
        textEl.innerHTML = '';
      } else {
        // Plain text for user messages
        textEl.textContent = content;
      }

      const timeEl = document.createElement('span');
      timeEl.className  = 'chat-bubble__time';
      timeEl.setAttribute('aria-hidden', 'true');
      timeEl.textContent = time;

      bubble.appendChild(textEl);
      bubble.appendChild(timeEl);
      wrap.appendChild(bubble);
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
     6. HISTORY (localStorage)
     ======================================================================== */

  function _loadHistory() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      _history = raw ? JSON.parse(raw) : [];
    } catch {
      _history = [];
    }

    _history.forEach(msg => _appendMessage(msg.role, msg.content));
  }

  function _saveHistory() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(_history.slice(-MAX_HISTORY)));
    } catch {
      // localStorage full — silently skip
    }
  }

  function _clearHistory() {
    if (!window.confirm(_ct().clearConfirm)) return;
    _history = [];
    localStorage.removeItem(STORAGE_KEY);
    _messagesEl.innerHTML = '';
    _showWelcome();
  }


  /* ========================================================================
     7. SEND MESSAGE
     ======================================================================== */

  async function _sendMessage() {
    if (_isLoading) return;

    const text = _inputEl.value.trim();
    if (!text) return;

    const s = _ct();

    _inputEl.value = '';
    _inputEl.style.height = 'auto';
    document.getElementById('chatSendBtn').disabled = true;

    _appendMessage('user', text);
    _history.push({ role: 'user', content: text });

    _isLoading = true;
    const typingTimeout = setTimeout(
      () => _appendMessage('assistant', '', true),
      TYPING_DELAY
    );

    try {
      const res = await fetch(API_ENDPOINT, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: _history.slice(-10),
        }),
      });

      clearTimeout(typingTimeout);
      _removeTypingIndicator();

      const data = await res.json();

      if (!res.ok) {
        let errMsg = s.errorGeneral;
        if (res.status === 429)  errMsg = s.errorLimit;
        else if (data?.error)    errMsg = data.error.id || data.error.en || s.errorGeneral;

        _appendMessage('assistant', String(errMsg));
        _history.pop();
        return;
      }

      const assistantMessage = _appendMessage('assistant', '');
      const textEl = assistantMessage.querySelector('.chat-bubble__text');

      await _typeAssistantMessage(
        textEl,
        data.reply
      );

      _history.push({
        role: 'assistant',
        content: data.reply
      });

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
     8. OPEN / CLOSE
     ======================================================================== */

  function _open() {
    _isOpen = true;
    const panel     = document.getElementById('chatPanel');
    const toggleBtn = document.getElementById('chatToggleBtn');
    const badge     = document.getElementById('chatBadge');

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
     9. LANGUAGE SYNC
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
     10. EVENT WIRING
     ======================================================================== */

  function _wireEvents() {
    document.getElementById('chatToggleBtn')?.addEventListener('click', _toggle);
    document.getElementById('chatCloseBtn')?.addEventListener('click',  _close);
    document.getElementById('chatClearBtn')?.addEventListener('click',  _clearHistory);
    document.getElementById('chatSendBtn')?.addEventListener('click',   _sendMessage);

    _inputEl?.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        _sendMessage();
      }
    });

    _inputEl?.addEventListener('input', () => {
      const btn = document.getElementById('chatSendBtn');
      btn.disabled = _inputEl.value.trim().length === 0;
      _inputEl.style.height = 'auto';
      _inputEl.style.height = Math.min(_inputEl.scrollHeight, 120) + 'px';
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && _isOpen) _close();
    });

    document.addEventListener('click', e => {
      if (_isOpen && _widgetEl && !_widgetEl.contains(e.target)) _close();
    });
  }


  /* ========================================================================
     11. INIT
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
