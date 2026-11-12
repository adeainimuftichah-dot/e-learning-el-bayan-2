/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Users,
  GraduationCap,
  BookOpen,
  FileText,
  CheckSquare,
  TrendingUp,
  Activity,
  ArrowUpRight,
  Database,
  Calendar,
  Sparkles,
  Award,
  Building2,
} from 'lucide-react';
import {
  User,
  MataPelajaran,
  Materi,
  Tugas,
  PengumpulanTugas,
  AktivitasLog,
  Kelas,
} from '../../types';

interface AdminDashboardProps {
  santriList: User[];
  guruList: User[];
  kitabList: MataPelajaran[];
  materiList: Materi[];
  tugasList: Tugas[];
  pengumpulanList: PengumpulanTugas[];
  kelasList: Kelas[];
  aktivitasList: AktivitasLog[];
  onNavigateTab: (tab: string, meta?: any) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  santriList,
  guruList,
  kitabList,
  materiList,
  tugasList,
  pengumpulanList,
  kelasList,
  aktivitasList,
  onNavigateTab,
}) => {
  const pendingGradingCount = pengumpulanList.filter(
    (p) => p.status === 'menunggu_diperiksa'
  ).length;

  const stats = [
    {
      title: 'Total Santri Mukim',
      value: santriList.length,
      unit: 'Santri',
      icon: Users,
      color: 'bg-sky-50 text-sky-700 border-sky-200',
      tab: 'santri',
      desc: 'Terdaftar di data induk',
    },
    {
      title: 'Dewan Asatidz / Guru',
      value: guruList.length,
      unit: 'Ustadz',
      icon: GraduationCap,
      color: 'bg-teal-50 text-teal-700 border-teal-200',
      tab: 'guru',
      desc: 'Pengampu 12 disiplin kitab',
    },
    {
      title: 'Mata Pelajaran (Kitab)',
      value: kitabList.length,
      unit: 'Kitab',
      icon: BookOpen,
      color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      tab: 'kitab',
      desc: 'Nahwu, Fiqih, Hadits, Tauhid',
    },
    {
      title: 'Rekap Nilai Masuk',
      value: 'Lengkap',
      unit: 'Rapor',
      icon: Award,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      tab: 'nilai',
      desc: 'Diterima dari para Ustadz',
    },
    {
      title: 'Tingkat Kelas & Halaqah',
      value: kelasList.length,
      unit: 'Kelas',
      icon: Building2,
      color: 'bg-amber-50 text-amber-700 border-amber-200',
      tab: 'kelas',
      desc: 'Jenjang Ula, Wustho, Ulya',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-sky-950 via-sky-900 to-teal-950 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs bg-teal-400/20 text-teal-300 px-2 py-0.5 rounded-full font-medium inline-block mb-1.5">
            Tahun Ajaran 1446-1447 H / 2025-2026 M
          </span>
          <h2 className="text-xl font-bold tracking-tight">
            Ahlan wa Sahlan, Administrator Ponpes El Bayan 2
          </h2>
          <p className="text-xs text-sky-200/80 mt-1 max-w-xl leading-relaxed">
            Sistem Informasi Akademik Ponpes El Bayan 2. Sebagai Administrator, Anda menerima rekapitulasi nilai para santri dari para Ustadz pengampu dan mengelola data lembaga.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onNavigateTab('database')}
            className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 backdrop-blur-xs transition-colors border border-white/15 cursor-pointer"
          >
            <Database className="w-4 h-4 text-teal-300" />
            <span>Skema Basis Data</span>
          </button>
          <button
            onClick={() => onNavigateTab('nilai')}
            className="px-4 py-2 bg-teal-400 text-sky-950 hover:bg-teal-300 text-xs font-bold rounded-lg transition-colors shadow-xs cursor-pointer"
          >
            Lihat Rekap Nilai Santri
          </button>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.title}
              onClick={() => onNavigateTab(s.tab)}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-sky-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-slate-500 leading-tight">
                    {s.title}
                  </span>
                  <div className={`p-2 rounded-xl border ${s.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
                    {s.value}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">{s.unit}</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-100 truncate">
                {s.desc}
              </p>
            </div>
          );
        })}
      </div>

      {/* Two Column Layout: Kitab Categories & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: 12 Kitab Quick List */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">12 Kitab Kurikulum Ponpes El Bayan 2</h3>
              <p className="text-xs text-slate-500">Kategori kitab pokok yang diajarkan</p>
            </div>
            <button
              onClick={() => onNavigateTab('kitab')}
              className="text-xs font-semibold text-sky-700 hover:text-sky-900 flex items-center gap-1"
            >
              <span>Semua Kitab</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {kitabList.slice(0, 8).map((k) => (
              <div
                key={k.id}
                onClick={() => onNavigateTab('kitab', { selectedKitabId: k.id })}
                className="p-3 rounded-xl border border-slate-200 hover:border-sky-300 hover:bg-sky-50/40 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-800 group-hover:text-sky-800">
                    {k.namaKitab}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">{k.tingkat}</span>
                </div>
                <p className="font-arabic text-xs text-slate-500 dir-rtl text-right truncate">
                  {k.arabTitle}
                </p>
                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                  <span className="truncate max-w-[120px]">{k.guruNama}</span>
                  <span className="text-sky-600 font-medium">{k.kategori}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Real-time Activity Logs */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-sky-700" />
                <h3 className="text-sm font-bold text-slate-800">Aktivitas Belajar Terbaru</h3>
              </div>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
                Waktu Nyata
              </span>
            </div>

            <div className="space-y-3">
              {aktivitasList.slice(0, 5).map((act) => (
                <div
                  key={act.id}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">{act.userName}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{act.waktu}</span>
                  </div>
                  <p className="text-slate-600">
                    <span className="font-medium text-sky-800">{act.aksi}:</span>{' '}
                    <span className="text-slate-700">{act.target}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Status Sistem: <strong>Normal & Terhubung</strong></span>
            <span className="text-emerald-600 font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Aktif
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
