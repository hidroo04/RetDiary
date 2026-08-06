# Pendahuluan
## Latar Belakang

Program Studi Perkebunan di Politeknik Negeri Lampung (Polinela) memiliki sejumlah besar materi perkuliahan yang selama ini disampaikan dan didistribusikan kepada mahasiswa melalui cara-cara konvensional, seperti pemberian langsung saat perkuliahan, grup pesan instan, atau media penyimpanan berbagi file yang tersebar dan tidak terstruktur. Kondisi ini menyulitkan mahasiswa dalam mencari kembali materi yang telah diberikan, terutama ketika materi tersebut dibutuhkan kembali untuk keperluan belajar mandiri, mengulang pemahaman, atau persiapan ujian.

Di sisi lain, dosen pengampu matakuliah juga tidak memiliki media terpusat untuk mengelola dan memperbarui materi perkuliahan yang telah dibagikan. Ketiadaan sistem terpusat ini menyebabkan materi yang beredar di kalangan mahasiswa sering kali tidak konsisten, sulit dilacak versi terbarunya, dan tidak tertata berdasarkan matakuliah maupun urutan pertemuan.

Berdasarkan permasalahan tersebut, dibutuhkan sebuah sistem berbasis website yang dapat menjadi pusat penyimpanan dan distribusi materi perkuliahan program studi Perkebunan Polinela, yang dapat diakses secara mudah oleh mahasiswa tanpa hambatan proses login, sekaligus memberikan dosen kendali penuh untuk mengelola konten materi secara terstruktur. Atas dasar inilah dikembangkan RetDiary, sebuah website materi perkuliahan yang terdiri dari dua sisi layanan: website publik untuk mahasiswa dan panel admin untuk dosen.

## Tujuan Proyek

Berdasarkan latar belakang di atas, tujuan dari pengembangan website RetDiary adalah sebagai berikut:

1. Membangun website yang memudahkan mahasiswa program studi Perkebunan dalam mengakses dan mencari materi perkuliahan secara cepat tanpa perlu melakukan proses login.
2. Menyediakan panel khusus bagi dosen untuk melakukan pengelolaan materi perkuliahan secara mandiri, meliputi penambahan, pembaruan, dan penghapusan materi (CRUD), baik dalam bentuk tulisan langsung maupun berkas PDF.
3. Menyediakan tampilan materi yang tertata dan mudah dijelajahi melalui mekanisme scroll pada sisi mahasiswa.
4. Membangun sistem yang responsif dan mampu menangani beban akses hingga 500 pengguna secara bersamaan tanpa penurunan performa yang signifikan.
5. Menerapkan penanganan kesalahan (error handling) yang baik pada setiap fitur untuk menjaga stabilitas dan keandalan sistem.
6. Menjamin kualitas setiap fitur yang dikembangkan melalui proses pengujian (testing) yang terstruktur dan terdokumentasi, sehingga setiap perubahan atau penghapusan fitur dapat diverifikasi kelayakannya sebelum digunakan.

#Ruang Lingkup

Ruang lingkup pengembangan website RetDiary mencakup hal-hal berikut:

1. Website mahasiswa (publik)
- Dapat diakses oleh siapa saja tanpa memerlukan proses login/autentikasi.
- Menampilkan daftar matakuliah beserta materi perkuliahan yang telah diinputkan oleh dosen.
- Menampilkan konten materi dalam bentuk tulisan, berkas PDF yang dapat diunduh/dilihat, serta foto-foto pendukung.
- Tampilan materi disajikan dengan mekanisme scroll ke bawah.
2. Website admin (dosen)
- Memerlukan proses autentikasi untuk dapat diakses.
- Menyediakan fitur CRUD (Create, Read, Update, Delete) materi perkuliahan.
- Mendukung input materi berupa tulisan langsung maupun unggah berkas PDF.
- Mendukung unggah beberapa foto pendukung untuk setiap materi.
4. Teknologi sistem
- Backend dibangun menggunakan Node.js dengan framework NestJS sebagai platform utama pengolahan data dan penyedia API bagi kedua sisi website.
- Frontend dibangun menggunakan React, Vite, dan TypeScript, baik untuk website mahasiswa (publik) maupun website admin (dosen), guna meningkatkan performa dan keandalan kode melalui penerapan static typing.
- Basis data menggunakan PostgreSQL sebagai database relasional untuk tahap pengembangan saat ini.
- Sistem dirancang untuk menangani traffic hingga 500 pengguna secara bersamaan dengan tetap menjaga kecepatan dan responsivitas.
- Dilengkapi dengan mekanisme error handling pada setiap endpoint/fitur.Pengujian sistem
- Setiap fitur yang dikembangkan disertai dengan pengujian (testing) yang disimpan pada folder terpisah dari kode utama.
- Pengujian dilakukan setiap kali terdapat pengembangan fitur baru maupun penghapusan fitur, untuk memastikan sistem tetap berjalan sesuai dengan yang diharapkan.
5. Batasan proyek
- Ruang lingkup materi yang dikelola terbatas pada matakuliah di lingkup program studi Perkebunan Polinela.
- Website tidak mencakup fitur interaksi sosial (komentar, forum diskusi) di luar fungsi utama sebagai media distribusi materi perkuliahan.

# Alur Penggunaan Sistem (User Flow)

Berikut alur penggunaan sistem RetDiary dari awal hingga selesai, dibagi menjadi dua alur utama: alur mahasiswa (sisi publik) dan alur dosen (sisi admin).

## Alur Mahasiswa (Website Publik)
- Mahasiswa membuka website RetDiary melalui browser tanpa perlu melakukan registrasi atau login.
- Sistem menampilkan halaman utama berisi daftar matakuliah yang tersedia beserta informasi jadwal perkuliahan.
- Mahasiswa memilih matakuliah tertentu, atau menggunakan fitur pencarian untuk mencari matakuliah/materi berdasarkan kata kunci.
- Sistem menampilkan daftar materi yang terdapat dalam matakuliah tersebut, tersusun dengan mekanisme scroll ke bawah.
- Mahasiswa memilih salah satu materi untuk dibuka.
- Sistem menampilkan detail materi, berupa konten tulisan, berkas PDF (dapat dilihat/diunduh), serta foto-foto pendukung.
- Mahasiswa dapat kembali ke daftar materi atau matakuliah lain untuk melanjutkan pencarian materi berikutnya.
- Proses selesai ketika mahasiswa telah menemukan dan membaca materi yang dibutuhkan.
# Alur Dosen (Panel Admin)
- Dosen membuka halaman admin dan melakukan login menggunakan akun yang telah terdaftar.
- Sistem melakukan autentikasi (JWT); jika berhasil, dosen diarahkan ke dashboard admin.
- Dosen memilih matakuliah yang akan dikelola, atau membuat matakuliah baru jika belum tersedia.
- Dosen menambahkan materi baru dengan mengisi form input, meliputi:
- Judul dan konten materi (tulisan langsung), dan/atau
- Unggah berkas PDF materi, dan/atau
- Unggah satu atau beberapa foto pendukung.
- Sistem melakukan validasi input dan error handling (misalnya format file, ukuran file, field wajib).
- Dosen dapat mengakses menu Jadwal untuk mengelola (menambah, mengubah, menghapus) jadwal perkuliahan.
- Materi dan jadwal yang berhasil disimpan langsung tersedia dan dapat diakses oleh mahasiswa di website publik.
- Dosen dapat kembali ke materi yang telah dibuat untuk melakukan pembaruan (update) konten maupun penghapusan (delete) materi kapan pun diperlukan.
- Setiap perubahan (tambah/ubah/hapus) melalui proses testing terhadap fitur terkait sebelum dianggap selesai dan stabil digunakan.
- Proses selesai ketika materi telah tersimpan, tervalidasi, dan tampil dengan benar di sisi mahasiswa.

# Daftar Fitur dan Kebutuhan Fungsional (Functional Requirements)

Bagian ini merangkum seluruh fitur sistem, dikelompokkan per halaman/modul yang sudah kita tetapkan di user flow sebelumnya, beserta kebutuhan fungsionalnya masing-masing.

A. Modul Web Publik (Mahasiswa)
Halaman Beranda (P1)
Kode	Fitur	Kebutuhan Fungsional
FR-01	Tampilkan daftar matakuliah	Sistem menampilkan seluruh matakuliah yang tersedia, tanpa memerlukan login
FR-02	Navigasi ke detail matakuliah	Mahasiswa dapat mengklik salah satu matakuliah untuk melihat daftar materinya
Halaman Pencarian (P2)
Kode	Fitur	Kebutuhan Fungsional
FR-03	Pencarian matakuliah/materi	Sistem menyediakan input pencarian berbasis kata kunci dan menampilkan hasil yang relevan
FR-04	Penanganan hasil kosong	Sistem menampilkan pesan yang jelas apabila hasil pencarian tidak ditemukan
Halaman Detail Matakuliah (P3)
Kode	Fitur	Kebutuhan Fungsional
FR-05	Tampilkan daftar materi per matakuliah	Sistem menampilkan seluruh materi dalam satu matakuliah, tersusun sesuai urutan pertemuan
FR-06	Scroll berkelanjutan	Daftar materi dimuat secara bertahap saat mahasiswa scroll ke bawah (infinite scroll), tanpa perlu reload halaman
Halaman Detail Materi (P4)
Kode	Fitur	Kebutuhan Fungsional
FR-07	Tampilkan konten tulisan	Sistem menampilkan isi materi berupa teks yang diinput dosen
FR-08	Tampilkan/unduh PDF	Sistem menampilkan preview atau tautan unduh berkas PDF materi, jika tersedia
FR-09	Tampilkan galeri foto	Sistem menampilkan seluruh foto pendukung suatu materi dalam bentuk galeri yang dapat diperbesar
FR-10	Navigasi antar materi	Mahasiswa dapat kembali ke daftar materi atau berpindah ke materi lain dalam matakuliah yang sama
Halaman Jadwal (P5)
Kode	Fitur	Kebutuhan Fungsional
FR-32	Tampilkan daftar jadwal perkuliahan	Sistem menampilkan informasi jadwal perkuliahan matakuliah, termasuk hari, jam, dan ruangan
B. Modul Web Admin (Dosen)
Halaman Login (A1)
Kode	Fitur	Kebutuhan Fungsional
FR-11	Autentikasi dosen	Sistem memvalidasi email/username dan password dosen sebelum memberikan akses ke panel admin
FR-12	Penanganan login gagal	Sistem menampilkan pesan kesalahan yang jelas jika kredensial salah, tanpa membocorkan informasi akun mana yang salah
Halaman Dashboard (A2)
Kode	Fitur	Kebutuhan Fungsional
FR-13	Ringkasan matakuliah dosen	Sistem menampilkan daftar matakuliah yang dikelola oleh dosen yang sedang login
FR-13A Logout Dosen dapat keluar dari sistem. Sistem menghapus JWT/token dari client kemudian mengarahkan pengguna kembali ke halaman login.
FR-13B Dashboard Summary Menampilkan jumlah matakuliah, jumlah materi, dan materi terbaru
Halaman Kelola Matakuliah (A3)
Kode	Fitur	Kebutuhan Fungsional
FR-14	Tambah matakuliah	Dosen dapat menambahkan matakuliah baru dengan mengisi nama, kode, dan deskripsi
FR-14A kode matakuliah unik Sistem memastikan kode matakuliah bersifat unik.
FR-15	Ubah matakuliah	Dosen dapat memperbarui data matakuliah yang sudah ada
FR-16	Hapus matakuliah	Dosen dapat menghapus matakuliah beserta seluruh materi di dalamnya, dengan konfirmasi sebelum penghapusan
Halaman Kelola Materi (A4)
Kode	Fitur	Kebutuhan Fungsional
FR-17	Tampilkan daftar materi	Sistem menampilkan seluruh materi dalam satu matakuliah kepada dosen, beserta status (tulisan/PDF/foto tersedia atau tidak)
FR-18	Hapus materi	Dosen dapat menghapus materi tertentu, dengan konfirmasi sebelum penghapusan
Halaman Form Materi — Tambah/Ubah (A5)
Kode	Fitur	Kebutuhan Fungsional
FR-19	Input konten tulisan	Dosen dapat menulis/mengubah isi materi dalam bentuk teks
FR-20	Upload PDF	Dosen dapat mengunggah satu berkas PDF sebagai materi, dengan validasi format dan ukuran file
FR-21	Upload foto pendukung	Dosen dapat mengunggah lebih dari satu foto pendukung untuk satu materi
FR-22	Validasi input	Sistem memvalidasi field wajib (judul, minimal satu jenis konten) sebelum materi dapat disimpan
FR-23	Simpan dan publikasikan	Materi yang berhasil disimpan langsung tersedia dan tampil di web publik (P4)
Halaman Kelola Jadwal (A6)
Kode	Fitur	Kebutuhan Fungsional
FR-33	Tampilkan daftar jadwal	Sistem menampilkan seluruh jadwal yang ada kepada dosen
FR-34	Tambah jadwal	Dosen dapat menambahkan jadwal baru dengan menentukan matakuliah, hari, jam, dan ruangan
FR-35	Ubah jadwal	Dosen dapat memperbarui jadwal yang sudah ada
FR-36	Hapus jadwal	Dosen dapat menghapus jadwal perkuliahan
C. Fitur Lintas Sistem (Cross-cutting)
Kode	Fitur	Kebutuhan Fungsional
FR-24	Error handling	Setiap endpoint/fitur menangani kondisi gagal (data tidak ditemukan, upload gagal, koneksi database gagal) dan mengembalikan pesan kesalahan yang jelas tanpa membocorkan detail teknis internal
FR-25	Testing per fitur	Setiap fitur yang dikembangkan atau dihapus disertai unit/integration test yang disimpan di folder terpisah dari kode utama, dan dijalankan setiap ada perubahan fitur
FR-26	Responsivitas tampilan	Seluruh halaman (publik dan admin) menyesuaikan tampilan pada perangkat desktop, tablet, dan mobile
FR-27	Performa akses bersamaan	Sistem tetap responsif saat diakses hingga 500 pengguna secara bersamaan, terutama pada endpoint publik yang bersifat read-heavy
FR-28 Mahasiswa dapat mengurutkan materi berdasarkan urutan pertemuan.
FR-29 Sistem menampilkan loading indicator ketika data sedang diproses.
FR-30 Jika suatu matakuliah belum memiliki materi maka sistem menampilkan halaman kosong beserta informasi kepada mahasiswa.
FR-31 Sistem mencatat aktivitas tambah, ubah, dan hapus materi beserta waktu dan pengguna yang melakukannya.

# Kebutuhan Non-Fungsional (Non-Functional Requirements)

Berikut kebutuhan non-fungsional untuk RetDiary, disusun berdasarkan seluruh keputusan teknis dan target yang sudah ditetapkan sebelumnya.

NFR-1. Performance (Kinerja)
Kode	Kebutuhan	Target
NFR-1.1	Waktu muat halaman	Halaman publik (Beranda, Detail Matakuliah, Detail Materi) dapat dimuat dalam < 2 detik pada koneksi standar
NFR-1.2	Response time API	Endpoint publik (read-only) merespons dalam < 300ms, didukung caching
NFR-1.3	Infinite scroll	Pemuatan materi tambahan saat scroll tidak menyebabkan jeda/lag yang terasa oleh pengguna
NFR-1.4	Optimasi gambar	Foto pendukung dikompresi dan disajikan dalam ukuran sesuai kebutuhan tampilan (thumbnail vs full-size) agar tidak memperlambat loading
NFR-2. Scalability (Skalabilitas)
Kode	Kebutuhan	Target
NFR-2.1	Concurrent user	Sistem mampu menangani hingga 500 pengguna secara bersamaan tanpa penurunan performa signifikan, terutama pada sisi publik yang read-heavy
NFR-2.2	Pemanfaatan sumber daya	Backend Node.js memanfaatkan multi-core (cluster mode) agar beban terdistribusi merata
NFR-3. Reliability & Availability (Keandalan)
Kode	Kebutuhan	Target
NFR-3.1	Uptime	Sistem tersedia minimal 99% dari waktu operasional
NFR-3.2	Error handling	Setiap kegagalan (upload gagal, koneksi database terputus, data tidak ditemukan) ditangani dengan graceful, tidak menyebabkan sistem crash, dan menampilkan pesan yang informatif bagi pengguna
NFR-3.3	Testing	Setiap fitur memiliki unit/integration test tersimpan di folder terpisah, dijalankan setiap ada penambahan atau penghapusan fitur, sebelum perubahan dianggap selesai
NFR-4. Security (Keamanan)
Kode	Kebutuhan	Target
NFR-4.1	Proteksi endpoint admin	Seluruh endpoint CRUD (matakuliah, materi) hanya dapat diakses dosen yang terautentikasi (JWT)
NFR-4.2	Rate limiting	Endpoint publik dilindungi dari abuse/spam request karena tidak memerlukan login
NFR-4.3	Validasi upload	Berkas PDF dan foto divalidasi format dan ukurannya sebelum disimpan, untuk mencegah upload berkas berbahaya
NFR-4.4	Sanitasi input	Input pencarian dan form materi disanitasi untuk mencegah injection (SQL injection, XSS)
NFR-5. Usability (Kebergunaan)
Kode	Kebutuhan	Target
NFR-5.1	Kemudahan akses	Mahasiswa dapat langsung menggunakan sistem tanpa proses registrasi/login
NFR-5.2	Navigasi intuitif	Struktur halaman dan alur (Beranda → Matakuliah → Materi) mudah dipahami tanpa panduan tambahan
NFR-5.3	Rekomendasi materi	Fitur rekomendasi materi selanjutnya membantu mahasiswa melanjutkan pembelajaran tanpa perlu mencari manual
NFR-6. Compatibility (Kompatibilitas)
Kode	Kebutuhan	Target
NFR-6.1	Responsivitas	Seluruh halaman menyesuaikan tampilan pada perangkat desktop, tablet, dan mobile
NFR-6.2	Kompatibilitas browser	Sistem berjalan baik di browser modern (Chrome, Firefox, Edge, Safari versi terbaru)
NFR-7. Maintainability (Pemeliharaan)
Kode	Kebutuhan	Target
NFR-7.1	Struktur kode	Backend dan frontend menggunakan struktur modular yang jelas (controller-service-repository di backend)
NFR-7.2	Type safety	Frontend menggunakan TypeScript untuk mengurangi bug akibat kesalahan tipe data
NFR-7.3	Dokumentasi pengujian	Folder testing terpisah dari kode utama, memudahkan pengecekan fitur mana yang sudah/belum diuji
NFR-8. Portability (Portabilitas)
Kode	Kebutuhan	Target
NFR-8.1	Database	Menggunakan PostgreSQL untuk tahap pengembangan saat ini, dengan skema yang dirancang cukup generik agar migrasi ke database relasional lain dimungkinkan di kemudian hari bila diperlukan

# Prioritas Fitur — Metode MoSCoW

Must Have (wajib ada, sistem tidak berfungsi tanpa ini)
Kode	Fitur
FR-01	Tampilkan daftar matakuliah
FR-02	Navigasi ke detail matakuliah
FR-03	Pencarian matakuliah/materi
FR-05	Tampilkan daftar materi per matakuliah
FR-06	Scroll berkelanjutan (infinite scroll)
FR-07	Tampilkan konten tulisan
FR-08	Tampilkan/unduh PDF
FR-09	Tampilkan galeri foto
FR-11	Autentikasi dosen
FR-14	Tambah matakuliah
FR-15	Ubah matakuliah
FR-16	Hapus matakuliah
FR-17	Tampilkan daftar materi (admin)
FR-18	Hapus materi
FR-19	Input konten tulisan
FR-20	Upload PDF
FR-21	Upload foto pendukung
FR-22	Validasi input form materi
FR-23	Simpan dan publikasikan materi
FR-24	Error handling
FR-25	Testing per fitur
FR-26	Responsivitas tampilan
FR-27	Performa akses 500 user bersamaan
FR-32	Tampilkan daftar jadwal perkuliahan (publik)
FR-33	Tampilkan daftar jadwal (admin)
FR-34	Tambah jadwal
FR-35	Ubah jadwal
FR-36	Hapus jadwal

27 fitur — ini adalah inti sistem: tanpa fitur-fitur ini, RetDiary tidak dapat menjalankan fungsi dasarnya sebagai media distribusi materi perkuliahan dan informasi jadwal.

Should Have (penting, tapi sistem masih bisa berjalan tanpanya di rilis awal)
Kode	Fitur
FR-04	Penanganan hasil pencarian kosong
FR-10	Navigasi antar materi (sebelumnya materi berikutnya berupa tombol manual)
FR-12	Penanganan login gagal
FR-13	Ringkasan matakuliah di dashboard dosen
FR-28	Rekomendasi materi selanjutnya berdasarkan urutan pertemuan

5 fitur — meningkatkan kualitas pengalaman pengguna, layak dikerjakan setelah fitur Must Have stabil.

Could Have (nice-to-have, dikerjakan jika waktu memungkinkan)
Kode	Fitur
FR-29	Penanganan kondisi materi terakhir (pesan "sudah menyelesaikan seluruh materi")

1 fitur — edge case dari FR-28, tidak kritikal tapi memperhalus pengalaman.

Won't Have (di luar cakupan untuk rilis ini)

Berdasarkan batasan proyek yang sudah ditetapkan di bagian Pendahuluan:

Fitur	Alasan
Fitur interaksi sosial (komentar, forum diskusi)	Di luar ruang lingkup proyek — fokus sistem adalah distribusi materi, bukan interaksi sosial
Personalisasi rekomendasi berbasis histori mahasiswa	Tidak memungkinkan karena web publik tanpa login
Multi-role admin (misal admin prodi terpisah dari dosen)	Belum dibutuhkan pada skala saat ini — cukup satu peran dosen
Notifikasi materi baru (email/push)	Belum menjadi kebutuhan inti, dapat dipertimbangkan di iterasi berikutnya

# Skema Database (ERD)

RetDiary menggunakan 4 tabel utama:

- Satu **dosen** dapat mengelola banyak **matakuliah**
- Satu **matakuliah** memiliki banyak **materi**, tersusun berdasarkan kolom `urutan`
- Satu **materi** dapat memiliki banyak **foto pendukung**
- Konten materi (tulisan dan/atau PDF) disimpan langsung dalam tabel `materi`

\`\`\`mermaid
erDiagram
  DOSEN ||--o{ MATAKULIAH : mengelola
  MATAKULIAH ||--o{ MATERI : memiliki
  MATERI ||--o{ FOTO_MATERI : memiliki
  MATAKULIAH ||--o{ JADWAL : memiliki
  DOSEN {
    uuid id PK
    string nama
    string email
    string password_hash
  }
  MATAKULIAH {
    uuid id PK
    uuid dosen_id FK
    string nama
    string kode
    text deskripsi
  }
  MATERI {
    uuid id PK
    uuid matakuliah_id FK
    string judul
    text konten
    string pdf_url
    int urutan
    timestamp created_at
    timestamp updated_at
  }
  FOTO_MATERI {
    uuid id PK
    uuid materi_id FK
    string url_foto
    int urutan
  }
  JADWAL {
    uuid id PK
    uuid matakuliah_id FK
    string hari
    string jam_mulai
    string jam_selesai
    string ruangan
  }
```

### Penjelasan tabel

| Tabel | Fungsi |
|---|---|
| `dosen` | Data akun dosen untuk login panel admin, `password_hash` disimpan dalam bentuk hash |
| `matakuliah` | Data matakuliah, terhubung ke `dosen` melalui `dosen_id` |
| `materi` | Tabel inti — menyimpan tulisan (`konten`), tautan PDF (`pdf_url`), dan `urutan` untuk penyusunan materi sekaligus fitur rekomendasi materi selanjutnya |
| `foto_materi` | Foto pendukung materi, relasi satu-ke-banyak terhadap `materi` |
| `jadwal` | Tabel informasi jadwal perkuliahan, berelasi dengan `matakuliah` |

### Catatan desain

- Foto dan PDF disimpan sebagai URL/path, bukan file binary — file aslinya disimpan di object storage
- Seluruh `id` menggunakan UUID untuk mencegah ID ditebak dari luar
- Kolom `konten` dan `pdf_url` bersifat nullable, karena satu materi bisa hanya berisi tulisan saja, PDF saja, atau keduanya

# Desain API Endpoint

API dipisah menjadi dua kelompok: `/api/public/*` (read-only, tanpa autentikasi) dan `/api/admin/*` (dilindungi JWT, khusus dosen).

### Public API (Web Mahasiswa)

| Method | Endpoint | Deskripsi | FR terkait |
|---|---|---|---|
| GET | `/api/public/matakuliah` | Mengambil daftar seluruh matakuliah | FR-01 |
| GET | `/api/public/matakuliah/:id` | Mengambil detail satu matakuliah beserta info dasarnya | FR-02 |
| GET | `/api/public/matakuliah/:id/materi?page=` | Mengambil daftar materi dalam matakuliah, mendukung pagination untuk infinite scroll | FR-05, FR-06 |
| GET | `/api/public/materi/:id` | Mengambil detail materi: konten tulisan, `pdf_url`, daftar foto pendukung | FR-07, FR-08, FR-09 |
| GET | `/api/public/materi/:id/rekomendasi` | Mengambil materi selanjutnya berdasarkan `urutan` dalam matakuliah yang sama | FR-28, FR-29 |
| GET | `/api/public/search?q=` | Mencari matakuliah/materi berdasarkan kata kunci | FR-03, FR-04 |
| GET | `/api/public/jadwal` | Mengambil seluruh daftar jadwal perkuliahan | FR-32 |

### Admin API (Web Dosen)

| Method | Endpoint | Deskripsi | FR terkait |
|---|---|---|---|
| POST | `/api/admin/auth/login` | Autentikasi dosen, mengembalikan JWT access token | FR-11, FR-12 |
| POST | `/api/admin/auth/logout` | Menghapus sesi login (JWT di client atau blacklist token bila digunakan) kemudian mengembalikan response berhasil logout.| Logout | FR-13A | 
| GET | `/api/admin/dashboard` | Mengambil ringkasan matakuliah milik dosen yang sedang login | FR-13 |
| GET | `/api/admin/matakuliah` | Mengambil daftar matakuliah milik dosen yang sedang login | FR-13 |
| POST | `/api/admin/matakuliah` | Menambahkan matakuliah baru | FR-14 |
| PUT | `/api/admin/matakuliah/:id` | Memperbarui data matakuliah | FR-15 |
| DELETE | `/api/admin/matakuliah/:id` | Menghapus matakuliah beserta seluruh materinya (dengan konfirmasi di sisi frontend) | FR-16 |
| GET | `/api/admin/matakuliah/:id/materi` | Mengambil daftar materi dalam matakuliah, termasuk status kelengkapan konten | FR-17 |
| POST | `/api/admin/materi` | Menambahkan materi baru (tulisan dan/atau upload PDF) | FR-19, FR-20, FR-22, FR-23 |
| PUT | `/api/admin/materi/:id` | Memperbarui materi yang sudah ada | FR-19, FR-20, FR-22 |
| DELETE | `/api/admin/materi/:id` | Menghapus materi tertentu (dengan konfirmasi di sisi frontend) | FR-18 |
| POST | `/api/admin/materi/:id/foto` | Mengunggah satu atau beberapa foto pendukung untuk materi | FR-21 |
| DELETE | `/api/admin/foto/:id` | Menghapus satu foto pendukung dari materi | FR-21 |
| GET | `/api/admin/jadwal` | Mengambil daftar jadwal | FR-33 |
| POST | `/api/admin/jadwal` | Menambahkan jadwal baru | FR-34 |
| PUT | `/api/admin/jadwal/:id` | Memperbarui data jadwal | FR-35 |
| DELETE | `/api/admin/jadwal/:id` | Menghapus data jadwal | FR-36 |

### Konvensi umum

- Seluruh response menggunakan format JSON dengan struktur konsisten: `{ "success": boolean, "data": ..., "message": string }`
- Endpoint admin memerlukan header `Authorization: Bearer <token>`, divalidasi melalui middleware JWT sebelum mencapai controller
- Endpoint publik dilindungi rate limiting (misalnya maksimum 100 request/menit per IP) untuk mencegah abuse
- Endpoint yang mengembalikan daftar (list) mendukung query parameter `page` dan `limit` untuk pagination
- Setiap endpoint mengembalikan HTTP status code yang sesuai (200, 201, 400, 401, 404, 500) beserta pesan error yang jelas, sesuai kebutuhan NFR-3.2 (error handling)

# Strategi Loading (Target < 2 Detik)

Untuk mencapai target NFR-1.1 (load halaman publik < 2 detik), strategi diterapkan pada beberapa lapisan sekaligus, karena beban terberat RetDiary ada pada query database berulang dan ukuran foto pendukung.

### 1. Lapisan database & backend

| Strategi | Penjelasan |
|---|---|
| Redis cache | Cache hasil query daftar matakuliah dan materi (TTL 5-10 menit), invalidasi otomatis saat dosen update/tambah/hapus |
| Database indexing | Index pada `matakuliah_id`, `urutan` di tabel `materi`, dan kolom pencarian |
| Query pagination | Endpoint list materi menggunakan `LIMIT`/`OFFSET` atau cursor-based pagination, tidak memuat seluruh materi sekaligus |
| Response compression | Aktifkan gzip/brotli compression di NestJS untuk memperkecil ukuran JSON response |
| Select kolom secukupnya | List materi hanya mengambil `judul` dan `urutan`, detail lengkap baru diambil saat masuk ke Detail Materi |

### 2. Lapisan foto

| Strategi | Penjelasan |
|---|---|
| Resize saat upload | Generate 2-3 ukuran per foto (thumbnail, medium, original) menggunakan `sharp` di backend |
| Format modern | Konversi ke WebP/AVIF saat upload untuk ukuran file lebih kecil |
| Lazy loading | Foto di luar viewport dimuat saat mendekati area scroll (`loading="lazy"`) |
| CDN untuk aset | Foto disajikan lewat CDN, tidak membebani server API |

### 3. Lapisan frontend (TypeScript)

| Strategi | Penjelasan |
|---|---|
| Skeleton loading | Placeholder ditampilkan saat data belum sampai, membuat halaman terasa lebih responsif |
| Code splitting | Bundle JS dipisah per halaman/route |
| Prefetch on hover/scroll | Fetch detail matakuliah dimulai di background saat card di-hover |
| Infinite scroll dengan intersection observer | Memuat batch materi berikutnya saat elemen sentinel terlihat di viewport |
| Cache di sisi client | Menggunakan TanStack Query/SWR untuk cache hasil fetch di browser |

### 4. Lapisan infrastruktur

| Strategi | Penjelasan |
|---|---|
| HTTP/2 atau HTTP/3 | Mendukung multiplexing request untuk banyak foto sekaligus |
| PM2 cluster mode | Backend Node.js memanfaatkan seluruh core CPU |
| Connection pooling | Koneksi ke PostgreSQL menggunakan pooling untuk menghindari overhead koneksi baru tiap request |

### Prioritas implementasi

1. Redis cache untuk list matakuliah/materi — dampak terbesar terhadap response time API
2. Resize dan lazy load foto — dampak terbesar terhadap waktu render halaman
3. Pagination pada infinite scroll — mencegah query membengkak seiring materi bertambah
4. CDN, code splitting, dan strategi lainnya dapat menyusul pada iterasi berikutnya

# Error Handling — Kondisi Error dan Respons Sistem

Bagian ini merinci skenario error yang mungkin terjadi di RetDiary beserta respons sistem terhadap masing-masing kondisi.

### A. Error di Web Publik (Mahasiswa)

| Kondisi | Penyebab | Respons Sistem | HTTP Status |
|---|---|---|---|
| Matakuliah tidak ditemukan | ID matakuliah tidak valid/sudah dihapus | Tampilkan halaman "Matakuliah tidak ditemukan" dengan tombol kembali ke beranda | 404 |
| Materi tidak ditemukan | ID materi tidak valid/sudah dihapus | Tampilkan halaman "Materi tidak ditemukan" dengan tombol kembali ke daftar materi | 404 |
| Hasil pencarian kosong | Kata kunci tidak cocok dengan data manapun | Tampilkan pesan "Tidak ada hasil untuk '...'" beserta saran memeriksa ejaan | 200 |
| Gagal memuat daftar materi (infinite scroll) | Koneksi terputus/server timeout saat scroll | Tampilkan tombol "Coba lagi" di posisi terakhir list, tanpa mereset scroll position | 500/timeout |
| PDF gagal dimuat | Berkas rusak/tidak dapat diakses dari storage | Tampilkan pesan "Berkas tidak dapat dimuat" dengan tombol unduh langsung sebagai alternatif | 404/502 |
| Foto gagal dimuat | URL foto tidak valid/CDN bermasalah | Tampilkan placeholder ikon gambar rusak pada slot foto tersebut, foto lain tetap tampil normal | - |
| Rekomendasi materi tidak tersedia | Materi yang dibaca adalah materi terakhir | Tampilkan pesan "Selamat, kamu telah menyelesaikan seluruh materi matakuliah ini" | 200 |
| Terlalu banyak request | Rate limit publik terlampaui | Tampilkan pesan "Terlalu banyak permintaan, coba lagi sebentar lagi" | 429 |
| Server tidak merespons | Backend down/maintenance | Tampilkan halaman error umum dengan pesan ramah, bukan stack trace teknis | 500/503 |

### B. Error di Web Admin (Dosen)

| Kondisi | Penyebab | Respons Sistem | HTTP Status |
|---|---|---|---|
| Login gagal | Email/password salah | Pesan "Email atau kata sandi salah", tidak menyebutkan mana yang salah | 401 |
| Sesi kedaluwarsa | Token JWT expired | Redirect otomatis ke halaman login dengan pesan "Sesi anda telah berakhir, silakan login kembali" | 401 |
| Akses tanpa autentikasi | Request langsung ke endpoint admin tanpa token | Tolak akses, redirect ke halaman login | 401 |
| Field wajib kosong | Judul materi/matakuliah tidak diisi | Highlight field yang kosong dengan pesan validasi inline, form tidak terkirim | 400 |
| Format PDF tidak valid | File yang diunggah bukan PDF | Tolak upload dengan pesan "Berkas harus berformat PDF" sebelum proses upload dimulai | 400 |
| Ukuran file terlalu besar | PDF/foto melebihi batas maksimum | Tolak upload dengan pesan batas ukuran yang jelas (misal "Maksimum 10MB") | 413 |
| Format foto tidak didukung | File bukan JPG/PNG/WebP | Tolak upload dengan pesan format yang didukung | 400 |
| Upload terputus di tengah jalan | Koneksi internet dosen putus saat upload | Tampilkan progress gagal dengan tombol "Coba unggah lagi", data form tidak hilang | - |
| Gagal menyimpan ke database | Query database error/timeout | Tampilkan pesan "Gagal menyimpan materi, silakan coba lagi", data form tetap tersimpan sementara di client | 500 |
| Hapus matakuliah/materi gagal | Constraint database/koneksi terputus | Tampilkan pesan error, item yang gagal dihapus tetap muncul di list | 500 |
| Duplikasi kode matakuliah | Kode matakuliah yang diinput sudah ada | Tampilkan pesan "Kode matakuliah sudah digunakan" | 409 |

### C. Prinsip Umum Error Handling

| Prinsip | Penjelasan |
|---|---|
| Tidak membocorkan detail teknis | Pesan error tidak menampilkan stack trace, nama tabel database, atau detail query |
| Konsisten format response | Semua error API mengikuti format `{ "success": false, "message": "...", "error_code": "..." }` |
| Logging di server | Setiap error dicatat di server dengan detail teknis lengkap, terpisah dari pesan yang dikirim ke client |
| Graceful degradation | Kegagalan pada satu bagian (misal satu foto gagal dimuat) tidak membuat seluruh halaman gagal ditampilkan |
| Retry pada operasi penting | Upload dan penyimpanan materi menyediakan opsi "coba lagi" tanpa kehilangan data yang sudah diisi |

# Assumptions & Constraints

### Assumptions (Asumsi)

Asumsi adalah hal-hal yang dianggap benar/tersedia selama pengembangan, tanpa verifikasi lebih lanjut pada tahap ini.

| No | Asumsi |
|---|---|
| 1 | Setiap dosen hanya memiliki satu peran (tidak ada perbedaan hak akses antar dosen, semua dosen memiliki kemampuan CRUD yang sama) |
| 2 | Data matakuliah dan dosen sudah/akan tersedia secara manual saat awal peluncuran (tidak ada proses sinkronisasi otomatis dengan sistem akademik kampus) |
| 3 | Mahasiswa mengakses sistem menggunakan browser modern (Chrome, Firefox, Edge, Safari versi terbaru) dengan koneksi internet yang stabil |
| 4 | Target 500 concurrent user adalah estimasi puncak (peak), bukan rata-rata harian, sehingga arsitektur cukup dirancang untuk menangani beban tersebut secara periodik, bukan konstan |
| 5 | Foto dan PDF yang diunggah dosen adalah milik/hak dosen tersebut untuk didistribusikan (tidak ada mekanisme pengecekan hak cipta otomatis) |
| 6 | Satu materi hanya berasal dari satu matakuliah (tidak ada materi yang dipakai bersama oleh lebih dari satu matakuliah) |
| 7 | Server/hosting yang digunakan mendukung Node.js dan PostgreSQL sesuai kebutuhan arsitektur yang sudah dirancang |

### Constraints (Batasan)

Batasan adalah hal-hal yang membatasi ruang gerak pengembangan, baik dari sisi teknis, waktu, maupun ruang lingkup proyek.

| No | Batasan | Kategori |
|---|---|---|
| 1 | Ruang lingkup materi terbatas pada program studi Perkebunan, Politeknik Negeri Lampung | Ruang lingkup |
| 2 | Tidak ada fitur interaksi sosial (komentar, forum diskusi, rating materi) | Ruang lingkup |
| 3 | Tidak ada personalisasi berbasis histori mahasiswa karena web publik tanpa login | Teknis |
| 4 | Database menggunakan PostgreSQL untuk tahap pengembangan saat ini, migrasi ke sistem lain belum direncanakan | Teknis |
| 5 | Backend dan frontend dibatasi pada stack yang sudah ditentukan: Node.js, TypeScript | Teknis |
| 6 | Sistem dirancang untuk menangani hingga 500 concurrent user; skenario di atas angka tersebut memerlukan penyesuaian arsitektur lebih lanjut (di luar cakupan versi ini) | Performa |
| 7 | Setiap fitur wajib disertai testing sebelum dianggap selesai, yang berdampak pada waktu pengembangan tiap fitur | Proses pengembangan |
| 8 | Rekomendasi materi selanjutnya hanya berbasis urutan pertemuan, bukan kecerdasan buatan/algoritma rekomendasi kompleks | Teknis |
| 9 | Tidak ada dukungan multi-bahasa (sistem hanya berbahasa Indonesia) | Ruang lingkup |
| 10 | Satu materi hanya dapat memiliki satu berkas PDF (tidak mendukung multi-PDF per materi) | Teknis |

# Struktur Modular Frontend — Reusable Component

Ini melengkapi struktur folder yang sudah dibuat sebelumnya, khusus membahas prinsip modularitas di sisi frontend agar elemen UI seperti tombol, card, dan komponen lain tidak ditulis ulang di setiap halaman.

Prinsip

Setiap elemen antarmuka yang muncul lebih dari satu kali — baik di halaman yang sama maupun berbeda — harus dibuat sebagai komponen terpisah dan dipanggil (di-import), bukan ditulis ulang. Contohnya:

Tombol "Tambah", "Simpan", "Hapus" di berbagai halaman admin → cukup satu komponen Button, dipanggil dengan prop berbeda (label, warna, aksi)
Card matakuliah di Beranda dan card hasil pencarian → satu komponen CourseCard
Card materi di daftar materi (list) → satu komponen MateriListItem
Form input (text field, textarea, upload area) di Form Materi → komponen TextField, FileUploadArea yang bisa dipakai ulang di form lain jika ada

# Aturan penulisan
Aturan	Alasan
Halaman (pages/) tidak boleh berisi style/markup mentah untuk elemen berulang	Mencegah duplikasi kode antar halaman
Setiap komponen punya satu tanggung jawab (single responsibility)	Memudahkan pengujian dan debugging per komponen
Komponen ui/ tidak boleh mengandung logic bisnis (fetch data, aturan RetDiary)	Membuat komponen dasar bisa dipakai ulang di konteks apapun
Props/parameter dipakai untuk variasi tampilan (warna, ukuran, label), bukan duplikasi komponen baru	Satu Button untuk semua kebutuhan, bukan ButtonMerah, ButtonBiru terpisah
Perubahan tampilan tombol/card cukup dilakukan di satu file komponen	Konsisten di seluruh halaman tanpa perlu ubah satu-satu

# contoh struktur folder
retdiary-backend/
└── src/
    ├── domain/
    │   ├── entities/
    │   ├── repositories/
    │   └── errors/
    ├── application/
    │   ├── use-cases/
    │   │   ├── materi/
    │   │   ├── matakuliah/
    │   │   └── auth/
    │   └── dtos/
    ├── infrastructure/
    │   ├── database/
    │   │   └── repositories/
    │   ├── cache/
    │   ├── storage/
    │   └── auth/
    ├── presentation/
    │   └── http/
    │       ├── controllers/
    │       │   ├── public/
    │       │   └── admin/
    │       ├── routes/
    │       ├── middlewares/
    │       └── validators/
    └── shared/
        ├── config/
        └── utils/

retdiary-backend/tests/
├── unit/
│   ├── domain/
│   └── application/
│       ├── materi/
│       └── matakuliah/
├── integration/
│   ├── public/
│   └── admin/
└── helpers/

retdiary-frontend-admin/
└── src/
    ├── pages/
    │   ├── Login/
    │   ├── Dashboard/
    │   ├── KelolaMatakuliah/
    │   ├── KelolaMateri/
    │   └── FormMateri/
    ├── components/
    │   ├── ui/
    │   ├── common/
    │   └── layout/
    ├── hooks/
    └── services/

retdiary-frontend-publik/
└── src/
    ├── pages/
    │   ├── Beranda/
    │   ├── Pencarian/
    │   ├── DetailMatakuliah/
    │   └── DetailMateri/
    ├── components/
    │   ├── ui/
    │   ├── common/
    │   └── layout/
    ├── hooks/
    └── services/


Tech Stack

Sebelum menginstal apa pun, tetapkan stack yang akan digunakan.

Backend
Node.js 22 LTS
TypeScript
NestJS
PostgreSQL
Prisma ORM
JWT
Multer
Sharp
Redis (opsional)
Swagger/OpenAPI
Winston/Pino
Zod
Helmet
CORS
Compression
Frontend

Admin

React
Vite
TypeScript
React Router
TanStack Query
Axios
React Hook Form
Zod
Zustand
Tailwind CSS (atau CSS Modules sesuai preferensi)

Publik

Stack sama dengan Admin.