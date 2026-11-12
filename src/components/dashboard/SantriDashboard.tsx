/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  BookOpen,
  Calendar,
  CheckSquare,
  Award,
  Clock,
  ArrowRight,
  Play,
  FileText,
  User,
  Sparkles,
} from 'lucide-react';
import {
  User as UserType,
  MataPelajaran,
  Materi,
  Tugas,
  PengumpulanTugas,
  JadwalHalaqah,
  NilaiSantri,
} from '../../types';

interface SantriDashboardProps {
  currentUser: UserType;
  allKitab: MataPelajaran[];
  allMateri: Materi[];
  allTugas: Tugas[];
  allPengumpulan: PengumpulanTugas[];
  allJadwal: JadwalHalaqah[];
  allNilai: NilaiSantri[];
  onOpenMateriViewer: (materi: Materi) => void;
  onOpenSubmitTugas: (tugas: Tugas, submission?: PengumpulanTugas) => void;
  onNavigateTab: (tab: string, meta?: any) => void;
}

export const SantriDashboard: React.FC<SantriDashboardProps> = ({
  currentUser,
  allKitab,
  allMateri,
  allTugas,
  allPengumpulan,
  allJadwal,
  allNilai,
  onOpenMateriViewer,
  onOpenSubmitTugas,
  onNavigateTab,
}) => {
  // Submissions by this student
  const mySubmissions = allPengumpulan.filter((p) => p.santriId === currentUser.id);
  const myGrades = allNilai.filter((n) => n.santriId === currentUser.id);

  // Compute tasks status
  const taskStatusList = allTugas.map((tugas) => {
    const submission = mySubmissions.find((s) => s.tugasId === tugas.id);
    const isSubmitted = Boolean(submission);
    const isGraded = submission?.status === 'sudah_dinilai';
    return {
      tugas,
      submission,
      isSubmitted,
      isGraded,
    };
  });

  const pendingTasks = taskStatusList.filter((item) => !item.isSubmitted);

  // Average score
  const avgGrade =
    myGrades.length > 0
      ? Math.round(myGrades.reduce((acc, curr) => acc + curr.nilaiAkhir, 0) / myGrades.length)
      : 93;

  return (
    <div className="space-y-6">
      {/* Student Profile Banner */}
      <div className="bg-gradient-to-r from-sky-950 via-sky-900 to-teal-950 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs bg-teal-400/20 text-teal-300 px-2.5 py-0.5 rounded-full font-medium inline-block mb-1.5">
            Santri Mukim Aktif • {currentUser.nomorInduk || 'NIS-20240101'}
          </span>
          <h2 className="text-xl font-bold tracking-tight">
            Ahlan wa Sahlan, {currentUser.nama}
          </h2>
          <p className="text-xs text-sky-200/80 mt-1 max-w-xl leading-relaxed">
            Semester: <strong>{currentUser.semester || 'Semester 1'}</strong> • Kamar:{' '}
            <strong>{currentUser.kamar || 'Asrama Al-Farabi Kamar 04'}</strong>.
            Tetap istiqamah dan bersemangat dalam thalabul ilmi.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white/10 backdrop-blur-xs p-3 rounded-xl border border-white/15 text-center">
            <span className="text-[10px] uppercase tracking-wider text-teal-300 block font-semibold">
              Rata-Rata Nilai
            </span>
            <span className="text-2xl font-bold text-white font-mono">{avgGrade}</span>
            <span className="text-[10px] text-teal-200 block font-medium">Mumtaz (A)</span>
          </div>
        </div>
      </div>

      {/* Action Shortcut Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => onNavigateTab('kitab')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-sky-300 transition-all cursor-pointer flex items-center justify-between"
        >
          <div>
            <p className="text-xs font-semibold text-slate-500">Kitab yang Dipelajari</p>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-bold text-slate-900 font-mono">12</span>
              <span className="text-xs text-slate-500">Kitab Kuning</span>
            </div>
            <p className="text-[11px] text-sky-700 mt-2 font-medium">Lihat Silabus & Bab</p>
          </div>
          <div className="p-3 rounded-xl bg-sky-50 text-sky-700 border border-sky-200">
            <BookOpen className="w-5 h-5" />
          </div>
        </div>

        <div
          onClick={() => onNavigateTab('tugas')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-amber-300 transition-all cursor-pointer flex items-center justify-between"
        >
          <div>
            <p className="text-xs font-semibold text-slate-500">Tugas Belum Dikerjakan</p>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-bold text-amber-700 font-mono">
                {pendingTasks.length}
              </span>
              <span className="text-xs text-slate-500">Tugas / Setoran</span>
            </div>
            <p className="text-[11px] text-amber-600 mt-2 font-medium">Perlu dikerjakan segera</p>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div
          onClick={() => onNavigateTab('kuis')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-teal-300 transition-all cursor-pointer flex items-center justify-between"
        >
          <div>
            <p className="text-xs font-semibold text-slate-500">Kuis & Ujian Tersedia</p>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-bold text-teal-700 font-mono">2</span>
              <span className="text-xs text-slate-500">Kuis Online</span>
            </div>
            <p className="text-[11px] text-teal-600 mt-2 font-medium">Safinah & Jurumiyah</p>
          </div>
          <div className="p-3 rounded-xl bg-teal-50 text-teal-700 border border-teal-200">
            <CheckSquare className="w-5 h-5" />
          </div>
        </div>

        <div
          onClick={() => onNavigateTab('nilai')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-indigo-300 transition-all cursor-pointer flex items-center justify-between"
        >
          <div>
            <p className="text-xs font-semibold text-slate-500">Rapor & Transkrip</p>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-bold text-indigo-700 font-mono">
                {myGrades.length}
              </span>
              <span className="text-xs text-slate-500">Nilai Kitab</span>
            </div>
            <p className="text-[11px] text-indigo-600 mt-2 font-medium">Cek Evaluasi Ustadz</p>
          </div>
          <div className="p-3 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Award className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Grid: Pending Tasks to Submit & Latest Materials */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Tugas yang Harus Dikerjakan */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Tugas & Setoran Santri</h3>
              <p className="text-xs text-slate-500">Kumpulkan tugas sebelum batas waktu berakhir</p>
            </div>
            <button
              onClick={() => onNavigateTab('tugas')}
              className="text-xs font-semibold text-sky-700 hover:text-sky-900 flex items-center gap-1"
            >
              <span>Lihat Semua</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {taskStatusList.slice(0, 4).map(({ tugas, submission, isSubmitted, isGraded }) => (
              <div
                key={tugas.id}
                className="p-4 rounded-xl border border-slate-200 hover:border-sky-300 hover:bg-slate-50/50 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold bg-sky-100 text-sky-800 px-2 py-0.5 rounded">
                      {tugas.mapelNama}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Batas: {new Date(tugas.batasWaktu).toLocaleDateString('id-ID')}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">{tugas.judul}</h4>
                  <p className="text-[11px] text-slate-500 line-clamp-1">{tugas.deskripsi}</p>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  {isGraded ? (
                    <div className="text-right">
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-md block">
                        Nilai: {submission?.nilai} / 100
                      </span>
                    </div>
                  ) : isSubmitted ? (
                    <span className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-md">
                      Menunggu Penilaian
                    </span>
                  ) : (
                    <button
                      onClick={() => onOpenSubmitTugas(tugas)}
                      className="px-3.5 py-1.5 bg-sky-800 hover:bg-sky-900 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
                    >
                      Kumpulkan Tugas
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Materi Terbaru Siap Dibaca */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Materi Pelajaran Terbaru</h3>
              <p className="text-xs text-slate-500">Buka dan pelajari matan kitab digital</p>
            </div>
            <button
              onClick={() => onNavigateTab('materi')}
              className="text-xs font-semibold text-sky-700 hover:text-sky-900 flex items-center gap-1"
            >
              <span>Semua</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {allMateri.slice(0, 4).map((m) => (
              <div
                key={m.id}
                onClick={() => onOpenMateriViewer(m)}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-teal-400 hover:bg-teal-50/20 transition-all cursor-pointer flex items-center justify-between gap-3 group"
              >
                <div className="space-y-1 truncate">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-1.5 py-0.2 rounded">
                      {m.mapelNama}
                    </span>
                    {m.jenisMateri === 'video' || m.videoEmbedUrl || m.videoDirectUrl ? (
                      m.videoSourceType === 'upload' || m.videoDirectUrl ? (
                        <span className="text-[10px] font-bold text-teal-800 bg-teal-100 px-1.5 py-0.2 rounded">
                          VIDEO MP4
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-rose-800 bg-rose-100 px-1.5 py-0.2 rounded">
                          YOUTUBE
                        </span>
                      )
                    ) : (
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">
                        {m.jenisMateri}
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 group-hover:text-teal-900 truncate">
                    {m.judul}
                  </h4>
                  <p className="text-[10px] text-slate-400">Pengampu: {m.guruNama}</p>
                </div>

                <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-teal-700 group-hover:text-white text-slate-600 flex items-center justify-center shrink-0 transition-colors">
                  <Play className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>

          {/* Today's Halaqah Quick Reminder */}
          <div className="p-3.5 bg-sky-50 border border-sky-200 rounded-xl text-xs space-y-1 mt-4">
            <div className="flex items-center gap-1.5 text-sky-950 font-bold">
              <Calendar className="w-4 h-4 text-sky-700" />
              <span>Halaqah Sore Ini (Ba'da Ashar):</span>
            </div>
            <p className="text-sky-900 font-medium">
              Kajian Kitab Safinatunnajah bersama Ust. Muhammad Ridwan, S.Pd.I di Aula Abu Bakar Ponpes El Bayan 2.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
