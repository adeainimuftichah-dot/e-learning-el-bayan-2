/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Database, Download, Copy, Check, Server, Terminal, ExternalLink } from 'lucide-react';
import { MYSQL_DATABASE_SCHEMA_SQL } from '../../data/initialData';

export const SqlExportModal: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(MYSQL_DATABASE_SCHEMA_SQL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([MYSQL_DATABASE_SCHEMA_SQL], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'db_elearning_pesantren.sql';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const tablesList = [
    { name: 'users', desc: 'Akun login admin, ustadz, dan santri' },
    { name: 'santri', desc: 'Data biodata, NIS, kamar kobong, wali' },
    { name: 'guru', desc: 'Data NIP, gelar, spesialisasi kitab pengampu' },
    { name: 'kelas', desc: 'Tingkat Ula, Wustho, Ulya, dan wali kelas' },
    { name: 'mata_pelajaran', desc: '12 Kitab Kuning utama pondok pesantren' },
    { name: 'materi', desc: 'Bahan ajar PDF, video kajian, matan Arab berharakat' },
    { name: 'tugas', desc: 'Tugas, setoran hafalan, batas akhir pengumpulan' },
    { name: 'pengumpulan_tugas', desc: 'Setoran santri, berkas lampiran, dan nilai ustadz' },
    { name: 'kuis', desc: 'Evaluasi harian, durasi waktu, dan batas kelulusan (KKM)' },
    { name: 'soal_kuis', desc: 'Bank soal pilihan ganda & esai beserta kunci jawaban' },
    { name: 'nilai_santri', desc: 'Transkrip nilai rapor pesantren (Mumtaz, Jayyid, dll)' },
    { name: 'jadwal_halaqah', desc: 'Waktu subuh, ashar, maghrib, isya & lokasi masjid' },
  ];

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center font-bold shrink-0 border border-teal-200">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">
                Struktur Database MySQL Ponpes El Bayan 2 & Integrasi Localhost (XAMPP)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Skema relasional lengkap Ponpes El Bayan 2 untuk phpMyAdmin dengan 12 tabel terindeks dan seed data awal.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Tersalin' : 'Salin Script SQL'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-sky-800 hover:bg-sky-900 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Unduh Berkas .sql</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tablesList.map((t, idx) => (
          <div
            key={t.name}
            className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs space-y-1"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-sky-900 bg-sky-50 px-2 py-0.5 rounded">
                {t.name}
              </span>
              <span className="text-[10px] text-slate-400">Tabel #{idx + 1}</span>
            </div>
            <p className="text-xs text-slate-600">{t.desc}</p>
          </div>
        ))}
      </div>

      {/* Guide Box */}
      <div className="p-5 bg-sky-50/70 border border-sky-200 rounded-2xl text-xs space-y-3">
        <h4 className="font-bold text-sky-950 flex items-center gap-2">
          <Server className="w-4 h-4 text-sky-700" />
          <span>Langkah Menjalankan Database di XAMPP / Localhost:</span>
        </h4>
        <ol className="list-decimal list-inside space-y-1.5 text-sky-900 pl-1">
          <li>Nyalakan modul <strong>Apache</strong> dan <strong>MySQL</strong> pada XAMPP Control Panel.</li>
          <li>Buka peramban (browser) dan akses <code>http://localhost/phpmyadmin</code>.</li>
          <li>Klik menu <strong>Import</strong> di bilah atas phpMyAdmin.</li>
          <li>Pilih file <code>db_elearning_pesantren.sql</code> yang Anda unduh dari tombol di atas, lalu klik <strong>Go / Kirim</strong>.</li>
          <li>Database <code>db_elearning_pesantren</code> otomatis dibuat beserta seluruh 12 tabel dan data awal kitab pesantren!</li>
        </ol>
      </div>

      {/* Code Previewer */}
      <div className="bg-slate-900 text-slate-100 rounded-2xl overflow-hidden border border-slate-800 shadow-lg">
        <div className="px-4 py-2.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span className="font-mono">db_elearning_pesantren.sql (MySQL 8.0 / MariaDB)</span>
          <button
            onClick={handleCopy}
            className="text-xs text-teal-400 hover:text-teal-300 font-semibold"
          >
            {copied ? 'Tersalin!' : 'Salin Semua'}
          </button>
        </div>
        <pre className="p-5 text-[11px] font-mono leading-relaxed overflow-x-auto max-h-96 text-sky-200/90 select-all">
          {MYSQL_DATABASE_SCHEMA_SQL}
        </pre>
      </div>
    </div>
  );
};
