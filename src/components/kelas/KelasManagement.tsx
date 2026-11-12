/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Building2, Plus, Edit2, Trash2, X, Users, GraduationCap } from 'lucide-react';
import { Kelas, User } from '../../types';

interface KelasManagementProps {
  kelasList: Kelas[];
  guruList?: User[];
  onSaveKelas: (kelas: Kelas) => void;
  onDeleteKelas: (id: string) => void;
}

export const KelasManagement: React.FC<KelasManagementProps> = ({
  kelasList,
  guruList = [],
  onSaveKelas,
  onDeleteKelas,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingKelas, setEditingKelas] = useState<Kelas | null>(null);

  const [nama, setNama] = useState('');
  const [tingkat, setTingkat] = useState<'Ula (Dasar)' | 'Wustho (Menengah)' | 'Ulya (Lanjutan)'>(
    'Ula (Dasar)'
  );
  const [waliKelas, setWaliKelas] = useState('');
  const [kapasitas, setKapasitas] = useState(30);
  const [tahunAjaran, setTahunAjaran] = useState('1446-1447 H / 2025-2026 M');

  const handleOpenAdd = () => {
    setEditingKelas(null);
    setNama('');
    setTingkat('Ula (Dasar)');
    setWaliKelas(guruList[0]?.nama || 'Ust. Ahmad Fauzi, Lc., M.Ag.');
    setKapasitas(30);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (kelas: Kelas) => {
    setEditingKelas(kelas);
    setNama(kelas.nama);
    setTingkat(kelas.tingkat);
    setWaliKelas(kelas.waliKelas);
    setKapasitas(kelas.kapasitas);
    setTahunAjaran(kelas.tahunAjaran);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim()) return;

    const saved: Kelas = {
      id: editingKelas ? editingKelas.id : `kelas-${Date.now()}`,
      nama,
      tingkat,
      waliKelas,
      kapasitas: Number(kapasitas),
      tahunAjaran,
    };

    onSaveKelas(saved);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-800">
            Manajemen Tingkat Kelas & Rombongan Belajar Halaqah
          </h2>
          <p className="text-xs text-slate-500">
            Pembagian jenjang marhalah Ula (Ibtidaiyah/Dasar), Wustho (Tsanawiyah/Menengah), dan Ulya (Aliyah/Lanjutan).
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-sky-800 hover:bg-sky-900 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Kelas Baru</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {kelasList.map((k) => (
          <div
            key={k.id}
            className="bg-white rounded-2xl border border-slate-200 hover:border-sky-300 p-5 shadow-xs space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold bg-sky-50 text-sky-800 px-2 py-0.5 rounded">
                  {k.tingkat}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  Maks {k.kapasitas} Santri
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-900">{k.nama}</h3>
              <p className="text-xs text-slate-500">
                Wali Kelas: <strong>{k.waliKelas}</strong>
              </p>
              <p className="text-[11px] text-slate-400">Tahun Ajaran: {k.tahunAjaran}</p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2 text-xs">
              <button
                onClick={() => handleOpenEdit(k)}
                className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
                title="Sunting Kelas"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onDeleteKelas(k.id)}
                className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                title="Hapus Kelas"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in duration-200">
            <div className="px-6 py-4 bg-sky-950 text-white flex items-center justify-between border-b border-sky-900">
              <h3 className="text-sm font-bold">
                {editingKelas ? 'Sunting Data Kelas' : 'Tambah Kelas Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-sky-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Kelas & Halaqah <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Contoh: Tingkat Ula C (Halaqah Sore)"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Jenjang / Marhalah
                </label>
                <select
                  value={tingkat}
                  onChange={(e) => setTingkat(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                >
                  <option value="Ula (Dasar)">Ula (Dasar)</option>
                  <option value="Wustho (Menengah)">Wustho (Menengah)</option>
                  <option value="Ulya (Lanjutan)">Ulya (Lanjutan)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Wali Kelas / Pembina
                </label>
                <input
                  type="text"
                  required
                  list="guru-options"
                  value={waliKelas}
                  onChange={(e) => setWaliKelas(e.target.value)}
                  placeholder="Pilih atau ketik nama Ustadz / Ustadzah..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                />
                <datalist id="guru-options">
                  {guruList.map((g) => (
                    <option key={g.id} value={g.nama}>
                      {g.nama} ({g.spesialisasi || 'Dewan Asatidz'})
                    </option>
                  ))}
                </datalist>
                {guruList.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {guruList.slice(0, 4).map((g) => (
                      <button
                        type="button"
                        key={g.id}
                        onClick={() => setWaliKelas(g.nama)}
                        className="text-[10px] bg-slate-100 hover:bg-sky-100 hover:text-sky-800 text-slate-600 px-2 py-0.5 rounded transition-colors"
                      >
                        {g.nama.split(',')[0]}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kapasitas Santri
                  </label>
                  <input
                    type="number"
                    value={kapasitas}
                    onChange={(e) => setKapasitas(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tahun Ajaran
                  </label>
                  <input
                    type="text"
                    value={tahunAjaran}
                    onChange={(e) => setTahunAjaran(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-sky-800 hover:bg-sky-900 text-white rounded-lg shadow-xs"
                >
                  Simpan Kelas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
