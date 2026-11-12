/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Calendar, Clock, MapPin, User as UserIcon, BookOpen, Trash2 } from 'lucide-react';
import { JadwalHalaqah, User } from '../../types';

interface JadwalHalaqahViewProps {
  jadwalList: JadwalHalaqah[];
  currentUser?: User;
  onDeleteJadwal?: (id: string) => void;
}

export const JadwalHalaqahView: React.FC<JadwalHalaqahViewProps> = ({
  jadwalList,
  currentUser,
  onDeleteJadwal,
}) => {
  const [selectedHari, setSelectedHari] = useState<string>('all');

  const days = ['all', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Ahad'];

  const filtered = jadwalList.filter((j) => {
    return selectedHari === 'all' || j.hari === selectedHari;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-800">
            Jadwal Halaqah Pengajian Kitab & Sorogan
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Waktu pengajian santri mukim Ponpes El Bayan 2 disesuaikan dengan waktu shalat fardhu berjama'ah di masjid pesantren.
          </p>
        </div>

        {/* Day Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs pt-2 border-t border-slate-100">
          <span className="text-slate-500 font-semibold mr-1 shrink-0">Hari:</span>
          {days.map((d) => (
            <button
              key={d}
              onClick={() => setSelectedHari(d)}
              className={`px-3 py-1 rounded-lg font-semibold shrink-0 transition-all cursor-pointer ${
                selectedHari === d
                  ? 'bg-sky-800 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {d === 'all' ? 'Seluruh Hari' : d}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Schedules */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-xs text-slate-500">
          Tidak ada jadwal halaqah untuk hari yang dipilih.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((j) => {
            return (
              <div
                key={j.id}
                className="bg-white rounded-2xl border border-slate-200 hover:border-teal-400 p-5 shadow-xs space-y-3 flex flex-col justify-between transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold bg-teal-50 text-teal-800 px-2.5 py-0.5 rounded-full">
                      {j.hari}
                    </span>
                    <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      {j.kelasNama}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{j.mapelNama}</h3>
                    <p className="font-arabic text-base text-teal-800 dir-rtl text-right mt-0.5">
                      {j.arabKitab}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                    <p className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-sky-700 shrink-0" />
                      <span className="font-medium text-slate-800">{j.waktu}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <UserIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Ustadz Pengampu: <strong>{j.guruNama}</strong></span>
                    </p>
                    <p className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span className="text-slate-500">{j.tempat}</span>
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="text-teal-700 font-bold">Wajib Bawa Kitab Kuning</span>
                  {onDeleteJadwal && (
                    <button
                      onClick={() => onDeleteJadwal(j.id)}
                      className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Hapus Jadwal Ini"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
