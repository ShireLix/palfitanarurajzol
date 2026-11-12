/**
 * Rajzolj és Emlékezz! – Játéklogika
 * - Főmenü nehézségválasztóval:
 *     * Könnyű: 10 mp / 5 rajz / Színek / Sorban
 *     * Normál: 5 mp / 15 rajz / Színek / Sorban
 *     * Extrém: 2 mp / 15 rajz / NINCS SZÍN / KEVERT RAJZOK
 * - Kurzor intelligens kezelése: fehér alapon fekete kurzor, fekete alapon fehér kurzor
 * - Lebegő reticle (mix-blend-mode: difference) a maximális láthatóságért
 * - Nehezebb szavak (Mikró, Ló, Majomkenyérfa, Megelőzni tilos, stb.)
 * - Konfetti és Web Audio API hangok
 */

(() => {
  'use strict';

  // --- Nehézségi Szintek Beállításai ---
  const DIFFICULTY_CONFIG = {
    easy: {
      name: "Könnyű",
      drawTime: 10.0,
      totalRounds: 5,
      allowColors: true,
      shuffleGuesses: false,
      hint: "10 másodperced lesz a rajzolásra!"
    },
    normal: {
      name: "Normál",
      drawTime: 5.0,
      totalRounds: 15,
      allowColors: true,
      shuffleGuesses: false,
      hint: "5 másodperced lesz a rajzolásra!"
    },
    extreme: {
      name: "Extrém",
      drawTime: 2.0,
      totalRounds: 15,
      allowColors: false,
      shuffleGuesses: true,
      hint: "Csak 2 másodperced van! Nincs szín, a rajzok keverve jönnek!"
    }
  };

  // --- Játék Állapot (State) ---
  const state = {
    difficulty: 'normal',    // 'easy' | 'normal' | 'extreme'
    currentView: 'view-menu',
    words: [],               // Kiválasztott szóobjektumok
    currentDrawRound: 0,
    currentGuessRound: 0,
    
    // Rajzok tárolása metaadatokkal
    drawingsMeta: [],        // { originalIndex, targetWordObj, dataUrl, canvasBg }
    guessQueue: [],          // Kitalálási sorrend (normál módban 0..N-1, extrém módban shuffled)
    userGuesses: new Map(),  // originalIndex -> guess string
    results: [],             // Kiértékelt adatok az eredményekhez

    // Időzítő állapot
    drawTimerActive: false,
    drawTimerStart: 0,
    drawTimerReqId: null,
    urgentBeepPlayed: {},

    // Vászon és rajzolás
    canvasBg: 'white',       // 'white' | 'black'
    isDrawing: false,
    drawLocked: false,
    currentColor: '#111111',
    currentLineWidth: 8,
    lastX: 0,
    lastY: 0
  };

  // --- DOM Elemek ---
  const views = {
    menu: document.getElementById('view-menu'),
    countdown: document.getElementById('view-countdown'),
    drawing: document.getElementById('view-drawing'),
    transition: document.getElementById('view-transition'),
    guessing: document.getElementById('view-guessing'),
    results: document.getElementById('view-results')
  };

  const elements = {
    // Globális / Fejléc
    btnSoundToggle: document.getElementById('btn-sound-toggle'),
    soundIcon: document.getElementById('sound-icon'),
    headerLogo: document.getElementById('header-logo'),
    headerDiffBadge: document.getElementById('header-difficulty-badge'),

    // Főmenü & Nehézség választó
    diffCards: document.querySelectorAll('.diff-card'),
    btnStartGame: document.getElementById('btn-start-game'),
    btnStartSub: document.getElementById('btn-start-sub'),

    // Visszaszámlálás
    countdownNumber: document.getElementById('countdown-number'),
    countdownHintText: document.getElementById('countdown-hint-text'),

    // Rajzolás
    drawRoundNumber: document.getElementById('draw-round-number'),
    drawTargetWord: document.getElementById('draw-target-word'),
    drawTimerText: document.getElementById('draw-timer-text'),
    drawTimerBox: document.getElementById('draw-timer-box'),
    drawTimerBar: document.getElementById('draw-timer-bar'),
    canvasWrapper: document.getElementById('canvas-wrapper'),
    drawingCanvas: document.getElementById('drawing-canvas'),
    canvasBrushCursor: document.getElementById('canvas-brush-cursor'),
    drawOverlayBlocked: document.getElementById('draw-overlay-blocked'),
    
    // Eszköztár
    toolGroupColors: document.getElementById('tool-group-colors'),
    toolExtremeNotice: document.getElementById('tool-extreme-notice'),
    toolGroupSizes: document.getElementById('tool-group-sizes'),
    colorBtns: document.querySelectorAll('.color-btn'),
    sizeBtns: document.querySelectorAll('.size-btn'),
    btnToggleCanvasBg: document.getElementById('btn-toggle-canvas-bg'),
    canvasBgIcon: document.getElementById('canvas-bg-icon'),
    canvasBgLabel: document.getElementById('canvas-bg-label'),
    btnClearCanvas: document.getElementById('btn-clear-canvas'),

    // Átvezető
    transitionDesc: document.getElementById('transition-desc'),
    transitionTimer: document.getElementById('transition-timer'),
    btnSkipTransition: document.getElementById('btn-skip-transition'),

    // Kitalálás
    guessRoundNumber: document.getElementById('guess-round-number'),
    guessingPromptTitle: document.getElementById('guessing-prompt-title'),
    guessCanvasFrame: document.getElementById('guess-canvas-frame'),
    guessDrawingImg: document.getElementById('guess-drawing-img'),
    guessForm: document.getElementById('guess-form'),
    guessInput: document.getElementById('guess-input'),
    btnSubmitGuess: document.getElementById('btn-submit-guess'),
    btnPassGuess: document.getElementById('btn-pass-guess'),

    // Eredmények
    resultsBadgeIcon: document.getElementById('results-badge-icon'),
    resultsRankTitle: document.getElementById('results-rank-title'),
    statCorrectCount: document.getElementById('stat-correct-count'),
    statWrongCount: document.getElementById('stat-wrong-count'),
    statPercentValue: document.getElementById('stat-percent-value'),
    galleryTitle: document.getElementById('gallery-title'),
    resultsGalleryGrid: document.getElementById('results-gallery-grid'),
    btnRestartGame: document.getElementById('btn-restart-game'),
    btnRestartBottom: document.getElementById('btn-restart-bottom'),
    confettiCanvas: document.getElementById('confetti-canvas')
  };

  // Canvas kontextus
  const canvas = elements.drawingCanvas;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  let canvasDpr = 1;

  // =========================================================================
  // Nézetváltó és Nehézségi Szint Kezelése
  // =========================================================================
  function showView(viewId) {
    state.currentView = viewId;
    Object.values(views).forEach(v => {
      if (v) v.classList.remove('active');
    });
    const target = document.getElementById(viewId);
    if (target) {
      target.classList.add('active');
    }
  }

  function setDifficulty(diffKey) {
    if (!DIFFICULTY_CONFIG[diffKey]) return;
    state.difficulty = diffKey;
    const cfg = DIFFICULTY_CONFIG[diffKey];

    // Főmenü kártyák frissítése
    elements.diffCards.forEach(c => {
      if (c.getAttribute('data-difficulty') === diffKey) {
        c.classList.add('active');
      } else {
        c.classList.remove('active');
      }
    });

    // Fejléc jelvény frissítése
    elements.headerDiffBadge.textContent = cfg.name;
    elements.headerDiffBadge.className = `header-diff-pill diff-${diffKey}`;

    // Főmenü indítógomb alcíme
    elements.btnStartSub.textContent = `${cfg.name} játékmód (${cfg.drawTime}s / ${cfg.totalRounds} kör) 🚀`;
    elements.countdownHintText.textContent = cfg.hint;
  }

  // =========================================================================
  // Kurzor és Vászon Háttérkezelés:
  // "fehér alapon fekete, fekete alapon fehér kurzor a láthatóság miatt"
  // =========================================================================
  function setCanvasBackground(bgType) {
    state.canvasBg = bgType; // 'white' | 'black'
    const wrapper = elements.canvasWrapper;

    if (bgType === 'black') {
      wrapper.classList.remove('cursor-light-bg');
      wrapper.classList.add('cursor-dark-bg', 'dark-board');
      elements.canvasBgIcon.textContent = '⬜';
      elements.canvasBgLabel.textContent = 'Fehér lap';
      
      // Fekete alapon alapértelmezett szín a fehér
      if (state.currentColor === '#111111') {
        state.currentColor = '#ffffff';
      }
    } else {
      wrapper.classList.remove('cursor-dark-bg', 'dark-board');
      wrapper.classList.add('cursor-light-bg');
      elements.canvasBgIcon.textContent = '⬛';
      elements.canvasBgLabel.textContent = 'Fekete tábla';

      // Fehér alapon alapértelmezett szín a fekete
      if (state.currentColor === '#ffffff') {
        state.currentColor = '#111111';
      }
    }

    updateBrushCursorSize();
    clearCanvas();
  }

  function toggleCanvasBackground() {
    soundManager.playClick();
    setCanvasBackground(state.canvasBg === 'white' ? 'black' : 'white');
  }

  function updateBrushCursorSize() {
    const cursor = elements.canvasBrushCursor;
    const size = Math.max(12, state.currentLineWidth + 6);
    cursor.style.width = `${size}px`;
    cursor.style.height = `${size}px`;
  }

  // =========================================================================
  // Canvas Inicializálás és Rajzoló Motor
  // =========================================================================
  function resizeCanvasToDisplaySize() {
    const rect = canvas.getBoundingClientRect();
    canvasDpr = window.devicePixelRatio || 1;
    
    const displayWidth = rect.width > 0 ? rect.width : 600;
    const displayHeight = rect.height > 0 ? rect.height : 420;

    canvas.width = Math.floor(displayWidth * canvasDpr);
    canvas.height = Math.floor(displayHeight * canvasDpr);

    ctx.scale(canvasDpr, canvasDpr);
  }

  function initCanvas() {
    resizeCanvasToDisplaySize();
    setCanvasBackground('white');

    // Egér események
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', (e) => {
      draw(e);
      moveBrushCursor(e);
    });
    window.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseleave', () => {
      stopDrawing();
      elements.canvasBrushCursor.classList.remove('visible');
    });
    canvas.addEventListener('mouseenter', () => {
      if (!state.drawLocked && state.drawTimerActive) {
        elements.canvasBrushCursor.classList.add('visible');
      }
    });

    // Touch események (mobilon és tableten)
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', stopDrawing);
    canvas.addEventListener('touchcancel', stopDrawing);
  }

  function moveBrushCursor(e) {
    if (state.drawLocked || !state.drawTimerActive) {
      elements.canvasBrushCursor.classList.remove('visible');
      return;
    }
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    elements.canvasBrushCursor.style.left = `${x}px`;
    elements.canvasBrushCursor.style.top = `${y}px`;
    elements.canvasBrushCursor.classList.add('visible');
  }

  function clearCanvas() {
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = state.canvasBg === 'black' ? '#18181b' : '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  }

  function getCanvasCoords(event) {
    const rect = canvas.getBoundingClientRect();
    let clientX = event.clientX;
    let clientY = event.clientY;

    if (event.touches && event.touches.length > 0) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  }

  function startDrawing(e) {
    if (state.drawLocked || !state.drawTimerActive) return;
    state.isDrawing = true;
    const coords = getCanvasCoords(e);
    state.lastX = coords.x;
    state.lastY = coords.y;

    // Egy pont kirajzolása azonnal kattintáskor
    ctx.beginPath();
    ctx.arc(coords.x, coords.y, state.currentLineWidth / 2, 0, Math.PI * 2);
    ctx.fillStyle = state.currentColor;
    ctx.fill();
  }

  function draw(e) {
    if (!state.isDrawing || state.drawLocked || !state.drawTimerActive) return;
    
    const coords = getCanvasCoords(e);
    
    ctx.beginPath();
    ctx.moveTo(state.lastX, state.lastY);
    ctx.lineTo(coords.x, coords.y);
    ctx.strokeStyle = state.currentColor;
    ctx.lineWidth = state.currentLineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    state.lastX = coords.x;
    state.lastY = coords.y;
  }

  function stopDrawing() {
    state.isDrawing = false;
  }

  function handleTouchStart(e) {
    e.preventDefault();
    startDrawing(e);
  }

  function handleTouchMove(e) {
    e.preventDefault();
    draw(e);
  }

  // =========================================================================
  // Játék Indítása és Visszaszámlálás
  // =========================================================================
  function startNewGame() {
    soundManager.init();
    soundManager.playClick();

    const cfg = DIFFICULTY_CONFIG[state.difficulty];

    // Szavak kiválasztása a nehézségi szint figyelembevételével
    state.words = getRandomWords(cfg.totalRounds, state.difficulty);
    state.currentDrawRound = 0;
    state.currentGuessRound = 0;
    state.drawingsMeta = [];
    state.guessQueue = [];
    state.userGuesses = new Map();
    state.results = [];

    // Eszköztár beállítása a nehézség szerint (Extrém módban NINCS SZÍN)
    if (state.difficulty === 'extreme') {
      elements.toolGroupColors.style.display = 'none';
      elements.toolExtremeNotice.style.display = 'flex';
      state.currentColor = state.canvasBg === 'black' ? '#ffffff' : '#111111';
    } else {
      elements.toolGroupColors.style.display = 'flex';
      elements.toolExtremeNotice.style.display = 'none';
    }

    // Visszaszámláló nézet
    showView('view-countdown');
    runCountdown(3, () => {
      startDrawingPhase();
    });
  }

  function runCountdown(seconds, onFinish) {
    let count = seconds;
    elements.countdownNumber.textContent = count;
    elements.countdownNumber.classList.remove('pop');
    void elements.countdownNumber.offsetWidth;
    elements.countdownNumber.classList.add('pop');
    soundManager.playCountdown(count);

    const timer = setInterval(() => {
      count--;
      if (count > 0) {
        elements.countdownNumber.textContent = count;
        elements.countdownNumber.classList.remove('pop');
        void elements.countdownNumber.offsetWidth;
        elements.countdownNumber.classList.add('pop');
        soundManager.playCountdown(count);
      } else if (count === 0) {
        elements.countdownNumber.textContent = "RAJT!";
        elements.countdownNumber.classList.remove('pop');
        void elements.countdownNumber.offsetWidth;
        elements.countdownNumber.classList.add('pop');
        soundManager.playCountdown(0);
      } else {
        clearInterval(timer);
        onFinish();
      }
    }, 1000);
  }

  // =========================================================================
  // Rajzolási Fázis (Könnyű: 10s, Normál: 5s, Extrém: 2s)
  // =========================================================================
  function startDrawingPhase() {
    showView('view-drawing');
    setupDrawingRound(state.currentDrawRound);
  }

  function setupDrawingRound(roundIdx) {
    const cfg = DIFFICULTY_CONFIG[state.difficulty];
    state.drawLocked = false;
    state.urgentBeepPlayed = {};
    elements.drawOverlayBlocked.classList.remove('active');

    // Kör és feladvány
    const wordObj = state.words[roundIdx];
    elements.drawRoundNumber.textContent = `${roundIdx + 1} / ${cfg.totalRounds}`;
    elements.drawTargetWord.textContent = wordObj.word;

    // Vászon előkészítése
    resizeCanvasToDisplaySize();
    clearCanvas();
    updateBrushCursorSize();

    // Időzítő UI alaphelyzet
    updateTimerUI(cfg.drawTime, cfg.drawTime);

    // Időzítő indítása
    startDrawTimer(cfg.drawTime);
  }

  function startDrawTimer(maxSeconds) {
    state.drawTimerActive = true;
    state.drawTimerStart = performance.now();

    function tick(now) {
      if (!state.drawTimerActive) return;

      const elapsed = (now - state.drawTimerStart) / 1000;
      const remaining = Math.max(0, maxSeconds - elapsed);

      updateTimerUI(remaining, maxSeconds);

      // Sürgető hangeffektek
      const urgentThreshold = maxSeconds <= 2.0 ? 1.0 : 2.0;
      if (remaining <= urgentThreshold && !state.urgentBeepPlayed[1]) {
        state.urgentBeepPlayed[1] = true;
        soundManager.playUrgentTick();
      }

      if (remaining <= 0) {
        endDrawingRound();
      } else {
        state.drawTimerReqId = requestAnimationFrame(tick);
      }
    }

    state.drawTimerReqId = requestAnimationFrame(tick);
  }

  function updateTimerUI(seconds, maxSeconds) {
    const safeSec = Math.max(0, seconds);
    elements.drawTimerText.textContent = safeSec.toFixed(1);

    const percent = (safeSec / maxSeconds) * 100;
    elements.drawTimerBar.style.width = `${percent}%`;

    const urgentThreshold = maxSeconds <= 2.0 ? 1.0 : 2.0;
    if (safeSec <= urgentThreshold) {
      elements.drawTimerBox.classList.add('urgent');
      elements.drawTimerBar.classList.add('urgent');
    } else {
      elements.drawTimerBox.classList.remove('urgent');
      elements.drawTimerBar.classList.remove('urgent');
    }
  }

  function endDrawingRound() {
    state.drawTimerActive = false;
    state.drawLocked = true;
    elements.canvasBrushCursor.classList.remove('visible');
    if (state.drawTimerReqId) {
      cancelAnimationFrame(state.drawTimerReqId);
    }

    soundManager.playTimeUp();
    elements.drawOverlayBlocked.classList.add('active');

    // Rajz elmentése a metaadatokkal
    const dataUrl = canvas.toDataURL('image/png');
    state.drawingsMeta.push({
      originalIndex: state.currentDrawRound,
      targetWordObj: state.words[state.currentDrawRound],
      dataUrl: dataUrl,
      canvasBg: state.canvasBg
    });

    const cfg = DIFFICULTY_CONFIG[state.difficulty];

    setTimeout(() => {
      state.currentDrawRound++;
      if (state.currentDrawRound < cfg.totalRounds) {
        setupDrawingRound(state.currentDrawRound);
      } else {
        startPhaseTransition();
      }
    }, 450);
  }

  // =========================================================================
  // Átvezető Képernyő
  // =========================================================================
  let transitionTimerInterval = null;

  function startPhaseTransition() {
    showView('view-transition');
    soundManager.playVictory();

    const cfg = DIFFICULTY_CONFIG[state.difficulty];
    if (cfg.shuffleGuesses) {
      elements.transitionDesc.innerHTML = `
        Minden rajz elkészült! 🏁
        <br><strong style="color: #e21b3c;">Figyelem: Extrém módban a rajzok ÖSSZEKEVERVE, nem sorban jönnek!</strong>
        <br>Vajon felismered így is, mit ábrázolnak?
      `;
    } else {
      elements.transitionDesc.innerHTML = `
        Mind a ${cfg.totalRounds} rajz elkészült!
        <br><strong>Nézd meg a saját rajzaidat, és találd ki emlékezetből, mit ábrázolnak!</strong>
      `;
    }

    let count = 4;
    elements.transitionTimer.textContent = count;

    if (transitionTimerInterval) clearInterval(transitionTimerInterval);

    transitionTimerInterval = setInterval(() => {
      count--;
      if (count > 0) {
        elements.transitionTimer.textContent = count;
      } else {
        clearInterval(transitionTimerInterval);
        startGuessingPhase();
      }
    }, 1000);
  }

  function skipPhaseTransition() {
    if (transitionTimerInterval) clearInterval(transitionTimerInterval);
    soundManager.playClick();
    startGuessingPhase();
  }

  // =========================================================================
  // Kitalálós Fázis (Extrém módban NEM sorba jönnek a rajzok!)
  // =========================================================================
  function startGuessingPhase() {
    const cfg = DIFFICULTY_CONFIG[state.difficulty];
    state.currentGuessRound = 0;
    state.userGuesses.clear();

    // Kitalálási sorrend felépítése
    state.guessQueue = [...state.drawingsMeta];

    if (cfg.shuffleGuesses) {
      // Extrém módban megkeverjük a rajzokat
      state.guessQueue.sort(() => 0.5 - Math.random());
      elements.guessingPromptTitle.innerHTML = `Emlékszel még, mi volt ez? 🤔 <span style="color:#ffa602; font-size: 0.9em;">(🔀 Kevert sorrend!)</span>`;
    } else {
      elements.guessingPromptTitle.textContent = `Emlékszel még, mi volt ez a feladat? 🤔`;
    }

    showView('view-guessing');
    setupGuessingRound(state.currentGuessRound);
  }

  function setupGuessingRound(idx) {
    const cfg = DIFFICULTY_CONFIG[state.difficulty];
    const currentItem = state.guessQueue[idx];

    elements.guessRoundNumber.textContent = `${idx + 1} / ${cfg.totalRounds}`;
    elements.guessDrawingImg.src = currentItem.dataUrl;

    // Keret háttér illesztése a rajzhoz
    if (currentItem.canvasBg === 'black') {
      elements.guessCanvasFrame.style.background = '#18181b';
    } else {
      elements.guessCanvasFrame.style.background = '#ffffff';
    }

    elements.guessInput.value = '';
    setTimeout(() => {
      elements.guessInput.focus();
    }, 60);
  }

  function submitGuess(isPass = false) {
    const rawGuess = isPass ? '' : elements.guessInput.value.trim();
    const currentItem = state.guessQueue[state.currentGuessRound];
    
    // Eltároljuk az eredeti rajz indexéhez kapcsolva
    state.userGuesses.set(currentItem.originalIndex, rawGuess);
    soundManager.playSubmit();

    const cfg = DIFFICULTY_CONFIG[state.difficulty];
    state.currentGuessRound++;

    if (state.currentGuessRound < cfg.totalRounds) {
      setupGuessingRound(state.currentGuessRound);
    } else {
      finishGameAndShowResults();
    }
  }

  // =========================================================================
  // Összesítés és Eredmények
  // =========================================================================
  function finishGameAndShowResults() {
    showView('view-results');
    const cfg = DIFFICULTY_CONFIG[state.difficulty];

    let correctCount = 0;
    const evaluatedResults = [];

    // Mindig az eredeti rajzolási sorrendben készítjük el az összefoglalót
    for (let i = 0; i < cfg.totalRounds; i++) {
      const meta = state.drawingsMeta[i];
      const targetObj = meta.targetWordObj;
      const userGuess = state.userGuesses.get(i) || '';
      const isMatch = checkAnswerMatch(targetObj, userGuess);

      if (isMatch) correctCount++;

      evaluatedResults.push({
        index: i + 1,
        targetWord: targetObj.word,
        userGuess: userGuess,
        isMatch: isMatch,
        drawingDataUrl: meta.dataUrl,
        canvasBg: meta.canvasBg
      });
    }

    state.results = evaluatedResults;
    const wrongCount = cfg.totalRounds - correctCount;
    const percent = Math.round((correctCount / cfg.totalRounds) * 100);

    elements.statCorrectCount.textContent = correctCount;
    elements.statWrongCount.textContent = wrongCount;
    elements.statPercentValue.textContent = `${percent}%`;

    // Rang és szöveges értékelés
    let rankTitle = "Fantasztikus memória!";
    let badgeIcon = "🏆";

    if (state.difficulty === 'extreme') {
      if (percent >= 80) {
        rankTitle = "EXTRÉM TÚLÉLŐ! 2 másodperc alatt is látnok vagy! 🔥🧠";
        badgeIcon = "👑";
      } else if (percent >= 50) {
        rankTitle = "Hősies helytállás az Extrém káoszban! ⚡💪";
        badgeIcon = "🔥";
      } else {
        rankTitle = "Az Extrém mód nem kegyelmez! De a próbálkozás dicséretes! 💀";
        badgeIcon = "🎪";
      }
    } else {
      if (percent === 100) {
        rankTitle = "Tökéletes! Fotografikus memória bajnok! 🧠✨";
        badgeIcon = "👑";
      } else if (percent >= 80) {
        rankTitle = "Lenyűgöző teljesítmény! Igazi művész és detektív! 🎨🔍";
        badgeIcon = "🌟";
      } else if (percent >= 60) {
        rankTitle = "Szép munka! Jól felismered a saját firkáidat! 👍";
        badgeIcon = "🎯";
      } else {
        rankTitle = "Kreatív próbálkozás! Absztrakt festőművész vagy! 🎨🤪";
        badgeIcon = "💡";
      }
    }

    elements.resultsRankTitle.textContent = rankTitle;
    elements.resultsBadgeIcon.textContent = badgeIcon;
    elements.galleryTitle.textContent = `A feladványok és rajzaid (${cfg.name} mód):`;

    renderResultsGallery(evaluatedResults);
    soundManager.playVictory();
    startConfetti();
  }

  function renderResultsGallery(results) {
    const grid = elements.resultsGalleryGrid;
    grid.innerHTML = '';

    results.forEach(res => {
      const card = document.createElement('div');
      card.className = `result-card ${res.isMatch ? 'is-correct' : 'is-wrong'}`;

      const statusBadge = res.isMatch
        ? `<span>✅ Helyes</span>`
        : `<span>❌ Helytelen</span>`;

      const displayGuess = res.userGuess.trim()
        ? `"${escapeHtml(res.userGuess)}"`
        : `<em style="color:#888;">(Passz / Nem jutott eszedbe)</em>`;

      const bgStyle = res.canvasBg === 'black' ? 'background: #18181b;' : 'background: #ffffff;';

      card.innerHTML = `
        <div class="card-header-status">
          <span>${res.index}. rajz</span>
          ${statusBadge}
        </div>
        <div class="card-img-wrap" style="${bgStyle}">
          <img src="${res.drawingDataUrl}" alt="${res.index}. rajz">
        </div>
        <div class="card-details">
          <div class="detail-row">
            <span class="detail-label">Eredeti feladvány:</span>
            <div class="detail-val-target">${escapeHtml(res.targetWord)}</div>
          </div>
          <div class="detail-row">
            <span class="detail-label">A te válaszod:</span>
            <div class="detail-val-guess">${displayGuess}</div>
          </div>
        </div>
      `;

      grid.appendChild(card);
    });
  }

  function escapeHtml(str) {
    return (str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // =========================================================================
  // Konfetti Animáció Motor
  // =========================================================================
  let confettiAnimId = null;

  function startConfetti() {
    const cCanvas = elements.confettiCanvas;
    const cCtx = cCanvas.getContext('2d');
    
    let width = cCanvas.width = window.innerWidth;
    let height = cCanvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
      width = cCanvas.width = window.innerWidth;
      height = cCanvas.height = window.innerHeight;
    }, { once: true });

    const particles = [];
    const colors = ['#e21b3c', '#1368ce', '#ffa602', '#26890c', '#ffffff', '#a855f7'];

    for (let i = 0; i < 90; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height - height,
        r: Math.random() * 8 + 4,
        d: Math.random() * 40 + 10,
        color: colors[Math.floor(Math.random() * colors.length)],
        tilt: Math.floor(Math.random() * 10) - 10,
        tiltAngleInc: (Math.random() * 0.07) + 0.05,
        tiltAngle: 0
      });
    }

    if (confettiAnimId) cancelAnimationFrame(confettiAnimId);

    let frames = 0;
    function drawConfetti() {
      cCtx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.tiltAngle += p.tiltAngleInc;
        p.y += (Math.cos(p.d) + 3 + p.r / 2) * 0.7;
        p.x += Math.sin(p.tiltAngle) * 1.5;
        p.tilt = Math.sin(p.tiltAngle) * 15;

        cCtx.beginPath();
        cCtx.lineWidth = p.r;
        cCtx.strokeStyle = p.color;
        cCtx.moveTo(p.x + p.tilt + p.r / 2, p.y);
        cCtx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
        cCtx.stroke();
      }

      frames++;
      if (frames < 360) {
        confettiAnimId = requestAnimationFrame(drawConfetti);
      } else {
        cCtx.clearRect(0, 0, width, height);
      }
    }

    drawConfetti();
  }

  // =========================================================================
  // Eseménykezelők Összekötése (Event Listeners)
  // =========================================================================
  function setupEventListeners() {
    // Hang némítás
    elements.btnSoundToggle.addEventListener('click', () => {
      const isMuted = soundManager.toggleMute();
      elements.soundIcon.textContent = isMuted ? '🔇' : '🔊';
    });

    // Nehézség választó kártyák kattintása
    elements.diffCards.forEach(card => {
      card.addEventListener('click', () => {
        soundManager.playClick();
        const diff = card.getAttribute('data-difficulty');
        setDifficulty(diff);
      });
    });

    // Vászon háttérszín váltó (Fehér alapon fekete kurzor / Fekete alapon fehér kurzor)
    elements.btnToggleCanvasBg.addEventListener('click', () => {
      if (!state.drawLocked && state.drawTimerActive) {
        toggleCanvasBackground();
      }
    });

    // Főmenü indítás
    elements.btnStartGame.addEventListener('click', () => {
      startNewGame();
    });

    // Átvezető átugrása
    elements.btnSkipTransition.addEventListener('click', () => {
      skipPhaseTransition();
    });

    // Vászon törlése a rajzolási kör alatt
    elements.btnClearCanvas.addEventListener('click', () => {
      if (!state.drawLocked && state.drawTimerActive) {
        clearCanvas();
        soundManager.playClick();
      }
    });

    // Színválasztó gombok
    elements.colorBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        elements.colorBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.currentColor = btn.getAttribute('data-color');
        soundManager.playClick();
      });
    });

    // Vonalvastagság gombok
    elements.sizeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        elements.sizeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.currentLineWidth = parseInt(btn.getAttribute('data-size'), 10) || 8;
        updateBrushCursorSize();
        soundManager.playClick();
      });
    });

    // Kitalálás: űrlap beküldés
    elements.guessForm.addEventListener('submit', (e) => {
      e.preventDefault();
      submitGuess(false);
    });

    // Kitalálás: Passz gomb
    elements.btnPassGuess.addEventListener('click', () => {
      submitGuess(true);
    });

    // Új játék gombok
    elements.btnRestartGame.addEventListener('click', () => {
      soundManager.playClick();
      showView('view-menu');
    });

    elements.btnRestartBottom.addEventListener('click', () => {
      soundManager.playClick();
      showView('view-menu');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Logo kattintás -> Főmenü megerősítéssel
    elements.headerLogo.addEventListener('click', () => {
      if (state.currentView !== 'view-menu' && state.currentView !== 'view-results') {
        if (confirm("Biztosan visszalépsz a főmenübe? A jelenlegi játék félbeszakad.")) {
          if (state.drawTimerReqId) cancelAnimationFrame(state.drawTimerReqId);
          state.drawTimerActive = false;
          showView('view-menu');
        }
      } else {
        showView('view-menu');
      }
    });

    elements.soundIcon.textContent = soundManager.isMuted() ? '🔇' : '🔊';
  }

  // =========================================================================
  // Inicializálás
  // =========================================================================
  window.addEventListener('DOMContentLoaded', () => {
    initCanvas();
    setupEventListeners();
    setDifficulty('normal'); // Alapértelmezett a normál szint
  });

  window.addEventListener('resize', () => {
    if (state.currentView === 'view-menu') {
      resizeCanvasToDisplaySize();
      clearCanvas();
    }
  });

})();
