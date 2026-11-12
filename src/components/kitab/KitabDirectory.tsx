/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  Filter,
  ArrowRight,
  User,
  GraduationCap,
  FileText,
  CheckSquare,
  HelpCircle,
  ChevronLeft,
  Download,
  Play,
  Eye,
  Plus,
} from 'lucide-react';
import { MataPelajaran, Materi, Tugas, Kuis, User as UserType, isGuruForKitab } from '../../types';

interface KitabDirectoryProps {
  kitabList: MataPelajaran[];
  materiList: Materi[];
  tugasList: Tugas[];
  kuisList: Kuis[];
  currentUser: UserType;
  initialSelectedKitabId?: string;
  onOpenMateriViewer: (materi: Materi) => void;
  onOpenSubmitTugas: (tugas: Tugas) => void;
  onOpenUploadMateri: () => void;
}

export const KitabDirectory: React.FC<KitabDirectoryProps> = ({
  kitabList,
  materiList,
  tugasList,
  kuisList,
  currentUser,
  initialSelectedKitabId,
  onOpenMateriViewer,
  onOpenSubmitTugas,
  onOpenUploadMateri,
}) => {
  const [selectedKitabId, setSelectedKitabId] = useState<string | null>(
    initialSelectedKitabId || null
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKategori, setSelectedKategori] = useState<string>('all');

  const selectedKitab = kitabList.find((k) => k.id === selectedKitabId);

  // If currentUser is guru, restrict list to their taught subjects
  const baseKitabList =
    currentUser.role === 'guru'
      ? kitabList.filter((k) => isGuruForKitab(currentUser, k))
      : kitabList;

  // Filtered kitab
  const filteredKitab = baseKitabList.filter((k) => {
    const matchSearch =
      k.namaKitab.toLowerCase().includes(searchQuery.toLowerCase()) ||
      k.arabTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      k.mushannif.toLowerCase().includes(searchQuery.toLowerCase()) ||
      k.guruNama.toLowerCase().includes(searchQuery.toLowerCase());
    const matchKategori = selectedKategori === 'all' || k.kategori === selectedKategori;
    return matchSearch && matchKategori;
  });

  const categories = [
    'all',
    'Nahwu & Shorof',
    'Fiqih & Ushul Fiqih',
    'Akhlak & Tasawuf',
    'Tarikh & Sirah',
    'Hadits & Mustholah',
    'Al-Qur\'an & Tajwid',
    'Aqidah & Tauhid',
  ];

  // If a kitab is selected, show detail view
  if (selectedKitab) {
    const relatedMateri = materiList.filter((m) => m.mapelId === selectedKitab.id);
    const relatedTugas = tugasList.filter((t) => t.mapelId === selectedKitab.id);
    const relatedKuis = kuisList.filter((k) => k.mapelId === selectedKitab.id);

    return (
      <div className="space-y-6">
        {/* Back button */}
        <button
          onClick={() => setSelectedKitabId(null)}
          className="flex items-center gap-2 text-xs font-semibold text-sky-800 hover:text-sky-950 bg-white px-3 py-2 rounded-xl border border-slate-200 transition-colors w-fit shadow-xs"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Kembali ke 12 Daftar Kitab</span>
        </button>

        {/* Kitab Detail Header Card */}
        <div className="bg-gradient-to-r from-sky-950 via-sky-900 to-teal-950 rounded-2xl p-8 text-white shadow-md relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xs bg-teal-400/20 text-teal-300 px-3 py-1 rounded-full font-semibold">
                  {selectedKitab.kategori}
                </span>
                <span className="text-xs bg-white/10 text-white/90 px-3 py-1 rounded-full font-mono">
                  Kode: {selectedKitab.kode}
                </span>
                <span className="text-xs bg-white/10 text-white/90 px-3 py-1 rounded-full">
                  {selectedKitab.tingkat}
                </span>
              </div>

              <div>
                <h2 className="text-2xl font-bold tracking-tight">{selectedKitab.namaKitab}</h2>
                <p className="font-arabic text-2xl text-teal-200 mt-1 dir-rtl text-right sm:text-left">
                  {selectedKitab.arabTitle}
                </p>
              </div>

              <p className="text-xs text-sky-200/90 max-w-2xl leading-relaxed">
                {selectedKitab.deskripsi}
              </p>

              <div className="flex flex-wrap items-center gap-6 pt-3 border-t border-sky-800/80 text-xs text-teal-100">
                <span>
                  Mushannif (Pengarang): <strong>{selectedKitab.mushannif}</strong>
                </span>
                <span>
                  Ustadz Pengampu: <strong>{selectedKitab.guruNama}</strong>
                </span>
                <span>
                  Total Kurikulum: <strong>{selectedKitab.jumlahBab} Bab</strong>
                </span>
              </div>
            </div>

            {currentUser.role === 'guru' && (
              <button
                onClick={onOpenUploadMateri}
                className="px-4 py-2.5 bg-teal-400 hover:bg-teal-300 text-sky-950 text-xs font-bold rounded-xl shadow-md transition-colors flex items-center gap-2 shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Unggah Materi Kitab Ini</span>
              </button>
            )}
          </div>
        </div>

        {/* 3 Tabs: Materi Pelajaran, Tugas Setoran, Kuis Evaluasi */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Materi Pembelajaran Kitab */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-teal-700" />
                  <span>Materi & Modul Kitab ({relatedMateri.length})</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Matan digital, terjemah, dan dokumen PDF yang telah diterbitkan
                </p>
              </div>
            </div>

            {relatedMateri.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500">
                Belum ada materi yang diunggah untuk kitab ini.
              </div>
            ) : (
              <div className="space-y-3">
                {relatedMateri.map((m) => (
                  <div
                    key={m.id}
                    className="p-4 rounded-xl border border-slate-200 hover:border-teal-400 hover:bg-teal-50/20 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                          {m.jenisMateri}
                        </span>
                        <span className="text-[10px] text-slate-400">{m.kelasNama}</span>
                        <span className="text-[10px] text-slate-400">• {m.tanggalUnggah}</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900">{m.judul}</h4>
                      <p className="text-[11px] text-slate-600 line-clamp-1">{m.deskripsi}</p>
                    </div>

                    <button
                      onClick={() => onOpenMateriViewer(m)}
                      className="px-3.5 py-1.5 bg-sky-800 hover:bg-sky-900 text-white rounded-lg text-xs font-semibold shrink-0 shadow-xs transition-colors flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Buka Pelajaran</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Tugas & Kuis Kitab Ini */}
          <div className="lg:col-span-5 space-y-6">
            {/* Tugas Setoran Box */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-amber-600" />
                    <span>Tugas & Setoran ({relatedTugas.length})</span>
                  </h3>
                  <p className="text-xs text-slate-500">Kewajiban santri mukim</p>
                </div>
              </div>

              {relatedTugas.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-500">
                  Tidak ada tugas aktif untuk kitab ini.
                </div>
              ) : (
                <div className="space-y-3">
                  {relatedTugas.map((t) => (
                    <div
                      key={t.id}
                      className="p-3.5 rounded-xl border border-slate-200 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">{t.judul}</span>
                        <span className="text-[10px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full font-semibold">
                          Bobot {t.bobotNilai}%
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px] line-clamp-2">{t.deskripsi}</p>
                      <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                        <span className="text-[10px] text-slate-400">
                          Batas: {new Date(t.batasWaktu).toLocaleDateString('id-ID')}
                        </span>
                        {currentUser.role === 'santri' && (
                          <button
                            onClick={() => onOpenSubmitTugas(t)}
                            className="text-xs text-sky-800 hover:underline font-bold"
                          >
                            Setor Tugas →
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Kuis Evaluasi Box */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-teal-700" />
                <span>Kuis & Ikhtibar ({relatedKuis.length})</span>
              </h3>
              {relatedKuis.length === 0 ? (
                <p className="text-xs text-slate-500 py-3 text-center">
                  Belum ada kuis daring terjadwal.
                </p>
              ) : (
                relatedKuis.map((k) => (
                  <div
                    key={k.id}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between font-bold text-slate-800">
                      <span>{k.judul}</span>
                      <span className="text-[10px] text-teal-700">{k.durasiMenit} Menit</span>
                    </div>
                    <p className="text-slate-500 text-[11px]">{k.deskripsi}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Otherwise, render full 12 Kitab Grid Directory
  return (
    <div className="space-y-6">
      {/* Header & Filter Controls */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                  currentUser.role === 'guru'
                    ? 'bg-teal-100 text-teal-800'
                    : 'bg-sky-100 text-sky-800'
                }`}
              >
                {currentUser.role === 'guru'
                  ? `${baseKitabList.length} Kitab yang Anda Ampu`
                  : '12 Kitab Kuning Pokok'}
              </span>
              <span className="text-xs text-slate-500">
                {currentUser.role === 'guru'
                  ? 'Mata Pelajaran Anda Sendiri'
                  : 'Kurikulum Turats Pesantren'}
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 mt-1">
              {currentUser.role === 'guru'
                ? 'Kitab & Mata Pelajaran Saya'
                : 'Daftar Mata Pelajaran & Kitab Kuning'}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari kitab atau pengarang..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 text-slate-800"
              />
            </div>
          </div>
        </div>

        {/* Category Pill Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-500 font-semibold text-xs mr-1 shrink-0">Kategori:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedKategori(cat)}
              className={`px-3 py-1 rounded-lg font-semibold shrink-0 transition-all ${
                selectedKategori === cat
                  ? 'bg-sky-800 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat === 'all' ? 'Semua Kitab' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* 12 Kitab Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredKitab.map((k, index) => {
          const materiCount = materiList.filter((m) => m.mapelId === k.id).length;
          const tugasCount = tugasList.filter((t) => t.mapelId === k.id).length;

          return (
            <div
              key={k.id}
              onClick={() => setSelectedKitabId(k.id)}
              className="bg-white rounded-2xl border border-slate-200 hover:border-sky-400 hover:shadow-lg transition-all cursor-pointer p-6 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-sky-50 text-sky-800 px-2 py-0.5 rounded">
                    {k.kategori}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-400">
                    #{index + 1 < 10 ? `0${index + 1}` : index + 1}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 group-hover:text-sky-800 transition-colors">
                  {k.namaKitab}
                </h3>
                <p className="font-arabic text-lg text-teal-800 mt-1 dir-rtl text-right font-medium">
                  {k.arabTitle}
                </p>

                <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                  {k.deskripsi}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1 text-xs text-slate-600">
                  <p className="truncate">
                    <span className="text-slate-400">Mushannif:</span> {k.mushannif}
                  </p>
                  <p className="truncate">
                    <span className="text-slate-400">Pengampu:</span>{' '}
                    <strong className="text-slate-700">{k.guruNama}</strong>
                  </p>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3 text-slate-500 font-medium text-[11px]">
                  <span>{materiCount} Materi</span>
                  <span>•</span>
                  <span>{tugasCount} Tugas</span>
                </div>
                <span className="text-sky-700 group-hover:text-sky-900 font-bold flex items-center gap-1 text-xs">
                  <span>Buka Kitab</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
