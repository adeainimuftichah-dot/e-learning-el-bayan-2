/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Role = 'admin' | 'guru' | 'santri';

export interface User {
  id: string;
  username: string;
  email: string;
  nama: string;
  role: Role;
  avatarUrl?: string;
  nomorInduk?: string; // NIS for santri, NIP for guru
  kelasId?: string; // For santri
  spesialisasi?: string; // For guru
  kamar?: string; // Asrama santri
  semester?: string; // For santri (e.g., 'Semester 1', 'Semester 2')
}

export interface Kelas {
  id: string;
  nama: string;
  tingkat: 'Ula (Dasar)' | 'Wustho (Menengah)' | 'Ulya (Lanjutan)';
  waliKelas: string;
  kapasitas: number;
  tahunAjaran: string;
}

export type KitabKategori = 
  | 'Nahwu & Shorof' 
  | 'Fiqih & Ushul Fiqih' 
  | 'Akhlak & Tasawuf' 
  | 'Tarikh & Sirah' 
  | 'Hadits & Mustholah' 
  | 'Al-Qur\'an & Tajwid' 
  | 'Aqidah & Tauhid';

export interface MataPelajaran {
  id: string;
  kode: string;
  namaKitab: string;
  arabTitle: string;
  mushannif: string; // Pengarang kitab
  kategori: KitabKategori;
  tingkat?: 'Ula (Dasar)' | 'Wustho (Menengah)' | 'Ulya (Lanjutan)' | 'Semua Tingkat';
  guruId: string;
  guruNama: string;
  deskripsi: string;
  warnaTema: string;
  jumlahBab: number;
}

export function isGuruForKitab(guru?: User | null, kitab?: MataPelajaran | null): boolean {
  if (!guru || !kitab) return false;
  if (guru.role !== 'guru') return false;
  if (kitab.guruId && guru.id && kitab.guruId === guru.id) return true;
  if (kitab.guruNama && guru.nama) {
    const kName = kitab.guruNama.toLowerCase().replace(/[^a-z0-9]/g, '');
    const gName = guru.nama.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (kName === gName || kName.includes(gName) || gName.includes(kName)) return true;
  }
  if (guru.spesialisasi) {
    const spec = guru.spesialisasi.toLowerCase();
    const kTitle = kitab.namaKitab.toLowerCase();
    if (spec.includes(kTitle) || kTitle.includes(spec)) return true;
    if (kTitle.includes('jurumiyah') && spec.includes('jurumiyah')) return true;
    if (kTitle.includes('safina') && spec.includes('safina')) return true;
    if (kTitle.includes('ta\'lim') && (spec.includes('ta\'lim') || spec.includes('talim'))) return true;
    if (kTitle.includes('arbain') && spec.includes('arbain')) return true;
    if (kTitle.includes('tilawah') && spec.includes('tilawah')) return true;
    if (kTitle.includes('aqidatul') && spec.includes('aqidatul')) return true;
    if (kTitle.includes('duror') && spec.includes('duror')) return true;
    if (kTitle.includes('taqrib') && spec.includes('taqrib')) return true;
    if (kTitle.includes('nurul mubin') && spec.includes('nurul mubin')) return true;
    if (kTitle.includes('fuadi') && (spec.includes('fuadi') || spec.includes('al fuadi'))) return true;
    if (kTitle.includes('attajhizu') && (spec.includes('attajhizu') || spec.includes('tajhiz'))) return true;
    if (kTitle.includes('akhlaq') && (spec.includes('akhlaq') || spec.includes('ahklaq'))) return true;
  }
  return false;
}

export type JenisMateri = 'pdf' | 'video' | 'ringkasan' | 'audio';

export interface Materi {
  id: string;
  judul: string;
  mapelId: string;
  mapelNama: string;
  kelasId: string;
  kelasNama: string;
  guruId: string;
  guruNama: string;
  deskripsi: string;
  jenisMateri: JenisMateri;
  fileUrl?: string;
  fileName?: string;
  fileSize?: string;
  videoEmbedUrl?: string;
  videoDirectUrl?: string;
  videoSourceType?: 'youtube' | 'upload';
  videoFileName?: string;
  videoFileSize?: string;
  videoDuration?: string;
  videoThumbnail?: string;
  arabText?: string;
  terjemah?: string;
  maknaPegon?: string;
  tanggalUnggah: string;
  statusPublikasi: 'publik' | 'draft';
  viewsCount: number;
  lampiranUrl?: string;
}

export interface Tugas {
  id: string;
  judul: string;
  deskripsi: string;
  mapelId: string;
  mapelNama: string;
  kelasId: string;
  kelasNama: string;
  guruId: string;
  guruNama: string;
  batasWaktu: string;
  tanggalDibuat: string;
  fileLampiran?: string;
  videoEmbedUrl?: string;
  videoDirectUrl?: string;
  videoSourceType?: 'youtube' | 'upload';
  videoFileName?: string;
  bobotNilai: number;
  status: 'aktif' | 'berakhir';
  instruksiSetoran?: string;
}

export interface PengumpulanTugas {
  id: string;
  tugasId: string;
  santriId: string;
  santriNama: string;
  santriNis: string;
  kelasNama: string;
  tanggalKumpul: string;
  fileTugas?: string;
  fileNama?: string;
  jawabanTeks: string;
  status: 'menunggu_diperiksa' | 'sudah_dinilai';
  nilai?: number;
  catatanEvaluasi?: string;
  waktuPenilaian?: string;
}

export interface SoalKuis {
  id: string;
  kuisId: string;
  nomor: number;
  pertanyaan: string;
  pertanyaanArab?: string;
  tipeSoal: 'pilihan_ganda' | 'esai';
  pilihan?: {
    a: string;
    b: string;
    c: string;
    d: string;
  };
  kunciJawaban?: 'a' | 'b' | 'c' | 'd';
  bobotPoin: number;
  pembahasan?: string;
}

export interface Kuis {
  id: string;
  judul: string;
  mapelId: string;
  mapelNama: string;
  kelasId: string;
  kelasNama: string;
  guruId: string;
  guruNama: string;
  durasiMenit: number;
  batasSelesai: string;
  totalSoal: number;
  passingScore: number;
  status: 'tersedia' | 'selesai' | 'draft';
  deskripsi: string;
  semester?: string;
  soal: SoalKuis[];
}

export interface JawabanKuisSantri {
  id: string;
  kuisId: string;
  santriId: string;
  santriNama: string;
  tanggalMengerjakan: string;
  nilaiPilihanGanda: number;
  nilaiEsai?: number;
  nilaiAkhir: number;
  isLulus: boolean;
  status: 'selesai' | 'perlu_koreksi_esai';
  jawabanSantri: Record<string, string>; // soalId -> jawaban
  catatanGuru?: string;
}

export interface NilaiSantri {
  id: string;
  santriId: string;
  santriNama: string;
  santriNis: string;
  kelasNama: string;
  mapelId: string;
  mapelNama: string;
  nilaiTugasRata: number;
  nilaiKuisRata: number;
  nilaiHafalanSetoran: number;
  nilaiUjianAkhir: number;
  nilaiAkhir: number;
  predikat: 'Mumtaz (A)' | 'Jayyid Jiddan (B+)' | 'Jayyid (B)' | 'Maqbul (C)' | 'Rasib (D)';
  catatan: string;
}

export interface JadwalHalaqah {
  id: string;
  hari: 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu' | 'Ahad';
  waktu: string; // e.g. "05:30 - 06:45 (Ba'da Subuh)"
  mapelNama: string;
  arabKitab: string;
  guruNama: string;
  guruId?: string;
  kelasNama: string;
  tempat: string; // e.g. "Masjid Jami' Lt. 1"
}

export interface AktivitasLog {
  id: string;
  userId: string;
  userName: string;
  userRole: Role;
  aksi: string;
  target: string;
  waktu: string;
}

export interface Notifikasi {
  id: string;
  targetRole: Role | 'all';
  userId?: string;
  judul: string;
  pesan: string;
  waktu: string;
  dibaca: boolean;
  kategori: 'materi' | 'tugas' | 'kuis' | 'nilai' | 'sistem';
  linkTab?: string;
}
