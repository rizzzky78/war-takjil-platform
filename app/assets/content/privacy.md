# Kebijakan Privasi War Takjil

Pembaruan Terakhir: 4 Maret 2026

Selamat datang di War Takjil. Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi informasi Anda saat Anda menggunakan aplikasi kami.

## 1. Informasi yang Kami Kumpulkan

### a. Informasi Akun

Kami menggunakan **Clerk** untuk keperluan autentikasi. Saat Anda masuk menggunakan akun Google Anda, kami mengumpulkan:

- Nama lengkap dan alamat email Anda.
- Foto profil dasar yang disediakan oleh Google (jika ada).

### b. Data Lokasi

Aplikasi ini sangat bergantung pada fitur lokasi (Geolocation) untuk menampilkan spot takjil di sekitar Anda.

- Kami meminta izin akses lokasi untuk memusatkan peta di wilayah Anda.
- Data lokasi yang Anda unggah ketika menambahkan "Spot Takjil" akan disimpan secara publik untuk dilihat oleh pengguna lain.

### c. Gambar dan Konten

Saat Anda mengunggah gambar spot takjil, gambar tersebut langsung diunggah menggunakan layanan pihak ketiga (**Cloudinary**).

- Gambar-gambar ini bersifat publik dan dapat dilihat oleh semua pengguna.
- Pastikan Anda tidak mengunggah gambar yang mengandung informasi pribadi atau sensitif.

## 2. Bagaimana Kami Menggunakan Informasi Anda

Informasi yang dikumpulkan digunakan secara eksklusif untuk memberikan pengalaman terbaik di aplikasi War Takjil:

- **Titik Lokasi:** Membantu pengguna lain menemukan takjil yang tersedia (secara real-time).
- **Akun:** Mengidentifikasi siapa yang melaporkan atau memperbarui status spot takjil tersebut.
- Kami **tidak menjual** atau membagikan data Anda dengan pihak ketiga mana pun untuk tujuan pemasaran.

## 3. Penyimpanan dan Retensi Data

- Data lokasi dan status (tersedia, mulai habis, habis) disimpan di **Firebase Firestore**.
- Postingan spot takjil dikonfigurasi untuk kadaluarsa (auto-expire) dalam waktu 2 jam guna menjaga agar data yang ditampilkan tetap relevan.
- Cache lokal pada peramban/perangkat Anda (melalui IndexedDB) digunakan untuk meminimalkan beban akses dengan masa aktif sekitar 5 menit.

## 4. Keamanan

Kami berusaha melindungi setiap data Anda dengan menggunakan penyedia layanan yang aman (**Clerk**, **Firebase**, dan **Cloudinary**). Namun, perlu diingat bahwa tidak ada metode transmisi data melalui internet yang 100% aman.

## 5. Perubahan Kebijakan Privasi

Kebijakan Privasi ini dapat diperbarui sewaktu-waktu. Perubahan akan langsung tercermin pada halaman ini. Anda diharapkan memeriksa halaman ini secara berkala.

## 6. Kontak Kami

Jika Anda memiliki pertanyaan mengenai Kebijakan Privasi ini, silakan hubungi pengembang aplikasi.
