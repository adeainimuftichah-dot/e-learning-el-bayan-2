/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { GraduationCap, Search, Plus, Edit2, Trash2, X, BookOpen } from 'lucide-react';
import { User } from '../../types';

interface GuruManagementProps {
  guruList: User[];
  onSaveGuru: (guru: User) => void;
  onDeleteGuru: (id: string) => void;
  currentUser?: User;
}

export const GuruManagement: React.FC<GuruManagementProps> = ({
  guruList,
  onSaveGuru,
  onDeleteGuru,
  currentUser,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGuru, setEditingGuru] = useState<User | null>(null);

  const [nama, setNama] = useState('');
  const [nip, setNip] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [spesialisasi, setSpesialisasi] = useState('');

  const titleShortcuts = ['Ust.', 'Ustadzah', 'K.H.', 'Lc.', 'M.Ag.', 'S.Pd.I', 'M.Pd.', 'Al-Hafizh'];

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

  const filtered = guruList.filter((g) => {
    return (
      g.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (g.nomorInduk && g.nomorInduk.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (g.spesialisasi && g.spesialisasi.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  const handleOpenAdd = () => {
    setEditingGuru(null);
    setNama('');
    setNip(`NIP-20240${guruList.length + 10}`);
    setEmail('');
    setUsername(`ustadz_${Date.now().toString().slice(-4)}`);
    setSpesialisasi('Fiqih & Ushul Fiqih');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (guru: User) => {
    setEditingGuru(guru);
    setNama(guru.nama);
    setNip(guru.nomorInduk || '');
    setEmail(guru.email);
    setUsername(guru.username);
    setSpesialisasi(guru.spesialisasi || '');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim()) return;

    const saved: User = {
      id: editingGuru ? editingGuru.id : `user-guru-${Date.now()}`,
      nama: nama.trim(),
      username: username.trim(),
      email: email.trim() || `${username.trim()}@elbayan2.sch.id`,
      role: 'guru',
      nomorInduk: nip.trim(),
      spesialisasi: spesialisasi.trim(),
      avatarUrl: editingGuru?.avatarUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    };

    onSaveGuru(saved);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-800">
              Manajemen Data Dewan Asatidz & Pengajar
            </h2>
            <p className="text-xs text-slate-500">
              Daftar dewan guru pengampu kurikulum 12 kitab kuning dan pembina asrama.
            </p>
          </div>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-sky-800 hover:bg-sky-900 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Guru / Ustadz</span>
          </button>
        </div>

        <div className="pt-2 border-t border-slate-100 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari ustadz berdasarkan nama, NIP, atau spesialisasi kitab..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 text-slate-800"
          />
        </div>
      </div>

      {/* Teachers Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4 w-12 text-center">No</th>
                <th className="py-3 px-4">Nama Lengkap & Gelar</th>
                <th className="py-3 px-4">Nomor Induk Pegawai (NIP)</th>
                <th className="py-3 px-4">Spesialisasi Kitab</th>
                <th className="py-3 px-4">Email Akademik</th>
                <th className="py-3 px-4 text-center w-28">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((g, idx) => {
                const isMe = currentUser?.id === g.id;
                return (
                  <tr
                    key={g.id}
                    className={`transition-colors ${
                      isMe ? 'bg-teal-50/60 hover:bg-teal-50' : 'hover:bg-sky-50/40'
                    }`}
                  >
                    <td className="py-3.5 px-4 text-center font-mono text-slate-400">
                      {idx + 1}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-8 h-8 rounded-full font-bold flex items-center justify-center shrink-0 ${
                            isMe ? 'bg-teal-600 text-white shadow-xs' : 'bg-teal-100 text-teal-800'
                          }`}
                        >
                          {g.nama.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900">{g.nama}</span>
                            {isMe && (
                              <span className="text-[10px] bg-teal-100 text-teal-800 font-bold px-1.5 py-0.2 rounded-full">
                                Akun Anda
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-700">
                      {g.nomorInduk || '-'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="bg-teal-50 text-teal-800 px-2 py-0.5 rounded font-semibold text-[11px]">
                        {g.spesialisasi || 'Ilmu Agama'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-500 text-[11px]">
                      {g.email}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(g)}
                          className="px-2 py-1 rounded-lg text-sky-800 hover:bg-sky-100 transition-colors font-medium text-xs flex items-center gap-1 border border-sky-200 cursor-pointer"
                          title="Ubah Nama & Data Ustadz"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Ubah</span>
                        </button>
                        <button
                          onClick={() => onDeleteGuru(g.id)}
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Hapus Data Ustadz"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in duration-200">
            <div className="px-6 py-4 bg-sky-950 text-white flex items-center justify-between border-b border-sky-900">
              <h3 className="text-sm font-bold">
                {editingGuru ? 'Perbarui Nama & Profil Ustadz' : 'Tambah Guru / Ustadz Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-sky-900 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Lengkap & Gelar Ustadz <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Contoh: Ust. Ahmad Fauzi, Lc., M.Ag."
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                />
                <div className="mt-1.5 flex flex-wrap items-center gap-1">
                  <span className="text-[10px] text-slate-400">Sisipkan:</span>
                  {titleShortcuts.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => handleAppendTitle(t)}
                      className="px-1.5 py-0.5 text-[10px] bg-slate-100 hover:bg-teal-100 hover:text-teal-900 text-slate-600 rounded border border-slate-200"
                    >
                      +{t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">NIP</label>
                  <input
                    type="text"
                    value={nip}
                    onChange={(e) => setNip(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Spesialisasi Kitab
                  </label>
                  <input
                    type="text"
                    value={spesialisasi}
                    onChange={(e) => setSpesialisasi(e.target.value)}
                    placeholder="Contoh: Nahwu & Hadits"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama Pengguna (Username)
                  </label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Resmi
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                  Simpan Data Pengajar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
