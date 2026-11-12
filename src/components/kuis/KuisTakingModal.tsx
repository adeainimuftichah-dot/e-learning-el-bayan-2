/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Send,
  HelpCircle,
  Award,
} from 'lucide-react';
import { Kuis, JawabanKuisSantri, User } from '../../types';

interface KuisTakingModalProps {
  kuis: Kuis;
  currentUser: User;
  onFinishKuis: (jawaban: JawabanKuisSantri) => void;
  onClose: () => void;
}

export const KuisTakingModal: React.FC<KuisTakingModalProps> = ({
  kuis,
  currentUser,
  onFinishKuis,
  onClose,
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(kuis.durasiMenit * 60);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<JawabanKuisSantri | null>(null);

  // Timer countdown
  useEffect(() => {
    if (isSubmitted) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitAnswers();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isSubmitted]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const currentSoal = kuis.soal[currentIdx];

  const handleSelectOption = (soalId: string, val: string) => {
    if (isSubmitted) return;
    setAnswers((prev) => ({ ...prev, [soalId]: val }));
  };

  const handleSubmitAnswers = () => {
    if (isSubmitted) return;

    // Calculate auto-grade for Multiple Choice
    let mcqScore = 0;
    let totalMcqWeight = 0;
    let hasEssay = false;

    kuis.soal.forEach((s) => {
      if (s.tipeSoal === 'pilihan_ganda') {
        totalMcqWeight += s.bobotPoin;
        if (answers[s.id] === s.kunciJawaban) {
          mcqScore += s.bobotPoin;
        }
      } else {
        hasEssay = true;
      }
    });

    const isLulus = mcqScore >= kuis.passingScore;

    const result: JawabanKuisSantri = {
      id: `jwb-${Date.now()}`,
      kuisId: kuis.id,
      santriId: currentUser.id,
      santriNama: currentUser.nama,
      tanggalMengerjakan: new Date().toISOString().replace('T', ' ').substring(0, 16),
      nilaiPilihanGanda: mcqScore,
      nilaiEsai: hasEssay ? 0 : undefined,
      nilaiAkhir: mcqScore,
      isLulus,
      status: hasEssay ? 'perlu_koreksi_esai' : 'selesai',
      jawabanSantri: answers,
      catatanGuru: hasEssay
        ? 'Jawaban pilihan ganda selesai dinilai otomatis. Menunggu penilaian soal esai oleh guru pengampu.'
        : isLulus
        ? 'Mumtaz! Anda telah melampaui batas kelulusan.'
        : 'Perlu belajar lebih giat lagi.',
    };

    setSubmissionResult(result);
    setIsSubmitted(true);
    onFinishKuis(result);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-sky-950 text-white flex items-center justify-between border-b border-sky-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center font-bold shrink-0">
              <HelpCircle className="w-5 h-5 text-teal-300" />
            </div>
            <div>
              <span className="text-[10px] font-semibold text-teal-300 uppercase tracking-wider">
                {kuis.mapelNama} • {kuis.kelasNama}
              </span>
              <h3 className="text-sm font-bold text-white truncate">{kuis.judul}</h3>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {!isSubmitted && (
              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold ${
                  timeLeft < 300
                    ? 'bg-rose-500 text-white animate-pulse'
                    : 'bg-sky-900 text-sky-200 border border-sky-800'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>{formatTime(timeLeft)}</span>
              </div>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-sky-900 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Question Area or Result Summary */}
        {!isSubmitted ? (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Question Navigation Bubbles */}
            <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-xs font-semibold text-slate-600">Daftar Soal:</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {kuis.soal.map((s, idx) => {
                  const isAnswered = Boolean(answers[s.id]);
                  const isCurrent = idx === currentIdx;
                  return (
                    <button
                      key={s.id}
                      onClick={() => setCurrentIdx(idx)}
                      className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                        isCurrent
                          ? 'ring-2 ring-sky-700 bg-sky-800 text-white shadow-xs'
                          : isAnswered
                          ? 'bg-teal-100 text-teal-900 border border-teal-300'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Current Question Box */}
            <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-sky-800 bg-sky-50 px-2.5 py-1 rounded-md">
                  Soal Nomor {currentIdx + 1} dari {kuis.soal.length}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  Bobot: {currentSoal.bobotPoin} Poin ({currentSoal.tipeSoal === 'pilihan_ganda' ? 'Pilihan Ganda' : 'Esai'})
                </span>
              </div>

              {/* Arabic quote if exists */}
              {currentSoal.pertanyaanArab && (
                <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-xl font-arabic text-xl text-right dir-rtl leading-loose text-amber-950">
                  {currentSoal.pertanyaanArab}
                </div>
              )}

              <p className="text-sm font-semibold text-slate-800 leading-relaxed">
                {currentSoal.pertanyaan}
              </p>

              {/* Options */}
              {currentSoal.tipeSoal === 'pilihan_ganda' && currentSoal.pilihan && (
                <div className="space-y-2.5 pt-2">
                  {(['a', 'b', 'c', 'd'] as const).map((key) => {
                    const optionText = currentSoal.pilihan?.[key];
                    if (!optionText) return null;
                    const isSelected = answers[currentSoal.id] === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => handleSelectOption(currentSoal.id, key)}
                        className={`w-full text-left p-3 rounded-xl border text-xs font-medium flex items-center gap-3 transition-all ${
                          isSelected
                            ? 'bg-sky-50 border-sky-600 text-sky-950 ring-2 ring-sky-500/20'
                            : 'bg-slate-50/60 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                        }`}
                      >
                        <span
                          className={`w-6 h-6 rounded-lg font-bold flex items-center justify-center shrink-0 uppercase text-xs ${
                            isSelected
                              ? 'bg-sky-800 text-white'
                              : 'bg-white border border-slate-300 text-slate-600'
                          }`}
                        >
                          {key}
                        </span>
                        <span className="leading-relaxed">{optionText}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Essay Input */}
              {currentSoal.tipeSoal === 'esai' && (
                <div className="pt-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Jawaban Esai Anda:
                  </label>
                  <textarea
                    rows={5}
                    value={answers[currentSoal.id] || ''}
                    onChange={(e) => handleSelectOption(currentSoal.id, e.target.value)}
                    placeholder="Tuliskan uraian dan penjelasan Anda secara rinci..."
                    className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 text-slate-800 leading-relaxed"
                  />
                </div>
              )}
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))}
                disabled={currentIdx === 0}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-40 flex items-center gap-1.5 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Soal Sebelumnya</span>
              </button>

              {currentIdx < kuis.soal.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentIdx(currentIdx + 1)}
                  className="px-4 py-2 text-xs font-bold text-white bg-sky-800 hover:bg-sky-900 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
                >
                  <span>Soal Berikutnya</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmitAnswers}
                  className="px-5 py-2 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Selesai & Kumpulkan Kuis</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Submission Results View */
          <div className="flex-1 overflow-y-auto p-8 space-y-6 max-w-xl mx-auto text-center">
            <div className="w-16 h-16 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center mx-auto shadow-sm">
              <Award className="w-8 h-8" />
            </div>

            <div>
              <h4 className="text-xl font-bold text-slate-900">Kuis Berhasil Diselesaikan!</h4>
              <p className="text-xs text-slate-500 mt-1">
                Alhamdulillah, jawaban Anda telah tersimpan di sistem akademik pesantren.
              </p>
            </div>

            {/* Score Card */}
            <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                Nilai Otomatis Pilihan Ganda
              </div>
              <div className="text-4xl font-extrabold text-sky-900 font-mono">
                {submissionResult?.nilaiPilihanGanda}
                <span className="text-lg text-slate-400 font-normal"> / 100</span>
              </div>
              <div>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                    submissionResult?.isLulus
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {submissionResult?.isLulus ? 'Lulus Ambang Batas (Mumtaz)' : 'Di Bawah KKM (Perlu Remidi)'}
                </span>
              </div>
              <p className="text-xs text-slate-600 pt-2 border-t border-slate-200">
                {submissionResult?.catatanGuru}
              </p>
            </div>

            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-sky-800 hover:bg-sky-900 text-white font-bold text-xs rounded-xl transition-colors shadow-sm"
            >
              Kembali ke Menu Kuis
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
