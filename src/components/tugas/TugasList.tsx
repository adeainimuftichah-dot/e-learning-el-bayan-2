/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  CheckSquare,
  Search,
  Plus,
  Clock,
  Calendar,
  Award,
  Eye,
  CheckCircle2,
  Trash2,
  Edit2,
  AlertCircle,
  Users,
  Check,
  X,
  UserCheck,
  FileText,
  MessageSquare,
  ChevronRight,
  Filter,
  Video,
  Film,
  Play,
} from 'lucide-react';
import { Tugas, PengumpulanTugas, MataPelajaran, User, isGuruForKitab } from '../../types';

interface TugasListProps {
  tugasList: Tugas[];
  pengumpulanList: PengumpulanTugas[];
  kitabList: MataPelajaran[];
  currentUser: User;
  santriList?: User[];
  onOpenCreateTugas: () => void;
  onOpenEditTugas: (tugas: Tugas) => void;
  onDeleteTugas: (id: string) => void;
  onDeleteSubmission?: (id: string) => void;
  onOpenSubmitTugas: (tugas: Tugas, submission?: PengumpulanTugas) => void;
  onOpenGradeSubmission: (submission: PengumpulanTugas, tugas: Tugas) => void;
}

export const TugasList: React.FC<TugasListProps> = ({
  tugasList,
  pengumpulanList,
  kitabList,
  currentUser,
  santriList = [],
  onOpenCreateTugas,
  onOpenEditTugas,
  onDeleteTugas,
  onDeleteSubmission,
  onOpenSubmitTugas,
  onOpenGradeSubmission,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'daftar' | 'setoran'>('daftar');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMapel, setSelectedMapel] = useState('all');
  const [selectedTugasDetail, setSelectedTugasDetail] = useState<Tugas | null>(null);
  const [detailTab, setDetailTab] = useState<'sudah' | 'belum'>('sudah');
  const [reminderToast, setReminderToast] = useState<string | null>(null);

  const canCreate = currentUser.role === 'admin' || currentUser.role === 'guru';

  // Teacher subject filtering using universal isGuruForKitab
  // Guru can ONLY see and manage subjects they teach:
  const myKitab =
    currentUser.role === 'guru'
      ? kitabList.filter((k) => isGuruForKitab(currentUser, k))
      : kitabList;
  const myKitabIds = myKitab.map((k) => k.id);
  const myKitabNames = myKitab.map((k) => k.namaKitab.toLowerCase());

  // Strictly filter tasks for teacher: ONLY tasks belonging to their taught subjects
  const baseTugasList =
    currentUser.role === 'guru'
      ? tugasList.filter((t) => {
          if (myKitabIds.includes(t.mapelId)) return true;
          const tMapel = (t.mapelNama || '').toLowerCase();
          return myKitabNames.some((kName) => tMapel.includes(kName) || kName.includes(tMapel));
        })
      : tugasList;

  const myTugasIds = baseTugasList.map((t) => t.id);
  const basePengumpulanList =
    currentUser.role === 'guru'
      ? pengumpulanList.filter((p) => myTugasIds.includes(p.tugasId))
      : currentUser.role === 'santri'
      ? pengumpulanList.filter((p) => p.santriId === currentUser.id)
      : pengumpulanList;

  // Submissions filter
  const filteredTugas = baseTugasList.filter((t) => {
    const matchSearch =
      t.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.mapelNama.toLowerCase().includes(searchQuery.toLowerCase());
    const matchMapel = selectedMapel === 'all' || t.mapelId === selectedMapel;
    return matchSearch && matchMapel;
  });

  const filteredPengumpulan = basePengumpulanList.filter((p) => {
    const matchSearch =
      p.santriNama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.santriNis.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.fileNama && p.fileNama.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchSearch;
  });

  const handleSendReminder = (santriNama: string) => {
    setReminderToast(`Pengingat setoran tugas telah dikirimkan kepada santri ${santriNama}`);
    setTimeout(() => setReminderToast(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {reminderToast && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-800 text-white px-4 py-3 rounded-xl shadow-lg border border-emerald-700 flex items-center gap-2 text-xs font-semibold animate-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{reminderToast}</span>
        </div>
      )}

      {/* Top Banner & Tab Switcher */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-800">
                {currentUser.role === 'santri'
                  ? 'Tugas Belajar & Setoran Hafalan Santri'
                  : 'Kelola Tugas & Koreksi Setoran Asatidz'}
              </h2>
              {currentUser.role === 'guru' && (
                <span className="text-[10px] bg-teal-100 text-teal-800 font-bold px-2 py-0.5 rounded-full">
                  Pelajaran Anda ({myKitab.map((k) => k.namaKitab).join(', ') || 'Kitab'})
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Pantau status pengerjaan tugas santri (yang sudah & belum mengerjakan), serta koreksi setoran per tugas secara langsung.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {canCreate && (
              <button
                onClick={onOpenCreateTugas}
                className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2 shrink-0 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Buat Tugas Baru</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Switcher & Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-slate-100">
          <div className="flex items-center p-1 bg-slate-100 rounded-lg w-fit">
            <button
              onClick={() => setActiveSubTab('daftar')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                activeSubTab === 'daftar'
                  ? 'bg-white text-sky-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Daftar Tugas Aktif ({filteredTugas.length})
            </button>
            <button
              onClick={() => setActiveSubTab('setoran')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                activeSubTab === 'setoran'
                  ? 'bg-white text-sky-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua Setoran Masuk ({filteredPengumpulan.length})
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <Filter className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={selectedMapel}
                onChange={(e) => setSelectedMapel(e.target.value)}
                className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 cursor-pointer"
                title="Saring berdasarkan mata pelajaran"
              >
                <option value="all">
                  {currentUser.role === 'guru'
                    ? `Semua Pelajaran Diampu (${myKitab.length})`
                    : `Semua Pelajaran (${kitabList.length})`}
                </option>
                {myKitab.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.namaKitab} ({k.kategori})
                  </option>
                ))}
              </select>
            </div>

            <div className="relative w-60">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari judul tugas, santri..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-slate-800"
              />
            </div>
          </div>
        </div>
      </div>

      {/* View 1: Daftar Tugas Aktif */}
      {activeSubTab === 'daftar' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTugas.length === 0 ? (
            <div className="col-span-full py-16 text-center text-xs text-slate-500 bg-white rounded-2xl border border-slate-200">
              Belum ada tugas untuk mata pelajaran yang dipilih.
            </div>
          ) : (
            filteredTugas.map((tugas) => {
              const mySub = pengumpulanList.find(
                (p) => p.tugasId === tugas.id && p.santriId === currentUser.id
              );
              // Submissions for this specific task
              const taskSubs = pengumpulanList.filter((p) => p.tugasId === tugas.id);
              const pendingSubs = taskSubs.filter((p) => p.status === 'menunggu_diperiksa');
              const gradedSubs = taskSubs.filter((p) => p.status === 'sudah_dinilai');
              
              // Unsubmitted santri for this task
              const submittedSantriIds = taskSubs.map((p) => p.santriId);
              const unsubmittedSantri = santriList.filter(
                (s) => !submittedSantriIds.includes(s.id)
              );
              const totalEnrolled = santriList.length || taskSubs.length;

              const isGraded = mySub?.status === 'sudah_dinilai';

              return (
                <div
                  key={tugas.id}
                  className="bg-white rounded-2xl border border-slate-200 hover:border-teal-400 hover:shadow-md transition-all p-5 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-1 flex-wrap">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-teal-50 text-teal-800 px-2 py-0.5 rounded">
                          {tugas.mapelNama}
                        </span>
                        {(tugas.videoEmbedUrl || tugas.videoDirectUrl) && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 bg-rose-50 text-rose-700 border border-rose-200">
                            <Play className="w-2.5 h-2.5 fill-rose-600" />
                            <span>Video Panduan</span>
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-mono bg-amber-50 text-amber-800 px-2 py-0.5 rounded font-bold">
                        Bobot {tugas.bobotNilai}%
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{tugas.judul}</h3>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                        {tugas.deskripsi}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 space-y-1 text-xs text-slate-600">
                      <p className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Batas Waktu: {new Date(tugas.batasWaktu).toLocaleString('id-ID')}</span>
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Pengampu: <strong>{tugas.guruNama}</strong>
                      </p>
                    </div>

                    {/* Teacher/Admin Information: Breakdown Sudah & Belum Mengumpulkan */}
                    {currentUser.role !== 'santri' && (
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-700">Status Pengerjaan:</span>
                          <span className="font-mono text-[11px] text-slate-500 font-bold">
                            {taskSubs.length} / {totalEnrolled} Santri
                          </span>
                        </div>

                        {/* Visual Progress Bar */}
                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden flex">
                          <div
                            style={{
                              width: `${totalEnrolled > 0 ? (gradedSubs.length / totalEnrolled) * 100 : 0}%`,
                            }}
                            className="bg-emerald-500 h-full"
                            title="Sudah Dikoreksi"
                          />
                          <div
                            style={{
                              width: `${totalEnrolled > 0 ? (pendingSubs.length / totalEnrolled) * 100 : 0}%`,
                            }}
                            className="bg-amber-400 h-full"
                            title="Menunggu Koreksi"
                          />
                        </div>

                        {/* Status Badges */}
                        <div className="flex items-center justify-between pt-1 gap-1 text-[11px]">
                          <span className="text-emerald-700 font-bold flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span>{taskSubs.length} Sudah</span>
                          </span>
                          {pendingSubs.length > 0 && (
                            <span className="text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded font-bold text-[10px]">
                              {pendingSubs.length} Perlu Koreksi
                            </span>
                          )}
                          <span className="text-rose-700 font-bold flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-rose-400" />
                            <span>{unsubmittedSantri.length} Belum</span>
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions depending on Role */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    {currentUser.role === 'santri' ? (
                      isGraded ? (
                        <div className="w-full flex items-center justify-between gap-2">
                          <span className="text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg">
                            Nilai: {mySub?.nilai}/100
                          </span>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => onOpenSubmitTugas(tugas, mySub)}
                              className="text-sky-800 hover:underline font-semibold text-xs cursor-pointer"
                            >
                              Lihat Jawaban
                            </button>
                            {onDeleteSubmission && mySub && (
                              <button
                                onClick={() => onDeleteSubmission(mySub.id)}
                                className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="Hapus Berkas Setoran Ini"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              onClick={() => onDeleteTugas(tugas.id)}
                              className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Hapus Tugas Ini"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ) : mySub ? (
                        <div className="w-full flex items-center justify-between gap-2">
                          <span className="text-amber-700 font-medium bg-amber-50 px-2 py-0.5 rounded text-[11px]">
                            Terkirim (Menunggu Koreksi)
                          </span>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => onOpenSubmitTugas(tugas, mySub)}
                              className="text-sky-800 hover:underline font-semibold text-xs cursor-pointer"
                            >
                              Ubah
                            </button>
                            {onDeleteSubmission && (
                              <button
                                onClick={() => onDeleteSubmission(mySub.id)}
                                className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="Hapus / Batalkan Setoran Ini"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              onClick={() => onDeleteTugas(tugas.id)}
                              className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Hapus Tugas Ini"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="w-full flex items-center justify-between gap-2">
                          <button
                            onClick={() => onOpenSubmitTugas(tugas)}
                            className="flex-1 py-2 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-lg text-xs transition-colors shadow-xs cursor-pointer"
                          >
                            Kerjakan & Setor Tugas
                          </button>
                          <button
                            onClick={() => onDeleteTugas(tugas.id)}
                            className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer border border-rose-200"
                            title="Hapus Tugas Ini"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )
                    ) : (
                      <div className="w-full flex items-center justify-between gap-2">
                        {/* Direct Button to open Per-Tugas Status & Instant Grading */}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedTugasDetail(tugas);
                            setDetailTab('sudah');
                          }}
                          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            pendingSubs.length > 0
                              ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-xs'
                              : 'bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-200'
                          }`}
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>
                            {pendingSubs.length > 0
                              ? `Koreksi (${pendingSubs.length})`
                              : 'Detail Santri'}
                          </span>
                        </button>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => onOpenEditTugas(tugas)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                            title="Sunting Tugas"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteTugas(tugas.id)}
                            className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Hapus Tugas"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* View 2: Semua Setoran Santri Masuk */}
      {activeSubTab === 'setoran' && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4 w-12 text-center">No</th>
                  <th className="py-3 px-4">Santri</th>
                  <th className="py-3 px-4">Tugas / Pelajaran</th>
                  <th className="py-3 px-4">Waktu Setor</th>
                  <th className="py-3 px-4">File / Catatan Jawaban</th>
                  <th className="py-3 px-4 text-center">Status Koreksi</th>
                  <th className="py-3 px-4 text-center">Aksi Ustadz</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPengumpulan.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500">
                      Belum ada setoran tugas santri yang masuk.
                    </td>
                  </tr>
                ) : (
                  filteredPengumpulan.map((p, idx) => {
                    const task = tugasList.find((t) => t.id === p.tugasId);
                    return (
                      <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 text-center font-mono text-slate-400">
                          {idx + 1}
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-bold text-slate-900">{p.santriNama}</p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            {p.santriNis} • {p.kelasNama}
                          </p>
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-semibold text-slate-800 line-clamp-1">
                            {task?.judul || 'Tugas Santri'}
                          </p>
                          <p className="text-[10px] text-teal-700 font-bold">
                            {task?.mapelNama || 'Kitab'}
                          </p>
                        </td>
                        <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                          {p.tanggalKumpul}
                        </td>
                        <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                          {p.fileNama ? (
                            <span className="font-mono text-sky-800 bg-sky-50 px-2 py-0.5 rounded">
                              📎 {p.fileNama}
                            </span>
                          ) : (
                            <span className="italic">{p.jawabanTeks || 'Setoran Teks'}</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {p.status === 'sudah_dinilai' ? (
                            <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full font-bold text-[10px]">
                              Nilai: {p.nilai} / 100
                            </span>
                          ) : (
                            <span className="bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full font-bold text-[10px]">
                              Menunggu Koreksi
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {task && currentUser.role !== 'santri' && (
                              <button
                                onClick={() => onOpenGradeSubmission(p, task)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                  p.status === 'menunggu_diperiksa'
                                    ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-xs'
                                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                }`}
                              >
                                {p.status === 'menunggu_diperiksa' ? 'Koreksi Sekarang' : 'Ubah Nilai'}
                              </button>
                            )}
                            {onDeleteSubmission && (
                              <button
                                onClick={() => onDeleteSubmission(p.id)}
                                className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="Hapus Berkas Setoran Ini"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DEDICATED MODAL: DETAIL STATUS PENGERJAAN & KOREKSI PER TUGAS */}
      {selectedTugasDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-sky-950 via-teal-900 to-sky-900 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] bg-teal-400/20 text-teal-300 px-2 py-0.5 rounded-full font-mono font-medium">
                  {selectedTugasDetail.mapelNama}
                </span>
                <h3 className="text-base font-bold text-white mt-1">
                  Status Pengumpulan: {selectedTugasDetail.judul}
                </h3>
                <p className="text-xs text-teal-200/80">
                  Batas Waktu: {new Date(selectedTugasDetail.batasWaktu).toLocaleString('id-ID')}
                </p>
              </div>
              <button
                onClick={() => setSelectedTugasDetail(null)}
                className="p-1.5 rounded-xl text-teal-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sub-tab Switcher: Sudah vs Belum */}
            {(() => {
              const taskSubs = pengumpulanList.filter((p) => p.tugasId === selectedTugasDetail.id);
              const submittedIds = taskSubs.map((p) => p.santriId);
              const unsubmittedList = santriList.filter((s) => !submittedIds.includes(s.id));
              const pendingCount = taskSubs.filter((p) => p.status === 'menunggu_diperiksa').length;

              return (
                <>
                  <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setDetailTab('sudah')}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          detailTab === 'sudah'
                            ? 'bg-emerald-700 text-white shadow-xs'
                            : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Sudah Mengerjakan ({taskSubs.length})</span>
                        {pendingCount > 0 && (
                          <span className="ml-1 px-1.5 py-0.2 rounded-full bg-amber-400 text-amber-950 text-[10px]">
                            {pendingCount} Perlu Koreksi
                          </span>
                        )}
                      </button>

                      <button
                        onClick={() => setDetailTab('belum')}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          detailTab === 'belum'
                            ? 'bg-rose-700 text-white shadow-xs'
                            : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Belum Mengerjakan ({unsubmittedList.length})</span>
                      </button>
                    </div>

                    <span className="text-xs text-slate-500 font-mono">
                      Total Santri: {santriList.length || taskSubs.length}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {/* TAB 1: SANTRI SUDAH MENGERJAKAN */}
                    {detailTab === 'sudah' && (
                      <div className="space-y-3">
                        {taskSubs.length === 0 ? (
                          <div className="py-12 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl border border-slate-200">
                            Belum ada santri yang mengumpulkan tugas ini.
                          </div>
                        ) : (
                          taskSubs.map((sub) => {
                            const isPending = sub.status === 'menunggu_diperiksa';
                            return (
                              <div
                                key={sub.id}
                                className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                                  isPending
                                    ? 'bg-amber-50/60 border-amber-300 ring-1 ring-amber-400/30'
                                    : 'bg-white border-slate-200'
                                }`}
                              >
                                <div className="space-y-1 truncate flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-slate-900 text-sm">
                                      {sub.santriNama}
                                    </span>
                                    <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                      {sub.santriNis} • {sub.kelasNama}
                                    </span>
                                    {isPending ? (
                                      <span className="text-[10px] bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded-full">
                                        Perlu Koreksi
                                      </span>
                                    ) : (
                                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                                        Nilai: {sub.nilai} / 100
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-slate-600 line-clamp-1 italic">
                                    "{sub.jawabanTeks || 'File setoran terlampir'}"
                                  </p>
                                  <p className="text-[10px] text-slate-400 font-mono">
                                    Waktu Kumpul: {sub.tanggalKumpul}
                                  </p>
                                </div>

                                <div className="shrink-0 flex items-center gap-2">
                                  <button
                                    onClick={() => {
                                      setSelectedTugasDetail(null);
                                      onOpenGradeSubmission(sub, selectedTugasDetail);
                                    }}
                                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                                      isPending
                                        ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-md'
                                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                    }`}
                                  >
                                    <UserCheck className="w-3.5 h-3.5" />
                                    <span>{isPending ? 'Koreksi Sekarang' : 'Ubah Nilai'}</span>
                                  </button>

                                  {onDeleteSubmission && (
                                    <button
                                      onClick={() => onDeleteSubmission(sub.id)}
                                      className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                                      title="Hapus Berkas Setoran Ini"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}

                    {/* TAB 2: SANTRI BELUM MENGERJAKAN */}
                    {detailTab === 'belum' && (
                      <div className="space-y-3">
                        {unsubmittedList.length === 0 ? (
                          <div className="py-12 text-center text-xs text-emerald-700 bg-emerald-50 rounded-2xl border border-emerald-200 font-bold flex flex-col items-center gap-2">
                            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                            <span>Alhamdulillah! Semua santri telah mengumpulkan tugas ini.</span>
                          </div>
                        ) : (
                          unsubmittedList.map((santri) => (
                            <div
                              key={santri.id}
                              className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 flex items-center justify-between gap-3"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs shrink-0">
                                  {santri.nama.charAt(0)}
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-slate-900">{santri.nama}</p>
                                  <p className="text-[10px] text-slate-500">
                                    {santri.nomorInduk || 'NIS'} • {santri.semester || 'Semester 1'} • {santri.kamar || 'Asrama'}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-full">
                                  Belum Setor
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleSendReminder(santri.nama)}
                                  className="px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-[10px] font-semibold text-slate-700 transition-colors cursor-pointer"
                                  title="Kirim notifikasi pengingat ke santri"
                                >
                                  Beri Pengingat
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};
