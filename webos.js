let installedApps = new Set(['cmatrix', 'sl']);
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
  readme_txt: {
    title: 'paketler.txt - Paket Deposu Rehberi',
    icon: '📄',
    width: 480,
    height: 380,
    init: initReadmeApp
  },
  tetris: {
    title: 'Tetris Arcade',
    icon: '🕹️',
    width: 320,
    height: 440,
    init: initTetrisApp
  },
  clock_app: {
    title: 'Neon Saat',
    icon: '⏰',
    width: 300,
    height: 180,
    init: initClockApp
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
// ==========================================
// 1. LINUX BASH TERMINAL (Virtual FS & Shell)
// ==========================================
function initTerminalApp(container) {
  // Sanal Dosya Sistemi (In-Memory Virtual Linux Filesystem)
  const vfs = {
    '/': { type: 'dir', children: ['home', 'bin', 'etc', 'var'] },
    '/home': { type: 'dir', children: ['mehmet'] },
    '/home/mehmet': { 
      type: 'dir', 
      children: ['Masaustu', 'Belgeler', 'Projeler', 'not.txt', '.bashrc'] 
    },
    '/home/mehmet/not.txt': { 
      type: 'file', 
      content: 'CyberOS Linux v6.8.0-generic\nBu sanal bir Linux bash terminalidir.' 
    },
    '/home/mehmet/.bashrc': { 
      type: 'file', 
      content: 'export PS1="\\u@\\h:\\w\\$ "\nalias ll="ls -la"' 
    },
    '/home/mehmet/Belgeler': { type: 'dir', children: ['sifreler.txt'] },
    '/home/mehmet/Belgeler/sifreler.txt': { type: 'file', content: 'SECRET_VAULT_KEY: 9482-cyber-linux-pass' },
    '/home/mehmet/Masaustu': { type: 'dir', children: ['paketler.txt'] },\n    '/home/mehmet/Masaustu/paketler.txt': { type: 'file', content: `=================================================
📦 CYBEROS LINUX - APT DEPOSU PAKET LİSTESİ
=================================================
Terminali açıp 'sudo apt install <paket-adi>' 
yazarak aşağıdaki uygulamaları kurabilirsiniz:

1. cmatrix
   Açıklama: Efsanevi yeşil Matrix dijital yağmur akışı!
   Komut:    sudo apt install cmatrix

2. sl
   Açıklama: Terminal ekranından geçen nostaljik buharlı tren!
   Komut:    sudo apt install sl

3. htop
   Açıklama: Etkileşimli dinamik CPU & RAM işlem yöneticisi.
   Komut:    sudo apt install htop

4. cowsay
   Açıklama: Konuşan sevimli terminal ineği!
   Komut:    sudo apt install cowsay

5. tetris
   Açıklama: Masaüstüne mini retro Tetris oyunu yükler!
   Komut:    sudo apt install tetris

6. clock
   Açıklama: Büyük dijital neon masaüstü saati.
   Komut:    sudo apt install clock
=================================================` },
    '/home/mehmet/Projeler': { type: 'dir', children: ['pixel-studio', 'sandbox-web'] },
    '/etc': { type: 'dir', children: ['os-release', 'hostname'] },
    '/etc/os-release': { 
      type: 'file', 
      content: 'NAME="CyberOS GNU/Linux"\nVERSION="24.04 LTS"\nID=cyberos\nPRETTY_NAME="CyberOS 24.04 LTS (Noble Numbat)"' 
    },
    '/etc/hostname': { type: 'file', content: 'cyberos-desktop' },
    '/bin': { type: 'dir', children: ['ls', 'cat', 'pwd', 'cd', 'mkdir', 'touch', 'rm', 'echo', 'uname', 'neofetch', 'whoami', 'clear', 'sudo', 'date'] },
    '/var': { type: 'dir', children: ['log'] }
  };

  let currentPath = '/home/mehmet';
  let history = [];
  let historyIdx = -1;

  function getPromptPath(p) {
    if (p === '/home/mehmet') return '~';
    if (p.startsWith('/home/mehmet/')) return '~' + p.slice('/home/mehmet'.length);
    return p;
  }

  function resolvePath(target) {
    if (!target || target === '.') return currentPath;
    if (target === '~') return '/home/mehmet';
    if (target.startsWith('~/')) return '/home/mehmet/' + target.slice(2);
    if (target.startsWith('/')) {
      const parts = target.split('/').filter(Boolean);
      return '/' + parts.join('/');
    }
    const currentParts = currentPath === '/' ? [] : currentPath.split('/').filter(Boolean);
    const targetParts = target.split('/').filter(Boolean);
    for (const part of targetParts) {
      if (part === '..') {
        if (currentParts.length > 0) currentParts.pop();
      } else if (part !== '.') {
        currentParts.push(part);
      }
    }
    return '/' + currentParts.join('/');
  }

  container.innerHTML = `
    <div class="terminal-app" id="term">
      <div class="term-output" id="term-output">Linux cyberos-desktop 6.8.0-31-generic #31-Ubuntu SMP PREEMPT_DYNAMIC x86_64

Welcome to CyberOS Linux 24.04 LTS (GNU/Linux 6.8.0-generic x86_64)
 * Documentation:  https://github.com/devilteams-s/Operating-Simulator-Web
 * System load:    0.14, 0.08, 0.03
 * Memory usage:   24% of 16384MB
 * IP address:     192.168.0.131

Type 'help' to view available Linux bash commands.</div>
      <div class="term-input-line">
        <span class="term-prompt" id="term-prompt">mehmet@cyberos-desktop:~$ </span>
        <input type="text" class="term-input" id="term-input" autofocus autocomplete="off" spellcheck="false">
      </div>
    </div>
  `;

  const input = container.querySelector('#term-input');
  const output = container.querySelector('#term-output');
  const promptEl = container.querySelector('#term-prompt');
  const termEl = container.querySelector('#term');

  function updatePrompt() {
    promptEl.textContent = `mehmet@cyberos-desktop:${getPromptPath(currentPath)}$ `;
  }

  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length > 0 && historyIdx > 0) {
        historyIdx--;
        input.value = history[historyIdx];
      }
      return;
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (history.length > 0 && historyIdx < history.length - 1) {
        historyIdx++;
        input.value = history[historyIdx];
      } else {
        historyIdx = history.length;
        input.value = '';
      }
      return;
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const val = input.value.trim();
      const parts = val.split(' ');
      const last = parts[parts.length - 1];
      const dir = vfs[currentPath];
      if (dir && dir.children) {
        const matches = dir.children.filter(c => c.startsWith(last));
        if (matches.length === 1) {
          parts[parts.length - 1] = matches[0];
          input.value = parts.join(' ');
        }
      }
      return;
    }

    if (e.key === 'Enter') {
      const rawCmd = input.value.trim();
      const promptText = `mehmet@cyberos-desktop:${getPromptPath(currentPath)}$ `;
      output.textContent += `\n${promptText}${rawCmd}`;
      input.value = '';

      if (rawCmd) {
        history.push(rawCmd);
        historyIdx = history.length;
      }

      const args = rawCmd.split(' ').filter(Boolean);
      const cmd = args[0] ? args[0].toLowerCase() : '';

      // --- Linux Komut Yorumlayıcı ---
      if (cmd === 'clear') {
        output.textContent = '';
      } else if (cmd === 'pwd') {
        output.textContent += `\n${currentPath}`;
      } else if (cmd === 'whoami') {
        output.textContent += '\nmehmet';
      } else if (cmd === 'hostname') {
        output.textContent += '\ncyberos-desktop';
      } else if (cmd === 'date') {
        output.textContent += `\n${new Date().toUTCString()}`;
      } else if (cmd === 'uname' || (cmd === 'uname' && args[1] === '-a')) {
        output.textContent += '\nLinux cyberos-desktop 6.8.0-31-generic #31-Ubuntu SMP PREEMPT_DYNAMIC x86_64 GNU/Linux';
      } else if (cmd === 'ls') {
        const showAll = args.includes('-a') || args.includes('-la') || args.includes('-al');
        const showLong = args.includes('-l') || args.includes('-la') || args.includes('-al');
        const dir = vfs[currentPath];
        if (dir && dir.type === 'dir') {
          let items = dir.children;
          if (!showAll) items = items.filter(i => !i.startsWith('.'));
          if (showLong) {
            output.textContent += `\ntotal ${items.length * 4}`;
            items.forEach(item => {
              const fullP = currentPath === '/' ? '/' + item : currentPath + '/' + item;
              const isD = vfs[fullP] && vfs[fullP].type === 'dir';
              const perms = isD ? 'drwxr-xr-x 2 mehmet mehmet 4096' : '-rw-r--r-- 1 mehmet mehmet  248';
              output.textContent += `\n${perms} Sep 25 21:50 ${item}`;
            });
          } else {
            output.textContent += `\n${items.join('   ')}`;
          }
        }
      } else if (cmd === 'cd') {
        const dest = args[1] || '~';
        const targetPath = resolvePath(dest);
        if (vfs[targetPath] && vfs[targetPath].type === 'dir') {
          currentPath = targetPath;
          updatePrompt();
        } else if (vfs[targetPath] && vfs[targetPath].type === 'file') {
          output.textContent += `\nbash: cd: ${dest}: Not a directory`;
        } else {
          output.textContent += `\nbash: cd: ${dest}: No such file or directory`;
        }
      } else if (cmd === 'cat') {
        if (!args[1]) {
          output.textContent += '\ncat: missing file operand';
        } else {
          const target = resolvePath(args[1]);
          if (vfs[target] && vfs[target].type === 'file') {
            output.textContent += `\n${vfs[target].content}`;
          } else if (vfs[target] && vfs[target].type === 'dir') {
            output.textContent += `\ncat: ${args[1]}: Is a directory`;
          } else {
            output.textContent += `\ncat: ${args[1]}: No such file or directory`;
          }
        }
      } else if (cmd === 'mkdir') {
        if (!args[1]) {
          output.textContent += '\nmkdir: missing operand';
        } else {
          const newDir = resolvePath(args[1]);
          const parent = newDir.slice(0, newDir.lastIndexOf('/')) || '/';
          const name = newDir.slice(newDir.lastIndexOf('/') + 1);
          if (vfs[newDir]) {
            output.textContent += `\nmkdir: cannot create directory '${args[1]}': File exists`;
          } else if (vfs[parent]) {
            vfs[newDir] = { type: 'dir', children: [] };
            vfs[parent].children.push(name);
          }
        }
      } else if (cmd === 'touch') {
        if (!args[1]) {
          output.textContent += '\ntouch: missing file operand';
        } else {
          const newFile = resolvePath(args[1]);
          const parent = newFile.slice(0, newFile.lastIndexOf('/')) || '/';
          const name = newFile.slice(newFile.lastIndexOf('/') + 1);
          if (!vfs[newFile] && vfs[parent]) {
            vfs[newFile] = { type: 'file', content: '' };
            vfs[parent].children.push(name);
          }
        }
      } else if (cmd === 'rm') {
        if (!args[1]) {
          output.textContent += '\nrm: missing operand';
        } else {
          const target = resolvePath(args[1]);
          const parent = target.slice(0, target.lastIndexOf('/')) || '/';
          const name = target.slice(target.lastIndexOf('/') + 1);
          if (vfs[target]) {
            delete vfs[target];
            if (vfs[parent]) vfs[parent].children = vfs[parent].children.filter(c => c !== name);
          } else {
            output.textContent += `\nrm: cannot remove '${args[1]}': No such file or directory`;
          }
        }
      } else if (cmd === 'echo') {
        const text = rawCmd.slice(5);
        if (text.includes('>')) {
          const [left, right] = text.split('>').map(s => s.trim());
          const target = resolvePath(right);
          const parent = target.slice(0, target.lastIndexOf('/')) || '/';
          const name = target.slice(target.lastIndexOf('/') + 1);
          vfs[target] = { type: 'file', content: left };
          if (vfs[parent] && !vfs[parent].children.includes(name)) vfs[parent].children.push(name);
        } else {
          output.textContent += `\n${text}`;
        }
      } else if (cmd === 'sudo') {
        output.textContent += '\n[sudo] password for mehmet: \nmehmet is in the sudoers file. This incident will be reported.';
      
      // --- APT PAKET YÖNETİCİSİ ---
      else if (cmd === 'apt' || (cmd === 'sudo' && args[1] === 'apt')) {
        const aptArgs = cmd === 'sudo' ? args.slice(2) : args.slice(1);
        const action = aptArgs[0];
        const pkg = aptArgs[1];

        if (!action) {
          output.textContent += '\napt 2.7.14 (x86_64)\nUsage: apt [options] command\n\nCommands: install, update, list, remove';
        } else if (action === 'update') {
          output.textContent += '\nHit:1 http://archive.cyberos.org/ubuntu noble InRelease\nGet:2 http://security.cyberos.org/ubuntu noble-security InRelease [126 kB]\nReading package lists... Done\nBuilding dependency tree... Done\nAll packages are up to date.';
        } else if (action === 'list') {
          output.textContent += '\nListing available packages...\ncmatrix/noble 2.0-3 x86_64\nsl/noble 5.02-1 x86_64\nhtop/noble 3.3.0-4 x86_64\ncowsay/noble 3.7.0-1 all\ntetris/noble 1.0.0-1 x86_64\nclock/noble 2.1.0-1 x86_64';
        } else if (action === 'install') {
          if (!pkg) {
            output.textContent += '\napt: missing package name operand. Example: sudo apt install cmatrix';
          } else {
            const validPkgs = ['cmatrix', 'sl', 'htop', 'cowsay', 'tetris', 'clock'];
            if (!validPkgs.includes(pkg)) {
              output.textContent += `\nE: Unable to locate package ${pkg}\nE: Check 'cat ~/Masaustu/paketler.txt' for valid packages.`;
            } else if (installedApps.has(pkg)) {
              output.textContent += `\n${pkg} is already the newest version.`;
            } else {
              output.textContent += `\nReading package lists... Done\nBuilding dependency tree... Done\nThe following NEW packages will be installed:\n  ${pkg}\n0 upgraded, 1 newly installed, 0 to remove.\nGet:1 http://archive.cyberos.org/ubuntu noble/main ${pkg} [428 kB]\nUnpacking ${pkg} (amd64)...\nSetting up ${pkg}...\nProcessing triggers for man-db...\n\n✨ SUCCESS: '${pkg}' has been installed!`;

              installedApps.add(pkg);
              vfs['/bin'].children.push(pkg);

              // Masaüstüne ve Başlat Menüsüne yeni ikonu dinamik ekle
              addAppToDesktop(pkg);
            }
          }
        }
      }
      // --- KURULAN PAKETLERİ ÇALIŞTIRMA ---
      else if (cmd === 'cmatrix') {
        if (!installedApps.has('cmatrix')) {
          output.textContent += "\nCommand 'cmatrix' not found, but can be installed with:\nsudo apt install cmatrix";
        } else {
          output.textContent += '\n01001000 01100001 01100011 01101011 01101001 01101110 01100111\n01000011 01111001 01100010 01100101 01110010 01001111 01010011\nWake up, Neo...\n[Matrix Stream Completed]';
        }
      } else if (cmd === 'sl') {
        if (!installedApps.has('sl')) {
          output.textContent += "\nCommand 'sl' not found, but can be installed with:\nsudo apt install sl";
        } else {
          output.textContent += '\n==== o o o o o o o . . . ____________________ _____\n  _D __|===|_D _| * * * * * * * * *| | | |\n |__/__|_____|__|__________________| |_|_|\n   oo---oo       ooo---ooo---ooo     o---o';
        }
      } else if (cmd === 'cowsay') {
        if (!installedApps.has('cowsay')) {
          output.textContent += "\nCommand 'cowsay' not found, but can be installed with:\nsudo apt install cowsay";
        } else {
          const msg = args.slice(1).join(' ') || 'Linux & CyberOS Harika!';
          output.textContent += `\n  < ${msg} >\n         \\   ^__^\n          \\  (oo)\\_______\n             (__)\\       )\\/\\\n                 ||----w |\n                 ||     ||`;
        }
      } else if (cmd === 'htop') {
        if (!installedApps.has('htop')) {
          output.textContent += "\nCommand 'htop' not found, but can be installed with:\nsudo apt install htop";
        } else {
          output.textContent += `\n  CPU[|||||||||||||||||||||||        42.8%]   Tasks: 42, 1 thr; 1 running\n  Mem[|||||||||||||||               3.8/16.0G]   Load average: 0.18 0.12 0.08\n\n  PID USER      PRI  NI  VIRT   RES   SHR S CPU% MEM%   TIME+  Command\n    1 root       20   0 168.4M 12.1M  8.4M S  0.0  0.1  0:02.14 /sbin/init\n  842 mehmet     20   0  1.2G  320M   98M S 22.4  2.0  0:45.10 /bin/cyberos-wm\n 1204 mehmet     20   0  420M   86M   42M S  2.8  0.5  0:08.22 /bin/bash`;
        }
      } else if (cmd === 'tetris') {
        if (!installedApps.has('tetris')) {
          output.textContent += "\nCommand 'tetris' not found, but can be installed with:\nsudo apt install tetris";
        } else {
          openApp('tetris');
          output.textContent += '\n[Tetris Arcade başlatıldı...]';
        }
      } else if (cmd === 'clock') {
        if (!installedApps.has('clock')) {
          output.textContent += "\nCommand 'clock' not found, but can be installed with:\nsudo apt install clock";
        } else {
          openApp('clock_app');
          output.textContent += '\n[Neon Saat başlatıldı...]';
        }
      }

      } else if (cmd === 'neofetch') {
        output.textContent += `\n
        #####        mehmet@cyberos-desktop
       #######       ----------------------
       ##O#O##       OS: CyberOS GNU/Linux 24.04 LTS x86_64
       #VVVVV#       Host: WebAssembly Container
     ##  VVV  ##     Kernel: 6.8.0-31-generic
    #          ##    Uptime: 2 hours, 14 mins
   #            ##   Shell: bash 5.2.21
   #            ###  Resolution: 1920x1080
  QQ#           ##Q  DE: CyberOS Desktop Environment
QQQQQQ#       #QQQQ  WM: CyberWindowManager (Glassmorphism)
QQQQQQQ#     #QQQQQ  Terminal: bash-in-browser
  QQQQQ ##### QQQQQ  CPU: 8-Core Virtual Processor @ 3.4GHz
                     Memory: 3940MiB / 16384MiB`;
      } else if (cmd === 'help') {
        output.textContent += `\nGNU bash, version 5.2.21(1)-release (x86_64-pc-linux-gnu)
Available Linux Commands:
  ls [-la]       - List directory contents
  cd [path]      - Change working directory (supports .. and ~)
  pwd            - Print name of current/working directory
  cat [file]     - Concatenate files and print on the standard output
  mkdir [dir]    - Make directories
  touch [file]   - Create an empty file
  rm [file]      - Remove directory entries
  echo [text]    - Write arguments to standard output (support > file)
  neofetch       - Display system information and ASCII art
  uname [-a]     - Print system information
  whoami         - Print effective userid
  hostname       - Print system hostname
  date           - Display the current time and date
  clear          - Clear the terminal screen`;
      } else if (cmd !== '') {
        output.textContent += `\nbash: ${cmd}: command not found. Type 'help' for command list.`;
      }

      termEl.scrollTop = termEl.scrollHeight;
    }
  });

  updatePrompt();
}

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

// ==========================================
// PAKETLER.TXT GÖRÜNTÜLEYİCİ
// ==========================================
function initReadmeApp(container) {
  const content = `=================================================
📦 CYBEROS LINUX - APT DEPOSU PAKET LİSTESİ
=================================================
Terminali açıp 'sudo apt install <paket-adi>' 
yazarak aşağıdaki uygulamaları kurabilirsiniz:

1. cmatrix
   Açıklama: Efsanevi yeşil Matrix dijital yağmur akışı!
   Komut:    sudo apt install cmatrix

2. sl
   Açıklama: Terminal ekranından geçen nostaljik buharlı tren!
   Komut:    sudo apt install sl

3. htop
   Açıklama: Etkileşimli dinamik CPU & RAM işlem yöneticisi.
   Komut:    sudo apt install htop

4. cowsay
   Açıklama: Konuşan sevimli terminal ineği!
   Komut:    sudo apt install cowsay

5. tetris
   Açıklama: Masaüstüne mini retro Tetris oyunu yükler!
   Komut:    sudo apt install tetris

6. clock
   Açıklama: Büyük dijital neon masaüstü saati.
   Komut:    sudo apt install clock
=================================================`;
  container.innerHTML = `
    <div style="height: 100%; display: flex; flex-direction: column; background: #181a26; color: #a29bfe; font-family: 'Fira Code', monospace; padding: 1rem; overflow-y: auto; font-size: 0.82rem; line-height: 1.5; white-space: pre-wrap; user-select: text;">${content}</div>
  `;
}

// ==========================================
// KURULAN UYGULAMALAR: TETRIS
// ==========================================
function initTetrisApp(container) {
  container.innerHTML = `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; background: #0c0d14; color: #fff; gap: 10px;">
      <div style="font-weight: 700; color: #ff4757; font-size: 1.1rem;">🕹️ Mini Tetris Arcade</div>
      <canvas id="mini-tetris" width="160" height="240" style="background: #000; border: 2px solid #333;"></canvas>
      <div style="font-size: 0.75rem; color: #888;">Yön Tuşları: Hareket | Yukarı: Döndür</div>
    </div>
  `;
  const cvs = container.querySelector('#mini-tetris');
  const tCtx = cvs.getContext('2d');
  tCtx.fillStyle = '#6c5ce7';
  tCtx.fillRect(40, 60, 80, 20);
  tCtx.fillStyle = '#00d2d3';
  tCtx.fillRect(60, 40, 20, 20);
}

// ==========================================
// KURULAN UYGULAMALAR: NEON SAAT
// ==========================================
function initClockApp(container) {
  container.innerHTML = `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; background: #090a10; color: #00d2d3; font-family: 'Fira Code', monospace;">
      <div id="big-digital-clock" style="font-size: 2.2rem; font-weight: 700; text-shadow: 0 0 20px #00d2d3;">00:00:00</div>
      <div style="font-size: 0.8rem; color: #888; margin-top: 5px;">CyberOS World Time</div>
    </div>
  `;
  const cEl = container.querySelector('#big-digital-clock');
  const timer = setInterval(() => {
    if (!document.body.contains(cEl)) {
      clearInterval(timer);
      return;
    }
    const d = new Date();
    cEl.textContent = d.toTimeString().split(' ')[0];
  }, 1000);
  const d = new Date();
  cEl.textContent = d.toTimeString().split(' ')[0];
}

function addAppToDesktop(appName) {
  const dtIcons = document.querySelector('.desktop-icons');
  const startList = document.querySelector('.start-list');
  const meta = {
    cmatrix: { icon: '📟', name: 'cmatrix (CLI)' },
    sl: { icon: '🚂', name: 'Steam Train' },
    htop: { icon: '📊', name: 'htop Monitor' },
    cowsay: { icon: '🐮', name: 'cowsay' },
    tetris: { icon: '🕹️', name: 'Tetris Arcade' },
    clock: { icon: '⏰', name: 'Neon Saat' }
  }[appName];

  if (!meta) return;

  // Masaüstü ikonu
  const iconDiv = document.createElement('div');
  iconDiv.className = 'desktop-icon';
  iconDiv.dataset.app = appName === 'clock' ? 'clock_app' : appName;
  iconDiv.innerHTML = `<div class="icon-img">${meta.icon}</div><div class="icon-label">${meta.name}</div>`;
  iconDiv.onclick = () => {
    if (appName === 'tetris' || appName === 'clock') {
      openApp(appName === 'clock' ? 'clock_app' : 'tetris');
    } else {
      openApp('terminal');
    }
  };
  dtIcons.appendChild(iconDiv);

  // Başlat Menüsü İkonu
  const itemDiv = document.createElement('div');
  itemDiv.className = 'start-item';
  itemDiv.dataset.app = iconDiv.dataset.app;
  itemDiv.innerHTML = `<span>${meta.icon}</span> ${meta.name}`;
  itemDiv.onclick = iconDiv.onclick;
  startList.appendChild(itemDiv);
}
