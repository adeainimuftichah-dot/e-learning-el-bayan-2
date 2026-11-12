/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  HelpCircle,
  Clock,
  Award,
  CheckCircle2,
  Play,
  Plus,
  Trash2,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { Kuis, JawabanKuisSantri, User, MataPelajaran, isGuruForKitab } from '../../types';

interface KuisListProps {
  kuisList: Kuis[];
  jawabanList: JawabanKuisSantri[];
  currentUser: User;
  onOpenTakeKuis: (kuis: Kuis) => void;
  onDeleteKuis: (id: string) => void;
  kitabList?: MataPelajaran[];
  onOpenCreateKuis?: () => void;
}

export const KuisList: React.FC<KuisListProps> = ({
  kuisList,
  jawabanList,
  currentUser,
  onOpenTakeKuis,
  onDeleteKuis,
  kitabList = [],
  onOpenCreateKuis,
}) => {
  const canManage = currentUser.role === 'admin' || currentUser.role === 'guru';
  const [selectedMapelId, setSelectedMapelId] = useState<string>('all');

  // Filter for guru: strictly only subjects taught by this ustadz
  const myKitab = kitabList.filter((k) => isGuruForKitab(currentUser, k));
  const myKitabIds = myKitab.map((k) => k.id);
  const myKitabNames = myKitab.map((k) => k.namaKitab.toLowerCase());

  const teacherKuisList =
    currentUser.role === 'guru'
      ? kuisList.filter((k) => {
          if (myKitabIds.includes(k.mapelId)) return true;
          const kMapel = (k.mapelNama || '').toLowerCase();
          return myKitabNames.some((title) => kMapel.includes(title) || title.includes(kMapel));
        })
      : kuisList;

  const displayedKuisList =
    selectedMapelId === 'all'
      ? teacherKuisList
      : teacherKuisList.filter(
          (k) => k.mapelId === selectedMapelId || (k.mapelNama || '').toLowerCase().includes(selectedMapelId.toLowerCase())
        );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-800">
              Kuis & Evaluasi Pembelajaran Santri (Ikhtibar Digital)
            </h2>
            {currentUser.role === 'guru' && (
              <span className="text-[10px] bg-teal-100 text-teal-800 font-bold px-2 py-0.5 rounded-full">
                Khusus Pelajaran yang Diampu
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {currentUser.role === 'guru'
              ? `Menampilkan kuis evaluasi untuk kitab yang Anda ampu (${displayedKuisList.length} Kuis). Anda hanya mengelola butir soal dari kitab pengajaran Anda.`
              : 'Evaluasi berkala pemahaman nahwu, fiqih ibadah, dan hafalan hadits secara objektif dan instan.'}
          </p>
          {currentUser.role === 'guru' && (
            <p className="text-[11px] text-teal-700 font-medium mt-1">
              Kitab Anda: <strong>{myKitab.map((k) => k.namaKitab).join(', ') || 'Belum ditentukan'}</strong>
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Subject Filter Dropdown */}
          {currentUser.role === 'guru' && myKitab.length > 1 && (
            <div className="flex items-center gap-1.5 text-xs">
              <label htmlFor="filter-mapel-kuis" className="text-slate-500 text-[11px] font-semibold">
                Filter Kitab:
              </label>
              <select
                id="filter-mapel-kuis"
                value={selectedMapelId}
                onChange={(e) => setSelectedMapelId(e.target.value)}
                className="px-2.5 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
              >
                <option value="all">Semua Kitab Saya ({teacherKuisList.length})</option>
                {myKitab.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.namaKitab}
                  </option>
                ))}
              </select>
            </div>
          )}

          {canManage && onOpenCreateKuis && (
            <button
              onClick={onOpenCreateKuis}
              className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2 shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Kuis Baru</span>
            </button>
          )}
        </div>
      </div>

      {/* Quizzes Grid */}
      {displayedKuisList.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-xs space-y-3">
          <HelpCircle className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="font-bold text-slate-700">Belum Ada Kuis untuk Mata Pelajaran Ini</p>
          <p className="text-slate-500 max-w-md mx-auto">
            {currentUser.role === 'guru'
              ? 'Anda belum menerbitkan kuis evaluasi untuk kitab yang Anda ampu. Silakan klik tombol "Buat Kuis Baru" di atas untuk menambahkan butir soal.'
              : 'Belum ada kuis yang tersedia saat ini.'}
          </p>
          {canManage && onOpenCreateKuis && (
            <button
              onClick={onOpenCreateKuis}
              className="px-4 py-2 bg-teal-700 text-white rounded-lg font-semibold inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Buat Kuis Sekarang</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {displayedKuisList.map((kuis) => {
          const myResult = jawabanList.find(
            (j) => j.kuisId === kuis.id && j.santriId === currentUser.id
          );
          const hasTaken = Boolean(myResult);

          return (
            <div
              key={kuis.id}
              className="bg-white rounded-2xl border border-slate-200 hover:border-teal-400 hover:shadow-md transition-all p-6 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-teal-50 text-teal-800 px-2 py-0.5 rounded">
                    {kuis.mapelNama}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{kuis.durasiMenit} Menit</span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900 leading-snug">{kuis.judul}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{kuis.deskripsi}</p>

                <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-100 text-center text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Total Soal</span>
                    <strong className="text-slate-800 font-mono text-sm">
                      {kuis.soal.length} Butir
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Nilai Kelulusan (KKM)</span>
                    <strong className="text-slate-800 font-mono text-sm">
                      {kuis.passingScore}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Semester</span>
                    <strong className="text-slate-800 text-[11px] truncate block">
                      {kuis.semester || kuis.kelasNama || 'Semester 1'}
                    </strong>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400">
                  Ustadz Pengampu: <strong>{kuis.guruNama}</strong>
                </p>
              </div>

              {/* Footer action / Result */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                {currentUser.role === 'santri' ? (
                  hasTaken ? (
                    <div className="w-full flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg">
                        Sudah Dikerjakan (Nilai: {myResult?.nilaiAkhir}/100)
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => onOpenTakeKuis(kuis)}
                          className="text-xs text-sky-800 hover:underline font-semibold cursor-pointer"
                        >
                          Ulangi / Tinjau Soal
                        </button>
                        <button
                          onClick={() => onDeleteKuis(kuis.id)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Hapus Kuis Ini"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full flex items-center justify-between gap-2">
                      <button
                        onClick={() => onOpenTakeKuis(kuis)}
                        className="flex-1 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl text-xs transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Play className="w-4 h-4 fill-white" />
                        <span>Mulai Kerjakan Ujian Sekarang</span>
                      </button>
                      <button
                        onClick={() => onDeleteKuis(kuis.id)}
                        className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer border border-rose-200"
                        title="Hapus Kuis Ini"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )
                ) : (
                  <div className="w-full flex items-center justify-between gap-2">
                    <span className="text-xs text-slate-500 font-medium">
                      Status: <strong>Tersedia untuk Santri</strong>
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onOpenTakeKuis(kuis)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                      >
                        Pratinjau Soal
                      </button>
                      <button
                        onClick={() => onDeleteKuis(kuis.id)}
                        className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Hapus Kuis Ini"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      )}
    </div>
  );
};
