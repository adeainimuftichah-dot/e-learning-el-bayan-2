/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  FileText,
  Search,
  Filter,
  Plus,
  Eye,
  Edit2,
  Trash2,
  Download,
  BookOpen,
  Video,
  Volume2,
  Film,
  Play,
  RotateCcw,
} from 'lucide-react';
import { Materi, MataPelajaran, Kelas, User, isGuruForKitab } from '../../types';
import { MateriTrashModal } from './MateriTrashModal';

interface MateriListProps {
  materiList: Materi[];
  kitabList: MataPelajaran[];
  kelasList: Kelas[];
  currentUser: User;
  trashList?: Materi[];
  onOpenViewer: (materi: Materi) => void;
  onOpenUpload: () => void;
  onOpenEdit: (materi: Materi) => void;
  onDeleteMateri: (id: string) => void;
  onRestoreMateri?: (id?: string) => void;
  onClearTrash?: () => void;
}

export const MateriList: React.FC<MateriListProps> = ({
  materiList,
  kitabList,
  kelasList,
  currentUser,
  trashList = [],
  onOpenViewer,
  onOpenUpload,
  onOpenEdit,
  onDeleteMateri,
  onRestoreMateri,
  onClearTrash,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMapel, setSelectedMapel] = useState('all');
  const [selectedJenis, setSelectedJenis] = useState('all');
  const [isTrashOpen, setIsTrashOpen] = useState(false);

  const canManage = currentUser.role === 'admin' || currentUser.role === 'guru';

  // If guru, only show their own materials
  const myKitab = currentUser.role === 'guru' ? kitabList.filter((k) => isGuruForKitab(currentUser, k)) : kitabList;
  const myKitabIds = myKitab.map((k) => k.id);
  const availableKitab = myKitab;

  const baseMateriList =
    currentUser.role === 'guru'
      ? materiList.filter((m) => m.guruId === currentUser.id || myKitabIds.includes(m.mapelId))
      : materiList;

  // Filtered
  const filtered = baseMateriList.filter((m) => {
    const matchSearch =
      m.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.mapelNama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.guruNama.toLowerCase().includes(searchQuery.toLowerCase());
    const matchMapel = selectedMapel === 'all' || m.mapelId === selectedMapel;
    
    let matchJenis = true;
    if (selectedJenis === 'all') matchJenis = true;
    else if (selectedJenis === 'video') matchJenis = m.jenisMateri === 'video' || Boolean(m.videoEmbedUrl || m.videoDirectUrl);
    else if (selectedJenis === 'youtube') matchJenis = m.videoSourceType === 'youtube' || Boolean(m.videoEmbedUrl && !m.videoDirectUrl);
    else if (selectedJenis === 'upload') matchJenis = m.videoSourceType === 'upload' || Boolean(m.videoDirectUrl);
    else matchJenis = m.jenisMateri === selectedJenis;

    return matchSearch && matchMapel && matchJenis;
  });

  const getFormatBadge = (materi: Materi) => {
    if (materi.jenisMateri === 'video' || materi.videoEmbedUrl || materi.videoDirectUrl) {
      if (materi.videoSourceType === 'upload' || (materi.videoDirectUrl && !materi.videoEmbedUrl)) {
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.5 rounded">
            <Film className="w-3 h-3 text-teal-700" />
            VIDEO MP4
          </span>
        );
      }
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded">
          <Play className="w-3 h-3 fill-rose-600" />
          YOUTUBE
        </span>
      );
    }

    switch (materi.jenisMateri) {
      case 'pdf':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-rose-50 text-rose-700 px-2 py-0.5 rounded">
            <FileText className="w-3 h-3" />
            PDF
          </span>
        );
      case 'audio':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-50 text-amber-700 px-2 py-0.5 rounded">
            <Volume2 className="w-3 h-3" />
            AUDIO
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-teal-50 text-teal-700 px-2 py-0.5 rounded">
            <BookOpen className="w-3 h-3" />
            TEKS
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-800">
                {currentUser.role === 'guru'
                  ? 'Materi Pembelajaran Saya (Kitab yang Diampu)'
                  : 'Daftar Materi Pembelajaran Digital Pesantren'}
              </h2>
              {currentUser.role === 'guru' && (
                <span className="text-[10px] bg-teal-100 text-teal-800 font-bold px-2 py-0.5 rounded-full">
                  Khusus Pelajaran Anda
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {currentUser.role === 'guru'
                ? `Menampilkan ${filtered.length} materi yang Anda terbitkan untuk santri.`
                : `Menampilkan ${filtered.length} materi terverifikasi dari 12 kitab pokok.`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsTrashOpen(true)}
              className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
              title="Lihat dan pulihkan materi yang dihapus"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-700" />
              <span>Kotak Sampah & Pemulihan {trashList.length > 0 ? `(${trashList.length})` : ''}</span>
            </button>

            {canManage && (
              <>
                <button
                  onClick={onOpenUpload}
                  className="px-3.5 py-2 bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
                  title="Kirim link YouTube atau upload video MP4 pengajian"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Upload Video / YouTube</span>
                </button>
                <button
                  onClick={onOpenUpload}
                  className="px-3.5 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Unggah Materi Baru</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2 border-t border-slate-100">
          <div className="sm:col-span-5 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari judul materi, guru pengampu..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 text-slate-800"
            />
          </div>

          <div className="sm:col-span-4">
            <select
              value={selectedMapel}
              onChange={(e) => setSelectedMapel(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
            >
              <option value="all">Semua Mata Pelajaran / Kitab</option>
              {availableKitab.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.namaKitab}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-3">
            <select
              value={selectedJenis}
              onChange={(e) => setSelectedJenis(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium"
            >
              <option value="all">Semua Jenis File</option>
              <option value="video">Semua Video (YouTube & MP4)</option>
              <option value="youtube">Khusus Link YouTube</option>
              <option value="upload">Khusus Berkas Video MP4</option>
              <option value="pdf">Dokumen PDF Kitab</option>
              <option value="ringkasan">Teks Matan & Terjemah</option>
              <option value="audio">Rekaman Audio / Bacaan</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table view as requested by user prompt */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4 w-12 text-center">No</th>
                <th className="py-3 px-4">Judul Materi Pembelajaran</th>
                <th className="py-3 px-4">Mata Pelajaran (Kitab)</th>
                <th className="py-3 px-4">Guru / Ustadz</th>
                <th className="py-3 px-4">Tanggal Unggah</th>
                <th className="py-3 px-4">Jenis File</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center w-32">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    Tidak ditemukan materi yang sesuai kriteria pencarian.
                  </td>
                </tr>
              ) : (
                filtered.map((materi, idx) => (
                  <tr key={materi.id} className="hover:bg-sky-50/40 transition-colors">
                    <td className="py-3.5 px-4 text-center font-mono text-slate-400">
                      {idx + 1}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-800 line-clamp-1">{materi.judul}</p>
                      <p className="text-[11px] text-slate-400 truncate max-w-sm">
                        {materi.deskripsi}
                      </p>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-sky-800 bg-sky-50 px-2 py-0.5 rounded">
                        {materi.mapelNama}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-700">
                      {materi.guruNama}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                      {materi.tanggalUnggah}
                    </td>
                    <td className="py-3.5 px-4">
                      {getFormatBadge(materi)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          materi.statusPublikasi === 'publik'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {materi.statusPublikasi === 'publik' ? 'Terbit' : 'Draf'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onOpenViewer(materi)}
                          className="p-1.5 rounded-lg text-sky-700 hover:bg-sky-100 transition-colors"
                          title="Pratinjau Materi / Baca"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {canManage && (
                          <button
                            onClick={() => onOpenEdit(materi)}
                            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
                            title="Sunting Materi"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => onDeleteMateri(materi.id)}
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Hapus Materi Ini"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Kotak Sampah & Pemulihan Modal */}
      <MateriTrashModal
        isOpen={isTrashOpen}
        trashList={trashList}
        onClose={() => setIsTrashOpen(false)}
        onRestoreSingle={(id) => {
          onRestoreMateri?.(id);
        }}
        onRestoreAll={() => {
          onRestoreMateri?.();
          setIsTrashOpen(false);
        }}
        onClearTrash={() => {
          onClearTrash?.();
          setIsTrashOpen(false);
        }}
      />
    </div>
  );
};
