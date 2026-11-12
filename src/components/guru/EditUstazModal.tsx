/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  UserCheck,
  GraduationCap,
  Sparkles,
  BookOpen,
  Mail,
  Hash,
  AtSign,
  Check,
  AlertCircle,
} from 'lucide-react';
import { User, MataPelajaran } from '../../types';

interface EditUstazModalProps {
  isOpen: boolean;
  onClose: () => void;
  guru: User;
  onSave: (updatedUser: User) => void;
  allKitab?: MataPelajaran[];
}

export const EditUstazModal: React.FC<EditUstazModalProps> = ({
  isOpen,
  onClose,
  guru,
  onSave,
  allKitab = [],
}) => {
  const [nama, setNama] = useState(guru.nama || '');
  const [nip, setNip] = useState(guru.nomorInduk || '');
  const [spesialisasi, setSpesialisasi] = useState(guru.spesialisasi || '');
  const [email, setEmail] = useState(guru.email || '');
  const [username, setUsername] = useState(guru.username || '');
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  useEffect(() => {
    setNama(guru.nama || '');
    setNip(guru.nomorInduk || '');
    setSpesialisasi(guru.spesialisasi || '');
    setEmail(guru.email || '');
    setUsername(guru.username || '');
  }, [guru, isOpen]);

  if (!isOpen) return null;

  const myTaughtKitab = allKitab.filter((k) => k.guruId === guru.id);

  const titleShortcuts = [
    'Ust.',
    'Ustadzah',
    'K.H.',
    'Lc.',
    'M.Ag.',
    'S.Pd.I',
    'M.Pd.',
    'Al-Hafizh',
  ];

  const handleAppendTitle = (title: string) => {
    if (title.endsWith('.')) {
      if (!nama.includes(title)) {
        if (title === 'Ust.' || title === 'Ustadzah' || title === 'K.H.') {
          setNama(`${title} ${nama.replace(/^(Ust\.|Ustadzah|K\.H\.)\s*/, '')}`);
        } else {
          setNama(`${nama}, ${title}`);
        }
      }
    } else {
      if (!nama.includes(title)) {
        setNama(`${nama}, ${title}`);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim()) return;

    const updated: User = {
      ...guru,
      nama: nama.trim(),
      nomorInduk: nip.trim(),
      spesialisasi: spesialisasi.trim(),
      email: email.trim() || `${username.trim()}@elbayan2.sch.id`,
      username: username.trim(),
    };

    onSave(updated);
    setShowSuccessToast(true);
    setTimeout(() => {
      setShowSuccessToast(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-sky-950 via-teal-900 to-sky-900 text-white flex items-center justify-between border-b border-sky-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-400/20 text-teal-300 flex items-center justify-center border border-teal-400/30">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white leading-tight">
                Perbarui Nama & Profil Ustadz
              </h3>
              <p className="text-[11px] text-teal-200/80">
                Dewan Asatidz & Pengajar Ponpes El Bayan 2
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
          {/* Live Identity Preview Card */}
          <div className="p-3.5 bg-gradient-to-r from-slate-50 to-teal-50/50 rounded-xl border border-teal-100/80 flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-teal-600 text-white font-bold text-base flex items-center justify-center shrink-0 shadow-xs ring-2 ring-teal-200">
              {nama ? nama.trim().replace(/^(Ust\.|Ustadzah|K\.H\.)\s*/, '').charAt(0) || 'U' : 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold uppercase px-1.5 py-0.2 bg-teal-100 text-teal-800 rounded">
                  Pratinjau Tampilan
                </span>
                <span className="text-[11px] font-mono text-slate-500">
                  {nip || 'NIP: Belum diisi'}
                </span>
              </div>
              <p className="font-bold text-slate-900 text-sm truncate mt-0.5">
                {nama || 'Nama Ustadz Belum Diisi'}
              </p>
              <p className="text-[11px] text-teal-700 truncate font-medium">
                {spesialisasi || 'Pengajar Kitab Kuning'}
              </p>
            </div>
          </div>

          {/* Input Nama Lengkap & Gelar */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Nama Lengkap & Gelar Ustadz <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Contoh: Ust. Ahmad Fauzi, Lc., M.Ag."
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-600 transition-all"
            />
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Nama ini otomatis disinkronkan ke seluruh <span className="font-semibold text-slate-700">Materi, Tugas, Kuis, Silabus Kitab</span>, dan <span className="font-semibold text-slate-700">Jadwal Halaqah</span>.
            </p>

            {/* Quick Title Buttons */}
            <div className="pt-1 flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-medium text-slate-400">Sisipkan Gelar:</span>
              {titleShortcuts.map((title) => (
                <button
                  key={title}
                  type="button"
                  onClick={() => handleAppendTitle(title)}
                  className="px-2 py-0.5 text-[10px] bg-slate-100 hover:bg-teal-100 hover:text-teal-900 text-slate-700 rounded-md font-medium transition-colors border border-slate-200"
                >
                  +{title}
                </button>
              ))}
            </div>
          </div>

          {/* NIP & Spesialisasi */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-slate-400" />
                <span>Nomor Induk Pegawai (NIP)</span>
              </label>
              <input
                type="text"
                value={nip}
                onChange={(e) => setNip(e.target.value)}
                placeholder="Contoh: NIP-20240901"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                <span>Spesialisasi Kitab / Bidang</span>
              </label>
              <input
                type="text"
                value={spesialisasi}
                onChange={(e) => setSpesialisasi(e.target.value)}
                placeholder="Contoh: Fiqih & Ushul Fiqih"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-600"
              />
            </div>
          </div>

          {/* Username & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <AtSign className="w-3.5 h-3.5 text-slate-400" />
                <span>Nama Pengguna (Username)</span>
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>Email Akademik</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ustadz@elbayan2.sch.id"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-600"
              />
            </div>
          </div>

          {/* Info Kitab yang Diampu */}
          {myTaughtKitab.length > 0 && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
              <span className="text-[11px] font-semibold text-slate-600 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-sky-700" />
                <span>Kitab yang Diampu Saat Ini ({myTaughtKitab.length} Kitab):</span>
              </span>
              <div className="flex flex-wrap gap-1">
                {myTaughtKitab.map((k) => (
                  <span
                    key={k.id}
                    className="text-[10px] bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded font-medium"
                  >
                    {k.namaKitab}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-teal-700 hover:bg-teal-800 text-white rounded-xl shadow-xs transition-colors flex items-center gap-2"
            >
              {showSuccessToast ? (
                <>
                  <Check className="w-4 h-4 text-white" />
                  <span>Berhasil Disimpan!</span>
                </>
              ) : (
                <>
                  <UserCheck className="w-4 h-4 text-teal-200" />
                  <span>Simpan Perubahan Nama</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
