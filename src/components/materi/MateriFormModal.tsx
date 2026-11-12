/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Upload,
  FileText,
  Video,
  BookOpen,
  AlertCircle,
  Check,
  Film,
  Link as LinkIcon,
  Play,
  Trash2,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { Materi, MataPelajaran, Kelas, JenisMateri, User, isGuruForKitab } from '../../types';
import {
  getYouTubeInfo,
  toYouTubeEmbedUrl,
  isValidYouTubeUrl,
  SAMPLE_PESANTREN_YOUTUBE_VIDEOS,
  formatBytes,
} from '../../utils/videoHelper';

interface MateriFormModalProps {
  materiToEdit?: Materi | null;
  kitabList: MataPelajaran[];
  kelasList: Kelas[];
  currentUser: User;
  onSave: (materi: Materi) => void;
  onClose: () => void;
}

export const MateriFormModal: React.FC<MateriFormModalProps> = ({
  materiToEdit,
  kitabList,
  kelasList,
  currentUser,
  onSave,
  onClose,
}) => {
  // If teacher, filter to their taught subjects
  const allowedKitab =
    currentUser.role === 'guru'
      ? kitabList.filter((k) => isGuruForKitab(currentUser, k))
      : kitabList;
  const availableKitab = allowedKitab.length > 0 ? allowedKitab : kitabList;

  const [judul, setJudul] = useState(materiToEdit?.judul || '');
  const [mapelId, setMapelId] = useState(
    materiToEdit?.mapelId && availableKitab.some((k) => k.id === materiToEdit.mapelId)
      ? materiToEdit.mapelId
      : availableKitab[0]?.id || ''
  );
  const [kelasId, setKelasId] = useState(materiToEdit?.kelasId || kelasList[0]?.id || '');
  const [deskripsi, setDeskripsi] = useState(materiToEdit?.deskripsi || '');
  const [jenisMateri, setJenisMateri] = useState<JenisMateri>(materiToEdit?.jenisMateri || 'video');
  const [statusPublikasi, setStatusPublikasi] = useState<'publik' | 'draft'>(
    materiToEdit?.statusPublikasi || 'publik'
  );

  // PDF Document states
  const [fileName, setFileName] = useState(materiToEdit?.fileName || '');
  const [fileSize, setFileSize] = useState(materiToEdit?.fileSize || '');

  // Video Modes: 'youtube' | 'upload'
  const initialVideoMode: 'youtube' | 'upload' =
    materiToEdit?.videoSourceType || (materiToEdit?.videoDirectUrl ? 'upload' : 'youtube');
  const [videoMode, setVideoMode] = useState<'youtube' | 'upload'>(initialVideoMode);

  // YouTube states
  const [youtubeInput, setYoutubeInput] = useState(
    materiToEdit?.videoSourceType === 'youtube' || materiToEdit?.videoEmbedUrl
      ? materiToEdit.videoEmbedUrl || ''
      : 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
  );

  // Upload Video states
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string>(
    materiToEdit?.videoDirectUrl || ''
  );
  const [uploadedVideoName, setUploadedVideoName] = useState<string>(
    materiToEdit?.videoFileName || ''
  );
  const [uploadedVideoSize, setUploadedVideoSize] = useState<string>(
    materiToEdit?.videoFileSize || ''
  );
  const [isProcessingVideo, setIsProcessingVideo] = useState<boolean>(false);
  const [videoUploadSuccess, setVideoUploadSuccess] = useState<boolean>(false);

  // Arabic & Text fields
  const [arabText, setArabText] = useState(materiToEdit?.arabText || '');
  const [terjemah, setTerjemah] = useState(materiToEdit?.terjemah || '');
  const [maknaPegon, setMaknaPegon] = useState(materiToEdit?.maknaPegon || '');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // YouTube preview info
  const ytInfo = getYouTubeInfo(youtubeInput);

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileName(file.name);
      setFileSize(formatBytes(file.size));
    }
  };

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIsProcessingVideo(true);

      // Create local object URL for instant high-performance playback
      const objectUrl = URL.createObjectURL(file);
      setUploadedVideoUrl(objectUrl);
      setUploadedVideoName(file.name);
      setUploadedVideoSize(formatBytes(file.size));

      setTimeout(() => {
        setIsProcessingVideo(false);
        setVideoUploadSuccess(true);
      }, 500);
    }
  };

  const handleClearUploadedVideo = () => {
    setUploadedVideoUrl('');
    setUploadedVideoName('');
    setUploadedVideoSize('');
    setVideoUploadSuccess(false);
    if (videoInputRef.current) {
      videoInputRef.current.value = '';
    }
  };

  const handleApplyPresetYouTube = (url: string) => {
    setYoutubeInput(url);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!judul.trim()) return;

    const selectedKitab =
      availableKitab.find((k) => k.id === mapelId) ||
      kitabList.find((k) => k.id === mapelId);
    const selectedKelas = kelasList.find((k) => k.id === kelasId);

    // Prepare video properties
    let finalVideoEmbedUrl: string | undefined = undefined;
    let finalVideoDirectUrl: string | undefined = undefined;
    let finalVideoSourceType: 'youtube' | 'upload' | undefined = undefined;
    let finalVideoThumbnail: string | undefined = undefined;

    if (jenisMateri === 'video') {
      if (videoMode === 'youtube') {
        finalVideoSourceType = 'youtube';
        finalVideoEmbedUrl = ytInfo ? ytInfo.embedUrl : toYouTubeEmbedUrl(youtubeInput);
        finalVideoThumbnail = ytInfo?.thumbnailUrl;
      } else {
        finalVideoSourceType = 'upload';
        finalVideoDirectUrl = uploadedVideoUrl || 'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-man-flipping-pages-of-a-book-41135-large.mp4';
      }
    } else if (youtubeInput && isValidYouTubeUrl(youtubeInput)) {
      // Allow supplementary video
      finalVideoSourceType = 'youtube';
      finalVideoEmbedUrl = toYouTubeEmbedUrl(youtubeInput);
      finalVideoThumbnail = ytInfo?.thumbnailUrl;
    }

    const newMateri: Materi = {
      id: materiToEdit ? materiToEdit.id : `mat-${Date.now()}`,
      judul,
      mapelId,
      mapelNama: selectedKitab?.namaKitab || 'Kitab Pesantren',
      kelasId,
      kelasNama: selectedKelas?.nama || 'Tingkat Ula',
      guruId: currentUser.role === 'admin' ? (selectedKitab?.guruId || currentUser.id) : currentUser.id,
      guruNama: currentUser.role === 'admin' ? (selectedKitab?.guruNama || currentUser.nama) : currentUser.nama,
      deskripsi,
      jenisMateri,
      fileName: fileName || (jenisMateri === 'pdf' ? `${judul.replace(/\s+/g, '_')}.pdf` : undefined),
      fileSize: fileSize || (jenisMateri === 'pdf' ? '3.5 MB' : undefined),
      fileUrl: materiToEdit?.fileUrl || 'https://example.com/kitab-materi.pdf',
      videoEmbedUrl: finalVideoEmbedUrl,
      videoDirectUrl: finalVideoDirectUrl,
      videoSourceType: finalVideoSourceType,
      videoFileName: uploadedVideoName || undefined,
      videoFileSize: uploadedVideoSize || undefined,
      videoThumbnail: finalVideoThumbnail,
      arabText,
      terjemah,
      maknaPegon,
      tanggalUnggah: materiToEdit?.tanggalUnggah || new Date().toISOString().split('T')[0],
      statusPublikasi,
      viewsCount: materiToEdit?.viewsCount || 0,
    };

    onSave(newMateri);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-sky-950 via-slate-900 to-teal-950 text-white flex items-center justify-between border-b border-sky-900 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-400/20 text-teal-300 flex items-center justify-center font-bold border border-teal-400/30">
              <Video className="w-5 h-5 text-teal-300" />
            </div>
            <div>
              <h3 className="text-sm font-bold leading-tight">
                {materiToEdit ? 'Sunting Materi Pembelajaran' : 'Unggah Materi & Video Kajian Baru'}
              </h3>
              <p className="text-[11px] text-teal-200/80">
                Ustadz dapat mengunggah video rekaman MP4 langsung atau menyematkan link YouTube pengajian.
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
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Judul Materi */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Judul Materi Pembelajaran <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              placeholder="Contoh: Kajian Bab Kalam & Tanda-Tanda Isim Fi'il Huruf"
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all text-slate-800 font-medium"
            />
          </div>

          {/* Kitab & Kelas Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Mata Pelajaran / Kitab <span className="text-rose-500">*</span>
                </label>
                {currentUser.role === 'guru' && (
                  <span className="text-[10px] bg-teal-100 text-teal-800 font-bold px-1.5 py-0.2 rounded">
                    Mapel Diampu
                  </span>
                )}
              </div>
              <select
                value={mapelId}
                onChange={(e) => setMapelId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-slate-800 font-medium"
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
                Tingkat / Kelas Santri <span className="text-rose-500">*</span>
              </label>
              <select
                value={kelasId}
                onChange={(e) => setKelasId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-slate-800"
              >
                {kelasList.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.nama}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Format / Jenis Materi & Status Publikasi */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Format Utama Materi
              </label>
              <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200">
                {(['video', 'pdf', 'ringkasan', 'audio'] as JenisMateri[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setJenisMateri(type)}
                    className={`py-1.5 text-[11px] font-bold rounded-lg capitalize transition-all cursor-pointer flex items-center justify-center gap-1 ${
                      jenisMateri === type
                        ? 'bg-teal-700 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {type === 'video' ? <Video className="w-3 h-3" /> : null}
                    {type === 'pdf' ? <FileText className="w-3 h-3" /> : null}
                    {type === 'ringkasan' ? <BookOpen className="w-3 h-3" /> : null}
                    <span>{type === 'ringkasan' ? 'Teks' : type.toUpperCase()}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Status Publikasi
              </label>
              <select
                value={statusPublikasi}
                onChange={(e) => setStatusPublikasi(e.target.value as 'publik' | 'draft')}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none text-slate-800 font-medium"
              >
                <option value="publik">Publikasikan (Dapat diakses seluruh santri)</option>
                <option value="draft">Simpan Sebagai Draf (Hanya Asatidz)</option>
              </select>
            </div>
          </div>

          {/* VIDEO UPLOAD & YOUTUBE SECTION (Highlighted for Video format) */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-teal-700" />
                <span className="text-xs font-bold text-slate-800">
                  {jenisMateri === 'video'
                    ? 'Pilihan Media Video Kajian Ustadz'
                    : 'Lampiran Video Tambahan (Opsional)'}
                </span>
              </div>

              {/* Toggle Video Mode: YouTube vs Upload */}
              <div className="flex items-center p-0.5 bg-slate-200/80 rounded-lg">
                <button
                  type="button"
                  onClick={() => setVideoMode('youtube')}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
                    videoMode === 'youtube'
                      ? 'bg-white text-rose-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                  <span>Kirim Link YouTube</span>
                </button>
                <button
                  type="button"
                  onClick={() => setVideoMode('upload')}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
                    videoMode === 'upload'
                      ? 'bg-white text-teal-800 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Berkas Video (MP4)</span>
                </button>
              </div>
            </div>

            {/* TAB 1: YOUTUBE LINK */}
            {videoMode === 'youtube' && (
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      Tautan Video YouTube (Watch, Shorts, Embed, atau Live)
                    </label>
                    {ytInfo ? (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        Tautan YouTube Valid (ID: {ytInfo.videoId})
                      </span>
                    ) : youtubeInput.trim() ? (
                      <span className="text-[10px] font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                        Format link belum dikenali
                      </span>
                    ) : null}
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      value={youtubeInput}
                      onChange={(e) => setYoutubeInput(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=... atau https://youtu.be/..."
                      className="w-full pl-3 pr-20 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 text-slate-800 font-mono"
                    />
                    {youtubeInput && (
                      <button
                        type="button"
                        onClick={() => setYoutubeInput('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 text-[11px] font-semibold"
                      >
                        Bersihkan
                      </button>
                    )}
                  </div>
                </div>

                {/* Live YouTube Preview Player */}
                {ytInfo ? (
                  <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-700 flex items-center gap-1.5">
                        <Play className="w-3.5 h-3.5 text-rose-600 fill-rose-600" />
                        Pratinjau Pemutar Video YouTube:
                      </span>
                      <a
                        href={ytInfo.watchUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-sky-700 hover:underline flex items-center gap-1"
                      >
                        <span>Buka di YouTube</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <div className="aspect-video w-full rounded-xl overflow-hidden bg-black shadow-inner">
                      <iframe
                        src={ytInfo.embedUrl}
                        title="Pratinjau Video YouTube"
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
                    <p className="font-semibold flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-700" />
                      <span>Petunjuk Tautan YouTube:</span>
                    </p>
                    <p className="text-[11px] text-amber-800/90 leading-relaxed">
                      Ustadz dapat menyalin link pengajian dari YouTube, baik dari browser laptop maupun aplikasi HP (format watch, share, shorts, atau embed).
                    </p>
                  </div>
                )}

                {/* Preset Samples */}
                <div className="pt-1">
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 font-semibold mb-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                    <span>Atau pilih contoh video kajian pesantren:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {SAMPLE_PESANTREN_YOUTUBE_VIDEOS.map((sample, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleApplyPresetYouTube(sample.url)}
                        className="px-2.5 py-1 text-[11px] bg-white hover:bg-teal-50 border border-slate-200 hover:border-teal-300 rounded-lg text-slate-700 hover:text-teal-900 transition-colors cursor-pointer"
                      >
                        {sample.kitab}: {sample.title.slice(0, 32)}...
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: UPLOAD LOCAL VIDEO FILE */}
            {videoMode === 'upload' && (
              <div className="space-y-3">
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/mp4,video/webm,video/ogg,video/quicktime,.mp4,.webm,.mkv,.mov,.avi"
                  onChange={handleVideoFileChange}
                  className="hidden"
                />

                {!uploadedVideoUrl ? (
                  <div
                    onClick={() => videoInputRef.current?.click()}
                    className="p-6 bg-white border-2 border-dashed border-teal-300 hover:border-teal-500 rounded-xl text-center cursor-pointer transition-all hover:bg-teal-50/20 group"
                  >
                    <div className="w-12 h-12 rounded-full bg-teal-50 group-hover:bg-teal-100 text-teal-700 flex items-center justify-center mx-auto mb-2 transition-colors">
                      <Film className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-bold text-slate-800">
                      Klik untuk Pilih Berkas Video Kajian dari Laptop/HP
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Mendukung format MP4, WebM, MKV, MOV, atau video rekaman kajian (hingga 100MB+).
                    </p>
                    <button
                      type="button"
                      className="mt-3 px-4 py-1.5 bg-teal-700 group-hover:bg-teal-800 text-white rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1.5 pointer-events-none"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Pilih Berkas Video</span>
                    </button>
                  </div>
                ) : (
                  <div className="bg-white p-4 rounded-xl border border-teal-200 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <div className="w-9 h-9 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center shrink-0">
                          <Film className="w-5 h-5" />
                        </div>
                        <div className="truncate">
                          <p className="text-xs font-bold text-slate-800 truncate">
                            {uploadedVideoName || 'Rekaman_Kajian_Pesantren.mp4'}
                          </p>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500">
                            <span>{uploadedVideoSize || '28.4 MB'}</span>
                            <span>•</span>
                            <span className="text-emerald-700 font-semibold flex items-center gap-0.5">
                              <Check className="w-3 h-3" /> Berkas Siap Diputar
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => videoInputRef.current?.click()}
                          className="px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
                        >
                          Ganti Berkas
                        </button>
                        <button
                          type="button"
                          onClick={handleClearUploadedVideo}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Hapus video ini"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* HTML5 Video Preview Player */}
                    <div className="aspect-video w-full rounded-xl overflow-hidden bg-black shadow-inner">
                      <video
                        src={uploadedVideoUrl}
                        controls
                        playsInline
                        className="w-full h-full object-contain"
                      >
                        Browser Anda tidak mendukung tag video HTML5.
                      </video>
                    </div>

                    <p className="text-[11px] text-slate-500 italic">
                      Santri dapat langsung menonton video ini secara jernih melalui browser atau aplikasi web pesantren.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* PDF Document Upload if Format is PDF */}
          {jenisMateri === 'pdf' && (
            <div className="p-4 bg-slate-50 border border-dashed border-slate-300 rounded-xl space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                Berkas PDF Kitab / Dokumen Pelajaran
              </label>
              <div className="flex items-center gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleDocumentChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="cursor-pointer px-3 py-2 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg text-xs font-medium text-slate-700 flex items-center gap-2"
                >
                  <Upload className="w-4 h-4 text-teal-700" />
                  <span>Pilih Dokumen PDF</span>
                </button>
                <span className="text-xs text-slate-600 truncate max-w-xs font-mono">
                  {fileName ? `${fileName} (${fileSize})` : 'Belum ada berkas dipilih'}
                </span>
              </div>
            </div>
          )}

          {/* Arabic Text & Harakat */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                Teks Matan Arab (Berharakat)
              </label>
              <span className="text-[10px] text-slate-500 font-arabic">النص العربي الأصلي</span>
            </div>
            <textarea
              rows={3}
              value={arabText}
              onChange={(e) => setArabText(e.target.value)}
              placeholder="Ketikkan atau tempel matan kitab dalam huruf Arab berharakat..."
              className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 font-arabic text-right dir-rtl leading-loose text-slate-900"
              dir="rtl"
            />
          </div>

          {/* Indonesian Translation & Pegon */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Terjemahan Bahasa Indonesia
              </label>
              <textarea
                rows={3}
                value={terjemah}
                onChange={(e) => setTerjemah(e.target.value)}
                placeholder="Arti atau terjemah ringkas materi pengajian..."
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Makna Pegon / Gandul (Opsional)
              </label>
              <textarea
                rows={3}
                value={maknaPegon}
                onChange={(e) => setMaknaPegon(e.target.value)}
                placeholder="Contoh: الْكَلَامُ (utawi kalam) هُوَ (iku)..."
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 font-arabic text-right dir-rtl text-slate-800"
                dir="rtl"
              />
            </div>
          </div>

          {/* Deskripsi */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Deskripsi & Catatan Pembelajaran Santri
            </label>
            <textarea
              rows={2}
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              placeholder="Tuliskan petunjuk atau poin penting kajian untuk santri..."
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-slate-800"
            />
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold bg-teal-700 hover:bg-teal-800 text-white rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{materiToEdit ? 'Simpan Perubahan Materi' : 'Terbitkan Materi & Video'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
