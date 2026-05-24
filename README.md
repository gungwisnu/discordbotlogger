# 🤖 Discord Logger & Analytics Bot (with Web Dashboard)

Discord bot logging premium berbasis Node.js & React (Vite) yang memantau seluruh aktivitas server Anda (Voice, Moderation, Member, Server, Activity) secara real-time dan menyajikannya dalam sebuah web dashboard glassmorphic yang interaktif.

## ✨ Fitur Utama

- 🔊 **Voice Logging Premium:** Melacak jam masuk/keluar voice, durasi nongkrong, perpindahan saluran, mic mute/unmute, deafen, kamera, dan screen share dengan pesan deskripsi super bersih (bebas redundansi) dan ID tersemat rapi di footer log.
- 🗑️ **Moderation & Purge Logs:** Mencatat pesan dihapus, pesan diedit, ban, unban, kick, timeout, serta bulk delete (purge pesan masal).
- 👤 **Member & Server Logging:** Mendeteksi member baru masuk, member keluar, pergantian nickname lokal, role baru ditambahkan/dihapus, serta modifikasi channel, role, dan emoji server.
- 🎮 **Gaming & Spotify Presence:** Melacak durasi bermain game (Minecraft, Valorant, dll.) serta riwayat lagu Spotify yang didengarkan anggota server.
- ⚙️ **Dashboard Web Glassmorphic:** Panel kontrol modern berbasis web untuk mengaktifkan/menonaktifkan kategori log, mengatur channel tujuan, serta dibekali **Simulasi Live Discord Embed** interaktif agar pengguna langsung memahami log.
- 🚀 **Hosting-Ready (Siap Cloud):**
  - Menggunakan Express static assets serving untuk performa optimal.
  - Mendukung Dynamic OAuth2 Redirect Callback (otomatis menyesuaikan domain).
  - Mendukung Persistent Volume Database untuk mengamankan data (`db.json`) agar tidak terhapus di cloud hosting ephemeral (seperti Render/Railway).

---

## 🛠️ Panduan Instalasi Lokal

1. Clone repositori ini:
   ```bash
   git clone https://github.com/gungwisnu/discordbotlogger.git
   cd discordbotlogger
   ```
2. Instal semua dependencies (backend & frontend):
   ```bash
   npm run install:all
   ```
3. Konfigurasikan file kredensial `.env` Anda (salin dari `.env.example`).
4. Build aset frontend:
   ```bash
   npm run build:frontend
   ```
5. Jalankan aplikasi gabungan secara lokal:
   ```bash
   npm start
   ```

---

## 🌐 Panduan Cloud Hosting (Render / Railway)

1. Buat repositori baru di GitHub (disarankan *Private* demi keamanan berkas `.env`).
2. Hubungkan repositori GitHub Anda ke penyedia cloud hosting Node.js seperti **Railway.app** atau **Render.com**.
3. Daftarkan environment variables berikut pada panel hosting Anda:
   - `DISCORD_TOKEN` (Token Bot Discord)
   - `DISCORD_CLIENT_ID` (ID Client Bot)
   - `DISCORD_CLIENT_SECRET` (Client Secret Bot)
   - `SESSION_SECRET` (Kata sandi acak pengaman sesi)
4. Buat sebuah **Persistent Volume / Disk Mount** sebesar `1 GB` di folder `/data` dan daftarkan variabel environment database:
   - `DATABASE_PATH` = `/data/db.json`
5. Daftarkan Domain Callback URL baru Anda di **Discord Developer Portal** -> menu **OAuth2** -> **Redirects** (misalnya `https://bot-anda.up.railway.app/api/auth/callback`).
