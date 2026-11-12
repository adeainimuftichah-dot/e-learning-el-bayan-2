/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Check, Award, FileText, Download, User } from 'lucide-react';
import { PengumpulanTugas, Tugas } from '../../types';

interface TugasGradeModalProps {
  submission: PengumpulanTugas;
  tugas: Tugas;
  onSaveGrade: (updatedSubmission: PengumpulanTugas) => void;
  onClose: () => void;
}

export const TugasGradeModal: React.FC<TugasGradeModalProps> = ({
  submission,
  tugas,
  onSaveGrade,
  onClose,
}) => {
  const [nilai, setNilai] = useState<number>(submission.nilai ?? 85);
  const [catatan, setCatatan] = useState<string>(submission.catatanEvaluasi || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: PengumpulanTugas = {
      ...submission,
      nilai: Number(nilai),
      catatanEvaluasi: catatan,
      status: 'sudah_dinilai',
      waktuPenilaian: new Date().toISOString().replace('T', ' ').substring(0, 16),
    };
    onSaveGrade(updated);
  };

  const getPredikat = (score: number) => {
    if (score >= 90) return { label: 'Mumtaz (A)', color: 'text-emerald-700 bg-emerald-100' };
    if (score >= 80) return { label: 'Jayyid Jiddan (B+)', color: 'text-sky-700 bg-sky-100' };
    if (score >= 70) return { label: 'Jayyid (B)', color: 'text-teal-700 bg-teal-100' };
    if (score >= 60) return { label: 'Maqbul (C)', color: 'text-amber-700 bg-amber-100' };
    return { label: 'Rasib (D)', color: 'text-rose-700 bg-rose-100' };
  };

  const predikat = getPredikat(nilai);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-sky-950 text-white flex items-center justify-between border-b border-sky-900">
          <div>
            <span className="text-[10px] font-semibold text-teal-300 uppercase tracking-wider">
              Pemeriksaan Tugas & Penilaian Santri
            </span>
            <h3 className="text-sm font-bold text-white truncate">{tugas.judul}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-sky-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Santri Info Banner */}
          <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-sky-800 text-white font-bold flex items-center justify-center shrink-0">
                {submission.santriNama.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-slate-800">{submission.santriNama}</p>
                <p className="text-[11px] text-slate-500">
                  {submission.santriNis} • {submission.kelasNama}
                </p>
              </div>
            </div>
            <span className="text-[11px] text-slate-500">
              Dikumpulkan: {submission.tanggalKumpul}
            </span>
          </div>

          {/* Student Answer Box */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Jawaban yang Dikirimkan Santri:
            </label>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 max-h-48 overflow-y-auto whitespace-pre-wrap leading-relaxed">
              {submission.jawabanTeks || 'Tidak ada teks jawaban disertakan.'}
            </div>
          </div>

          {/* Student Attached File */}
          {submission.fileNama && (
            <div className="p-3 bg-sky-50/50 border border-sky-200 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 truncate">
                <FileText className="w-4 h-4 text-sky-700 shrink-0" />
                <span className="font-medium text-slate-800 truncate">{submission.fileNama}</span>
              </div>
              <button
                type="button"
                onClick={() => alert(`Mengunduh berkas setoran santri: ${submission.fileNama}`)}
                className="flex items-center gap-1 text-sky-700 hover:text-sky-900 font-semibold shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh Berkas</span>
              </button>
            </div>
          )}

          {/* Grading Input */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-800">
                Beri Nilai Angka (Skala 0 - 100) <span className="text-rose-500">*</span>
              </label>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${predikat.color}`}>
                Predikat: {predikat.label}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="100"
                value={nilai}
                onChange={(e) => setNilai(Number(e.target.value))}
                className="flex-1 accent-sky-700 cursor-pointer"
              />
              <input
                type="number"
                min="0"
                max="100"
                required
                value={nilai}
                onChange={(e) => setNilai(Math.min(100, Math.max(0, Number(e.target.value))))}
                className="w-20 px-3 py-1.5 text-center text-sm font-bold bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          {/* Evaluation Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Catatan Evaluasi / Ulasan Ustadz
            </label>
            <textarea
              rows={3}
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Berikan masukan koreksi tajwid, kejelasan tulisan, atau nasihat belajar..."
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 text-slate-800"
            />
          </div>

          {/* Footer actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-sky-800 hover:bg-sky-900 text-white rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Simpan & Terbitkan Nilai</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
