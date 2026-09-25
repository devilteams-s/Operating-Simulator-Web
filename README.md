# 💻 Operating Simulator Web (CyberOS)

> Tarayıcı içinde çalışan, çok pencereli, modern cam efektli (**Glassmorphism**) ve retro/cyberpunk temalı web tabanlı **Masaüstü İşletim Sistemi Simülatörü**. Sıfır harici kütüphane bağımlılığı ile saf HTML5, modern CSS3 ve Vanilla JavaScript ile inşa edilmiştir.

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.0-purple.svg)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)
![Python 3](https://img.shields.io/badge/Python-3.x-3776AB?style=flat&logo=python&logoColor=white)

---

## ✨ Özellikler

### 🪟 Masaüstü & Pencere Yöneticisi (Window Manager)
- **Sürükle & Bırak (Draggable Windows):** Başlık çubuğundan tutarak pencereleri masaüstünde serbestçe taşıma.
- **Pencere Kontrolleri:** Simge durumuna küçült (`_`), tam ekran yap (`□`), ve kapat (`✕`).
- **Z-Index Katman Odaklanması:** Tıklanan pencere otomatik olarak en öne gelir.
- **Görev Çubuğu (Taskbar) & Canlı Saat:** Açık pencereleri sekme olarak izleme ve dijital saat.
- **Başlat Menüsü:** Kullanıcı profili, hızlı uygulama listesi ve sistemi yeniden başlatma kısayolu.

### 📱 Yerleşik Uygulamalar (Native Built-in Apps)
1. 💻 **Hacker Terminali (Bash/CLI):**
   - Etkileşimli komut satırı: `help`, `neofetch` (sistem bilgileri), `matrix` (veri akışı), `clear`, `date`, `apps`, `echo [metin]`.
2. 📝 **Not Defteri (Notepad):**
   - Yazdığınız notları tarayıcının yerel hafızasına (`LocalStorage`) otomatik kaydeder, sayfa yenilense de silinmez.
3. 🧮 **Hesap Makinesi:**
   - Dört işlem yapabilen, temiz ve fonksiyonel retro hesap makinesi.
4. 🎨 **CyberPaint Studio:**
   - Renk seçici, fırça kalınlığı ayarı ve tuvali temizleme özellikli Canvas çizim aracı.
5. ⚙️ **Masaüstü Kişiselleştirme (Ayarlar):**
   - Canlı arka plan temaları: *Cyber Deep*, *Synth Sunset*, *AMOLED Dark*, *Nord Frost*.

---

## 🚀 Kurulum ve Yerel Sunucu Başlatma

Harici hiçbir paket veya kütüphane (`npm install` vb.) gerektirmez.

### 1. Depoyu Klonlayın
```bash
git clone git@github.com:devilteams-s/Operating-Simulator-Web.git
cd Operating-Simulator-Web
```

### 2. Yerel Sunucuyu Başlatın

Projede hem **Linux** hem **Windows** için otomatik tarayıcı açan Python geliştirme sunucusu hazır bulunmaktadır:

#### 🐧 Linux:
```bash
# Betiği çalıştırın (Otomatik tarayıcı açar)
./start-server.sh

# Veya doğrudan Python ile:
python3 server.py
```

#### 🪟 Windows:
- `start-server.bat` dosyasına **çift tıklayın**,
- Veya Komut İstemi'nde (CMD / PowerShell):
```cmd
python server.py
```

> **Not:** Sunucu başlatıldığında varsayılan tarayıcınızda otomatik olarak `http://localhost:5175` adresi açılır. Port meşgulse sıradaki boş port otomatik seçilir.

---

## 📁 Proje Yapısı

```
Operating-Simulator-Web/
├── index.html        # Masaüstü, görev çubuğu ve pencerelerin ana HTML şablonu
├── style.css         # Modern Glassmorphism stilleri ve tema değişkenleri
├── webos.js          # Pencere yöneticisi, sürükle-bırak mantığı ve dahili uygulamalar
├── server.py         # Çapraz platform Python yerel geliştirme sunucusu
├── start-server.sh   # Linux tek tıkla başlatma betiği
├── start-server.bat  # Windows tek tıkla başlatma betiği
├── README.md         # Dokümantasyon
└── LICENSE           # MIT Lisansı
```

---

## 📄 Lisans
Bu proje [MIT Lisansı](LICENSE) altında lisanslanmıştır.
