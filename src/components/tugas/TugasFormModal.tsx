/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { X, CheckSquare, Check, Calendar, FileText, Video, Link as LinkIcon, Upload, Film, Play, Trash2 } from 'lucide-react';
import { Tugas, MataPelajaran, Kelas, User, isGuruForKitab } from '../../types';
import { toYouTubeEmbedUrl, isValidYouTubeUrl, getYouTubeInfo, formatBytes } from '../../utils/videoHelper';

interface TugasFormModalProps {
  tugasToEdit?: Tugas | null;
  kitabList: MataPelajaran[];
  kelasList: Kelas[];
  currentUser: User;
  onSave: (tugas: Tugas) => void;
  onClose: () => void;
}

export const TugasFormModal: React.FC<TugasFormModalProps> = ({
  tugasToEdit,
  kitabList,
  kelasList,
  currentUser,
  onSave,
  onClose,
}) => {
  // Only subjects this teacher teaches:
  const allowedKitab =
    currentUser.role === 'guru'
      ? kitabList.filter((k) => isGuruForKitab(currentUser, k))
      : kitabList;
  const availableKitab = allowedKitab.length > 0 ? allowedKitab : kitabList;

  const [judul, setJudul] = useState(tugasToEdit?.judul || '');
  const [mapelId, setMapelId] = useState(
    tugasToEdit?.mapelId && availableKitab.some((k) => k.id === tugasToEdit.mapelId)
      ? tugasToEdit.mapelId
      : availableKitab[0]?.id || ''
  );
  const [kelasId, setKelasId] = useState(tugasToEdit?.kelasId || kelasList[0]?.id || '');
  const [deskripsi, setDeskripsi] = useState(tugasToEdit?.deskripsi || '');
  const [instruksi, setInstruksi] = useState(tugasToEdit?.instruksiSetoran || '');
  const [batasWaktu, setBatasWaktu] = useState(
    tugasToEdit?.batasWaktu
      ? tugasToEdit.batasWaktu.substring(0, 16)
      : '2026-11-20T23:59'
  );
  const [bobotNilai, setBobotNilai] = useState<number>(tugasToEdit?.bobotNilai || 20);

  // Video guide attachment (YouTube or direct MP4 upload)
  const initialVideoType = tugasToEdit?.videoSourceType || (tugasToEdit?.videoEmbedUrl ? 'youtube' : tugasToEdit?.videoDirectUrl ? 'upload' : 'none');
  const [videoMode, setVideoMode] = useState<'none' | 'youtube' | 'upload'>(initialVideoType);
  const [youtubeUrl, setYoutubeUrl] = useState(tugasToEdit?.videoEmbedUrl || '');
  const [videoDirectUrl, setVideoDirectUrl] = useState(tugasToEdit?.videoDirectUrl || '');
  const [videoFileName, setVideoFileName] = useState(tugasToEdit?.videoFileName || '');
  const [videoFileSize, setVideoFileSize] = useState('');

  const videoFileInputRef = useRef<HTMLInputElement>(null);

  const ytInfo = youtubeUrl ? getYouTubeInfo(youtubeUrl) : null;

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const objectUrl = URL.createObjectURL(file);
      setVideoDirectUrl(objectUrl);
      setVideoFileName(file.name);
      setVideoFileSize(formatBytes(file.size));
    }
  };

  const handleClearVideo = () => {
    setVideoDirectUrl('');
    setVideoFileName('');
    setVideoFileSize('');
    if (videoFileInputRef.current) {
      videoFileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!judul.trim()) return;

    const selectedKitab =
      availableKitab.find((k) => k.id === mapelId) ||
      kitabList.find((k) => k.id === mapelId);
    const selectedKelas = kelasList.find((k) => k.id === kelasId);

    const newTugas: Tugas = {
      id: tugasToEdit ? tugasToEdit.id : `tgs-${Date.now()}`,
      judul,
      deskripsi,
      instruksiSetoran: instruksi,
      mapelId,
      mapelNama: selectedKitab?.namaKitab || 'Kitab',
      kelasId,
      kelasNama: selectedKelas?.nama || 'Kelas',
      guruId: currentUser.role === 'admin' ? (selectedKitab?.guruId || currentUser.id) : currentUser.id,
      guruNama: currentUser.role === 'admin' ? (selectedKitab?.guruNama || currentUser.nama) : currentUser.nama,
      batasWaktu: batasWaktu,
      tanggalDibuat: tugasToEdit?.tanggalDibuat || new Date().toISOString().split('T')[0],
      bobotNilai: Number(bobotNilai),
      status: 'aktif',
      videoSourceType: videoMode !== 'none' ? videoMode : undefined,
      videoEmbedUrl: videoMode === 'youtube' && youtubeUrl ? (ytInfo ? ytInfo.embedUrl : toYouTubeEmbedUrl(youtubeUrl)) : undefined,
      videoDirectUrl: videoMode === 'upload' ? videoDirectUrl : undefined,
      videoFileName: videoMode === 'upload' ? videoFileName : undefined,
    };

    onSave(newTugas);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/65 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-sky-950 to-teal-950 text-white flex items-center justify-between border-b border-sky-900 shrink-0">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-teal-400" />
            <h3 className="text-sm font-bold">
              {tugasToEdit ? 'Sunting Tugas Pembelajaran' : 'Buat Tugas / Setoran Baru'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Judul Tugas / Setoran <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              placeholder="Contoh: Setoran Hafalan Kitab Jurumiyah Bab I'rab"
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 text-slate-800 font-medium"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Mata Pelajaran / Kitab <span className="text-rose-500">*</span>
                </label>
                {currentUser.role === 'guru' && (
                  <span className="text-[10px] bg-teal-100 text-teal-850 font-bold px-1.5 py-0.2 rounded">
                    Khusus Mapel Diampu
                  </span>
                )}
              </div>
              <select
                value={mapelId}
                onChange={(e) => setMapelId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium"
              >
                {availableKitab.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.namaKitab} ({k.kategori})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Sasaran Kelas Santri <span className="text-rose-500">*</span>
              </label>
              <select
                value={kelasId}
                onChange={(e) => setKelasId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
              >
                {kelasList.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.nama}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Batas Waktu Pengumpulan <span className="text-rose-500">*</span>
              </label>
              <input
                type="datetime-local"
                required
                value={batasWaktu}
                onChange={(e) => setBatasWaktu(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
              >
              </input>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Bobot Nilai (%)
              </label>
              <input
                type="number"
                min="5"
                max="50"
                value={bobotNilai}
                onChange={(e) => setBobotNilai(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Deskripsi & Rincian Tugas <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              required
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              placeholder="Jelaskan instruksi tugas, bab kitab yang wajib dikerjakan atau dihafal..."
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Petunjuk Format Pengumpulan (Opsional)
            </label>
            <input
              type="text"
              value={instruksi}
              onChange={(e) => setInstruksi(e.target.value)}
              placeholder="Contoh: Format file rekaman audio MP3 atau tulisan tangan PDF"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
            />
          </div>

          {/* Lampiran Video / Panduan Ustadz */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Video className="w-4 h-4 text-teal-700" />
                <span>Video Panduan / Contoh Hafalan Ustadz (Opsional)</span>
              </span>

              <div className="flex items-center gap-1 bg-slate-200/80 p-0.5 rounded-lg text-[11px]">
                <button
                  type="button"
                  onClick={() => setVideoMode('none')}
                  className={`px-2 py-0.5 rounded font-semibold transition-all ${
                    videoMode === 'none' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Tidak Ada
                </button>
                <button
                  type="button"
                  onClick={() => setVideoMode('youtube')}
                  className={`px-2 py-0.5 rounded font-semibold transition-all ${
                    videoMode === 'youtube' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  YouTube
                </button>
                <button
                  type="button"
                  onClick={() => setVideoMode('upload')}
                  className={`px-2 py-0.5 rounded font-semibold transition-all ${
                    videoMode === 'upload' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Upload Video
                </button>
              </div>
            </div>

            {videoMode === 'youtube' && (
              <div className="space-y-2 pt-1">
                <input
                  type="text"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 font-mono"
                />
                {ytInfo && (
                  <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-[11px] text-emerald-800 flex items-center gap-1.5 font-medium">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Tautan YouTube valid: Santri dapat menonton video panduan ini saat mengerjakan tugas.</span>
                  </div>
                )}
              </div>
            )}

            {videoMode === 'upload' && (
              <div className="space-y-2 pt-1">
                <input
                  ref={videoFileInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleVideoFileChange}
                  className="hidden"
                />
                {!videoDirectUrl ? (
                  <button
                    type="button"
                    onClick={() => videoFileInputRef.current?.click()}
                    className="w-full py-2.5 px-3 bg-white border border-dashed border-teal-300 hover:border-teal-500 rounded-lg text-xs font-semibold text-teal-800 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Upload className="w-4 h-4 text-teal-700" />
                    <span>Pilih Berkas Video (MP4 / WebM)</span>
                  </button>
                ) : (
                  <div className="p-2.5 bg-white border border-teal-200 rounded-lg flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 truncate max-w-xs flex items-center gap-1.5">
                      <Film className="w-4 h-4 text-teal-700 shrink-0" />
                      <span className="truncate">{videoFileName || 'video-panduan.mp4'}</span>
                    </span>
                    <button
                      type="button"
                      onClick={handleClearVideo}
                      className="p-1 text-rose-500 hover:bg-rose-50 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-teal-700 hover:bg-teal-800 text-white rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{tugasToEdit ? 'Simpan Perubahan' : 'Terbitkan Tugas'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
