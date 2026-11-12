/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Upload, FileText, CheckCircle2, AlertCircle, Send, Trash2, Video, Film, Play } from 'lucide-react';
import { Tugas, PengumpulanTugas, User } from '../../types';

interface TugasSubmitModalProps {
  tugas: Tugas;
  existingSubmission?: PengumpulanTugas;
  currentUser: User;
  onSave: (submission: PengumpulanTugas) => void;
  onDelete?: (id: string) => void;
  onClose: () => void;
}

export const TugasSubmitModal: React.FC<TugasSubmitModalProps> = ({
  tugas,
  existingSubmission,
  currentUser,
  onSave,
  onDelete,
  onClose,
}) => {
  const [jawabanTeks, setJawabanTeks] = useState(existingSubmission?.jawabanTeks || '');
  const [fileNama, setFileNama] = useState(existingSubmission?.fileNama || '');
  const [fileUrl, setFileUrl] = useState(existingSubmission?.fileTugas || '');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileNama(file.name);
      setFileUrl(`https://example.com/santri-upload/${file.name}`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jawabanTeks.trim() && !fileNama) {
      alert('Mohon ketikkan jawaban teks atau unggah berkas tugas Anda.');
      return;
    }

    const submission: PengumpulanTugas = {
      id: existingSubmission ? existingSubmission.id : `kumpul-${Date.now()}`,
      tugasId: tugas.id,
      santriId: currentUser.id,
      santriNama: currentUser.nama,
      santriNis: currentUser.nomorInduk || 'NIS-202401',
      kelasNama: tugas.kelasNama,
      tanggalKumpul: new Date().toISOString().replace('T', ' ').substring(0, 16),
      jawabanTeks,
      fileNama: fileNama || undefined,
      fileTugas: fileUrl || undefined,
      status: 'menunggu_diperiksa',
    };

    onSave(submission);
  };

  const isGraded = existingSubmission?.status === 'sudah_dinilai';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-sky-950 text-white flex items-center justify-between border-b border-sky-900">
          <div>
            <span className="text-[10px] font-semibold text-teal-300 uppercase tracking-wider">
              {tugas.mapelNama}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Instructions Box */}
          <div className="p-3.5 bg-sky-50 border border-sky-200 rounded-xl text-xs space-y-1">
            <p className="font-bold text-sky-950">Petunjuk Tugas:</p>
            <p className="text-sky-900">{tugas.deskripsi}</p>
            {tugas.instruksiSetoran && (
              <p className="text-sky-800 italic pt-1 border-t border-sky-200/60 mt-1">
                Catatan: {tugas.instruksiSetoran}
              </p>
            )}
            <p className="text-[11px] text-slate-500 pt-1">
              Batas Pengumpulan: <strong>{new Date(tugas.batasWaktu).toLocaleString('id-ID')}</strong>
            </p>
          </div>

          {/* Video Panduan Ustadz if provided */}
          {(tugas.videoEmbedUrl || tugas.videoDirectUrl) && (
            <div className="p-3.5 bg-slate-900 text-white rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-teal-300 flex items-center gap-1.5">
                  <Video className="w-4 h-4 text-teal-400" />
                  <span>Video Panduan / Contoh dari Ustadz:</span>
                </span>
                {tugas.videoEmbedUrl && (
                  <span className="text-[10px] text-rose-300 font-semibold flex items-center gap-1">
                    <Play className="w-3 h-3 fill-rose-400" /> YouTube
                  </span>
                )}
                {tugas.videoDirectUrl && (
                  <span className="text-[10px] text-teal-300 font-semibold flex items-center gap-1">
                    <Film className="w-3 h-3" /> Video MP4
                  </span>
                )}
              </div>

              {tugas.videoEmbedUrl ? (
                <div className="aspect-video w-full rounded-lg overflow-hidden bg-black">
                  <iframe
                    src={tugas.videoEmbedUrl}
                    title="Video Panduan Tugas"
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : tugas.videoDirectUrl ? (
                <div className="aspect-video w-full rounded-lg overflow-hidden bg-black">
                  <video
                    src={tugas.videoDirectUrl}
                    controls
                    playsInline
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : null}
            </div>
          )}

          {/* Graded Notification if already graded */}
          {isGraded && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Tugas Sudah Dinilai Ustadz</span>
                </span>
                <span className="text-base font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-lg">
                  {existingSubmission.nilai} / 100
                </span>
              </div>
              <p className="text-emerald-800">
                <strong>Catatan Evaluasi:</strong> {existingSubmission.catatanEvaluasi || 'Alhamdulillah sangat baik.'}
              </p>
            </div>
          )}

          {/* Answer Text Area */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Jawaban Teks / Catatan Setoran <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={6}
              disabled={isGraded}
              value={jawabanTeks}
              onChange={(e) => setJawabanTeks(e.target.value)}
              placeholder="Tuliskan jawaban Anda, hafalan matan, atau catatan penjelasan di sini..."
              className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 text-slate-800 leading-relaxed disabled:opacity-75"
            />
          </div>

          {/* File Upload Box */}
          <div className="p-4 bg-slate-50 border border-dashed border-slate-300 rounded-xl">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Unggah Berkas Tugas (PDF, Dokumen, Foto, atau Rekaman Audio)
            </label>
            <div className="flex items-center gap-3">
              <label
                className={`px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-700 flex items-center gap-2 ${
                  isGraded ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-slate-100'
                }`}
              >
                <Upload className="w-4 h-4 text-sky-700" />
                <span>Pilih Berkas Tugas</span>
                <input
                  type="file"
                  disabled={isGraded}
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              <span className="text-xs text-slate-600 truncate max-w-xs font-medium">
                {fileNama || 'Belum ada berkas dipilih'}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
            <div>
              {existingSubmission && onDelete && (
                <button
                  type="button"
                  onClick={() => {
                    onDelete(existingSubmission.id);
                    onClose();
                  }}
                  className="px-3.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer border border-rose-200"
                >
                  <Trash2 className="w-4 h-4 text-rose-500" />
                  <span>Hapus Setoran</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                {isGraded ? 'Tutup' : 'Batal'}
              </button>
              {!isGraded && (
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold bg-sky-800 hover:bg-sky-900 text-white rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Kumpulkan Tugas</span>
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
