# 💻 Operating Simulator Web (CyberOS)

> Browser-based multi-window desktop operating system simulator featuring modern **Glassmorphism aesthetics** and an authentic Linux/Cyberpunk experience. Built with zero external dependencies using pure HTML5, CSS3, and Vanilla JavaScript.

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.0-purple.svg)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)
![Python 3](https://img.shields.io/badge/Python-3.x-3776AB?style=flat&logo=python&logoColor=white)
![i18n: TR/EN](https://img.shields.io/badge/Language-TR%20%7C%20EN-purple.svg)

---

## ✨ Features (Özellikler)

### 🌐 Multi-Language (Çoklu Dil)
- Instant **Turkish (TR)** and **English (EN)** switch button located on the taskbar system tray.

### 🪟 Desktop & Window Manager
- **Draggable Windows:** Grab window titlebars to freely move windows across the desktop.
- **Controls:** Minimize (`_`), Maximize/Restore (`□`), and Close (`✕`).
- **Z-Index Layering:** Automatic focus bringing clicked windows to foreground.
- **Taskbar & Start Menu:** Live digital clock, open app tabs, system tray, and user session menu.

### 📱 Built-in Native Applications & Linux Shell
1. 💻 **Linux Bash Terminal:**
   - Real Virtual In-Memory Filesystem (`/`, `/home/user`, `/etc`, `/bin`).
   - Essential Coreutils: `ls`, `cd`, `cat`, `pwd`, `mkdir`, `touch`, `rm`, `echo`, `uname -a`, `whoami`, `neofetch`, `clear`, `date`.
   - **Interactive APT Package Manager (`sudo apt install <pkg>`):** Dynamically install and spawn desktop software (e.g., `tetris`, `clock`, `htop`, `cmatrix`, `sl`, `cowsay`).
2. 📝 **Notepad:**
   - Text editor with persistent automatic `LocalStorage` saving across browser reloads.
3. 🧮 **Calculator:**
   - Safe whitelisted expression evaluator for standard arithmetic.
4. 🎨 **CyberPaint Studio:**
   - Canvas drawing board with color picker and brush size controls.
5. ⚙️ **Desktop Settings:**
   - Live wallpaper themes: *Cyber Deep*, *Synth Sunset*, *AMOLED Dark*, *Nord Frost*.

---

## 🚀 Quick Start & Local Server

Requires zero external packages (`npm install` not needed).

### 1. Clone the Repository
```bash
git clone git@github.com:devilteams-s/Operating-Simulator-Web.git
cd Operating-Simulator-Web
```

### 2. Launch Local Server

#### 🐧 Linux:
```bash
./start-server.sh
# or
python3 server.py
```

#### 🪟 Windows:
- Double click `start-server.bat` or run:
```cmd
python server.py
```

---

## 📄 License
This project is licensed under the [MIT License](LICENSE).
