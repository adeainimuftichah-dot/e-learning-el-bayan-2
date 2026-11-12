/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  BookOpen,
  Users,
  FileText,
  CheckSquare,
  Clock,
  Plus,
  ArrowRight,
  Award,
  AlertCircle,
  Eye,
  Edit3,
  UserCheck,
  Video,
  Film,
  Play,
} from 'lucide-react';
import {
  User,
  MataPelajaran,
  Materi,
  Tugas,
  PengumpulanTugas,
  isGuruForKitab,
} from '../../types';

interface GuruDashboardProps {
  currentUser: User;
  allKitab: MataPelajaran[];
  allMateri: Materi[];
  allTugas: Tugas[];
  allPengumpulan: PengumpulanTugas[];
  santriList?: User[];
  onOpenUploadMateri: () => void;
  onOpenCreateTugas: () => void;
  onGradeSubmission: (submission: PengumpulanTugas) => void;
  onNavigateTab: (tab: string, meta?: any) => void;
  onOpenEditProfile?: () => void;
}

export const GuruDashboard: React.FC<GuruDashboardProps> = ({
  currentUser,
  allKitab,
  allMateri,
  allTugas,
  allPengumpulan,
  santriList = [],
  onOpenUploadMateri,
  onOpenCreateTugas,
  onGradeSubmission,
  onNavigateTab,
  onOpenEditProfile,
}) => {
  // My taught subjects
  const myKitab = allKitab.filter((k) => isGuruForKitab(currentUser, k));
  const myKitabIds = myKitab.map((k) => k.id);

  // My uploaded materials
  const myMateri = allMateri.filter(
    (m) => m.guruId === currentUser.id || myKitabIds.includes(m.mapelId)
  );

  // My tasks: strictly only tasks of subjects taught by this ustadz
  const myKitabNames = myKitab.map((k) => k.namaKitab.toLowerCase());
  const myTugas = allTugas.filter((t) => {
    if (myKitabIds.includes(t.mapelId)) return true;
    const tMapel = (t.mapelNama || '').toLowerCase();
    return myKitabNames.some((kName) => tMapel.includes(kName) || kName.includes(tMapel));
  });
  const myTugasIds = myTugas.map((t) => t.id);

  // Submissions for my tasks
  const mySubmissions = allPengumpulan.filter((p) => myTugasIds.includes(p.tugasId));
  const pendingSubmissions = mySubmissions.filter((p) => p.status === 'menunggu_diperiksa');

  // Helper to reliably resolve and verify registered santri names and NIS
  const getSantriDisplayName = (sub: PengumpulanTugas) => {
    const matched = santriList?.find((s) => s.id === sub.santriId || (s.nomorInduk && s.nomorInduk === sub.santriNis));
    if (matched) return matched.nama;
    if (sub.santriNama && !sub.santriNama.includes('Zaid') && !sub.santriNama.includes('Azzam')) {
      return sub.santriNama;
    }
    if (sub.santriId === 'user-santri-1') return 'Aini Muftichah';
    if (sub.santriId === 'user-santri-2') return 'Ana fiki hidayatul m';
    if (sub.santriId === 'user-santri-3') return 'Dewi masrurotul h';
    return sub.santriNama || 'Santri Ponpes El Bayan 2';
  };

  const getSantriDisplayNis = (sub: PengumpulanTugas) => {
    const matched = santriList?.find((s) => s.id === sub.santriId || (s.nomorInduk && s.nomorInduk === sub.santriNis));
    if (matched?.nomorInduk) return matched.nomorInduk;
    if (sub.santriId === 'user-santri-1') return 'NIS-20240101';
    if (sub.santriId === 'user-santri-2') return 'NIS-20240102';
    if (sub.santriId === 'user-santri-3') return 'NIS-20240201';
    return sub.santriNis || 'NIS-202401';
  };

  const pendingSantriNames = Array.from(
    new Set(pendingSubmissions.map((s) => getSantriDisplayName(s)))
  );

  return (
    <div className="space-y-6">
      {/* Teacher Hero Banner */}
      <div className="bg-gradient-to-r from-sky-950 via-teal-900 to-sky-900 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs bg-teal-400/20 text-teal-300 px-2 py-0.5 rounded-full font-medium inline-block mb-1.5">
            Portal Khusus Asatidz & Guru Pengampu
          </span>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-xl font-bold tracking-tight">
              Ahlan wa Sahlan, {currentUser.nama}
            </h2>
            {onOpenEditProfile && (
              <button
                onClick={onOpenEditProfile}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/15 hover:bg-white/25 text-teal-200 hover:text-white rounded-lg text-xs font-semibold backdrop-blur-xs transition-colors border border-white/20 cursor-pointer"
                title="Ubah nama ustadz atau perbarui profil pengajar"
              >
                <Edit3 className="w-3.5 h-3.5 text-teal-300" />
                <span>Ubah Nama Ustadz</span>
              </button>
            )}
          </div>
          <p className="text-xs text-teal-100/80 mt-1 max-w-xl leading-relaxed">
            Spesialisasi: {currentUser.spesialisasi || 'Kitab Kuning & Dirasah Islamiyyah'}. Anda dapat mengunggah modul bahan ajar, memeriksa setoran hafalan santri, serta memberikan evaluasi nilai.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onOpenEditProfile && (
            <button
              onClick={onOpenEditProfile}
              className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 backdrop-blur-xs transition-colors border border-white/15 cursor-pointer"
              title="Perbarui profil dan gelar ustadz"
            >
              <UserCheck className="w-4 h-4 text-teal-300" />
              <span>Ubah Profil</span>
            </button>
          )}
          <button
            onClick={onOpenCreateTugas}
            className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 backdrop-blur-xs transition-colors border border-white/15 cursor-pointer"
          >
            <CheckSquare className="w-4 h-4 text-teal-300" />
            <span>Buat Tugas</span>
          </button>
          <button
            onClick={onOpenUploadMateri}
            className="px-3.5 py-2 bg-rose-600/90 hover:bg-rose-600 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 backdrop-blur-xs transition-colors border border-rose-400/40 cursor-pointer shadow-xs"
            title="Unggah rekaman video MP4 atau sematkan video kajian YouTube"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Upload Video / YouTube</span>
          </button>
          <button
            onClick={onOpenUploadMateri}
            className="px-4 py-2 bg-teal-400 text-sky-950 hover:bg-teal-300 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Materi Baru</span>
          </button>
        </div>
      </div>

      {/* Pemberitahuan Santri yang Belum Dikoreksi di Beranda Utama */}
      {pendingSubmissions.length > 0 ? (
        <div className="bg-amber-50/90 border border-amber-300 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-800 shrink-0 mt-0.5">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-amber-950">
                  Pemberitahuan: Setoran Santri Menunggu Pemeriksaan ({pendingSubmissions.length} Berkas)
                </h4>
                <span className="text-[10px] bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded-full">
                  Perlu Nilai
                </span>
              </div>
              <p className="text-xs text-amber-900/90 mt-1">
                Santri yang belum dikoreksi:{' '}
                <strong className="text-amber-950 underline decoration-amber-400">
                  {pendingSantriNames.join(', ')}
                </strong>
                . Silakan tinjau berkas/rekaman setoran santri di bawah dan berikan evaluasi nilai.
              </p>
            </div>
          </div>
          <button
            onClick={() => onGradeSubmission(pendingSubmissions[0])}
            className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors shrink-0 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Award className="w-4 h-4" />
            <span>Koreksi Setoran</span>
          </button>
        </div>
      ) : (
        <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-3.5 px-4 flex items-center justify-between text-xs text-emerald-800">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-emerald-600" />
            <span>
              <strong>Pemberitahuan:</strong> Seluruh tugas santri untuk pelajaran yang Anda ampu telah selesai diperiksa dan dinilai.
            </span>
          </div>
          <span className="text-[11px] font-semibold text-emerald-700 font-mono">100% Selesai</span>
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Kitab yang Diampu</p>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-bold text-slate-900 font-mono">
                {myKitab.length}
              </span>
              <span className="text-xs text-slate-500">Kitab Pokok</span>
            </div>
            <p className="text-[11px] text-teal-700 mt-2 font-medium truncate">
              {myKitab.map((k) => k.namaKitab).join(', ')}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-sky-50 text-sky-700 border border-sky-200">
            <BookOpen className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Materi yang Diunggah</p>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-bold text-slate-900 font-mono">
                {myMateri.length}
              </span>
              <span className="text-xs text-slate-500">Modul & Teks</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">Tersimpan di database</p>
          </div>
          <div className="p-3 rounded-xl bg-teal-50 text-teal-700 border border-teal-200">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Tugas / Setoran Aktif</p>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-bold text-slate-900 font-mono">
                {myTugas.length}
              </span>
              <span className="text-xs text-slate-500">Tugas</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">Diberikan ke santri</p>
          </div>
          <div className="p-3 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200">
            <CheckSquare className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Belum Diperiksa</p>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-bold text-amber-700 font-mono">
                {pendingSubmissions.length}
              </span>
              <span className="text-xs text-slate-500">Setoran Santri</span>
            </div>
            <p className="text-[11px] text-amber-600 mt-2 font-medium">Perlu evaluasi ustadz</p>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Grid: Pending Submissions to Grade & My Uploaded Materials */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Setoran Santri yang Belum Diperiksa */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>Tugas & Setoran Santri Menunggu Pemeriksaan</span>
              </h3>
              <p className="text-xs text-slate-500">
                Santri yang telah mengirimkan rekaman atau jawaban teks
              </p>
            </div>
            <span className="text-xs bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full font-bold">
              {pendingSubmissions.length} Berkas
            </span>
          </div>

          {pendingSubmissions.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500 space-y-2">
              <p className="text-emerald-700 font-semibold">Alhamdulillah, seluruh setoran santri telah dinilai!</p>
              <p className="text-slate-400">Tugas baru dari santri akan muncul di sini secara otomatis.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingSubmissions.map((sub) => {
                const parentTask = allTugas.find((t) => t.id === sub.tugasId);
                return (
                  <div
                    key={sub.id}
                    className="p-4 rounded-xl border border-slate-200 hover:border-sky-300 hover:bg-slate-50/70 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-xs">{getSantriDisplayName(sub)}</span>
                        <span className="text-[10px] text-slate-500 font-mono">({getSantriDisplayNis(sub)})</span>
                        <span className="text-[10px] bg-sky-50 text-sky-800 px-1.5 py-0.2 rounded font-medium">
                          {sub.kelasNama}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 font-medium truncate max-w-md">
                        {parentTask?.judul || 'Tugas Kitab'}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Diserahkan: {sub.tanggalKumpul} {sub.fileNama && `• Berkas: ${sub.fileNama}`}
                      </p>
                    </div>

                    <button
                      onClick={() => onGradeSubmission(sub)}
                      className="px-3.5 py-1.5 bg-sky-800 hover:bg-sky-900 text-white rounded-lg text-xs font-semibold shrink-0 shadow-xs transition-colors flex items-center gap-1.5"
                    >
                      <Award className="w-3.5 h-3.5" />
                      <span>Beri Nilai</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: My Uploaded Materials */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Materi Terakhir Diunggah</h3>
              <p className="text-xs text-slate-500">Daftar materi yang telah Anda terbitkan</p>
            </div>
            <button
              onClick={() => onNavigateTab('materi')}
              className="text-xs font-semibold text-sky-700 hover:text-sky-900 flex items-center gap-1"
            >
              <span>Semua</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {myMateri.slice(0, 5).map((m) => (
              <div
                key={m.id}
                onClick={() => onNavigateTab('materi', { selectedMateriId: m.id })}
                className="p-3 rounded-xl border border-slate-200 hover:border-sky-300 hover:bg-sky-50/30 transition-all cursor-pointer text-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 truncate max-w-[200px]">
                    {m.judul}
                  </span>
                  {m.jenisMateri === 'video' || m.videoEmbedUrl || m.videoDirectUrl ? (
                    m.videoSourceType === 'upload' || m.videoDirectUrl ? (
                      <span className="text-[10px] font-bold bg-teal-100 text-teal-800 px-1.5 py-0.2 rounded flex items-center gap-1">
                        <Film className="w-3 h-3 text-teal-700" /> MP4
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold bg-rose-100 text-rose-800 px-1.5 py-0.2 rounded flex items-center gap-1">
                        <Play className="w-3 h-3 fill-rose-600" /> YouTube
                      </span>
                    )
                  ) : (
                    <span className="text-[10px] uppercase font-mono bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded font-semibold">
                      {m.jenisMateri}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>{m.mapelNama}</span>
                  <span>{m.viewsCount}x dibaca</span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <button
              onClick={onOpenUploadMateri}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Unggah Modul / Bab Baru</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
