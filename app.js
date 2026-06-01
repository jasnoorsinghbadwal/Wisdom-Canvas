// WisdomCanvas - Core Application Controller

document.addEventListener('DOMContentLoaded', () => {
  // ==========================================
  // 1. APP STATE & ELEMENT REFERENCES
  // ==========================================
  const state = {
    currentTopic: 'all',
    searchQuery: '',
    filteredQuotes: [...QUOTES_DATABASE],
    currentIndex: 0,
    history: [], // tracks indices of quotes shown this session
    historyPointer: -1,
    bookmarks: JSON.parse(localStorage.getItem('wc_bookmarks')) || [],
    isDarkTheme: localStorage.getItem('wc_theme') !== 'light',
    

    
    // Canvas Settings
    canvasBg: 'aurora',
    canvasFont: 'serif',
    canvasAlign: 'center',
    
    // Slideshow State
    slideshowActive: false,
    slideshowPlaying: true,
    slideshowInterval: 7, // seconds
    slideshowTimer: null,
    slideshowProgressInterval: null,
    slideshowProgressVal: 0,
  };

  // DOM Elements
  const el = {
    body: document.body,
    quoteCard: document.getElementById('quote-display-card'),
    quoteText: document.getElementById('quote-text'),
    quoteAuthor: document.getElementById('quote-author'),
    currentTopicLabel: document.getElementById('current-topic-label'),
    quotesCountLabel: document.getElementById('quotes-count-label'),
    
    // Header Actions
    searchBar: document.getElementById('quote-search'),
    themeToggle: document.getElementById('theme-toggle-btn'),
    bookmarkToggle: document.getElementById('bookmark-toggle-btn'),
    bookmarkBadge: document.getElementById('bookmark-badge'),
    
    // Tabs & Navigation
    topicPills: document.querySelectorAll('.topic-pill'),
    prevBtn: document.getElementById('prev-quote-btn'),
    nextBtn: document.getElementById('next-quote-btn'),
    
    // Card Quick Actions
    favBtn: document.getElementById('fav-btn'),
    canvasExportBtn: document.getElementById('canvas-export-btn'),
    
    // Share Buttons
    copyBtn: document.getElementById('copy-btn'),
    twitterBtn: document.getElementById('twitter-btn'),
    whatsappBtn: document.getElementById('whatsapp-btn'),
    
    // Bookmarks Drawer
    drawer: document.getElementById('bookmarks-drawer'),
    drawerClose: document.getElementById('bookmarks-close'),
    drawerOverlay: document.getElementById('drawer-overlay'),
    bookmarksList: document.getElementById('bookmarks-list-container'),
    emptyBookmarksMsg: document.getElementById('empty-bookmarks-msg'),
    clearAllBookmarksBtn: document.getElementById('clear-all-bookmarks'),
    drawerFooter: document.getElementById('drawer-footer-actions'),
    
    // Canvas Modal
    canvasModal: document.getElementById('canvas-modal'),
    canvasClose: document.getElementById('canvas-modal-close'),
    canvasCancel: document.getElementById('canvas-cancel'),
    exportCanvas: document.getElementById('export-canvas'),
    canvasDownloadBtn: document.getElementById('canvas-download-btn'),
    palettePills: document.querySelectorAll('.palette-pill'),
    fontSelectBtns: document.querySelectorAll('.font-select-btn'),
    alignBtns: document.querySelectorAll('.align-btn'),
    canvasLoading: document.getElementById('canvas-loading'),
    
    // Screensaver
    screensaver: document.getElementById('screensaver-overlay'),
    screensaverClose: document.getElementById('screensaver-close'),
    ssQuoteText: document.getElementById('ss-quote-text'),
    ssQuoteAuthor: document.getElementById('ss-quote-author'),
    ssProgressFill: document.getElementById('ss-progress-fill'),
    ssPlayPause: document.getElementById('ss-play-pause'),
    ssPrev: document.getElementById('ss-prev'),
    ssNext: document.getElementById('ss-next'),
    ssIntervalSlider: document.getElementById('ss-interval-slider'),
    ssIntervalVal: document.getElementById('ss-interval-val'),
    ssTopicSelector: document.getElementById('ss-topic-selector'),
    screensaverTrigger: document.getElementById('screensaver-trigger')
  };

  // Color theme maps for each topic to apply ambient highlights
  const TOPIC_THEMES = {
    all: { color: '#a855f7', glow: 'rgba(168, 85, 247, 0.25)' },
    motivation: { color: '#ec4899', glow: 'rgba(236, 72, 153, 0.25)' },
    wisdom: { color: '#06b6d4', glow: 'rgba(6, 182, 212, 0.25)' },
    love: { color: '#f43f5e', glow: 'rgba(244, 63, 94, 0.25)' },
    peace: { color: '#10b981', glow: 'rgba(16, 185, 129, 0.25)' },
    creativity: { color: '#f59e0b', glow: 'rgba(245, 158, 11, 0.25)' },
    humor: { color: '#6366f1', glow: 'rgba(99, 102, 241, 0.25)' }
  };

  // ==========================================
  // 2. INITIALIZATION
  // ==========================================
  function init() {
    setupTheme();
    updateBookmarksBadge();
    applyFilter();
    
    // Load a random initial quote
    displayRandomQuote();
    
    // Register Event Listeners
    registerEventListeners();
  }

  // ==========================================
  // 3. THEME SYSTEM
  // ==========================================
  function setupTheme() {
    if (!state.isDarkTheme) {
      el.body.classList.add('light-theme');
      el.themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
    } else {
      el.body.classList.remove('light-theme');
      el.themeToggle.innerHTML = '<i class="fa-solid fa-moon"></i>';
    }
  }

  function toggleTheme() {
    state.isDarkTheme = !state.isDarkTheme;
    localStorage.setItem('wc_theme', state.isDarkTheme ? 'dark' : 'light');
    setupTheme();
  }

  // Dynamic colors based on topic
  function applyTopicColors(topic) {
    const theme = TOPIC_THEMES[topic] || TOPIC_THEMES.all;
    
    // Set custom CSS properties dynamically
    document.documentElement.style.setProperty('--topic-theme', theme.color);
    document.documentElement.style.setProperty('--topic-glow', theme.glow);
    
    // Sync screensaver active gradient theme
    if (state.slideshowActive) {
      document.documentElement.style.setProperty('--topic-theme', theme.color);
    }
  }

  // ==========================================
  // 4. FILTER & QUERY CONTROLLERS
  // ==========================================
  function applyFilter() {
    state.filteredQuotes = QUOTES_DATABASE.filter(q => {
      const matchesTopic = state.currentTopic === 'all' || q.topic === state.currentTopic;
      const matchesSearch = q.text.toLowerCase().includes(state.searchQuery.toLowerCase()) || 
                            q.author.toLowerCase().includes(state.searchQuery.toLowerCase());
      return matchesTopic && matchesSearch;
    });

    // Update Meta Headers
    const cleanTopicName = state.currentTopic === 'all' ? 'All Moods' : state.currentTopic;
    el.currentTopicLabel.textContent = cleanTopicName;
    el.quotesCountLabel.textContent = `${state.filteredQuotes.length} quotes available`;

    // Reset history pointers when filter is changed
    state.history = [];
    state.historyPointer = -1;
  }

  // ==========================================
  // 5. RENDERING & NAVIGATION CONTROLS
  // ==========================================
  function displayQuote(quote, direction = 'fade') {
    if (!quote) {
      el.quoteText.textContent = "No quotes match your current filter. Try broadening your search.";
      el.quoteAuthor.textContent = "WisdomCanvas";
      el.favBtn.style.display = 'none';
      return;
    }

    el.favBtn.style.display = 'flex';
    
    // Stop speaking if moving to next quote
    stopTTS();

    // Check quote size to adjust font dynamically
    if (quote.text.length > 120) {
      el.quoteText.classList.add('text-long');
    } else {
      el.quoteText.classList.remove('text-long');
    }

    // Apply color highlights matching the quote's topic
    applyTopicColors(quote.topic);

    // Perform smooth fade transition
    if (direction === 'fade') {
      el.quoteCard.style.opacity = '0';
      el.quoteCard.style.transform = 'translateY(10px) scale(0.98)';
      
      setTimeout(() => {
        el.quoteText.textContent = quote.text;
        el.quoteAuthor.textContent = quote.author;
        
        // Sync Favorite Button State
        const isFav = state.bookmarks.some(b => b.text === quote.text);
        if (isFav) {
          el.favBtn.classList.add('active');
          el.favBtn.innerHTML = '<i class="fa-solid fa-heart"></i>';
        } else {
          el.favBtn.classList.remove('active');
          el.favBtn.innerHTML = '<i class="fa-regular fa-heart"></i>';
        }

        el.quoteCard.style.opacity = '1';
        el.quoteCard.style.transform = 'translateY(0) scale(1)';
      }, 200);
    } else {
      // Direct render (e.g. initial start)
      el.quoteText.textContent = quote.text;
      el.quoteAuthor.textContent = quote.author;
      
      const isFav = state.bookmarks.some(b => b.text === quote.text);
      if (isFav) {
        el.favBtn.classList.add('active');
        el.favBtn.innerHTML = '<i class="fa-solid fa-heart"></i>';
      } else {
        el.favBtn.classList.remove('active');
        el.favBtn.innerHTML = '<i class="fa-regular fa-heart"></i>';
      }
    }
  }

  function displayRandomQuote() {
    if (state.filteredQuotes.length === 0) {
      displayQuote(null);
      return;
    }

    const randomIndex = Math.floor(Math.random() * state.filteredQuotes.length);
    state.currentIndex = randomIndex;

    // Save to history
    state.history = state.history.slice(0, state.historyPointer + 1);
    state.history.push(randomIndex);
    state.historyPointer++;

    displayQuote(state.filteredQuotes[randomIndex]);
    updateNavButtons();
  }

  function displayPrevQuote() {
    if (state.historyPointer > 0) {
      state.historyPointer--;
      state.currentIndex = state.history[state.historyPointer];
      displayQuote(state.filteredQuotes[state.currentIndex]);
    }
    updateNavButtons();
  }

  function displayNextQuote() {
    if (state.historyPointer < state.history.length - 1) {
      // Move forward in existing history
      state.historyPointer++;
      state.currentIndex = state.history[state.historyPointer];
      displayQuote(state.filteredQuotes[state.currentIndex]);
    } else {
      // Pick a brand new random quote
      displayRandomQuote();
    }
    updateNavButtons();
  }

  function updateNavButtons() {
    el.prevBtn.disabled = state.historyPointer <= 0;
  }

  // ==========================================
  // 6. BOOKMARKS & SAVING (Local Storage)
  // ==========================================
  function toggleFavorite() {
    const currentQuote = state.filteredQuotes[state.currentIndex];
    if (!currentQuote) return;

    const existingIndex = state.bookmarks.findIndex(b => b.text === currentQuote.text);
    
    if (existingIndex > -1) {
      // Remove
      state.bookmarks.splice(existingIndex, 1);
      el.favBtn.classList.remove('active');
      el.favBtn.innerHTML = '<i class="fa-regular fa-heart"></i>';
      showToast("Removed from bookmarks");
    } else {
      // Add
      state.bookmarks.push(currentQuote);
      el.favBtn.classList.add('active');
      el.favBtn.innerHTML = '<i class="fa-solid fa-heart"></i>';
      showToast("Added to bookmarks!");
    }

    localStorage.setItem('wc_bookmarks', JSON.stringify(state.bookmarks));
    updateBookmarksBadge();
    renderBookmarksDrawer();
  }

  function updateBookmarksBadge() {
    const count = state.bookmarks.length;
    el.bookmarkBadge.textContent = count;
    el.bookmarkBadge.style.transform = 'scale(1.2)';
    setTimeout(() => {
      el.bookmarkBadge.style.transform = 'scale(1)';
    }, 200);
  }

  function renderBookmarksDrawer() {
    el.bookmarksList.innerHTML = '';
    
    if (state.bookmarks.length === 0) {
      el.bookmarksList.appendChild(el.emptyBookmarksMsg);
      el.clearAllBookmarksBtn.style.display = 'none';
      el.drawerFooter.classList.remove('active');
      return;
    }

    el.clearAllBookmarksBtn.style.display = 'flex';
    el.drawerFooter.classList.add('active');

    state.bookmarks.forEach((quote, index) => {
      const card = document.createElement('div');
      card.className = 'bookmark-card';
      
      // Setup card click to view
      card.addEventListener('click', (e) => {
        if (e.target.closest('.delete-bookmark-btn')) return;
        
        // Find inside current database
        const dbIndex = state.filteredQuotes.findIndex(q => q.text === quote.text);
        if (dbIndex > -1) {
          state.currentIndex = dbIndex;
          state.history.push(dbIndex);
          state.historyPointer = state.history.length - 1;
          displayQuote(state.filteredQuotes[dbIndex]);
        } else {
          // If not matching filter, temporarily switch topic to 'all' to show it
          state.currentTopic = 'all';
          syncTopicTabs();
          applyFilter();
          
          const newDbIndex = state.filteredQuotes.findIndex(q => q.text === quote.text);
          state.currentIndex = newDbIndex;
          displayQuote(state.filteredQuotes[newDbIndex]);
        }
        
        closeBookmarksDrawer();
      });

      card.innerHTML = `
        <p class="bookmark-quote-text">"${quote.text}"</p>
        <div class="bookmark-quote-author">
          <span>— ${quote.author}</span>
          <button class="delete-bookmark-btn" title="Remove" aria-label="Delete bookmark">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
      `;

      // Wire up individual delete button
      card.querySelector('.delete-bookmark-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        state.bookmarks.splice(index, 1);
        localStorage.setItem('wc_bookmarks', JSON.stringify(state.bookmarks));
        updateBookmarksBadge();
        renderBookmarksDrawer();
        
        // Sync active card button if relevant
        const currentQuote = state.filteredQuotes[state.currentIndex];
        if (currentQuote && currentQuote.text === quote.text) {
          el.favBtn.classList.remove('active');
          el.favBtn.innerHTML = '<i class="fa-regular fa-heart"></i>';
        }
        showToast("Removed bookmark");
      });

      el.bookmarksList.appendChild(card);
    });
  }

  function clearAllBookmarks() {
    if (confirm("Are you sure you want to delete all saved bookmarks?")) {
      state.bookmarks = [];
      localStorage.setItem('wc_bookmarks', JSON.stringify(state.bookmarks));
      updateBookmarksBadge();
      renderBookmarksDrawer();
      
      // Sync card fav button
      el.favBtn.classList.remove('active');
      el.favBtn.innerHTML = '<i class="fa-regular fa-heart"></i>';
      showToast("Cleared all bookmarks!");
    }
  }

  function openBookmarksDrawer() {
    renderBookmarksDrawer();
    el.drawer.classList.add('open');
    el.drawerOverlay.classList.add('active');
  }

  function closeBookmarksDrawer() {
    el.drawer.classList.remove('open');
    el.drawerOverlay.classList.remove('active');
  }

  // ==========================================
  // 7. TEXT-TO-SPEECH (TTS) REMOVED
  // ==========================================
  function stopTTS() {}

  // ==========================================
  // 8. CANVAS IMAGE GENERATOR & EXPORTER
  // ==========================================
  const PALETTES = {
    aurora: { bgStart: '#0f172a', bgMid: '#1e1b4b', bgEnd: '#311042', text: '#ffffff', author: '#c084fc' },
    sunset: { bgStart: '#f97316', bgMid: '#ec4899', bgEnd: '#8b5cf6', text: '#ffffff', author: '#fef08a' },
    emerald: { bgStart: '#064e3b', bgMid: '#022c22', bgEnd: '#0d5c3a', text: '#ffffff', author: '#34d399' },
    peace: { bgStart: '#134e5e', bgMid: '#447d6e', bgEnd: '#71b280', text: '#ffffff', author: '#a7f3d0' },
    'minimal-dark': { bgStart: '#111111', bgMid: '#111111', bgEnd: '#111111', text: '#ffffff', author: '#aaaaaa' },
    'minimal-light': { bgStart: '#ffffff', bgMid: '#ffffff', bgEnd: '#ffffff', text: '#000000', author: '#555555' }
  };

  function openCanvasModal() {
    el.canvasModal.classList.add('active');
    renderExportCanvas();
  }

  function closeCanvasModal() {
    el.canvasModal.classList.remove('active');
  }

  function renderExportCanvas() {
    const canvas = el.exportCanvas;
    const ctx = canvas.getContext('2d');
    const quote = state.filteredQuotes[state.currentIndex];
    
    if (!quote) return;

    el.canvasLoading.classList.add('active');

    // Draw Background
    const palette = PALETTES[state.canvasBg] || PALETTES.aurora;
    
    if (state.canvasBg.startsWith('minimal')) {
      ctx.fillStyle = palette.bgStart;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
      const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      grad.addColorStop(0, palette.bgStart);
      grad.addColorStop(0.5, palette.bgMid);
      grad.addColorStop(1, palette.bgEnd);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Canvas details: border & quote marks
    ctx.strokeStyle = state.canvasBg === 'minimal-light' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 20;
    ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60);

    // Draw elegant quote marks
    ctx.font = 'italic 120px Georgia, serif';
    ctx.fillStyle = state.canvasBg === 'minimal-light' ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)';
    ctx.textAlign = 'left';
    ctx.fillText('“', 80, 160);

    // Setup typography details
    let quoteFont = 'Playfair Display';
    if (state.canvasFont === 'sans') quoteFont = 'Outfit';
    if (state.canvasFont === 'space') quoteFont = 'Space Grotesk';

    // Wrap quote text beautifully
    ctx.fillStyle = palette.text;
    ctx.textAlign = state.canvasAlign;
    
    let fontSize = 42;
    if (quote.text.length > 150) fontSize = 32;
    else if (quote.text.length > 80) fontSize = 38;

    ctx.font = `400 ${fontSize}px ${quoteFont}`;

    // Custom Canvas Word Wrap function
    const x = state.canvasAlign === 'center' ? canvas.width / 2 : (state.canvasAlign === 'left' ? 100 : canvas.width - 100);
    const maxWidth = canvas.width - 200;
    const words = quote.text.split(' ');
    let line = '';
    const lines = [];
    
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      
      if (testWidth > maxWidth && n > 0) {
        lines.push(line);
        line = words[n] + ' ';
      } else {
        line = testLine;
      }
    }
    lines.push(line);

    // Center vertical lines
    const lineHeight = fontSize * 1.45;
    const totalHeight = lines.length * lineHeight;
    let y = (canvas.height - totalHeight) / 2;

    lines.forEach(l => {
      ctx.fillText(l.trim(), x, y);
      y += lineHeight;
    });

    // Draw Author
    ctx.font = `600 24px Outfit`;
    ctx.fillStyle = palette.author;
    
    const authorY = y + 50;
    if (state.canvasAlign === 'center') {
      ctx.fillText(`—  ${quote.author}  —`, x, authorY);
    } else if (state.canvasAlign === 'left') {
      ctx.fillText(`— ${quote.author}`, x, authorY);
    } else {
      ctx.fillText(`${quote.author} —`, x, authorY);
    }

    // Bottom brand mark on export
    ctx.font = '300 16px Outfit';
    ctx.fillStyle = state.canvasBg === 'minimal-light' ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.3)';
    ctx.textAlign = 'center';
    ctx.fillText('CREATED WITH WISDOMCANVAS', canvas.width / 2, canvas.height - 70);

    setTimeout(() => {
      el.canvasLoading.classList.remove('active');
    }, 300);
  }

  function downloadCanvas() {
    const canvas = el.exportCanvas;
    const link = document.createElement('a');
    const quote = state.filteredQuotes[state.currentIndex];
    
    const cleanAuthor = quote ? quote.author.replace(/[^a-zA-Z0-9]/g, '_') : 'quote';
    
    link.download = `WisdomCanvas_${cleanAuthor}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    
    showToast("Quote downloaded successfully!");
    closeCanvasModal();
  }

  // ==========================================
  // 9. SCREENSAVER / AMBIENT SLIDESHOW
  // ==========================================
  function openScreensaver() {
    state.slideshowActive = true;
    el.ssTopicSelector.value = state.currentTopic;
    
    // Stop core TTS
    stopTTS();

    el.screensaver.classList.add('active');
    displayScreensaverQuote();
    startSlideshowTimer();
  }

  function closeScreensaver() {
    state.slideshowActive = false;
    el.screensaver.classList.remove('active');
    clearSlideshowTimer();
  }

  function displayScreensaverQuote() {
    const quote = state.filteredQuotes[state.currentIndex];
    if (!quote) return;

    // Dynamic style update inside screensaver
    applyTopicColors(quote.topic);

    el.ssQuoteText.style.opacity = '0';
    el.ssQuoteAuthor.style.opacity = '0';
    
    // Shift floating color orbs inside screensaver
    const theme = TOPIC_THEMES[quote.topic] || TOPIC_THEMES.all;
    document.getElementById('ss-orb-1').style.background = `radial-gradient(circle, ${theme.glow} 0%, rgba(0,0,0,0) 70%)`;

    setTimeout(() => {
      el.ssQuoteText.textContent = quote.text;
      el.ssQuoteAuthor.textContent = `— ${quote.author}`;
      
      if (quote.text.length > 120) {
        el.ssQuoteText.classList.add('text-long');
      } else {
        el.ssQuoteText.classList.remove('text-long');
      }

      el.ssQuoteText.style.opacity = '1';
      el.ssQuoteAuthor.style.opacity = '1';
    }, 400);
  }

  function startSlideshowTimer() {
    clearSlideshowTimer();
    
    if (!state.slideshowPlaying) return;

    state.slideshowProgressVal = 0;
    const duration = state.slideshowInterval * 1000;
    const step = 100; // update progress bar every 100ms
    
    state.slideshowProgressInterval = setInterval(() => {
      state.slideshowProgressVal += step;
      const pct = (state.slideshowProgressVal / duration) * 100;
      el.ssProgressFill.style.width = `${pct}%`;
      
      if (state.slideshowProgressVal >= duration) {
        state.slideshowProgressVal = 0;
        advanceSlideshow();
      }
    }, step);
  }

  function clearSlideshowTimer() {
    clearInterval(state.slideshowProgressInterval);
    el.ssProgressFill.style.width = '0%';
  }

  function advanceSlideshow() {
    if (state.filteredQuotes.length === 0) return;
    
    // Pick next index randomly
    const newIdx = Math.floor(Math.random() * state.filteredQuotes.length);
    state.currentIndex = newIdx;
    
    // Keep core screen synced as well
    displayQuote(state.filteredQuotes[newIdx], 'direct');
    
    displayScreensaverQuote();
    startSlideshowTimer();
  }

  function prevSlideshowQuote() {
    if (state.filteredQuotes.length === 0) return;
    
    let newIdx = state.currentIndex - 1;
    if (newIdx < 0) newIdx = state.filteredQuotes.length - 1;
    
    state.currentIndex = newIdx;
    displayQuote(state.filteredQuotes[newIdx], 'direct');
    displayScreensaverQuote();
    startSlideshowTimer();
  }

  function toggleSlideshowPlay() {
    state.slideshowPlaying = !state.slideshowPlaying;
    
    if (state.slideshowPlaying) {
      el.ssPlayPause.innerHTML = '<i class="fa-solid fa-pause"></i>';
      startSlideshowTimer();
      showToast("Slideshow Resumed");
    } else {
      el.ssPlayPause.innerHTML = '<i class="fa-solid fa-play"></i>';
      clearSlideshowTimer();
      showToast("Slideshow Paused");
    }
  }

  // ==========================================
  // 10. EVENTS REGISTER & SOCIAL SHARES
  // ==========================================
  function registerEventListeners() {
    // Theme
    el.themeToggle.addEventListener('click', toggleTheme);
    
    // Topic Navigation Pills
    el.topicPills.forEach(pill => {
      pill.addEventListener('click', () => {
        el.topicPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        
        state.currentTopic = pill.dataset.topic;
        applyFilter();
        displayRandomQuote();
      });
    });

    // Logo click triggers full random shuffle
    el.body.querySelector('#logo-trigger').addEventListener('click', () => {
      state.currentTopic = 'all';
      syncTopicTabs();
      applyFilter();
      displayRandomQuote();
      showToast("Refreshing canvas!");
    });

    // Search bar input
    el.searchBar.addEventListener('input', (e) => {
      state.searchQuery = e.target.value;
      applyFilter();
      displayRandomQuote();
    });

    // Core Controls
    el.nextBtn.addEventListener('click', displayNextQuote);
    el.prevBtn.addEventListener('click', displayPrevQuote);

    // Keyboard support: arrows & Space
    document.addEventListener('keydown', (e) => {
      if (document.activeElement === el.searchBar) return;
      if (state.canvasModal.classList.contains('active')) return;
      
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        if (state.slideshowActive) {
          advanceSlideshow();
        } else {
          displayNextQuote();
        }
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (state.slideshowActive) {
          prevSlideshowQuote();
        } else {
          displayPrevQuote();
        }
      } else if (e.key === 'Escape') {
        if (state.slideshowActive) closeScreensaver();
        if (el.drawer.classList.contains('open')) closeBookmarksDrawer();
        if (el.canvasModal.classList.contains('active')) closeCanvasModal();
      }
    });

    // Favorites Drawer Toggle
    el.bookmarkToggle.addEventListener('click', openBookmarksDrawer);
    el.drawerClose.addEventListener('click', closeBookmarksDrawer);
    el.drawerOverlay.addEventListener('click', closeBookmarksDrawer);
    el.clearAllBookmarksBtn.addEventListener('click', clearAllBookmarks);

    // Quick Action Triggers
    el.favBtn.addEventListener('click', toggleFavorite);
    el.canvasExportBtn.addEventListener('click', openCanvasModal);

    // Canvas Settings Listeners
    el.canvasClose.addEventListener('click', closeCanvasModal);
    el.canvasCancel.addEventListener('click', closeCanvasModal);
    el.canvasDownloadBtn.addEventListener('click', downloadCanvas);

    el.palettePills.forEach(pill => {
      pill.addEventListener('click', () => {
        el.palettePills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        state.canvasBg = pill.dataset.bg;
        renderExportCanvas();
      });
    });

    el.fontSelectBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        el.fontSelectBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.canvasFont = btn.dataset.font;
        renderExportCanvas();
      });
    });

    el.alignBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        el.alignBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.canvasAlign = btn.dataset.align;
        renderExportCanvas();
      });
    });

    // Share Operations
    el.copyBtn.addEventListener('click', copyToClipboard);
    el.twitterBtn.addEventListener('click', shareOnTwitter);
    el.whatsappBtn.addEventListener('click', shareOnWhatsApp);

    // Screensaver controls
    el.screensaverTrigger.addEventListener('click', openScreensaver);
    el.screensaverClose.addEventListener('click', closeScreensaver);
    el.ssPlayPause.addEventListener('click', toggleSlideshowPlay);
    el.ssPrev.addEventListener('click', prevSlideshowQuote);
    el.ssNext.addEventListener('click', advanceSlideshow);

    el.ssIntervalSlider.addEventListener('input', (e) => {
      state.slideshowInterval = parseInt(e.target.value);
      el.ssIntervalVal.textContent = `${state.slideshowInterval}s`;
      startSlideshowTimer();
    });

    el.ssTopicSelector.addEventListener('change', (e) => {
      state.currentTopic = e.target.value;
      
      // Update core page highlights synchronously
      syncTopicTabs();
      applyFilter();
      
      // Select a new quote under that topic
      displayRandomQuote();
      displayScreensaverQuote();
      startSlideshowTimer();
    });
  }

  // ==========================================
  // 11. HELPER & SHARING UTILITIES
  // ==========================================
  function syncTopicTabs() {
    el.topicPills.forEach(p => {
      if (p.dataset.topic === state.currentTopic) {
        p.classList.add('active');
      } else {
        p.classList.remove('active');
      }
    });
  }

  function copyToClipboard() {
    const quote = state.filteredQuotes[state.currentIndex];
    if (!quote) return;

    const formatted = `"${quote.text}" — ${quote.author}`;
    
    navigator.clipboard.writeText(formatted).then(() => {
      showToast("Copied to clipboard!");
    }).catch(err => {
      console.error("Copy failed", err);
    });
  }

  function shareOnTwitter() {
    const quote = state.filteredQuotes[state.currentIndex];
    if (!quote) return;

    const text = encodeURIComponent(`"${quote.text}" — ${quote.author}\n\nGenerated via #WisdomCanvas`);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  }

  function shareOnWhatsApp() {
    const quote = state.filteredQuotes[state.currentIndex];
    if (!quote) return;

    const text = encodeURIComponent(`"${quote.text}" — ${quote.author}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  }

  // Beautiful UI Toast messages
  function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'wc-toast';
    toast.textContent = message;
    
    // Add styled toast dynamically
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.classList.add('visible');
    }, 50);

    setTimeout(() => {
      toast.classList.remove('visible');
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 2500);
  }

  // Start the engine
  init();
});
