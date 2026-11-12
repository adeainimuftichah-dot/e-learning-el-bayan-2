/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bell,
  ChevronDown,
  User as UserIcon,
  LogOut,
  RotateCcw,
  BookOpen,
  FileText,
  CheckSquare,
  Shield,
  GraduationCap,
  Sparkles,
  ExternalLink,
  Edit3,
} from 'lucide-react';
import { User, Role, Notifikasi, MataPelajaran, Materi, Tugas } from '../../types';
import { PesantrenDB } from '../../services/storage';

interface HeaderProps {
  currentUser: User;
  onLogout: () => void;
  onSwitchUser: (user: User) => void;
  allUsers: User[];
  activeTab: string;
  onNavigateTab: (tab: string, meta?: any) => void;
  collapsed: boolean;
  onResetData: () => void;
  onOpenEditProfile?: (user: User) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onLogout,
  onSwitchUser,
  allUsers,
  activeTab,
  onNavigateTab,
  collapsed,
  onResetData,
  onOpenEditProfile,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const [notifications, setNotifications] = useState<Notifikasi[]>([]);
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Load notifications
  useEffect(() => {
    const list = PesantrenDB.getNotifikasi().filter(
      (n) => n.targetRole === 'all' || n.targetRole === currentUser.role || n.userId === currentUser.id
    );
    setNotifications(list);
  }, [currentUser]);

  const unreadCount = notifications.filter((n) => !n.dibaca).length;

  // Handle click outside to close popovers
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifDropdown(false);
      }
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = () => {
    PesantrenDB.markAllNotifsAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, dibaca: true })));
  };

  const handleReadNotif = (notif: Notifikasi) => {
    PesantrenDB.markNotifAsRead(notif.id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, dibaca: true } : n))
    );
    setShowNotifDropdown(false);
    if (notif.linkTab) {
      onNavigateTab(notif.linkTab);
    }
  };

  // Search Results Computation
  const getSearchResults = () => {
    if (!searchQuery.trim()) return { kitab: [], materi: [], tugas: [] };
    const q = searchQuery.toLowerCase();

    const allKitab = PesantrenDB.getKitab();
    const allMateri = PesantrenDB.getMateri();
    const allTugas = PesantrenDB.getTugas();

    return {
      kitab: allKitab.filter(
        (k) =>
          k.namaKitab.toLowerCase().includes(q) ||
          k.arabTitle.toLowerCase().includes(q) ||
          k.mushannif.toLowerCase().includes(q) ||
          k.kategori.toLowerCase().includes(q)
      ),
      materi: allMateri.filter(
        (m) =>
          m.judul.toLowerCase().includes(q) ||
          m.mapelNama.toLowerCase().includes(q) ||
          m.deskripsi.toLowerCase().includes(q)
      ),
      tugas: allTugas.filter(
        (t) =>
          t.judul.toLowerCase().includes(q) ||
          t.mapelNama.toLowerCase().includes(q)
      ),
    };
  };

  const searchResults = getSearchResults();
  const hasSearchResults =
    searchResults.kitab.length > 0 ||
    searchResults.materi.length > 0 ||
    searchResults.tugas.length > 0;

  const getTabTitle = (tab: string) => {
    const map: Record<string, string> = {
      dashboard: 'Beranda Utama',
      kitab: 'Daftar 12 Kitab & Silabus Pesantren',
      materi: 'Materi Pembelajaran Digital',
      tugas: 'Tugas & Setoran Santri',
      kuis: 'Kuis & Evaluasi Belajar',
      jadwal: 'Jadwal Halaqah & Pengajian',
      nilai: 'Rekapitulasi Nilai & Rapor',
      santri: 'Manajemen Data Santri',
      guru: 'Manajemen Data Guru & Ustadz',
      kelas: 'Manajemen Kelas & Halaqah',
      database: 'Struktur Basis Data & Skema MySQL',
    };
    return map[tab] || 'SIAKAD Ponpes El Bayan 2';
  };

  return (
    <header
      className={`fixed top-0 right-0 z-20 h-16 bg-white border-b border-slate-200/90 transition-all duration-300 flex items-center justify-between px-6 shadow-xs ${
        collapsed ? 'left-20' : 'left-64'
      }`}
    >
      {/* Left: Breadcrumbs & Page title */}
      <div className="flex items-center gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
            <span>Sistem Akademik</span>
            <span className="text-slate-500">/</span>
            <span className="text-sky-700 capitalize font-semibold">{currentUser.role}</span>
          </div>
          <h2 className="text-base font-bold text-slate-800 tracking-tight leading-tight">
            {getTabTitle(activeTab)}
          </h2>
        </div>
      </div>

      {/* Center: Live Global Search */}
      <div className="relative flex-1 max-w-md mx-6 hidden md:block" ref={searchRef}>
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
          <input
            type="text"
            placeholder="Cari kitab, materi pelajaran, tugas..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearchResults(true);
            }}
            onFocus={() => setShowSearchResults(true)}
            className="w-full pl-10 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all text-slate-800 placeholder:text-slate-600"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-600 hover:text-slate-800"
            >
              ×
            </button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {showSearchResults && searchQuery.trim() && (
          <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden max-h-96 overflow-y-auto z-50 p-2">
            {!hasSearchResults ? (
              <div className="py-6 text-center text-xs text-slate-600">
                Tidak ada hasil untuk "{searchQuery}"
              </div>
            ) : (
              <div className="space-y-3">
                {searchResults.kitab.length > 0 && (
                  <div>
                    <p className="px-2 py-1 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                      Kitab & Mata Pelajaran
                    </p>
                    {searchResults.kitab.map((k) => (
                      <button
                        key={k.id}
                        onClick={() => {
                          onNavigateTab('kitab', { selectedKitabId: k.id });
                          setShowSearchResults(false);
                          setSearchQuery('');
                        }}
                        className="w-full text-left px-2.5 py-1.5 hover:bg-sky-50 rounded-lg flex items-center justify-between text-xs transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                          <span className="font-semibold text-slate-800">{k.namaKitab}</span>
                          <span className="text-slate-600 font-arabic text-sm">{k.arabTitle}</span>
                        </div>
                        <span className="text-[10px] text-slate-600 font-medium">{k.kategori}</span>
                      </button>
                    ))}
                  </div>
                )}

                {searchResults.materi.length > 0 && (
                  <div>
                    <p className="px-2 py-1 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                      Materi Pembelajaran
                    </p>
                    {searchResults.materi.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => {
                          onNavigateTab('materi', { selectedMateriId: m.id });
                          setShowSearchResults(false);
                          setSearchQuery('');
                        }}
                        className="w-full text-left px-2.5 py-1.5 hover:bg-sky-50 rounded-lg flex items-center justify-between text-xs transition-colors"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <FileText className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                          <span className="font-medium text-slate-800 truncate">{m.judul}</span>
                        </div>
                        <span className="text-[10px] text-slate-600 font-medium shrink-0 ml-2">
                          {m.mapelNama}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {searchResults.tugas.length > 0 && (
                  <div>
                    <p className="px-2 py-1 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                      Tugas & Ujian
                    </p>
                    {searchResults.tugas.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => {
                          onNavigateTab('tugas');
                          setShowSearchResults(false);
                          setSearchQuery('');
                        }}
                        className="w-full text-left px-2.5 py-1.5 hover:bg-sky-50 rounded-lg flex items-center justify-between text-xs transition-colors"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <CheckSquare className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span className="font-medium text-slate-800 truncate">{t.judul}</span>
                        </div>
                        <span className="text-[10px] text-slate-600 shrink-0 ml-2">{t.mapelNama}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right: Quick Role Switcher, Notifications, Profile */}
      <div className="flex items-center gap-3">
        {/* Quick Role Switcher Buttons */}
        <div className="hidden lg:flex items-center p-1 bg-slate-100 rounded-lg border border-slate-200">
          <span className="text-[11px] font-medium text-slate-600 px-2">Peran:</span>
          {allUsers.slice(0, 3).map((u) => {
            const isCurrent = u.id === currentUser.id;
            return (
              <button
                key={u.id}
                onClick={() => onSwitchUser(u)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                  isCurrent
                    ? 'bg-sky-800 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
                title={`Beralih ke peran ${u.role}: ${u.nama}`}
              >
                {u.role === 'admin' ? 'Admin' : u.role === 'guru' ? 'Ustadz' : 'Santri'}
              </button>
            );
          })}
        </div>

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
            className="relative p-2 rounded-lg text-slate-600 hover:text-sky-700 hover:bg-slate-100 transition-colors"
            title="Notifikasi"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifDropdown && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden z-50">
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-800">Notifikasi</span>
                  {unreadCount > 0 && (
                    <span className="text-[10px] bg-rose-100 text-rose-700 px-1.5 py-0.2 rounded font-semibold">
                      {unreadCount} baru
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[11px] text-sky-700 hover:underline font-medium"
                  >
                    Tandai dibaca
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-600">
                    Tidak ada notifikasi saat ini
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => handleReadNotif(notif)}
                      className={`p-3 text-xs cursor-pointer hover:bg-slate-50 transition-colors ${
                        !notif.dibaca ? 'bg-sky-50/50' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className={`font-semibold ${!notif.dibaca ? 'text-sky-950' : 'text-slate-800'}`}>
                          {notif.judul}
                        </p>
                        <span className="text-[10px] text-slate-600 shrink-0">{notif.waktu}</span>
                      </div>
                      <p className="text-slate-600 mt-1 line-clamp-2 text-[11px]">{notif.pesan}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Account Menu */}
        <div className="relative" ref={userRef}>
          <button
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center gap-2.5 pl-2 pr-1 py-1 rounded-lg hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
          >
            <div className="w-8 h-8 rounded-full bg-sky-800 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
              {currentUser.nama.charAt(0)}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[120px]">
                {currentUser.nama}
              </p>
              <p className="text-[10px] text-slate-600 capitalize font-medium">{currentUser.role}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-600" />
          </button>

          {showUserDropdown && (
            <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden z-50">
              <div className="p-3 bg-slate-50 border-b border-slate-200">
                <p className="text-xs font-bold text-slate-800">{currentUser.nama}</p>
                <p className="text-[11px] text-slate-600 truncate">{currentUser.email}</p>
                <div className="mt-1 flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono bg-sky-100 text-sky-800 px-1.5 py-0.5 rounded font-semibold">
                      {currentUser.nomorInduk || 'ID: ' + currentUser.id}
                    </span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-semibold capitalize">
                      {currentUser.role}
                    </span>
                  </div>
                  {onOpenEditProfile && currentUser.role === 'guru' && (
                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        onOpenEditProfile(currentUser);
                      }}
                      className="text-[10px] text-teal-700 hover:text-teal-900 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                      title="Ubah nama ustadz"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Ubah Nama</span>
                    </button>
                  )}
                </div>
              </div>

              {onOpenEditProfile && currentUser.role === 'guru' && (
                <div className="p-2 border-b border-slate-100 bg-teal-50/40">
                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      onOpenEditProfile(currentUser);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-bold text-teal-900 bg-white hover:bg-teal-50 flex items-center justify-between transition-colors border border-teal-200/80 shadow-xs cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <Edit3 className="w-3.5 h-3.5 text-teal-700" />
                      <span>Ubah Nama Ustadz</span>
                    </span>
                    <span className="text-[10px] bg-teal-100 text-teal-800 px-1.5 py-0.5 rounded font-semibold">
                      Ubah
                    </span>
                  </button>
                </div>
              )}

              <div className="p-2 space-y-1">
                <p className="px-2 py-1 text-[10px] font-semibold text-slate-600 uppercase tracking-wider">
                  Ganti Profil / Akun Pengguna
                </p>
                {allUsers.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => {
                      onSwitchUser(u);
                      setShowUserDropdown(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                      u.id === currentUser.id
                        ? 'bg-sky-50 text-sky-900 font-semibold'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="truncate">
                      <p className="truncate font-medium">{u.nama}</p>
                      <p className="text-[10px] text-slate-600 capitalize">{u.role}</p>
                    </div>
                    {u.id === currentUser.id && (
                      <span className="w-2 h-2 rounded-full bg-sky-600 shrink-0"></span>
                    )}
                  </button>
                ))}

                <div className="pt-2 mt-2 border-t border-slate-100">
                  <button
                    onClick={() => {
                      onResetData();
                      setShowUserDropdown(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-amber-700 hover:bg-amber-50 flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                    <span>Kembalikan Data Semula</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      onLogout();
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Keluar Akun</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
