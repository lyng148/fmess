// Messenger Slack Theme - Content Script
(function () {
  'use strict';

  const UI = 'data-fmess-ui';
  const CHATS = 'data-fmess-chats';
  const LIST_PANE = 'data-fmess-list';
  const SENDER_START = 'data-fmess-sender-start';
  const SEARCH_BOX_ID = 'fmess-search-box';

  let isEnabled = true;

  // 1. Icon signatures to identify composer buttons without depending on language
  const COMPOSER_ICONS = [
    ['M102 926.75 102 929', 'voice-clip'],
    ['M8 .5A3.5 3.5 0 0 0 4.5 4', 'voice-clip'],
    ['M7 4.25a1.25 1.25 0 1 1-2.5 0', 'attach'],
    ['M8.305 1h-.61c-1.368', 'sticker'],
    ['M7.695 1h.61c1.367', 'gif'],
    ['M8 .5a7.5 7.5 0 1 0 0 15 7.5 7.5 0 0 0 0-15z', 'record-cancel'],
    ['M16.6915026,12.4744748', 'send'],
    ['M10 25.5v-15a1.5 1.5 0 012.17-1.34l15 7.5a1.5', 'record-play'],
    ['M99.825 918.322', 'attach'],
    ['M106.617 923.049', 'sticker'],
    ['M460.25 1079a', 'gif'],
    ['M210.5,405 C209.121', 'emoji'],
  ];
  const THUMBS_UP = 'M16,9.1c';

  const mark = (el, name) => {
    if (el && el.getAttribute(UI) !== name) el.setAttribute(UI, name);
  };

  const markComposer = (composer) => {
    mark(composer, 'composer');
    const bar = composer.previousElementSibling;
    mark(bar, 'composer-bar');

    const title = bar?.querySelector('h3')?.parentElement;
    if (title && title !== bar && title.parentElement !== bar) {
      mark(title.parentElement, 'reply-text');
      mark(title, 'reply-title');
      mark(title.nextElementSibling, 'reply-quote');
    }

    const isMoreActionsAria = (button) => {
      const aria = (button.getAttribute('aria-label') || '').toLowerCase();
      return (
        aria.includes('more actions') ||
        aria.includes('hành động khác') ||
        aria.includes('close more actions') ||
        aria.includes('đóng hành động khác')
      );
    };

    const field = [...composer.children].find((child) => child.querySelector('[role="textbox"]'));
    const buttons = [...composer.querySelectorAll('[role="button"]')];
    const pathOf = (button) => button.querySelector('svg path')?.getAttribute('d') ?? '';
    const recording = buttons.some(
      (button) => !isMoreActionsAria(button) && pathOf(button).startsWith('M8 .5a7.5 7.5 0 1 0 0 15 7.5 7.5 0 0 0 0-15z')
    );

    for (const button of buttons) {
      const path = pathOf(button);
      const icon = COMPOSER_ICONS.find(([start]) => path.startsWith(start))?.[1];
      const end = composer.lastElementChild?.tagName === 'SPAN' && composer.lastElementChild.contains(button);
      const aria = (button.getAttribute('aria-label') || '').toLowerCase();
      const isSendAria =
        aria.includes('enter to send') ||
        aria.includes('để gửi') ||
        aria === 'send' ||
        aria === 'gửi';
      const isLike =
        aria.includes('👍') ||
        aria.includes('like') ||
        aria.includes('thích') ||
        aria.includes('❤️') ||
        aria.includes('tim') ||
        aria.includes('heart') ||
        button.querySelector('img') ||
        path.startsWith(THUMBS_UP) ||
        (!isSendAria && !path.startsWith('M16.6915026,12.4744748'));

      if (isMoreActionsAria(button)) mark(button, 'more-actions');
      else if (icon) mark(button, icon);
      else if (!path && button.querySelector('svg')) mark(button, 'record-stop');
      else if (end) mark(button, isLike ? 'like' : 'send');
      else if (recording && !field?.contains(button)) mark(button, 'record-play');
      else if (!field?.contains(button)) mark(button, 'more-actions');
    }

    ensureGroupVoiceClip(composer);
    ensureEmojiPosition(composer);
  };

  const ensureGroupVoiceClip = (composer) => {
    const nativeVoice = composer.querySelector('[data-fmess-ui="voice-clip"]:not([data-fmess-synthetic-voice])');
    if (nativeVoice) {
      composer.querySelector('[data-fmess-synthetic-voice]')?.parentElement?.parentElement?.remove();
      return;
    }

    const moreActions = composer.querySelector(
      '[aria-label*="more actions" i], [aria-label*="hành động khác" i], [data-fmess-ui="more-actions"]'
    );
    if (!moreActions) return;

    if (!composer.querySelector('[data-fmess-synthetic-voice]')) {
      const voiceBtn = document.createElement('div');
      voiceBtn.setAttribute('data-fmess-ui', 'voice-clip');
      voiceBtn.setAttribute('data-fmess-synthetic-voice', '');
      voiceBtn.setAttribute('role', 'button');
      voiceBtn.setAttribute('tabindex', '0');
      voiceBtn.setAttribute('aria-label', 'Send a voice clip');
      voiceBtn.className = moreActions.className;
      voiceBtn.innerHTML = `
        <svg viewBox="0 0 16 16" width="20" height="20" fill="currentColor" aria-hidden="true" class="x14rh7hd x1lliihq x1tzjh5l x1k90msu x2h7rmj x1qfuztq" style="--x-color: var(--primary-icon);">
          <path d="M8 .5A3.5 3.5 0 0 0 4.5 4v4a3.5 3.5 0 1 0 7 0V4A3.5 3.5 0 0 0 8 .5z"></path>
          <path d="M8.749 13.954 8.75 14v.75a.75.75 0 0 1-1.5 0V14l.001-.046A6.001 6.001 0 0 1 2 8v-.25a.75.75 0 0 1 1.5 0V8a4.5 4.5 0 1 0 9 0v-.25a.75.75 0 0 1 1.5 0V8a6.001 6.001 0 0 1-5.251 5.954z"></path>
        </svg>
        <div class="x1ey2m1c xtijo5x x1o0tod xg01cxk x47corl x10l6tqk x13vifvy x1ebt8du x19991ni x1dhq9h x1iwo8zk x1033uif x179ill4 x1b60jn0" role="none" data-visualcompletion="ignore"></div>
      `;

      voiceBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        const curMore = composer.querySelector(
          '[aria-label*="more actions" i], [aria-label*="hành động khác" i], [data-fmess-ui="more-actions"]'
        );
        if (!curMore) return;
        curMore.click();
        let count = 0;
        const poll = setInterval(() => {
          count++;
          const voiceItem =
            document.querySelector('[role="menuitem"][aria-label*="voice clip" i], [role="menuitem"][aria-label*="thoại" i]') ||
            Array.from(document.querySelectorAll('[role="menuitem"]')).find((it) => {
              const t = (it.textContent || '').toLowerCase();
              return t.includes('voice clip') || t.includes('thoại');
            });
          if (voiceItem) {
            clearInterval(poll);
            voiceItem.click();
          } else if (count > 25) {
            clearInterval(poll);
          }
        }, 30);
      });

      const wrap = document.createElement('span');
      wrap.className = 'html-span';
      wrap.appendChild(voiceBtn);

      const attachOrSticker =
        composer.querySelector('div:has(> span [data-fmess-ui="sticker"])') ||
        composer.querySelector('div:has(> span [data-fmess-ui="attach"])');
      if (attachOrSticker && attachOrSticker.parentElement) {
        const containerDiv = document.createElement('div');
        containerDiv.style.order = '3';
        containerDiv.appendChild(wrap);
        attachOrSticker.parentElement.insertBefore(containerDiv, attachOrSticker.nextSibling);
      }
    }
  };

  const ensureEmojiPosition = (composer) => {
    const emoji = composer.querySelector('[data-fmess-ui="emoji"]');
    if (!emoji) return;

    const attach = composer.querySelector('[data-fmess-ui="attach"]');
    const toolsContainer = attach?.closest('[data-fmess-ui="composer"] > div');
    if (!toolsContainer) return;

    const voice = composer.querySelector('[data-fmess-ui="voice-clip"]');
    const sticker = composer.querySelector('[data-fmess-ui="sticker"]');
    const ref = voice || sticker || attach;
    if (!ref) return;

    let refDiv = ref;
    while (refDiv && refDiv.parentElement !== toolsContainer) {
      refDiv = refDiv.parentElement;
    }

    let emojiDiv = composer.querySelector('[data-fmess-emoji-wrap]');
    if (!emojiDiv) {
      emojiDiv = document.createElement('div');
      emojiDiv.setAttribute('data-fmess-emoji-wrap', '');
      emojiDiv.style.order = '4';
      const emojiSpan = emoji.closest('span') || emoji;
      emojiDiv.appendChild(emojiSpan);
    }

    if (refDiv && emojiDiv.parentElement !== toolsContainer) {
      toolsContainer.insertBefore(emojiDiv, refDiv.nextSibling);
    } else if (!refDiv && emojiDiv.parentElement !== toolsContainer) {
      toolsContainer.appendChild(emojiDiv);
    }
  };

  const markReactions = () => {
    for (const menu of document.querySelectorAll('[role="menu"]')) {
      if (!menu.querySelector('[role="menuitemradio"] img[alt]')) continue;
      mark(menu, 'reactions');
      mark(menu.querySelector('[role="button"]'), 'more-emojis');
    }
  };

  let markedInfo = null;

  const markUi = (main, list, log, details) => {
    const textbox = main?.querySelector('[role="textbox"][contenteditable="true"]');
    const region = textbox?.closest('[role="region"]');
    const composer = region && !region.contains(log) ? region : null;
    if (composer) markComposer(composer);

    if (details && !details.querySelector('[role="textbox"]') && !details.contains(textbox)) {
      mark(details, 'details');
    }
    mark(list?.querySelector('[role="button"][aria-haspopup="menu"]:not([role="grid"] *)'), 'list-menu');

    if (log && !(markedInfo?.isConnected && main.contains(markedInfo))) {
      const info = [...main.querySelectorAll('[role="button"][aria-expanded]')].find(
        (button) => !log.contains(button) && !composer?.contains(button) && !details?.contains(button)
      );
      if (info) {
        markedInfo = info;
        mark(info, 'info');
        let header = info;
        while (header.parentElement && !header.parentElement.contains(log)) header = header.parentElement;
        mark(header, 'chat-header');

        const buttons = [...header.querySelectorAll('[role="button"]')];
        const top = info.getBoundingClientRect().top;
        const calls = buttons
          .slice(0, buttons.indexOf(info))
          .filter((button) => button.querySelector('svg') && Math.abs(button.getBoundingClientRect().top - top) < 8)
          .slice(-2);
        if (calls.length === 2) {
          mark(calls[0], 'audio-call');
          mark(calls[1], 'video-call');
        }
      }
    }
    markReactions();
  };

  // 2. Sender Avatars & Timestamps Hook
  const syncSenderInfo = () => {
    const root = document.documentElement;
    if (!root || !isEnabled) return;

    let start = null;
    let lastTime = '';

    const rows = document.querySelectorAll(
      '[role="main"] [role="log"] [data-scope="messages_table"], [role="main"] [role="log"] [data-scope="date_break"]'
    );

    for (const row of rows) {
      if (row.getAttribute('data-scope') === 'date_break') {
        const text = (row.textContent || '').trim();
        const timeMatch = text.match(/\b(\d{1,2}:\d{2}(?:\s*[AP]M)?)\b/i);
        lastTime = timeMatch ? timeMatch[1] : text;
        start = null;
        continue;
      }
      if (!row.hasAttribute('data-message-id')) {
        start = null;
        continue;
      }
      const first = !!row.querySelector('h4');
      if (row.hasAttribute(SENDER_START) !== first) row.toggleAttribute(SENDER_START, first);

      if (first) {
        start = row;
        if (lastTime) {
          const timeStr = JSON.stringify(`  ${lastTime}`);
          if (start.style.getPropertyValue('--fmess-sender-time') !== timeStr) {
            start.style.setProperty('--fmess-sender-time', timeStr);
          }
          lastTime = '';
        }
      }

      // Query sender avatar picture from the row or button
      const picture =
        start &&
        (row.querySelector('[role="button"] > img') ||
          row.querySelector('img[style*="border-radius"]') ||
          row.querySelector('svg image'));
      const src = picture?.getAttribute('src') || picture?.getAttribute('href') || picture?.getAttribute('xlink:href');
      const value = src && `url("${src.replace(/"/g, '%22')}")`;
      if (value && start.style.getPropertyValue('--fmess-sender-picture') !== value) {
        start.style.setProperty('--fmess-sender-picture', value);
      }

      const name = picture?.getAttribute('alt') && JSON.stringify(picture.getAttribute('alt'));
      if (name && start.style.getPropertyValue('--fmess-sender-name') !== name) {
        start.style.setProperty('--fmess-sender-name', name);
        start.setAttribute('data-fmess-sender-named', '');
      }
    }
  };

  // 3. User Avatar & Top Search Box
  const syncChromeExtras = () => {
    const root = document.documentElement;

    // Detect user's own avatar if not yet set
    if (!root.style.getPropertyValue('--fmess-avatar')) {
      const userImg =
        document.querySelector('[role="banner"] img') ||
        document.querySelector('svg image') ||
        document.querySelector('[aria-label*="profile"] img, [aria-label*="cá nhân"] img');
      const userSrc = userImg?.getAttribute('src') || userImg?.getAttribute('href');
      if (userSrc) {
        root.style.setProperty('--fmess-avatar', `url("${userSrc}")`);
      }
    }

    // Top Search Box (#fmess-search-box)
    let searchBox = document.getElementById(SEARCH_BOX_ID);
    if (!searchBox && document.body) {
      searchBox = document.createElement('div');
      searchBox.id = SEARCH_BOX_ID;
      searchBox.setAttribute('role', 'button');
      searchBox.setAttribute('tabindex', '0');
      searchBox.textContent = 'Search in conversation / workspace';
      searchBox.addEventListener('click', () => {
        const input = document.querySelector('[data-fmess-list] input[type="search"]') || document.querySelector('input[type="search"]');
        input?.focus();
      });
      document.body.appendChild(searchBox);
    }
  };

  // Helper to reliably find the conversation list container
  const findList = (main) => {
    const grid = document.querySelector('[role="grid"]');
    if (grid) {
      const nav = grid.closest('[role="navigation"]');
      if (nav) return nav;
      let el = grid.parentElement;
      while (el && el !== document.body) {
        if (el.querySelector('input[type="search"]')) return el;
        el = el.parentElement;
      }
      return grid.parentElement;
    }

    const search = document.querySelector('input[type="search"]');
    if (search) {
      const nav = search.closest('[role="navigation"]');
      if (nav) return nav;
    }

    return main?.parentElement?.querySelector(':scope > [role="navigation"]') || null;
  };

  // Helper to find the details pane
  const findDetails = (main) => {
    if (!main) return null;
    const log = main.querySelector('[role="log"]');
    if (!log) return null;

    let cur = log;
    while (cur && cur !== main) {
      const parent = cur.parentElement;
      if (parent) {
        const children = Array.from(parent.children);
        const idx = children.indexOf(cur);
        if (idx !== -1 && idx < children.length - 1) {
          const next = children[idx + 1];
          const curRect = cur.getBoundingClientRect();
          const nextRect = next.getBoundingClientRect();
          // Next must be horizontally to the right
          if (
            nextRect.left >= curRect.right - 40 &&
            nextRect.width > 50 &&
            !next.querySelector('[role="textbox"][contenteditable="true"]')
          ) {
            return next;
          }
        }
      }
      cur = cur.parentElement;
    }
    return null;
  };

  const syncAvatars = (list) => {
    if (!list) return;
    const targets = list.querySelectorAll('.x1c9tyrk, [class*="x1c9tyrk"], img, svg, [role="img"]');
    for (const el of targets) {
      if (el.tagName.toLowerCase() === 'circle') {
        el.setAttribute('rx', '8');
        el.setAttribute('ry', '8');
      } else {
        if (el.style.borderRadius !== '8px') {
          el.style.setProperty('border-radius', '8px', 'important');
        }
      }
    }
  };

  const syncActiveChat = (list) => {
    if (!list) return;
    const links = list.querySelectorAll('a[role="link"]');
    const currentPath = window.location.pathname;
    for (const a of links) {
      const href = a.getAttribute('href') || '';
      const isPathActive = currentPath.length > 5 && href.includes(currentPath);
      const isClassActive = a.classList.contains('x1av1boa') || a.classList.contains('x1obq294') || a.getAttribute('aria-current') === 'page';
      const isActive = isPathActive || isClassActive;
      a.toggleAttribute('data-fmess-active-chat', isActive);
      if (isActive) {
        a.style.setProperty('--hosted-view-selected-state', '#1164a3');
        a.style.setProperty('background-color', '#1164a3', 'important');
      } else {
        a.style.removeProperty('background-color');
      }
    }
  };

  // 4. Main sync loop
  const syncAll = () => {
    if (!isEnabled) {
      document.documentElement.removeAttribute(CHATS);
      document.documentElement.removeAttribute('data-fmess-dark');
      document.documentElement.removeAttribute('data-fmess-sender-pictures');
      document.querySelector(`[${LIST_PANE}]`)?.removeAttribute(LIST_PANE);
      document.getElementById(SEARCH_BOX_ID)?.remove();
      return;
    }

    const root = document.documentElement;
    if (!root.hasAttribute(CHATS)) root.setAttribute(CHATS, '');
    if (!root.hasAttribute('data-fmess-sender-pictures')) root.setAttribute('data-fmess-sender-pictures', '');

    // Dark mode detection
    const isDark =
      root.classList.contains('__fb-dark-mode') ||
      document.body?.classList.contains('__fb-dark-mode') ||
      window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.toggleAttribute('data-fmess-dark', isDark);

    const main = document.querySelector('[role="main"]');
    const list = findList(main);

    if (list && !list.hasAttribute(LIST_PANE)) {
      document.querySelector(`[${LIST_PANE}]`)?.removeAttribute(LIST_PANE);
      list.setAttribute(LIST_PANE, '');
      list.setAttribute('data-fmess-list', '');
    }

    const log = main?.querySelector('[role="log"]');
    const details = findDetails(main);

    markUi(main, list, log, details);
    syncAvatars(list);
    syncSenderInfo();
    syncActiveChat(list);
    syncChromeExtras();
    hideNativeFbElements();
    if (window.scrollY !== 0 || window.scrollX !== 0) {
      window.scrollTo(0, 0);
    }
  };

  const hideNativeFbElements = () => {
    // Hide native left navigation rail
    for (const nav of document.querySelectorAll('nav, [role="navigation"]')) {
      if (nav.hasAttribute(LIST_PANE)) continue;
      const aria = (nav.getAttribute('aria-label') || '').toLowerCase();
      if (
        aria.includes('switcher') ||
        aria.includes('inbox') ||
        aria.includes('hộp thư') ||
        aria.includes('messenger') ||
        aria.includes('facebook') ||
        aria.includes('đoạn chat') ||
        nav.querySelector('a[href*="/messages/"]')
      ) {
        nav.style.setProperty('display', 'none', 'important');
      }
    }
    // Collapse native top banner and wrappers
    for (const banner of document.querySelectorAll('[role="banner"]')) {
      banner.style.setProperty('display', 'none', 'important');
      if (banner.parentElement && banner.parentElement !== document.body) {
        banner.parentElement.style.setProperty('display', 'none', 'important');
      }
    }
  };

  // 5. Typing turns like into send
  let typedFrame = 0;
  document.addEventListener(
    'input',
    (event) => {
      if (!isEnabled) return;
      const composer = event.target instanceof Element && event.target.closest(`[${UI}="composer"]`);
      if (composer) {
        typedFrame ||= requestAnimationFrame(() => {
          typedFrame = 0;
          markComposer(composer);
        });
      }
    },
    { capture: true, passive: true }
  );

  // 6. Clicks and DOM events re-trigger sync
  document.addEventListener(
    'click',
    () => {
      if (!isEnabled) return;
      setTimeout(syncAll, 50);
      setTimeout(syncAll, 300);
    },
    { capture: true, passive: true }
  );

  // Periodic fallback check
  setInterval(syncAll, 1000);

  // Prevent whole-window scrolling
  window.addEventListener(
    'scroll',
    () => {
      if (isEnabled && (window.scrollY !== 0 || window.scrollX !== 0)) {
        window.scrollTo(0, 0);
      }
    },
    { passive: true }
  );

  // MutationObserver for instant DOM updates
  const observer = new MutationObserver(() => {
    if (isEnabled) syncAll();
  });

  const startObserver = () => {
    observer.observe(document.body || document.documentElement, {
      childList: true,
      subtree: true,
    });
  };

  if (document.body) {
    startObserver();
  } else {
    document.addEventListener('DOMContentLoaded', startObserver);
  }

  // 7. Listen for toggle from extension popup
  if (typeof chrome !== 'undefined' && chrome.storage) {
    chrome.storage.sync.get({ enabled: true }, (data) => {
      isEnabled = data.enabled !== false;
      syncAll();
    });

    chrome.storage.onChanged.addListener((changes, namespace) => {
      if (namespace === 'sync' && changes.enabled !== undefined) {
        isEnabled = changes.enabled.newValue;
        syncAll();
      }
    });
  }

  syncAll();
})();
