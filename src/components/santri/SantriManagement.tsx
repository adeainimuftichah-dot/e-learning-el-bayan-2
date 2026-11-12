/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  Filter,
  CheckCircle2,
  X,
  User as UserIcon,
  Download,
} from 'lucide-react';
import { User, Kelas } from '../../types';

interface SantriManagementProps {
  santriList: User[];
  kelasList?: Kelas[];
  onSaveSantri: (santri: User) => void;
  onDeleteSantri: (id: string) => void;
}

export const SantriManagement: React.FC<SantriManagementProps> = ({
  santriList,
  onSaveSantri,
  onDeleteSantri,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSantri, setEditingSantri] = useState<User | null>(null);

  // Form states
  const [nama, setNama] = useState('');
  const [nis, setNis] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [kamar, setKamar] = useState('');
  const [semester, setSemester] = useState('Semester 1');

  const semesterOptions = [
    'Semester 1',
    'Semester 2',
    'Semester 3',
    'Semester 4',
    'Semester 5',
    'Semester 6',
  ];

  const filtered = santriList.filter((s) => {
    const matchSearch =
      s.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.nomorInduk && s.nomorInduk.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.kamar && s.kamar.toLowerCase().includes(searchQuery.toLowerCase()));
    const santriSem = s.semester || (s.kelasId === 'kelas-1' ? 'Semester 1' : s.kelasId === 'kelas-2' ? 'Semester 2' : 'Semester 3');
    const matchSem = selectedSemester === 'all' || santriSem === selectedSemester;
    return matchSearch && matchSem;
  });

  const handleOpenAdd = () => {
    setEditingSantri(null);
    setNama('');
    setNis(`NIS-20240${santriList.length + 10}`);
    setEmail('');
    setUsername(`santri_${Date.now().toString().slice(-4)}`);
    setKamar('Asrama Al-Farabi Kamar 05');
    setSemester('Semester 1');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (santri: User) => {
    setEditingSantri(santri);
    setNama(santri.nama);
    setNis(santri.nomorInduk || '');
    setEmail(santri.email);
    setUsername(santri.username);
    setKamar(santri.kamar || '');
    setSemester(santri.semester || (santri.kelasId === 'kelas-2' ? 'Semester 2' : 'Semester 1'));
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim()) return;

    const saved: User = {
      id: editingSantri ? editingSantri.id : `user-santri-${Date.now()}`,
      nama: nama.trim(),
      username: username.trim(),
      email: email.trim() || `${username.trim()}@santri.pesantren.ac.id`,
      role: 'santri',
      nomorInduk: nis.trim(),
      kamar: kamar.trim(),
      semester,
    };

    onSaveSantri(saved);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-800">
              Manajemen Data Induk Santri Mukim
            </h2>
            <p className="text-xs text-slate-500">
              Total {santriList.length} santri terdaftar dalam pangkalan data akademik pesantren.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2 bg-sky-800 hover:bg-sky-900 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Santri Baru</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2 border-t border-slate-100">
          <div className="sm:col-span-8 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari berdasarkan nama, NIS, atau kamar asrama..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 text-slate-800"
            />
          </div>

          <div className="sm:col-span-4">
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
            >
              <option value="all">Semua Semester</option>
              {semesterOptions.map((sem) => (
                <option key={sem} value={sem}>
                  {sem}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Santri Data Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4 w-12 text-center">No</th>
                <th className="py-3 px-4">Nama Lengkap</th>
                <th className="py-3 px-4">Nomor Induk (NIS)</th>
                <th className="py-3 px-4">Semester</th>
                <th className="py-3 px-4">Kamar Asrama</th>
                <th className="py-3 px-4">Email / Akun</th>
                <th className="py-3 px-4 text-center w-28">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    Tidak ada data santri yang cocok.
                  </td>
                </tr>
              ) : (
                filtered.map((s, idx) => {
                  const semDisplay =
                    s.semester ||
                    (s.kelasId === 'kelas-1'
                      ? 'Semester 1'
                      : s.kelasId === 'kelas-2'
                      ? 'Semester 2'
                      : 'Semester 3');
                  return (
                    <tr key={s.id} className="hover:bg-sky-50/40 transition-colors">
                      <td className="py-3 px-4 text-center font-mono text-slate-400">
                        {idx + 1}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-sky-100 text-sky-800 font-bold flex items-center justify-center shrink-0 text-xs">
                            {s.nama.charAt(0)}
                          </div>
                          <span className="font-bold text-slate-900">{s.nama}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono font-medium text-slate-700">
                        {s.nomorInduk || '-'}
                      </td>
                      <td className="py-3 px-4">
                        <span className="bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.5 rounded font-bold text-[11px]">
                          {semDisplay}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{s.kamar || '-'}</td>
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px] truncate max-w-[180px]">
                        {s.email}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(s)}
                            className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                            title="Sunting Data Santri"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteSantri(s.id)}
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Hapus Santri"
                          >
                            <Trash2 className="w-4 h-4" />
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

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in duration-200">
            <div className="px-6 py-4 bg-sky-950 text-white flex items-center justify-between border-b border-sky-900">
              <h3 className="text-sm font-bold">
                {editingSantri ? 'Sunting Data Santri' : 'Tambah Santri Mukim Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-sky-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Lengkap Santri <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Contoh: Muhammad Ihsanuddin"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nomor Induk Santri (NIS)
                  </label>
                  <input
                    type="text"
                    value={nis}
                    onChange={(e) => setNis(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Semester <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium"
                  >
                    {semesterOptions.map((sem) => (
                      <option key={sem} value={sem}>
                        {sem}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kamar & Asrama Santri
                </label>
                <input
                  type="text"
                  value={kamar}
                  onChange={(e) => setKamar(e.target.value)}
                  placeholder="Contoh: Asrama Al-Ghazali Kamar 03"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                />
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
                    Email Aktif
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
                  Simpan Data Santri
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
