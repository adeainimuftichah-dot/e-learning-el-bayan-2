/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  HelpCircle,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  Award,
  BookOpen,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { Kuis, SoalKuis, MataPelajaran, User, isGuruForKitab } from '../../types';

interface KuisFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (kuis: Kuis) => void;
  kitabList: MataPelajaran[];
  currentUser: User;
}

export const KuisFormModal: React.FC<KuisFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  kitabList,
  currentUser,
}) => {
  // If guru, only their taught kitab
  const availableKitab =
    currentUser.role === 'guru'
      ? kitabList.filter((k) => isGuruForKitab(currentUser, k))
      : kitabList;

  const initialKitab = availableKitab[0] || kitabList[0];

  const [judul, setJudul] = useState('');
  const [mapelId, setMapelId] = useState(initialKitab?.id || '');
  const [semester, setSemester] = useState('Semester 1');
  const [durasiMenit, setDurasiMenit] = useState<number>(30);
  const [passingScore, setPassingScore] = useState<number>(75);
  const [batasSelesai, setBatasSelesai] = useState<string>(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [deskripsi, setDeskripsi] = useState(
    'Jawablah seluruh pertanyaan dengan teliti. Dilarang membuka catatan atau kitab saat kuis berlangsung.'
  );

  // Dynamic Questions
  const [soalList, setSoalList] = useState<
    Array<{
      id: string;
      nomor: number;
      pertanyaan: string;
      pilihanA: string;
      pilihanB: string;
      pilihanC: string;
      pilihanD: string;
      kunciJawaban: 'a' | 'b' | 'c' | 'd';
      bobotPoin: number;
    }>
  >([
    {
      id: `soal-1-${Date.now()}`,
      nomor: 1,
      pertanyaan: 'Apa pengertian Kalam menurut istilah ulama Nahwu dalam kitab Jurumiyah?',
      pilihanA: 'Lafadz yang tersusun dan berfaidah sempurna menurut kaidah Arab',
      pilihanB: 'Setiap suara yang keluar dari lisan manusia tanpa syarat',
      pilihanC: 'Tulisan yang tertera di lembaran kitab kuning',
      pilihanD: 'Gerak isyarat tangan yang dipahami pendengar',
      kunciJawaban: 'a',
      bobotPoin: 50,
    },
    {
      id: `soal-2-${Date.now()}`,
      nomor: 2,
      pertanyaan: 'Berikut yang BUKAN merupakan tanda-tanda isim (kata benda/sifat) adalah...',
      pilihanA: 'Adanya tanwin di akhir kata',
      pilihanB: 'Kemasukan huruf jar / khafadh',
      pilihanC: 'Kemasukan huruf Qad (قد) atau Saufa (سوف)',
      pilihanD: 'Kemasukan Alif dan Lam (ال)',
      kunciJawaban: 'c',
      bobotPoin: 50,
    },
  ]);

  if (!isOpen) return null;

  const handleAddQuestion = () => {
    const nextNomor = soalList.length + 1;
    setSoalList([
      ...soalList,
      {
        id: `soal-${nextNomor}-${Date.now()}`,
        nomor: nextNomor,
        pertanyaan: '',
        pilihanA: '',
        pilihanB: '',
        pilihanC: '',
        pilihanD: '',
        kunciJawaban: 'a',
        bobotPoin: 25,
      },
    ]);
  };

  const handleRemoveQuestion = (idx: number) => {
    if (soalList.length <= 1) {
      alert('Kuis minimal harus memiliki 1 butir soal.');
      return;
    }
    const updated = soalList.filter((_, i) => i !== idx).map((s, i) => ({ ...s, nomor: i + 1 }));
    setSoalList(updated);
  };

  const handleQuestionChange = (idx: number, field: string, val: any) => {
    const updated = [...soalList];
    updated[idx] = { ...updated[idx], [field]: val };
    setSoalList(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!judul.trim()) {
      alert('Judul kuis wajib diisi!');
      return;
    }

    const selectedKitabObj = kitabList.find((k) => k.id === mapelId);
    if (!selectedKitabObj) {
      alert('Pilih kitab pelajaran yang valid.');
      return;
    }

    const formattedSoal: SoalKuis[] = soalList.map((s, i) => ({
      id: s.id,
      kuisId: '',
      nomor: i + 1,
      pertanyaan: s.pertanyaan.trim(),
      tipeSoal: 'pilihan_ganda',
      pilihan: {
        a: s.pilihanA.trim() || 'Pilihan A',
        b: s.pilihanB.trim() || 'Pilihan B',
        c: s.pilihanC.trim() || 'Pilihan C',
        d: s.pilihanD.trim() || 'Pilihan D',
      },
      kunciJawaban: s.kunciJawaban,
      bobotPoin: Number(s.bobotPoin) || 20,
    }));

    const kuisId = `kuis-${Date.now()}`;
    const newKuis: Kuis = {
      id: kuisId,
      judul: judul.trim(),
      mapelId: selectedKitabObj.id,
      mapelNama: selectedKitabObj.namaKitab,
      kelasId: semester,
      kelasNama: semester,
      semester: semester,
      guruId: currentUser.role === 'guru' ? currentUser.id : selectedKitabObj.guruId,
      guruNama: currentUser.role === 'guru' ? currentUser.nama : selectedKitabObj.guruNama,
      durasiMenit: Number(durasiMenit) || 30,
      batasSelesai,
      totalSoal: formattedSoal.length,
      passingScore: Number(passingScore) || 75,
      status: 'tersedia',
      deskripsi: deskripsi.trim(),
      soal: formattedSoal.map((s) => ({ ...s, kuisId })),
    };

    onSave(newKuis);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-sky-950 via-teal-900 to-sky-900 text-white flex items-center justify-between border-b border-sky-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-400/20 text-teal-300 flex items-center justify-center border border-teal-400/30">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white leading-tight">
                Buat Kuis & Evaluasi Baru
              </h3>
              <p className="text-[11px] text-teal-200/80">
                Penyusunan Butir Soal Daring Santri Ponpes El Bayan 2
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
          {/* Judul & Kitab */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-8">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Judul Kuis / Evaluasi <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={judul}
                onChange={(e) => setJudul(e.target.value)}
                placeholder="Contoh: Ikhtibar Fathul Qorib: Bab Shalat Berjamaah"
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all"
              />
            </div>

            <div className="md:col-span-4">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Kitab / Pelajaran <span className="text-rose-500">*</span>
              </label>
              <select
                value={mapelId}
                onChange={(e) => setMapelId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              >
                {availableKitab.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.namaKitab} ({k.kategori})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Semester, Durasi, Passing Score, Deadline */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Tingkat Semester
              </label>
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-800"
              >
                <option value="Semester 1">Semester 1</option>
                <option value="Semester 2">Semester 2</option>
                <option value="Semester 3">Semester 3</option>
                <option value="Semester 4">Semester 4</option>
                <option value="Semester 5">Semester 5</option>
                <option value="Semester 6">Semester 6</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-teal-600" />
                <span>Durasi (Menit)</span>
              </label>
              <input
                type="number"
                min="5"
                max="180"
                value={durasiMenit}
                onChange={(e) => setDurasiMenit(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-amber-600" />
                <span>KKM (Nilai Kelulusan Minimal)</span>
              </label>
              <input
                type="number"
                min="10"
                max="100"
                value={passingScore}
                onChange={(e) => setPassingScore(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-sky-600" />
                <span>Batas Selesai</span>
              </label>
              <input
                type="date"
                value={batasSelesai}
                onChange={(e) => setBatasSelesai(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg text-slate-800"
              />
            </div>
          </div>

          {/* Deskripsi */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Petunjuk Pengerjaan Santri
            </label>
            <textarea
              rows={2}
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            />
          </div>

          {/* Bagian Butir Soal */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900">
                  Daftar Butir Soal ({soalList.length} Soal)
                </span>
                <span className="text-[10px] bg-teal-50 text-teal-800 px-2 py-0.5 rounded font-semibold">
                  Pilihan Ganda
                </span>
              </div>
              <button
                type="button"
                onClick={handleAddQuestion}
                className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Soal</span>
              </button>
            </div>

            <div className="space-y-4">
              {soalList.map((soal, idx) => (
                <div
                  key={soal.id}
                  className="p-4 bg-slate-50/70 rounded-xl border border-slate-200 space-y-3 relative group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-sky-900 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-sky-800 text-white flex items-center justify-center text-[10px]">
                        {idx + 1}
                      </span>
                      <span>Pertanyaan #{idx + 1}</span>
                    </span>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-[11px] text-slate-600">
                        <span>Poin:</span>
                        <input
                          type="number"
                          min="5"
                          max="100"
                          value={soal.bobotPoin}
                          onChange={(e) =>
                            handleQuestionChange(idx, 'bobotPoin', Number(e.target.value))
                          }
                          className="w-14 px-1.5 py-0.5 text-xs bg-white border border-slate-300 rounded text-center font-mono"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveQuestion(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors"
                        title="Hapus Soal Ini"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Teks Pertanyaan */}
                  <textarea
                    rows={2}
                    required
                    placeholder="Tuliskan butir soal / pertanyaan di sini..."
                    value={soal.pertanyaan}
                    onChange={(e) => handleQuestionChange(idx, 'pertanyaan', e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  />

                  {/* Pilihan A, B, C, D dan Radio Kunci Jawaban */}
                  <div className="space-y-2 pt-1">
                    <p className="text-[11px] font-semibold text-slate-600">
                      Pilihan Jawaban & Kunci Jawaban Benar:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {(['a', 'b', 'c', 'd'] as const).map((opt) => {
                        const optKey =
                          opt === 'a'
                            ? 'pilihanA'
                            : opt === 'b'
                            ? 'pilihanB'
                            : opt === 'c'
                            ? 'pilihanC'
                            : 'pilihanD';
                        const isCorrect = soal.kunciJawaban === opt;
                        return (
                          <div
                            key={opt}
                            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border transition-all ${
                              isCorrect
                                ? 'bg-emerald-50/70 border-emerald-400 ring-1 ring-emerald-300'
                                : 'bg-white border-slate-200'
                            }`}
                          >
                            <label className="flex items-center gap-1.5 cursor-pointer shrink-0">
                              <input
                                type="radio"
                                name={`kunci-${soal.id}`}
                                checked={isCorrect}
                                onChange={() => handleQuestionChange(idx, 'kunciJawaban', opt)}
                                className="text-emerald-600 focus:ring-emerald-500"
                              />
                              <span
                                className={`font-bold uppercase text-[11px] px-1.5 py-0.2 rounded ${
                                  isCorrect
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                {opt}
                              </span>
                            </label>
                            <input
                              type="text"
                              required
                              placeholder={`Opsi ${opt.toUpperCase()}...`}
                              value={(soal as any)[optKey]}
                              onChange={(e) => handleQuestionChange(idx, optKey, e.target.value)}
                              className="w-full text-xs bg-transparent border-none focus:outline-none text-slate-800"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
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
              <CheckCircle2 className="w-4 h-4 text-teal-200" />
              <span>Simpan & Terbitkan Kuis</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
