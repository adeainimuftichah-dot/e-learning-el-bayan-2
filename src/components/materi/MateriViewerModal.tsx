/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import {
  X,
  FileText,
  Video,
  Download,
  BookOpen,
  Volume2,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  Eye,
  Check,
  Copy,
  User,
  Calendar,
  ExternalLink,
  Film,
  Play,
  RotateCcw,
} from 'lucide-react';
import { Materi } from '../../types';
import { getYouTubeInfo, toYouTubeEmbedUrl } from '../../utils/videoHelper';

interface MateriViewerModalProps {
  materi: Materi;
  onClose: () => void;
}

export const MateriViewerModal: React.FC<MateriViewerModalProps> = ({ materi, onClose }) => {
  const hasVideo = Boolean(
    materi.videoEmbedUrl || materi.videoDirectUrl || materi.jenisMateri === 'video'
  );

  const [activeTab, setActiveTab] = useState<'text' | 'pdf' | 'video'>(
    materi.jenisMateri === 'video' || (hasVideo && !materi.arabText && materi.jenisMateri !== 'pdf')
      ? 'video'
      : materi.jenisMateri === 'pdf'
      ? 'pdf'
      : 'text'
  );

  const [arabicFontSize, setArabicFontSize] = useState<number>(24);
  const [showTranslation, setShowTranslation] = useState<boolean>(true);
  const [showPegon, setShowPegon] = useState<boolean>(true);
  const [pdfPage, setPdfPage] = useState<number>(1);
  const [pdfZoom, setPdfZoom] = useState<number>(100);
  const [copied, setCopied] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);

  const videoElementRef = useRef<HTMLVideoElement>(null);

  const handleCopy = () => {
    const textToCopy = `${materi.judul}\n\n${materi.arabText || ''}\n\nTerjemah:\n${materi.terjemah || ''}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleAudio = () => {
    setIsPlayingAudio(!isPlayingAudio);
  };

  const handleChangePlaybackSpeed = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoElementRef.current) {
      videoElementRef.current.playbackRate = speed;
    }
  };

  // Determine video parameters
  const isUploadedVideo =
    materi.videoSourceType === 'upload' || Boolean(materi.videoDirectUrl);
  const isYouTubeVideo =
    materi.videoSourceType === 'youtube' ||
    Boolean(materi.videoEmbedUrl && !materi.videoDirectUrl);

  const ytInfo = materi.videoEmbedUrl ? getYouTubeInfo(materi.videoEmbedUrl) : null;
  const embedUrl = ytInfo ? ytInfo.embedUrl : materi.videoEmbedUrl ? toYouTubeEmbedUrl(materi.videoEmbedUrl) : '';
  const watchUrl = ytInfo ? ytInfo.watchUrl : materi.videoEmbedUrl || '';

  const totalSimulatedPages = 6;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/75 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-sky-950 via-slate-900 to-teal-950 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center font-bold shrink-0 border border-teal-500/30">
              {materi.jenisMateri === 'video' ? (
                <Video className="w-5 h-5 text-teal-300" />
              ) : (
                <BookOpen className="w-5 h-5 text-teal-300" />
              )}
            </div>
            <div className="truncate">
              <div className="flex items-center gap-2 text-xs text-teal-300 font-medium">
                <span>{materi.mapelNama}</span>
                <span>•</span>
                <span className="text-slate-300">{materi.kelasNama}</span>
                {isYouTubeVideo && (
                  <>
                    <span>•</span>
                    <span className="text-rose-300 font-semibold flex items-center gap-1">
                      <Play className="w-3 h-3 fill-rose-400" /> YouTube Kajian
                    </span>
                  </>
                )}
                {isUploadedVideo && (
                  <>
                    <span>•</span>
                    <span className="text-teal-300 font-semibold flex items-center gap-1">
                      <Film className="w-3 h-3" /> Rekaman Video MP4
                    </span>
                  </>
                )}
              </div>
              <h3 className="text-base font-bold text-white truncate">{materi.judul}</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-header / Metadata bar */}
        <div className="px-6 py-2.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 shrink-0">
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>Pengampu: <strong className="text-slate-800">{materi.guruNama}</strong></span>
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{materi.tanggalUnggah}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-slate-400" />
              <span>{materi.viewsCount} kali dipelajari</span>
            </span>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center p-1 bg-slate-200/70 rounded-xl">
            {hasVideo && (
              <button
                onClick={() => setActiveTab('video')}
                className={`px-3 py-1 rounded-lg font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'video'
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                <Video className="w-3.5 h-3.5" />
                <span>Video Kajian</span>
              </button>
            )}
            <button
              onClick={() => setActiveTab('text')}
              className={`px-3 py-1 rounded-lg font-semibold text-xs transition-all flex items-center gap-1 cursor-pointer ${
                activeTab === 'text'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Matan & Terjemah</span>
            </button>
            <button
              onClick={() => setActiveTab('pdf')}
              className={`px-3 py-1 rounded-lg font-semibold text-xs transition-all flex items-center gap-1 cursor-pointer ${
                activeTab === 'pdf'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Pratinjau PDF</span>
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 bg-slate-50/50">
          {/* TAB 1: VIDEO KAJIAN (YOUTUBE / UPLOADED MP4) */}
          {activeTab === 'video' && (
            <div className="space-y-5 max-w-3xl mx-auto animate-in fade-in duration-150">
              {/* VIDEO PLAYER CONTAINER */}
              <div className="bg-black rounded-2xl overflow-hidden shadow-xl border border-slate-800">
                {isUploadedVideo ? (
                  /* Uploaded Video HTML5 Player */
                  <div className="relative">
                    <video
                      ref={videoElementRef}
                      src={materi.videoDirectUrl || 'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-man-flipping-pages-of-a-book-41135-large.mp4'}
                      controls
                      playsInline
                      className="w-full aspect-video bg-black object-contain"
                    >
                      Browser Anda tidak mendukung pemutar video HTML5.
                    </video>
                  </div>
                ) : isYouTubeVideo && embedUrl ? (
                  /* YouTube Iframe Embed */
                  <div className="aspect-video w-full bg-black">
                    <iframe
                      src={embedUrl}
                      title={materi.judul}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <div className="aspect-video flex items-center justify-center text-slate-400 text-xs p-6 text-center">
                    Video kajian sedang disiapkan oleh pengampu ustadz.
                  </div>
                )}
              </div>

              {/* Video Toolbar / Controls & Info Card */}
              <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800">
                        {isUploadedVideo
                          ? 'Rekaman Video Kajian Ustadz (MP4)'
                          : 'Pengajian Kitab Streaming YouTube'}
                      </span>
                      {isUploadedVideo ? (
                        <span className="text-[10px] font-bold bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Film className="w-3 h-3" /> Video Lokal Terunggah
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Play className="w-3 h-3 fill-rose-700" /> YouTube Channel Pesantren
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Dibimbing oleh: <strong>{materi.guruNama}</strong> • Kelas: <strong>{materi.kelasNama}</strong>
                    </p>
                  </div>

                  {/* Actions / Speed selector / External link */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {isUploadedVideo && (
                      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                        <span className="text-[10px] font-semibold text-slate-500 px-1">Kecepatan:</span>
                        {[1, 1.25, 1.5].map((speed) => (
                          <button
                            key={speed}
                            onClick={() => handleChangePlaybackSpeed(speed)}
                            className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${
                              playbackSpeed === speed
                                ? 'bg-teal-700 text-white'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            {speed}x
                          </button>
                        ))}
                      </div>
                    )}

                    {isUploadedVideo && (
                      <a
                        href={materi.videoDirectUrl || '#'}
                        download={materi.videoFileName || 'Kajian_Pesantren_El_Bayan.mp4'}
                        onClick={(e) => {
                          if (!materi.videoDirectUrl) {
                            e.preventDefault();
                            alert('Mengunduh rekaman video kajian ustadz...');
                          }
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Unduh Video {materi.videoFileSize ? `(${materi.videoFileSize})` : ''}</span>
                      </a>
                    )}

                    {isYouTubeVideo && watchUrl && (
                      <a
                        href={watchUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition-colors"
                      >
                        <span>Buka Langsung di YouTube</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Deskripsi Catatan Ustadz */}
                <div className="text-xs text-slate-700 space-y-1">
                  <h4 className="font-bold text-slate-900">Petunjuk Pembelajaran untuk Santri:</h4>
                  <p className="leading-relaxed text-slate-600">
                    {materi.deskripsi ||
                      'Simak dengan seksama syarah ustadz, catat faidah-faidah penting dalam buku catatan masing-masing, dan selaraskan dengan teks matan kitab.'}
                  </p>
                </div>
              </div>

              {/* Matan Kitab Terkait (Read along while watching) */}
              {materi.arabText && (
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-teal-700" />
                      <h4 className="text-xs font-bold text-slate-800">
                        Teks Matan Kitab (Sambil Menyimak Video Kajian)
                      </h4>
                    </div>
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 px-2 py-1 rounded-lg"
                    >
                      {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copied ? 'Tersalin' : 'Salin Matan'}</span>
                    </button>
                  </div>

                  <div
                    className="font-arabic text-slate-900 leading-loose text-right dir-rtl select-text text-xl"
                    dir="rtl"
                  >
                    {materi.arabText.split('\n').map((para, i) => (
                      <p key={i} className="mb-2">
                        {para}
                      </p>
                    ))}
                  </div>

                  {materi.terjemah && (
                    <div className="pt-3 border-t border-slate-100 text-xs text-slate-700 bg-slate-50 p-3.5 rounded-xl">
                      <span className="font-bold block mb-1 text-slate-800">Terjemahan Ringkas:</span>
                      <p className="leading-relaxed">{materi.terjemah}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: MATAN & TERJEMAH */}
          {activeTab === 'text' && (
            <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-150">
              {/* Controls bar */}
              <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl shadow-xs">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-600">Ukuran Font Arab:</span>
                  <button
                    onClick={() => setArabicFontSize(Math.max(18, arabicFontSize - 2))}
                    className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold w-6 h-6 flex items-center justify-center cursor-pointer"
                    title="Perkecil Font"
                  >
                    A-
                  </button>
                  <span className="text-xs font-mono w-7 text-center">{arabicFontSize}px</span>
                  <button
                    onClick={() => setArabicFontSize(Math.min(36, arabicFontSize + 2))}
                    className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold w-6 h-6 flex items-center justify-center cursor-pointer"
                    title="Perbesar Font"
                  >
                    A+
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showTranslation}
                      onChange={(e) => setShowTranslation(e.target.checked)}
                      className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                    />
                    <span>Terjemah</span>
                  </label>

                  {materi.maknaPegon && (
                    <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showPegon}
                        onChange={(e) => setShowPegon(e.target.checked)}
                        className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                      />
                      <span>Makna Pegon</span>
                    </label>
                  )}

                  <button
                    onClick={toggleAudio}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      isPlayingAudio
                        ? 'bg-teal-600 text-white animate-pulse'
                        : 'bg-teal-50 text-teal-700 hover:bg-teal-100'
                    }`}
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>{isPlayingAudio ? 'Menyimak Audio...' : 'Audio Matan'}</span>
                  </button>

                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Tersalin' : 'Salin'}</span>
                  </button>
                </div>
              </div>

              {/* Matan Arabic Container */}
              <div className="bg-white rounded-2xl p-8 border border-slate-200/90 shadow-xs relative">
                <div className="text-center mb-6">
                  <span className="text-xs font-bold tracking-widest text-teal-700 uppercase">
                    Matan Asli Berharakat
                  </span>
                </div>

                <div
                  className="font-arabic text-slate-900 leading-loose text-right dir-rtl select-text"
                  style={{ fontSize: `${arabicFontSize}px` }}
                  dir="rtl"
                >
                  {materi.arabText ? (
                    materi.arabText.split('\n').map((para, i) => (
                      <p key={i} className="mb-4">
                        {para}
                      </p>
                    ))
                  ) : (
                    <p className="text-slate-400 text-center py-6">
                      Teks matan digital sedang dalam proses verifikasi ustadz.
                    </p>
                  )}
                </div>

                {/* Makna Pegon Section */}
                {showPegon && materi.maknaPegon && (
                  <div className="mt-8 pt-6 border-t border-slate-100 bg-amber-50/60 p-4 rounded-xl border border-amber-200/60">
                    <p className="text-xs font-bold text-amber-900 mb-2 flex items-center gap-1.5">
                      <span>Makna Gandul / Pegon Pesantren:</span>
                    </p>
                    <p
                      className="font-arabic text-amber-950 text-right dir-rtl leading-relaxed"
                      style={{ fontSize: `${Math.max(16, arabicFontSize - 4)}px` }}
                      dir="rtl"
                    >
                      {materi.maknaPegon}
                    </p>
                  </div>
                )}

                {/* Indonesian Translation Section */}
                {showTranslation && materi.terjemah && (
                  <div className="mt-8 pt-6 border-t border-slate-100">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
                      Terjemahan Bahasa Indonesia:
                    </h4>
                    <div className="text-xs text-slate-700 space-y-2 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
                      {materi.terjemah.split('\n').map((t, idx) => (
                        <p key={idx}>{t}</p>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Deskripsi & Catatan Ustadz */}
              <div className="p-4 bg-sky-50 border border-sky-200 rounded-xl text-xs">
                <h4 className="font-bold text-sky-950 mb-1">Catatan Penting Guru / Ustadz:</h4>
                <p className="text-sky-900 leading-relaxed">{materi.deskripsi}</p>
              </div>
            </div>
          )}

          {/* TAB 3: PRATINJAU PDF */}
          {activeTab === 'pdf' && (
            <div className="space-y-4 max-w-3xl mx-auto animate-in fade-in duration-150">
              {/* PDF Toolbar */}
              <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl shadow-xs text-xs">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPdfPage(Math.max(1, pdfPage - 1))}
                      disabled={pdfPage <= 1}
                      className="p-1 rounded bg-slate-100 hover:bg-slate-200 disabled:opacity-40 cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="font-semibold text-slate-700 px-1">
                      Halaman {pdfPage} / {totalSimulatedPages}
                    </span>
                    <button
                      onClick={() => setPdfPage(Math.min(totalSimulatedPages, pdfPage + 1))}
                      disabled={pdfPage >= totalSimulatedPages}
                      className="p-1 rounded bg-slate-100 hover:bg-slate-200 disabled:opacity-40 cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="h-4 w-px bg-slate-200" />

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPdfZoom(Math.max(70, pdfZoom - 10))}
                      className="p-1 rounded bg-slate-100 hover:bg-slate-200 cursor-pointer"
                      title="Perkecil"
                    >
                      <ZoomOut className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-mono text-slate-700 w-10 text-center">{pdfZoom}%</span>
                    <button
                      onClick={() => setPdfZoom(Math.min(140, pdfZoom + 10))}
                      className="p-1 rounded bg-slate-100 hover:bg-slate-200 cursor-pointer"
                      title="Perbesar"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <a
                  href={`#download-${materi.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    alert(`Mengunduh file PDF asli: ${materi.fileName || 'Kitab_Pesantren.pdf'}`);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-700 text-white rounded-lg hover:bg-teal-800 transition-colors font-semibold cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh Dokumen PDF ({materi.fileSize || '3.2 MB'})</span>
                </a>
              </div>

              {/* Simulated Kitab Page Viewer */}
              <div
                className="bg-[#fcfbf7] border-2 border-[#e6decb] rounded-xl shadow-md p-10 min-h-[500px] text-slate-900 transition-all mx-auto overflow-hidden relative"
                style={{
                  transform: `scale(${pdfZoom / 100})`,
                  transformOrigin: 'top center',
                }}
              >
                <div className="border border-[#b8a27d]/60 p-6 rounded-lg relative">
                  <div className="text-center pb-4 border-b border-[#b8a27d]/40 mb-6">
                    <p className="font-arabic text-xl text-[#3d2b1f] font-bold">
                      بِسْمِ اللهِ الرَّحْمَنِ الرَّحِيمِ
                    </p>
                    <p className="text-xs tracking-wider uppercase text-[#735e40] font-semibold mt-1">
                      {materi.mapelNama} — Halaman {pdfPage}
                    </p>
                  </div>

                  <div className="font-arabic text-right text-lg text-[#261b13] leading-loose dir-rtl select-text" dir="rtl">
                    {pdfPage === 1 ? (
                      <div>
                        <p className="mb-4">
                          الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ، وَبِهِ نَسْتَعِينُ عَلَى أُمُورِ الدُّنْيَا وَالدِّينِ،
                          وَصَلَّى اللهُ وَسَلَّمَ عَلَى سَيِّدِنَا مُحَمَّدٍ خَاتَمِ النَّبِيِّينَ، وَآلِهِ وَصَحْبِهِ أَجْمَعِينَ.
                        </p>
                        <p className="mb-4">
                          {materi.arabText || 'قَالَ الْمُصَنِّفُ رَحِمَهُ اللهُ تَعَالَى وَنَفَعَنَا بِعُلُومِهِ فِي الدَّارَيْنِ آمِينَ...'}
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="mb-4">
                          (فَصْلٌ) فِي بَيَانِ الْأَحْكَامِ الشَّرْعِيَّةِ وَمَا يَتَعَلَّقُ بِهَا مِنَ الْوَاجِبَاتِ وَالْمَنْدُوبَاتِ.
                        </p>
                        <p className="mb-4">
                          وَاعْلَمْ أَنَّ الْعِلْمَ نُورٌ يَقْذِفُهُ اللهُ فِي قَلْبِ مَنْ يَشَاءُ مِنْ عِبَادِهِ، فَلَا يَصِحُّ تَحْصِيلُهُ إِلَّا بِالْإِخْلَاصِ وَالِاجْتِهَادِ وَتَعْظِيمِ الْأُسْتَاذِ.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mt-8 pt-4 border-t border-[#b8a27d]/40 text-left text-[11px] text-[#594732] font-serif">
                    <p>¹ Catatan Hasyiyah: Syarah cetakan klasik Darul Kutub Al-Ilmiyyah hal. {pdfPage + 12}.</p>
                    <p>² Tashih oleh Dewan Asatidz Pondok Pesantren.</p>
                  </div>
                </div>

                <div className="text-center text-[11px] text-[#735e40] mt-4 font-mono">
                  - {pdfPage} -
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-white border-t border-slate-200 flex items-center justify-between text-xs text-slate-600 shrink-0">
          <span>Kitab: <strong className="text-slate-800">{materi.mapelNama}</strong></span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Tutup Pratinjau
          </button>
        </div>
      </div>
    </div>
  );
};
