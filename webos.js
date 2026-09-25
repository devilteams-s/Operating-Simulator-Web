/**
 * CyberOS - Window Manager & Native Applications
 */

let highestZIndex = 100;
const openWindows = new Map();

// Saat Güncellemesi
function updateClock() {
  const clockEl = document.getElementById('clock');
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  clockEl.textContent = `${hours}:${minutes}`;
}
setInterval(updateClock, 1000);
updateClock();

// Başlat Menüsü Aç/Kapat
const startBtn = document.getElementById('start-btn');
const startMenu = document.getElementById('start-menu');

startBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  startMenu.classList.toggle('open');
});

document.addEventListener('click', (e) => {
  if (!startMenu.contains(e.target) && e.target !== startBtn) {
    startMenu.classList.remove('open');
  }
});

// Uygulama Tanımları ve İçerikleri
const APPS = {
  terminal: {
    title: 'Hacker Terminal (Bash)',
    icon: '💻',
    width: 520,
    height: 340,
    init: initTerminalApp
  },
  notepad: {
    title: 'Not Defteri',
    icon: '📝',
    width: 440,
    height: 320,
    init: initNotepadApp
  },
  calc: {
    title: 'Hesap Makinesi',
    icon: '🧮',
    width: 280,
    height: 380,
    init: initCalcApp
  },
  paint: {
    title: 'CyberPaint Studio',
    icon: '🎨',
    width: 500,
    height: 380,
    init: initPaintApp
  },
  settings: {
    title: 'Masaüstü Ayarları',
    icon: '⚙️',
    width: 360,
    height: 260,
    init: initSettingsApp
  }
};

// Pencere Oluşturma (Window Creator)
function openApp(appId) {
  startMenu.classList.remove('open');

  if (openWindows.has(appId)) {
    const win = openWindows.get(appId);
    win.element.style.display = 'flex';
    focusWindow(win);
    return;
  }

  const appDef = APPS[appId];
  if (!appDef) return;

  const winId = `win-${appId}`;
  const winEl = document.createElement('div');
  winEl.className = 'os-window';
  winEl.id = winId;
  winEl.style.width = `${appDef.width}px`;
  winEl.style.height = `${appDef.height}px`;

  // Masaüstünde ortala / hafif kaydır
  const offset = openWindows.size * 25;
  const left = Math.max(20, Math.min(window.innerWidth - appDef.width - 20, 100 + offset));
  const top = Math.max(20, Math.min(window.innerHeight - appDef.height - 60, 60 + offset));
  winEl.style.left = `${left}px`;
  winEl.style.top = `${top}px`;
  winEl.style.zIndex = ++highestZIndex;

  winEl.innerHTML = `
    <div class="window-titlebar">
      <div class="titlebar-left">
        <span>${appDef.icon}</span>
        <span>${appDef.title}</span>
      </div>
      <div class="titlebar-controls">
        <button class="ctrl-btn min" title="Küçült">_</button>
        <button class="ctrl-btn max" title="Büyüt">□</button>
        <button class="ctrl-btn close" title="Kapat">✕</button>
      </div>
    </div>
    <div class="window-content" id="content-${appId}"></div>
  `;

  document.getElementById('windows-container').appendChild(winEl);

  // Görev çubuğuna ekle
  const taskTab = document.createElement('div');
  taskTab.className = 'taskbar-item active';
  taskTab.innerHTML = `<span>${appDef.icon}</span> <span>${appDef.title}</span>`;
  document.getElementById('taskbar-apps').appendChild(taskTab);

  const windowData = {
    id: appId,
    element: winEl,
    taskTab: taskTab,
    isMaximized: false
  };

  openWindows.set(appId, windowData);

  // Sürükleme Mantığı (Drag)
  setupDrag(winEl);

  // Kontrol Butonları
  const titlebar = winEl.querySelector('.window-titlebar');
  winEl.querySelector('.ctrl-btn.close').onclick = () => closeWindow(appId);
  winEl.querySelector('.ctrl-btn.min').onclick = () => {
    winEl.style.display = 'none';
    taskTab.classList.remove('active');
  };
  winEl.querySelector('.ctrl-btn.max').onclick = () => toggleMaximize(windowData);

  winEl.addEventListener('mousedown', () => focusWindow(windowData));
  taskTab.onclick = () => {
    if (winEl.style.display === 'none') {
      winEl.style.display = 'flex';
      focusWindow(windowData);
    } else if (winEl.style.zIndex == highestZIndex) {
      winEl.style.display = 'none';
      taskTab.classList.remove('active');
    } else {
      focusWindow(windowData);
    }
  };

  // Uygulamanın kendi UI içeriğini yükle
  const contentArea = winEl.querySelector(`#content-${appId}`);
  appDef.init(contentArea);
}

function focusWindow(winData) {
  winData.element.style.zIndex = ++highestZIndex;
  document.querySelectorAll('.taskbar-item').forEach(t => t.classList.remove('active'));
  winData.taskTab.classList.add('active');
}

function toggleMaximize(winData) {
  winData.isMaximized = !winData.isMaximized;
  winData.element.classList.toggle('maximized', winData.isMaximized);
}

function closeWindow(appId) {
  const win = openWindows.get(appId);
  if (win) {
    win.element.remove();
    win.taskTab.remove();
    openWindows.delete(appId);
  }
}

// Sürükle ve Bırak (Window Dragging)
function setupDrag(winEl) {
  const titlebar = winEl.querySelector('.window-titlebar');
  let isDragging = false;
  let startX, startY, initLeft, initTop;

  titlebar.addEventListener('mousedown', (e) => {
    if (e.target.closest('.titlebar-controls')) return;
    if (winEl.classList.contains('maximized')) return;
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    initLeft = winEl.offsetLeft;
    initTop = winEl.offsetTop;

    function onMouseMove(moveEvent) {
      if (!isDragging) return;
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      winEl.style.left = `${initLeft + dx}px`;
      winEl.style.top = `${initTop + dy}px`;
    }

    function onMouseUp() {
      isDragging = false;
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    }

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  });
}

// Masaüstü ve Başlat İkon Tıklamaları
document.querySelectorAll('.desktop-icon, .start-item').forEach(el => {
  el.addEventListener('click', () => {
    const appId = el.dataset.app;
    if (appId) openApp(appId);
  });
});

document.getElementById('btn-restart').addEventListener('click', () => {
  location.reload();
});

// ==========================================
// 1. TERMINAL APP
// ==========================================
function initTerminalApp(container) {
  container.innerHTML = `
    <div class="terminal-app" id="term">
      <div class="term-output" id="term-output">CyberOS Kernel v2.4.0-release (x86_64-web)
Hoş geldin! Komut listesi için 'help' yazabilirsin.</div>
      <div class="term-input-line">
        <span class="term-prompt">root@cyberos:~#</span>
        <input type="text" class="term-input" id="term-input" autofocus autocomplete="off">
      </div>
    </div>
  `;

  const input = container.querySelector('#term-input');
  const output = container.querySelector('#term-output');

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const cmd = input.value.trim().toLowerCase();
      input.value = '';
      output.textContent += `\nroot@cyberos:~# ${cmd}`;

      if (cmd === 'help') {
        output.textContent += `\nKullanılabilir Komutlar:
  help      - Bu listeyi gösterir
  neofetch  - Sistem özelliklerini gösterir
  clear     - Terminal ekranını temizler
  date      - Güncel saat ve tarih
  matrix    - Matrix veri akışı simülasyonu
  echo [..] - Yazılan metni ekrana basar
  apps      - Yüklü uygulamaları listeler`;
      } else if (cmd === 'clear') {
        output.textContent = '';
      } else if (cmd === 'date') {
        output.textContent += `\n${new Date().toString()}`;
      } else if (cmd === 'neofetch') {
        output.textContent += `\n
   /\\_/\\     root@cyberos
  ( o.o )    OS: CyberOS Web Edition
   > ^ <     Host: Browser Window (${window.innerWidth}x${window.innerHeight})
             Uptime: ${Math.floor(performance.now() / 1000)}s
             Memory: 1024MB / 4096MB
             UI: Pure CSS3 Glassmorphism`;
      } else if (cmd.startsWith('echo ')) {
        output.textContent += `\n${cmd.slice(5)}`;
      } else if (cmd === 'matrix') {
        output.textContent += `\nWake up, Neo... The Matrix has you. Follow the white rabbit.`;
      } else if (cmd === 'apps') {
        output.textContent += `\nYüklü Uygulamalar: terminal, notepad, calc, paint, settings`;
      } else if (cmd !== '') {
        output.textContent += `\nBilinmeyen komut: '${cmd}'. 'help' yazarak komutlara bakabilirsin.`;
      }

      container.querySelector('#term').scrollTop = container.querySelector('#term').scrollHeight;
    }
  });
}

// ==========================================
// 2. NOTEPAD APP
// ==========================================
function initNotepadApp(container) {
  const savedText = localStorage.getItem('cyberos_notepad') || 'CyberOS Not Defterine Hoş Geldiniz!\n\nBuraya aldığınız notlar tarayıcının yerel hafızasına (LocalStorage) anında kaydedilir.';
  container.innerHTML = `
    <div class="notepad-app">
      <textarea class="notepad-textarea" id="note-text">${savedText}</textarea>
    </div>
  `;

  const textarea = container.querySelector('#note-text');
  textarea.addEventListener('input', () => {
    localStorage.setItem('cyberos_notepad', textarea.value);
  });
}

// ==========================================
// 3. CALCULATOR APP
// ==========================================
function initCalcApp(container) {
  container.innerHTML = `
    <div class="calc-app">
      <div class="calc-screen" id="calc-screen">0</div>
      <div class="calc-grid">
        <button class="calc-btn op" data-val="C">C</button>
        <button class="calc-btn op" data-val="back">⌫</button>
        <button class="calc-btn op" data-val="/">/</button>
        <button class="calc-btn op" data-val="*">×</button>
        <button class="calc-btn" data-val="7">7</button>
        <button class="calc-btn" data-val="8">8</button>
        <button class="calc-btn" data-val="9">9</button>
        <button class="calc-btn op" data-val="-">-</button>
        <button class="calc-btn" data-val="4">4</button>
        <button class="calc-btn" data-val="5">5</button>
        <button class="calc-btn" data-val="6">6</button>
        <button class="calc-btn op" data-val="+">+</button>
        <button class="calc-btn" data-val="1">1</button>
        <button class="calc-btn" data-val="2">2</button>
        <button class="calc-btn" data-val="3">3</button>
        <button class="calc-btn op" data-val="=" style="grid-row: span 2; height: 100%; background: #6c5ce7;">=</button>
        <button class="calc-btn" data-val="0" style="grid-column: span 2;">0</button>
        <button class="calc-btn" data-val=".">.</button>
      </div>
    </div>
  `;

  const screen = container.querySelector('#calc-screen');
  let currentExpr = '';

  container.querySelectorAll('.calc-btn').forEach(btn => {
    btn.onclick = () => {
      const v = btn.dataset.val;
      if (v === 'C') {
        currentExpr = '';
        screen.textContent = '0';
      } else if (v === 'back') {
        currentExpr = currentExpr.slice(0, -1);
        screen.textContent = currentExpr || '0';
      } else if (v === '=') {
        try {
          const res = Function(`'use strict'; return (${currentExpr})`)();
          currentExpr = String(res);
          screen.textContent = currentExpr;
        } catch {
          screen.textContent = 'Hata';
          currentExpr = '';
        }
      } else {
        currentExpr += v;
        screen.textContent = currentExpr;
      }
    };
  });
}

// ==========================================
// 4. PAINT APP
// ==========================================
function initPaintApp(container) {
  container.innerHTML = `
    <div class="paint-app">
      <div class="paint-bar">
        <input type="color" id="paint-color" value="#000000">
        <input type="range" id="paint-size" min="1" max="30" value="4">
        <button id="paint-clear" class="ctrl-btn" style="width: auto; padding: 0 8px;">Temizle</button>
      </div>
      <div class="paint-canvas-wrapper">
        <canvas class="paint-canvas" id="paint-canvas"></canvas>
      </div>
    </div>
  `;

  const pCanvas = container.querySelector('#paint-canvas');
  const pCtx = pCanvas.getContext('2d');
  const wrapper = container.querySelector('.paint-canvas-wrapper');

  // Boyutlandırma
  setTimeout(() => {
    pCanvas.width = wrapper.clientWidth;
    pCanvas.height = wrapper.clientHeight;
    pCtx.fillStyle = '#ffffff';
    pCtx.fillRect(0, 0, pCanvas.width, pCanvas.height);
  }, 50);

  let isPainting = false;
  let pColor = '#000000';
  let pSize = 4;

  container.querySelector('#paint-color').oninput = (e) => pColor = e.target.value;
  container.querySelector('#paint-size').oninput = (e) => pSize = e.target.value;
  container.querySelector('#paint-clear').onclick = () => {
    pCtx.fillStyle = '#ffffff';
    pCtx.fillRect(0, 0, pCanvas.width, pCanvas.height);
  };

  pCanvas.onmousedown = (e) => {
    isPainting = true;
    pCtx.beginPath();
    pCtx.moveTo(e.offsetX, e.offsetY);
  };

  pCanvas.onmousemove = (e) => {
    if (!isPainting) return;
    pCtx.strokeStyle = pColor;
    pCtx.lineWidth = pSize;
    pCtx.lineCap = 'round';
    pCtx.lineTo(e.offsetX, e.offsetY);
    pCtx.stroke();
  };

  window.addEventListener('mouseup', () => isPainting = false);
}

// ==========================================
// 5. SETTINGS APP
// ==========================================
function initSettingsApp(container) {
  container.innerHTML = `
    <div style="padding: 1.2rem; display: flex; flex-direction: column; gap: 1rem;">
      <div style="font-weight: 600; font-size: 0.9rem;">Masaüstü Duvar Kağıdı:</div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.6rem;">
        <button class="bg-opt" data-bg="cyber" style="padding: 0.6rem; border-radius: 6px; background: #201735; color: #fff; border: 1px solid var(--border); cursor: pointer;">🌌 Cyber Deep</button>
        <button class="bg-opt" data-bg="sunset" style="padding: 0.6rem; border-radius: 6px; background: #e17055; color: #fff; border: 1px solid var(--border); cursor: pointer;">🌇 Synth Sunset</button>
        <button class="bg-opt" data-bg="dark" style="padding: 0.6rem; border-radius: 6px; background: #000; color: #fff; border: 1px solid var(--border); cursor: pointer;">🖤 AMOLED Dark</button>
        <button class="bg-opt" data-bg="nord" style="padding: 0.6rem; border-radius: 6px; background: #2e3440; color: #fff; border: 1px solid var(--border); cursor: pointer;">❄️ Nord Frost</button>
      </div>
    </div>
  `;

  const desktop = document.getElementById('desktop');
  container.querySelectorAll('.bg-opt').forEach(btn => {
    btn.onclick = () => {
      const type = btn.dataset.bg;
      if (type === 'cyber') desktop.style.background = 'linear-gradient(135deg, #0d0f19 0%, #171b2f 50%, #201735 100%)';
      if (type === 'sunset') desktop.style.background = 'linear-gradient(135deg, #2c3e50, #fd746c)';
      if (type === 'dark') desktop.style.background = '#0a0a0c';
      if (type === 'nord') desktop.style.background = 'linear-gradient(135deg, #2e3440, #4c566a)';
    };
  });
}

// Varsayılan olarak başlangıçta Terminal'i aç
openApp('terminal');
