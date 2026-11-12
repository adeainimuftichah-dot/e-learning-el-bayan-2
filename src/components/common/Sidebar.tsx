/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  CheckSquare,
  Award,
  Users,
  GraduationCap,
  Calendar,
  Building2,
  Database,
  ChevronLeft,
  ChevronRight,
  LogOut,
  HelpCircle,
  Sparkles,
  Edit3,
} from 'lucide-react';
import { Role, User } from '../../types';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  currentUser: User;
  onLogout: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  pendingTasksCount?: number;
  onOpenEditProfile?: (user: User) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  currentUser,
  onLogout,
  collapsed,
  onToggleCollapse,
  pendingTasksCount = 0,
  onOpenEditProfile,
}) => {
  const role = currentUser.role;

  const getNavItems = () => {
    // Common items
    const mainItems = [
      {
        id: 'dashboard',
        label: 'Beranda Utama',
        icon: LayoutDashboard,
        roles: ['admin', 'guru', 'santri'] as Role[],
      },
      {
        id: 'kitab',
        label: 'Kitab & Mapel (12)',
        icon: BookOpen,
        roles: ['admin', 'guru', 'santri'] as Role[],
      },
      {
        id: 'materi',
        label: 'Materi Pembelajaran',
        icon: FileText,
        roles: ['admin', 'guru', 'santri'] as Role[],
      },
      {
        id: 'tugas',
        label: role === 'santri' ? 'Tugas Santri' : 'Kelola Tugas & Nilai',
        icon: CheckSquare,
        roles: ['admin', 'guru', 'santri'] as Role[],
        badge: (role === 'guru' || role === 'admin') && pendingTasksCount > 0 ? `${pendingTasksCount} Baru` : undefined,
      },
      {
        id: 'kuis',
        label: 'Kuis & Ujian Daring',
        icon: HelpCircle,
        roles: ['admin', 'guru', 'santri'] as Role[],
      },
      {
        id: 'jadwal',
        label: 'Jadwal Halaqah',
        icon: Calendar,
        roles: ['admin', 'guru', 'santri'] as Role[],
      },
      {
        id: 'nilai',
        label: role === 'santri' ? 'Rapor & Nilai Saya' : role === 'admin' ? 'Rekap Nilai Santri' : 'Rekapitulasi Nilai',
        icon: Award,
        roles: ['admin', 'guru', 'santri'] as Role[],
      },
    ];

    // Admin & Management items
    const adminItems = [
      {
        id: 'santri',
        label: 'Data Santri',
        icon: Users,
        roles: ['admin', 'guru'] as Role[],
      },
      {
        id: 'guru',
        label: role === 'guru' ? 'Dewan Asatidz & Profil' : 'Data Guru / Ustadz',
        icon: GraduationCap,
        roles: ['admin', 'guru'] as Role[],
      },
      {
        id: 'kelas',
        label: 'Data Kelas',
        icon: Building2,
        roles: ['admin', 'guru'] as Role[],
      },
      {
        id: 'database',
        label: 'Skema Basis Data & SQL',
        icon: Database,
        roles: ['admin'] as Role[],
      },
    ];

    return {
      learning: mainItems.filter((i) => i.roles.includes(role)),
      management: adminItems.filter((i) => i.roles.includes(role)),
    };
  };

  const nav = getNavItems();

  const getRoleLabel = (r: Role) => {
    switch (r) {
      case 'admin':
        return 'Administrator';
      case 'guru':
        return 'Ustadz / Pengajar';
      case 'santri':
        return 'Santri Mukim';
    }
  };

  return (
    <aside
      className={`fixed top-0 left-0 z-30 h-screen transition-all duration-300 ease-in-out flex flex-col justify-between 
        bg-gradient-to-b from-sky-950 via-sky-900 to-teal-950 text-white shadow-xl
        ${collapsed ? 'w-20' : 'w-64'}`}
    >
      {/* Brand Header */}
      <div>
        <div className="flex items-center justify-between px-4 py-5 border-b border-sky-800/60">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-400 to-sky-300 flex items-center justify-center text-sky-950 font-bold shrink-0 shadow-md">
              <BookOpen className="w-5 h-5 text-sky-950" />
            </div>
            {!collapsed && (
              <div className="truncate">
                <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
                  e-Pondok
                  <span className="text-[10px] bg-teal-400/20 text-teal-300 px-1.5 py-0.5 rounded font-mono font-medium">
                    SIAKAD
                  </span>
                </h1>
                <p className="text-[11px] text-sky-200/70 truncate font-medium">
                  Ponpes El Bayan 2
                </p>
              </div>
            )}
          </div>
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-lg text-sky-300 hover:text-white hover:bg-sky-800/60 transition-colors"
            title={collapsed ? 'Perluas Menu Bilah Samping' : 'Ciutkan Menu Bilah Samping'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Section */}
        <div className="px-3 py-4 space-y-6 overflow-y-auto max-h-[calc(100vh-170px)]">
          {/* Main Navigation */}
          <div>
            {!collapsed && (
              <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-sky-300/60 mb-2">
                Menu Pembelajaran
              </p>
            )}
            <nav className="space-y-1">
              {nav.learning.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onTabChange(item.id)}
                    title={collapsed ? item.label : undefined}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all text-left ${
                      isActive
                        ? 'bg-white text-sky-950 font-semibold shadow-md shadow-sky-950/20'
                        : 'text-sky-100/90 hover:bg-sky-800/50 hover:text-white'
                    } ${collapsed ? 'justify-center' : ''}`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-teal-700' : 'text-sky-300'}`} />
                    {!collapsed && <span className="truncate flex-1">{item.label}</span>}
                    {!collapsed && item.badge && (
                      <span className="text-[10px] bg-amber-400 text-amber-950 px-1.5 py-0.5 rounded-full font-bold">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Admin Section (if applicable) */}
          {nav.management.length > 0 && (
            <div>
              {!collapsed && (
                <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-sky-300/60 mb-2">
                  Kelola Lembaga (Admin)
                </p>
              )}
              <nav className="space-y-1">
                {nav.management.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onTabChange(item.id)}
                      title={collapsed ? item.label : undefined}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all text-left ${
                        isActive
                          ? 'bg-white text-sky-950 font-semibold shadow-md shadow-sky-950/20'
                          : 'text-sky-100/90 hover:bg-sky-800/50 hover:text-white'
                      } ${collapsed ? 'justify-center' : ''}`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-teal-700' : 'text-sky-300'}`} />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </button>
                  );
                })}
              </nav>
            </div>
          )}
        </div>
      </div>

      {/* User Info & Footer */}
      <div className="p-3 border-t border-sky-800/60 bg-sky-950/40">
        <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : 'justify-between'}`}>
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-teal-500/30 border border-teal-400/40 text-teal-200 flex items-center justify-center font-bold text-xs shrink-0">
              {currentUser.nama.charAt(0)}
            </div>
            {!collapsed && (
              <div className="truncate">
                <p className="text-xs font-semibold text-white truncate">{currentUser.nama}</p>
                <p className="text-[10px] text-teal-300 capitalize">{getRoleLabel(currentUser.role)}</p>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1">
            {!collapsed && onOpenEditProfile && currentUser.role === 'guru' && (
              <button
                onClick={() => onOpenEditProfile(currentUser)}
                className="p-1.5 rounded-lg text-teal-300 hover:text-white hover:bg-teal-500/20 transition-colors"
                title="Ubah Nama & Profil Ustadz"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            )}
            {!collapsed && (
              <button
                onClick={onLogout}
                className="p-1.5 rounded-lg text-sky-300/80 hover:text-rose-300 hover:bg-rose-500/20 transition-colors"
                title="Keluar dari Akun"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};
