/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, RotateCcw, Trash2, FileText, Video, BookOpen, AlertCircle, Sparkles } from 'lucide-react';
import { Materi } from '../../types';

interface MateriTrashModalProps {
  isOpen: boolean;
  trashList: Materi[];
  onClose: () => void;
  onRestoreSingle: (id: string) => void;
  onRestoreAll: () => void;
  onClearTrash: () => void;
}

export const MateriTrashModal: React.FC<MateriTrashModalProps> = ({
  isOpen,
  trashList,
  onClose,
  onRestoreSingle,
  onRestoreAll,
  onClearTrash,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-amber-500/10 via-amber-50/30 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-700">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">Kotak Sampah & Pemulihan Materi</h3>
              <p className="text-xs text-slate-500">
                Pulihkan materi pembelajaran yang sebelumnya sempat terhapus.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-3">
          {trashList.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <Trash2 className="w-6 h-6" />
              </div>
              <p className="font-bold text-slate-700 text-sm">Kotak Sampah Kosong</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Semua materi pembelajaran aktif dan tidak ada materi terhapus saat ini.
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs">
                <span className="font-semibold text-slate-600">
                  Terdapat <strong className="text-amber-700 font-bold">{trashList.length}</strong> materi dalam kotak sampah:
                </span>
                <button
                  onClick={onRestoreAll}
                  className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Pulihkan Semua Materi</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {trashList.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                        {item.jenisMateri === 'video' || item.videoEmbedUrl || item.videoDirectUrl ? (
                          <Video className="w-4 h-4" />
                        ) : (
                          <BookOpen className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-1">
                          {item.judul}
                        </h4>
                        <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-slate-500">
                          <span className="font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                            {item.mapelNama}
                          </span>
                          <span>•</span>
                          <span>{item.guruNama}</span>
                          {item.videoSourceType && (
                            <>
                              <span>•</span>
                              <span className="text-sky-700 font-medium">
                                {item.videoSourceType === 'youtube' ? 'YouTube' : 'Video MP4'}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                      <button
                        onClick={() => onRestoreSingle(item.id)}
                        className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Pulihkan</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/70 rounded-xl transition-colors cursor-pointer"
          >
            Tutup
          </button>

          {trashList.length > 0 && (
            <button
              onClick={onClearTrash}
              className="text-xs text-rose-600 hover:text-rose-700 hover:underline font-medium cursor-pointer"
            >
              Kosongkan Kotak Sampah
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
