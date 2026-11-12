/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Award,
  Search,
  Printer,
  CheckCircle2,
  BookOpen,
  UserCheck,
  Clock,
  AlertCircle,
  FileText,
  Edit2,
  Trash2,
  X,
  Plus,
  Users,
  ChevronDown,
  ChevronUp,
  Layers,
  GraduationCap,
} from 'lucide-react';
import { NilaiSantri, User, MataPelajaran, Tugas, PengumpulanTugas, isGuruForKitab } from '../../types';

interface NilaiManagementProps {
  nilaiList: NilaiSantri[];
  currentUser: User;
  kitabList?: MataPelajaran[];
  santriList?: User[];
  tugasList?: Tugas[];
  pengumpulanList?: PengumpulanTugas[];
  onOpenGradeSubmission?: (submission: PengumpulanTugas, tugas: Tugas) => void;
  onSaveNilai?: (nilai: NilaiSantri) => void;
  onDeleteNilai?: (id: string) => void;
}

export const NilaiManagement: React.FC<NilaiManagementProps> = ({
  nilaiList,
  currentUser,
  kitabList = [],
  santriList = [],
  tugasList = [],
  pengumpulanList = [],
  onOpenGradeSubmission,
  onSaveNilai,
  onDeleteNilai,
}) => {
  const [activeTab, setActiveTab] = useState<'per_santri' | 'tabel_semua' | 'tugas'>('per_santri');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMapel, setSelectedMapel] = useState('all');
  const [editingNilai, setEditingNilai] = useState<NilaiSantri | null>(null);
  const [expandedSantriId, setExpandedSantriId] = useState<string | null>(null);

  // Form input nilai
  const [formTugas, setFormTugas] = useState(85);
  const [formKuis, setFormKuis] = useState(85);
  const [formHafalan, setFormHafalan] = useState(90);
  const [formUjian, setFormUjian] = useState(85);
  const [formCatatan, setFormCatatan] = useState('');

  // Kitab yang diampu ustadz
  const myKitab =
    currentUser.role === 'guru'
      ? kitabList.filter((k) => isGuruForKitab(currentUser, k))
      : kitabList;
  const myKitabIds = myKitab.map((k) => k.id);
  const myKitabNames = myKitab.map((k) => k.namaKitab.toLowerCase());

  // Filter daftar nilai dasar
  const baseNilaiList =
    currentUser.role === 'guru'
      ? nilaiList.filter(
          (n) =>
            myKitabIds.includes(n.mapelId) ||
            myKitabNames.some((name) => n.mapelNama.toLowerCase().includes(name))
        )
      : currentUser.role === 'santri'
      ? nilaiList.filter((n) => n.santriId === currentUser.id)
      : nilaiList;

  // Sinkronisasi nama santri & ustadz pengampu
  const resolvedNilaiList = baseNilaiList.map((n) => {
    const matchedSantri = santriList.find((s) => s.id === n.santriId);
    const matchedKitab = kitabList.find((k) => k.id === n.mapelId);
    return {
      ...n,
      santriNama: matchedSantri ? matchedSantri.nama : n.santriNama,
      santriNis: matchedSantri?.nomorInduk || n.santriNis,
      guruPengampu: matchedKitab?.guruNama || 'Ustadz Pengampu',
    };
  });

  // Filter pencarian
  const filtered = resolvedNilaiList.filter((n) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      n.santriNama.toLowerCase().includes(q) ||
      n.mapelNama.toLowerCase().includes(q) ||
      n.santriNis.toLowerCase().includes(q) ||
      (n.guruPengampu && n.guruPengampu.toLowerCase().includes(q));
    const matchMapel = selectedMapel === 'all' || n.mapelId === selectedMapel;
    return matchSearch && matchMapel;
  });

  // PENGELOMPOKAN SESUAI NAMA SANTRI (Group by Santri)
  interface SantriGroup {
    santriId: string;
    santriNama: string;
    santriNis: string;
    kelasNama: string;
    kamar?: string;
    items: typeof resolvedNilaiList;
    rataAkhir: number;
    predikatUmum: string;
  }

  const groupedBySantri: SantriGroup[] = React.useMemo(() => {
    const groupsMap = new Map<string, SantriGroup>();

    filtered.forEach((item) => {
      const key = item.santriId;
      if (!groupsMap.has(key)) {
        const santriInfo = santriList.find((s) => s.id === item.santriId);
        groupsMap.set(key, {
          santriId: key,
          santriNama: item.santriNama,
          santriNis: item.santriNis,
          kelasNama: santriInfo?.semester || item.kelasNama || 'Semester 1',
          kamar: santriInfo?.kamar || 'Asrama Santri',
          items: [],
          rataAkhir: 0,
          predikatUmum: 'Jayyid (B)',
        });
      }
      groupsMap.get(key)!.items.push(item);
    });

    // Hitung rata-rata dan predikat per santri
    const result: SantriGroup[] = Array.from(groupsMap.values()).map((group) => {
      const totalNilai = group.items.reduce((acc, curr) => acc + curr.nilaiAkhir, 0);
      const rata = group.items.length > 0 ? Math.round(totalNilai / group.items.length) : 0;

      let predikat = 'Maqbul (C)';
      if (rata >= 90) predikat = 'Mumtaz (A)';
      else if (rata >= 80) predikat = 'Jayyid Jiddan (B+)';
      else if (rata >= 70) predikat = 'Jayyid (B)';
      else if (rata >= 60) predikat = 'Maqbul (C)';
      else predikat = 'Rasib (D)';

      return {
        ...group,
        rataAkhir: rata,
        predikatUmum: predikat,
      };
    });

    // Urutkan abjad berdasarkan nama santri
    return result.sort((a, b) => a.santriNama.localeCompare(b.santriNama));
  }, [filtered, santriList]);

  // Tugas untuk ustadz
  const teacherTugas =
    currentUser.role === 'guru'
      ? tugasList.filter((t) => t.guruId === currentUser.id || myKitabIds.includes(t.mapelId))
      : tugasList;

  const getPredikatBadge = (predikat: string) => {
    if (predikat.includes('Mumtaz')) {
      return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    }
    if (predikat.includes('Jayyid Jiddan')) {
      return 'bg-sky-50 text-sky-800 border-sky-200';
    }
    if (predikat.includes('Jayyid')) {
      return 'bg-teal-50 text-teal-800 border-teal-200';
    }
    if (predikat.includes('Maqbul')) {
      return 'bg-amber-50 text-amber-800 border-amber-200';
    }
    return 'bg-rose-50 text-rose-800 border-rose-200';
  };

  const handleOpenEditNilai = (n: NilaiSantri) => {
    setEditingNilai(n);
    setFormTugas(n.nilaiTugasRata);
    setFormKuis(n.nilaiKuisRata);
    setFormHafalan(n.nilaiHafalanSetoran);
    setFormUjian(n.nilaiUjianAkhir);
    setFormCatatan(n.catatan);
  };

  const handleSaveEditNilai = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNilai || !onSaveNilai) return;

    const akhir = Math.round(
      formTugas * 0.25 + formKuis * 0.2 + formHafalan * 0.25 + formUjian * 0.3
    );

    let predikat: 'Mumtaz (A)' | 'Jayyid Jiddan (B+)' | 'Jayyid (B)' | 'Maqbul (C)' | 'Rasib (D)' = 'Maqbul (C)';
    if (akhir >= 90) predikat = 'Mumtaz (A)';
    else if (akhir >= 80) predikat = 'Jayyid Jiddan (B+)';
    else if (akhir >= 70) predikat = 'Jayyid (B)';
    else if (akhir >= 60) predikat = 'Maqbul (C)';
    else predikat = 'Rasib (D)';

    const updated: NilaiSantri = {
      ...editingNilai,
      nilaiTugasRata: formTugas,
      nilaiKuisRata: formKuis,
      nilaiHafalanSetoran: formHafalan,
      nilaiUjianAkhir: formUjian,
      nilaiAkhir: akhir,
      predikat,
      catatan: formCatatan.trim(),
    };

    onSaveNilai(updated);
    setEditingNilai(null);
  };

  const handleDeleteEntry = (item: NilaiSantri) => {
    if (!onDeleteNilai) return;
    onDeleteNilai(item.id);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-800">
              {currentUser.role === 'santri'
                ? 'Buku Rapor & Transkrip Nilai Akademik Saya'
                : currentUser.role === 'guru'
                ? 'Kelola Nilai Santri & Pantau Pengerjaan Tugas'
                : 'Pusat Rekapitulasi Nilai Santri (Diterima dari Dewan Ustadz)'}
            </h2>
            {currentUser.role === 'guru' && (
              <span className="text-[10px] bg-teal-100 text-teal-800 font-bold px-2 py-0.5 rounded-full">
                Khusus Mata Pelajaran Anda ({myKitab.map((k) => k.namaKitab).join(', ') || 'Kitab'})
              </span>
            )}
            {currentUser.role === 'admin' && (
              <span className="text-[10px] bg-sky-100 text-sky-800 font-bold px-2.5 py-0.5 rounded-full">
                Mode Penerima Laporan
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {currentUser.role === 'admin'
              ? 'Administrator menerima seluruh akumulasi nilai dari para Ustadz pengampu. Nilai dikelompokkan secara rapi per masing-masing nama santri untuk kemudahan pencetakan rapor.'
              : currentUser.role === 'guru'
              ? 'Kelola dan perbarui nilai tugas, kuis harian, setoran hafalan matan, dan ujian akhir untuk santri yang Anda bimbing.'
              : 'Hasil evaluasi komprehensif dari seluruh dewan Ustadz pengampu kitab.'}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Rekap / Rapor</span>
          </button>
        </div>
      </div>

      {/* Tab Switcher: Dikelompokkan per Santri vs Tabel Lengkap vs Monitoring Tugas */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('per_santri')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'per_santri'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Dikelompokkan per Santri ({groupedBySantri.length} Santri)</span>
        </button>

        <button
          onClick={() => setActiveTab('tabel_semua')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'tabel_semua'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Tabel Semua Nilai ({filtered.length} Rekaman)</span>
        </button>

        {currentUser.role === 'guru' && (
          <button
            onClick={() => setActiveTab('tugas')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'tugas'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Monitoring Tugas Santri (Sudah & Belum)</span>
          </button>
        )}
      </div>

      {/* Filter & Search Bar */}
      {activeTab !== 'tugas' && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama santri, NIS, kitab, atau ustadz pengampu..."
              className="w-full pl-10 pr-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-slate-800"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedMapel}
              onChange={(e) => setSelectedMapel(e.target.value)}
              className="px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            >
              <option value="all">Seluruh Mata Pelajaran Kitab</option>
              {kitabList.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.namaKitab}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* TAMPILAN 1: DIKELOMPOKKAN SESUAI NAMA SANTRI */}
      {activeTab === 'per_santri' && (
        <div className="space-y-4">
          {groupedBySantri.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-xs text-slate-500">
              Tidak ada data nilai santri yang sesuai dengan pencarian.
            </div>
          ) : (
            groupedBySantri.map((group) => {
              const isExpanded = expandedSantriId === null || expandedSantriId === group.santriId;

              return (
                <div
                  key={group.santriId}
                  className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden transition-all"
                >
                  {/* Santri Card Header */}
                  <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-50 via-teal-50/20 to-slate-50 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-teal-800 text-white font-bold flex items-center justify-center text-base shadow-xs shrink-0">
                        {group.santriNama.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-extrabold text-slate-900">
                            {group.santriNama}
                          </h3>
                          <span className="text-[10px] font-mono bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded-md font-semibold">
                            NIS: {group.santriNis}
                          </span>
                          <span className="text-[10px] bg-teal-100 text-teal-800 font-bold px-2 py-0.5 rounded-full">
                            {group.kelasNama}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Kamar / Asrama: <strong className="text-slate-700">{group.kamar}</strong> • Jumlah Kitab Dinilai: <strong className="text-teal-800">{group.items.length} Kitab</strong>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end md:self-center">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block font-medium">Rata-rata Nilai</span>
                        <div className="flex items-center gap-1.5 justify-end">
                          <span className="text-base font-black font-mono text-slate-900">
                            {group.rataAkhir}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getPredikatBadge(
                              group.predikatUmum
                            )}`}
                          >
                            {group.predikatUmum}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() =>
                          setExpandedSantriId(expandedSantriId === group.santriId ? '__NONE__' : group.santriId)
                        }
                        className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/50 transition-colors cursor-pointer"
                        title={isExpanded ? 'Tutup Rincian' : 'Buka Rincian'}
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Nilai Details Table for this Santri */}
                  {isExpanded && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                            <th className="py-2.5 px-4 w-10 text-center">No</th>
                            <th className="py-2.5 px-4">Mata Pelajaran (Kitab)</th>
                            <th className="py-2.5 px-4">Ustadz Pengampu</th>
                            <th className="py-2.5 px-3 text-center">Tugas (25%)</th>
                            <th className="py-2.5 px-3 text-center">Kuis (20%)</th>
                            <th className="py-2.5 px-3 text-center">Hafalan (25%)</th>
                            <th className="py-2.5 px-3 text-center">Ujian (30%)</th>
                            <th className="py-2.5 px-3 text-center">Nilai Akhir</th>
                            <th className="py-2.5 px-3 text-center">Predikat</th>
                            <th className="py-2.5 px-4">Catatan Evaluasi Ustadz</th>
                            <th className="py-2.5 px-3 text-center">Aksi</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {group.items.map((n, idx) => {
                            const canTeacherEdit =
                              currentUser.role === 'guru' &&
                              (myKitabIds.includes(n.mapelId) ||
                                myKitabNames.some((name) => n.mapelNama.toLowerCase().includes(name)));

                            return (
                              <tr key={n.id} className="hover:bg-teal-50/20 transition-colors">
                                <td className="py-3 px-4 text-center font-mono text-slate-400">
                                  {idx + 1}
                                </td>
                                <td className="py-3 px-4">
                                  <span className="font-bold text-teal-900 bg-teal-50 px-2 py-0.5 rounded">
                                    {n.mapelNama}
                                  </span>
                                </td>
                                <td className="py-3 px-4">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[11px] font-semibold text-slate-800">
                                      {n.guruPengampu}
                                    </span>
                                    <span className="text-[9px] bg-emerald-50 text-emerald-700 font-bold px-1.5 py-0.2 rounded border border-emerald-200">
                                      Diterima
                                    </span>
                                  </div>
                                </td>
                                <td className="py-3 px-3 text-center font-mono font-medium text-slate-700">
                                  {n.nilaiTugasRata}
                                </td>
                                <td className="py-3 px-3 text-center font-mono font-medium text-slate-700">
                                  {n.nilaiKuisRata}
                                </td>
                                <td className="py-3 px-3 text-center font-mono font-bold text-teal-800">
                                  {n.nilaiHafalanSetoran}
                                </td>
                                <td className="py-3 px-3 text-center font-mono font-medium text-slate-700">
                                  {n.nilaiUjianAkhir}
                                </td>
                                <td className="py-3 px-3 text-center">
                                  <span className="font-mono font-black text-sm text-slate-900">
                                    {n.nilaiAkhir}
                                  </span>
                                </td>
                                <td className="py-3 px-3 text-center">
                                  <span
                                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getPredikatBadge(
                                      n.predikat
                                    )}`}
                                  >
                                    {n.predikat}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-slate-600 italic text-[11px] max-w-xs truncate">
                                  {n.catatan || '-'}
                                </td>
                                <td className="py-3 px-3 text-center">
                                  <div className="flex items-center justify-center gap-1">
                                    {canTeacherEdit && (
                                      <button
                                        onClick={() => handleOpenEditNilai(n)}
                                        className="p-1 rounded-lg text-slate-600 hover:text-teal-800 hover:bg-teal-50 transition-colors cursor-pointer"
                                        title="Ubah Nilai"
                                      >
                                        <Edit2 className="w-3.5 h-3.5" />
                                      </button>
                                    )}

                                    {/* Tombol Hapus Nilai (Aktif untuk SEMUA USER) */}
                                    <button
                                      onClick={() => handleDeleteEntry(n)}
                                      className="p-1 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                                      title="Hapus Nilai Ini"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAMPILAN 2: TABEL SEMUA NILAI (TABULAR FLAT VIEW) */}
      {activeTab === 'tabel_semua' && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4 w-12 text-center">No</th>
                  <th className="py-3 px-4">Nama Santri</th>
                  <th className="py-3 px-4">Mata Pelajaran (Kitab)</th>
                  <th className="py-3 px-4">Ustadz Pengampu</th>
                  <th className="py-3 px-4 text-center">Rata Tugas</th>
                  <th className="py-3 px-4 text-center">Kuis Harian</th>
                  <th className="py-3 px-4 text-center">Setoran Hafalan</th>
                  <th className="py-3 px-4 text-center">Ujian Akhir</th>
                  <th className="py-3 px-4 text-center">Nilai Akhir</th>
                  <th className="py-3 px-4 text-center">Predikat</th>
                  <th className="py-3 px-4">Catatan Ustadz</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="py-12 text-center text-slate-500">
                      Belum ada rekaman nilai rapor.
                    </td>
                  </tr>
                ) : (
                  filtered.map((n, idx) => {
                    const canTeacherEdit =
                      currentUser.role === 'guru' &&
                      (myKitabIds.includes(n.mapelId) ||
                        myKitabNames.some((name) => n.mapelNama.toLowerCase().includes(name)));

                    return (
                      <tr key={n.id} className="hover:bg-teal-50/30 transition-colors">
                        <td className="py-3.5 px-4 text-center font-mono text-slate-400">
                          {idx + 1}
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-slate-900">{n.santriNama}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{n.santriNis}</p>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded">
                            {n.mapelNama}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-medium text-slate-700 text-[11px]">
                            {n.guruPengampu}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono font-medium text-slate-700">
                          {n.nilaiTugasRata}
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono font-medium text-slate-700">
                          {n.nilaiKuisRata}
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono font-bold text-teal-900">
                          {n.nilaiHafalanSetoran}
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono font-medium text-slate-700">
                          {n.nilaiUjianAkhir}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="font-mono font-extrabold text-sm text-slate-900">
                            {n.nilaiAkhir}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getPredikatBadge(
                              n.predikat
                            )}`}
                          >
                            {n.predikat}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 italic text-[11px] max-w-xs truncate">
                          {n.catatan || '-'}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {canTeacherEdit && (
                              <button
                                onClick={() => handleOpenEditNilai(n)}
                                className="px-2.5 py-1 bg-slate-100 hover:bg-teal-50 hover:text-teal-800 text-slate-700 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                                title="Ubah Nilai"
                              >
                                <Edit2 className="w-3 h-3" />
                                <span>Ubah</span>
                              </button>
                            )}

                            <button
                              onClick={() => handleDeleteEntry(n)}
                              className="p-1 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Hapus Nilai"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
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

      {/* TAMPILAN 3: MONITORING PENGERJAAN TUGAS PER TUGAS (KHUSUS USTADZ) */}
      {activeTab === 'tugas' && (
        <div className="space-y-6">
          {teacherTugas.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-xs text-slate-500">
              Belum ada tugas untuk mata pelajaran yang Anda ampu.
            </div>
          ) : (
            teacherTugas.map((tugas) => {
              const taskSubs = pengumpulanList.filter((p) => p.tugasId === tugas.id);
              const submittedIds = taskSubs.map((p) => p.santriId);
              const unsubmittedSantri = santriList.filter((s) => !submittedIds.includes(s.id));
              const pendingCount = taskSubs.filter((p) => p.status === 'menunggu_diperiksa').length;

              return (
                <div
                  key={tugas.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold bg-teal-100 text-teal-800 px-2 py-0.5 rounded">
                          {tugas.mapelNama}
                        </span>
                        <span className="text-xs text-slate-500">
                          Batas Waktu: {new Date(tugas.batasWaktu).toLocaleDateString('id-ID')}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 mt-1">{tugas.judul}</h3>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                        ✓ {taskSubs.length} Sudah Setor
                      </span>
                      {pendingCount > 0 && (
                        <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-lg">
                          ⏳ {pendingCount} Perlu Koreksi
                        </span>
                      )}
                      <span className="text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-lg">
                        ✗ {unsubmittedSantri.length} Belum Setor
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Sudah Mengumpulkan */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-slate-800 flex items-center justify-between">
                        <span className="text-emerald-700">Sudah Mengumpulkan ({taskSubs.length}):</span>
                        <span className="text-[10px] text-slate-400">Klik untuk koreksi</span>
                      </h4>

                      {taskSubs.length === 0 ? (
                        <p className="text-xs text-slate-400 italic py-3 bg-slate-50 rounded-xl text-center">
                          Belum ada yang mengumpulkan tugas ini.
                        </p>
                      ) : (
                        <div className="space-y-2 max-h-56 overflow-y-auto">
                          {taskSubs.map((sub) => {
                            const isPending = sub.status === 'menunggu_diperiksa';
                            return (
                              <div
                                key={sub.id}
                                className={`p-3 rounded-xl border flex items-center justify-between text-xs gap-2 ${
                                  isPending
                                    ? 'bg-amber-50/70 border-amber-300'
                                    : 'bg-white border-slate-200'
                                }`}
                              >
                                <div className="truncate">
                                  <p className="font-bold text-slate-900 truncate">
                                    {sub.santriNama}
                                  </p>
                                  <p className="text-[10px] text-slate-500 font-mono">
                                    {sub.tanggalKumpul} • {sub.status === 'sudah_dinilai' ? `Nilai: ${sub.nilai}/100` : 'Menunggu Koreksi'}
                                  </p>
                                </div>

                                {onOpenGradeSubmission && (
                                  <button
                                    onClick={() => onOpenGradeSubmission(sub, tugas)}
                                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                                      isPending
                                        ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-xs'
                                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                    }`}
                                  >
                                    {isPending ? 'Koreksi' : 'Ubah'}
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Belum Mengumpulkan */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-rose-700">
                        Belum Mengumpulkan ({unsubmittedSantri.length}):
                      </h4>

                      {unsubmittedSantri.length === 0 ? (
                        <p className="text-xs text-emerald-700 font-medium py-3 bg-emerald-50 rounded-xl text-center">
                          ✓ Semua santri telah mengumpulkan tugas ini.
                        </p>
                      ) : (
                        <div className="space-y-2 max-h-56 overflow-y-auto">
                          {unsubmittedSantri.map((santri) => (
                            <div
                              key={santri.id}
                              className="p-3 rounded-xl border border-rose-100 bg-rose-50/30 flex items-center justify-between text-xs"
                            >
                              <div>
                                <p className="font-bold text-slate-900">{santri.nama}</p>
                                <p className="text-[10px] text-slate-500">
                                  {santri.nomorInduk || 'NIS'} • {santri.semester || 'Semester 1'}
                                </p>
                              </div>
                              <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-full">
                                Belum Setor
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* MODAL EDIT NILAI RAPOR */}
      {editingNilai && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in duration-200">
            <div className="px-6 py-4 bg-gradient-to-r from-sky-950 via-teal-900 to-sky-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Masukkan / Ubah Nilai Santri</h3>
                <p className="text-xs text-teal-200/80">
                  {editingNilai.santriNama} • {editingNilai.mapelNama}
                </p>
              </div>
              <button
                onClick={() => setEditingNilai(null)}
                className="p-1 rounded-lg text-teal-200 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditNilai} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Rata-rata Tugas (25%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formTugas}
                    onChange={(e) => setFormTugas(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kuis Harian (20%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formKuis}
                    onChange={(e) => setFormKuis(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Setoran Hafalan (25%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formHafalan}
                    onChange={(e) => setFormHafalan(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Ujian Akhir (30%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formUjian}
                    onChange={(e) => setFormUjian(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Catatan Evaluasi Ustadz
                </label>
                <textarea
                  rows={2}
                  value={formCatatan}
                  onChange={(e) => setFormCatatan(e.target.value)}
                  placeholder="Catatan perkembangan belajar santri..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingNilai(null)}
                  className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-teal-700 hover:bg-teal-800 text-white rounded-xl shadow-xs"
                >
                  Simpan Nilai Santri
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
