import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const termsContent = `
<h2>1. Pengantar</h2>
<p>Selamat datang di <strong>Pernahga</strong>. Syarat dan Ketentuan ini ("Syarat", "Ketentuan") mengatur penggunaan Anda atas situs web dan layanan konsultasi teknologi serta pengembangan perangkat lunak ("Layanan") yang dioperasikan oleh Pernahga.</p>
<p>Dengan mengakses atau menggunakan Layanan kami, Anda menyetujui untuk terikat oleh Syarat ini. Jika Anda tidak setuju dengan bagian mana pun dari syarat ini, Anda tidak diperkenankan untuk mengakses Layanan.</p>

<h2>2. Layanan Kami</h2>
<p>Pernahga menyediakan layanan konsultasi IT, analisis kebutuhan bisnis, serta pengembangan perangkat lunak (termasuk aplikasi web, mobile, dan sistem kustom). Ruang lingkup spesifik proyek akan selalu tertuang dalam dokumen Surat Perjanjian Kerjasama (SPK) atau Statement of Work (SOW) tersendiri untuk setiap klien.</p>

<h2>3. Hak Kekayaan Intelektual</h2>
<p>Kecuali dinyatakan lain dalam kesepakatan tertulis, seluruh perangkat lunak, sistem dasar, metodologi, dan materi yang dikembangkan oleh Pernahga tetap menjadi milik intelektual Pernahga. Klien akan diberikan lisensi penggunaan sesuai dengan kontrak yang disepakati.</p>

<h2>4. Tanggung Jawab Klien</h2>
<p>Klien diwajibkan untuk: (a) memberikan informasi yang akurat dan lengkap sesuai kebutuhan proyek; (b) memberikan umpan balik tepat waktu pada setiap fase pengujian (UAT); (c) menggunakan layanan kami untuk tujuan yang sah secara hukum.</p>

<h2>5. Batasan Tanggung Jawab</h2>
<p>Pernahga berupaya maksimal memberikan solusi teknologi yang handal, namun tidak bertanggung jawab atas kerugian tidak langsung, insidental, atau konsekuensial yang timbul dari penggunaan atau ketidakmampuan menggunakan perangkat lunak yang telah diserahterimakan, kecuali diakibatkan oleh kelalaian berat dari pihak kami.</p>

<h2>6. Perubahan Layanan & Harga</h2>
<p>Harga paket konsultasi dan layanan kami tunduk pada perubahan tanpa pemberitahuan sebelumnya. Pernahga berhak sewaktu-waktu untuk memodifikasi atau menghentikan Layanan (atau bagian mana pun darinya) tanpa pemberitahuan.</p>
`;

const privacyContent = `
<h2>1. Informasi yang Kami Kumpulkan</h2>
<p>Di <strong>Pernahga</strong>, privasi klien adalah prioritas utama. Dalam menyediakan layanan konsultasi dan pengembangan perangkat lunak, kami mengumpulkan berbagai informasi, termasuk namun tidak terbatas pada:</p>
<ul>
  <li><strong>Data Pribadi:</strong> Nama lengkap, alamat email, nomor telepon, dan informasi jabatan.</li>
  <li><strong>Data Bisnis:</strong> Informasi perusahaan, alur operasional, dan data teknis yang dibagikan selama sesi konsultasi.</li>
  <li><strong>Data Penggunaan:</strong> Log sistem dan analitik penggunaan pada platform kami.</li>
</ul>

<h2>2. Bagaimana Kami Menggunakan Informasi Anda</h2>
<p>Kami menggunakan data yang dikumpulkan semata-mata untuk:</p>
<ul>
  <li>Merancang solusi perangkat lunak yang spesifik dan tepat guna untuk perusahaan Anda.</li>
  <li>Menyediakan, memelihara, dan memperbaiki Layanan kami.</li>
  <li>Berkomunikasi dengan Anda mengenai proyek, tagihan, atau pembaruan teknis.</li>
</ul>

<h2>3. Non-Disclosure Agreement (NDA)</h2>
<p>Sebagai perusahaan IT, kami memahami betapa berharganya data bisnis Anda. Pernahga selalu siap untuk menandatangani Perjanjian Kerahasiaan (NDA) standar secara terpisah sebelum proyek skala Enterprise atau Konsultasi Profesional dimulai, untuk menjamin bahwa ide dan data bisnis Anda tidak akan pernah bocor ke pihak ketiga.</p>

<h2>4. Keamanan Data</h2>
<p>Kami mematuhi standar industri terkini untuk mengamankan data yang Anda kirimkan. Namun, perlu diingat bahwa tidak ada metode transmisi di atas internet atau penyimpanan elektronik yang 100% aman.</p>

<h2>5. Pihak Ketiga</h2>
<p>Kami tidak menjual, memperdagangkan, atau menyewakan informasi identitas pribadi maupun rahasia dagang klien kepada pihak luar. Pengecualian hanya berlaku bagi vendor pihak ketiga berlisensi (misalnya layanan hosting AWS/Google Cloud) yang wajib mematuhi standar privasi yang ketat.</p>
`;

const refundContent = `
<h2>1. Kebijakan Refund Umum</h2>
<p>Mengingat karakteristik layanan Pernahga yang berupa konsultasi intelektual dan pengembangan perangkat lunak kustom, kebijakan pengembalian dana (refund) kami ditangani secara sangat spesifik berdasarkan fase proyek.</p>

<h2>2. Sesi Konsultasi (Basic & Professional)</h2>
<p>Jika Anda telah membayar untuk paket Konsultasi Profesional dan ingin membatalkannya:</p>
<ul>
  <li>Pembatalan selambat-lambatnya <strong>48 jam sebelum jadwal sesi pertama</strong> akan mendapatkan pengembalian dana penuh (100%).</li>
  <li>Pembatalan setelah sesi pertama berlangsung tidak akan mendapat pengembalian dana, karena waktu dan analisis awal dari konsultan kami telah didedikasikan.</li>
</ul>

<h2>3. Layanan Pengembangan Perangkat Lunak (Enterprise)</h2>
<p>Untuk proyek pembuatan software kustom, struktur pembayaran biasanya dibagi menjadi beberapa termin (Down Payment, Termin Tengah, Pelunasan). Kebijakan pengembalian dana akan merujuk pada Surat Perjanjian Kerjasama (SPK) yang disepakati bersama:</p>
<ul>
  <li><strong>Down Payment (DP)</strong> umumnya bersifat non-refundable (tidak dapat dikembalikan) jika tahap analisis sistem (System Requirements) sudah dimulai.</li>
  <li>Jika Pernahga gagal memenuhi spesifikasi akhir (setelah revisi maksimal), skema penalti atau sebagian refund akan diatur spesifik pada kontrak hukum proyek tersebut.</li>
</ul>

<h2>4. Masalah Teknis Pasca-Peluncuran</h2>
<p>Layanan kami sudah termasuk garansi pemeliharaan (maintenance) sesuai paket (misalnya gratis 1 bulan atau 1 tahun). Setiap bug atau error akan diperbaiki secara gratis dalam masa garansi ini. Pengembalian dana tidak berlaku untuk masalah teknis yang muncul setelah masa serah-terima dan UAT ditandatangani.</p>

<h2>5. Proses Pengajuan</h2>
<p>Untuk mengajukan pembatalan atau diskusi terkait kontrak/refund, Anda dapat mengirimkan email resmi ke tim operasional kami di <strong>hello@pernahga.com</strong> atau langsung melalui manajer proyek yang bertugas.</p>
`;

async function main() {
  console.log("Updating Legal Pages with professional content...");

  await prisma.siteSettings.upsert({
    where: { key: "termsContent" },
    update: { value: termsContent.trim() },
    create: { key: "termsContent", value: termsContent.trim() },
  });

  await prisma.siteSettings.upsert({
    where: { key: "privacyContent" },
    update: { value: privacyContent.trim() },
    create: { key: "privacyContent", value: privacyContent.trim() },
  });

  await prisma.siteSettings.upsert({
    where: { key: "refundContent" },
    update: { value: refundContent.trim() },
    create: { key: "refundContent", value: refundContent.trim() },
  });

  console.log("Successfully updated legal pages!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
