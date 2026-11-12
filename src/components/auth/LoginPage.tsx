/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Lock,
  User as UserIcon,
  ArrowRight,
  ShieldCheck,
  GraduationCap,
  Eye,
  EyeOff,
  Info,
  CheckCircle2,
  KeyRound,
} from 'lucide-react';
import { User, Role } from '../../types';

interface LoginPageProps {
  onLoginSuccess: (user: User) => void;
  users: User[];
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, users }) => {
  // 1. Role Selection: 'admin' | 'guru' | 'santri'
  const [selectedRole, setSelectedRole] = useState<Role>('guru');
  const [inputName, setInputName] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [showPasswordHint, setShowPasswordHint] = useState<boolean>(false);

  // Users filtered by selected role
  const roleUsers = useMemo(() => {
    return users.filter((u) => u.role === selectedRole);
  }, [users, selectedRole]);

  // Helper to normalize strings for robust name matching
  const normalizeText = (text: string): string => {
    return text
      .toLowerCase()
      .replace(/[.,'"`\-_/]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  };

  // Find user matching the typed name
  const findMatchingUser = (query: string): User | undefined => {
    const q = query.trim();
    if (!q) return undefined;
    const normQ = normalizeText(q);

    // 1. Exact username match
    const byUsername = roleUsers.find(
      (u) => u.username.toLowerCase() === q.toLowerCase()
    );
    if (byUsername) return byUsername;

    // 2. Exact email match
    const byEmail = roleUsers.find(
      (u) => u.email.toLowerCase() === q.toLowerCase()
    );
    if (byEmail) return byEmail;

    // 3. Exact nomorInduk (NIS/NIP) match
    const byNomorInduk = roleUsers.find(
      (u) => u.nomorInduk && u.nomorInduk.toLowerCase() === q.toLowerCase()
    );
    if (byNomorInduk) return byNomorInduk;

    // 4. Exact normalized full name match
    const byExactName = roleUsers.find(
      (u) => normalizeText(u.nama) === normQ
    );
    if (byExactName) return byExactName;

    // 5. Normalized full name contains query or query contains full name
    const byContains = roleUsers.find(
      (u) =>
        normalizeText(u.nama).includes(normQ) ||
        normQ.includes(normalizeText(u.nama))
    );
    if (byContains) return byContains;

    // 6. Word-by-word match (e.g. user typed "Ilham", matches "Ust. Ilham ma'tuf")
    const words = normQ.split(' ').filter((w) => w.length >= 2);
    if (words.length > 0) {
      const byWord = roleUsers.find((u) => {
        const normName = normalizeText(u.nama);
        return words.every((w) => normName.includes(w));
      });
      if (byWord) return byWord;
    }

    return undefined;
  };

  // Check if currently typed name matches a user
  const recognizedUser = useMemo(() => {
    if (!inputName.trim()) return null;
    return findMatchingUser(inputName);
  }, [inputName, roleUsers]);

  // Expected password helper
  const getExpectedPassword = (user: User): string => {
    if (!user) return '123456';
    if (user.role === 'admin') return 'admin123';
    if (user.role === 'santri') return 'santri123';
    if (user.username === 'ustadz') return 'ustadz123';
    if (user.username === 'ustadz.ridwan') return 'ridwan123';
    if (user.username === 'ustadzah.fatimah') return 'fatimah123';
    if (user.username === 'ustadz.alimanshur') return 'alimanshur123';
    if (user.username === 'ustadz.salman') return 'salman123';
    if (user.username === 'ustadz.zainuddin') return 'zainuddin123';
    if (user.username === 'ustadz.bahruddin') return 'bahruddin123';
    return 'ustadz123';
  };

  const handleRoleChange = (role: Role) => {
    setSelectedRole(role);
    setError('');
    // Clear inputs when role is switched
    setInputName('');
    setPassword('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!inputName.trim()) {
      setError('Silakan ketik nama lengkap atau nama pengguna Anda.');
      return;
    }

    const matched = findMatchingUser(inputName);
    if (!matched) {
      const roleLabel =
        selectedRole === 'admin'
          ? 'Administrator'
          : selectedRole === 'guru'
          ? 'Ustadz / Guru'
          : 'Santri';
      setError(
        `Nama "${inputName.trim()}" tidak ditemukan pada daftar ${roleLabel}. Mohon periksa kembali ejaan nama Anda.`
      );
      return;
    }

    const expectedPwd = getExpectedPassword(matched);
    const entered = password.trim();

    const isValid =
      entered === expectedPwd ||
      (matched.role === 'guru' && entered === 'ustadz123') ||
      (matched.role === 'santri' && entered === 'santri123') ||
      (matched.role === 'admin' && entered === 'admin123') ||
      entered === '123456';

    if (!isValid) {
      setError(`Kata sandi untuk ${matched.nama} salah. Silakan coba lagi.`);
      return;
    }

    onLoginSuccess(matched);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-sky-50 to-teal-50 flex items-center justify-center p-4 py-8">
      <div className="max-w-4xl w-full flex flex-col gap-6">
        {/* Main Box */}
        <div className="grid md:grid-cols-12 bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
          {/* Left Column: Dark Blue / Islamic Identity Banner */}
          <div className="md:col-span-5 bg-gradient-to-br from-sky-950 via-sky-900 to-teal-950 p-8 text-white flex flex-col justify-between relative overflow-hidden">
            {/* Ambient background blur */}
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />

            <div>
              {/* Pesantren Branding */}
              <div className="flex items-center gap-3.5 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-400 to-sky-300 flex items-center justify-center text-sky-950 font-bold shadow-md">
                  <BookOpen className="w-6 h-6 text-sky-950" />
                </div>
                <div>
                  <h1 className="text-base font-bold tracking-tight text-white">Ponpes El Bayan 2</h1>
                  <p className="text-xs text-teal-300 font-medium">Sistem Informasi & Pembelajaran Digital</p>
                </div>
              </div>

              {/* Arabic Ahlan Wa Sahlan Greeting */}
              <div className="space-y-4 my-4">
                <div className="py-2">
                  <h2
                    className="text-4xl sm:text-5xl font-serif text-teal-200 font-bold tracking-wide leading-relaxed font-arabic"
                    style={{ fontFamily: 'Amiri, serif' }}
                  >
                    أَهْلًا وَسَهْلًا بِكُمْ
                  </h2>
                  <p className="text-xs text-teal-300/90 font-arabic mt-1">
                    مَعْهَدُ البَيَانِ الثَّانِي لِلْعُلُومِ الإِسْلَامِيَّةِ
                  </p>
                </div>

                <p className="text-sm font-semibold text-sky-100 leading-snug">
                  Selamat Datang di Portal Pembelajaran Digital & Kajian Kitab Kuning
                </p>
                <p className="text-xs text-sky-200/80 leading-relaxed">
                  Menunjang kegiatan thalabul ilmi, setoran hafalan, materi audio-visual matan kitab, dan evaluasi berkala bagi santri mukim dan segenap dewan asatidz.
                </p>
              </div>
            </div>

            {/* Noble Hadith Quotation at Bottom */}
            <div className="mt-8 pt-6 border-t border-sky-800/60">
              <p
                className="text-sm font-arabic text-teal-200/90 leading-relaxed"
                style={{ fontFamily: 'Amiri, serif' }}
              >
                « مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ طَرِيقًا إِلَى الْجَنَّةِ »
              </p>
              <p className="text-[10px] text-sky-300/80 mt-1 italic">
                "Barangsiapa menempuh suatu jalan untuk menuntut ilmu, maka Allah akan memudahkan jalannya menuju surga." (HR. Muslim)
              </p>
            </div>
          </div>

          {/* Right Column: Clean Role Tabs & Manual Typing Form */}
          <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
            <div>
              {/* Header Title */}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-slate-800">Masuk ke Portal</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Pilih opsi peran Anda, lalu ketikkan nama dan kata sandi Anda.
                </p>
              </div>

              {/* Step 1: Opsi Peran (Admin / Ustadz / Santri) */}
              <div className="mb-6">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                  Pilih Peran:
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {/* Admin Tab */}
                  <button
                    type="button"
                    onClick={() => handleRoleChange('admin')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      selectedRole === 'admin'
                        ? 'border-purple-600 bg-purple-50 text-purple-950 ring-2 ring-purple-500/20 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <ShieldCheck
                        className={`w-4 h-4 ${
                          selectedRole === 'admin' ? 'text-purple-700' : 'text-slate-400'
                        }`}
                      />
                      {selectedRole === 'admin' && (
                        <span className="w-2 h-2 rounded-full bg-purple-600" />
                      )}
                    </div>
                    <p className="text-xs font-bold leading-tight">Admin</p>
                    <p className="text-[10px] text-slate-500">Pimpinan</p>
                  </button>

                  {/* Ustadz Tab */}
                  <button
                    type="button"
                    onClick={() => handleRoleChange('guru')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      selectedRole === 'guru'
                        ? 'border-teal-600 bg-teal-50 text-teal-950 ring-2 ring-teal-500/20 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <GraduationCap
                        className={`w-4 h-4 ${
                          selectedRole === 'guru' ? 'text-teal-700' : 'text-slate-400'
                        }`}
                      />
                      {selectedRole === 'guru' && (
                        <span className="w-2 h-2 rounded-full bg-teal-600" />
                      )}
                    </div>
                    <p className="text-xs font-bold leading-tight">Ustadz</p>
                    <p className="text-[10px] text-slate-500">Dewan Pengajar</p>
                  </button>

                  {/* Santri Tab */}
                  <button
                    type="button"
                    onClick={() => handleRoleChange('santri')}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      selectedRole === 'santri'
                        ? 'border-sky-600 bg-sky-50 text-sky-950 ring-2 ring-sky-500/20 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <BookOpen
                        className={`w-4 h-4 ${
                          selectedRole === 'santri' ? 'text-sky-700' : 'text-slate-400'
                        }`}
                      />
                      {selectedRole === 'santri' && (
                        <span className="w-2 h-2 rounded-full bg-sky-600" />
                      )}
                    </div>
                    <p className="text-xs font-bold leading-tight">Santri</p>
                    <p className="text-[10px] text-slate-500">Santri Mukim</p>
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <Info className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Login Form: Name & Password Inputs */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* 1. Name Input (User types their own name) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700">
                      Nama Lengkap Anda <span className="text-rose-500">*</span>
                    </label>
                    {recognizedUser && (
                      <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Nama Teridentifikasi</span>
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={inputName}
                      onChange={(e) => {
                        setInputName(e.target.value);
                        setError('');
                      }}
                      placeholder={
                        selectedRole === 'admin'
                          ? 'Ketik nama Anda (contoh: KH. Abdullah Maksum)'
                          : selectedRole === 'guru'
                          ? 'Ketik nama Ustadz Anda (contoh: Ust. Ilham, Ust. Ahmad, dll)'
                          : 'Ketik nama santri Anda (contoh: Zaid bin Tsabit, Abdullah, dll)'
                      }
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all text-slate-900 font-medium"
                    />
                  </div>

                  {/* Display Matched Identity Badge if matched while typing */}
                  {recognizedUser && (
                    <div className="mt-2 p-2.5 rounded-xl bg-teal-50/80 border border-teal-200 flex items-center justify-between text-xs animate-in fade-in duration-150">
                      <div className="flex items-center gap-2 truncate">
                        <div className="w-6 h-6 rounded-full bg-teal-700 text-white font-bold flex items-center justify-center text-[10px] shrink-0">
                          {recognizedUser.nama.charAt(0)}
                        </div>
                        <div className="truncate">
                          <p className="font-bold text-teal-950 truncate">{recognizedUser.nama}</p>
                          <p className="text-[10px] text-teal-700 truncate">
                            {recognizedUser.role === 'guru'
                              ? recognizedUser.spesialisasi || 'Dewan Pengajar'
                              : recognizedUser.role === 'santri'
                              ? recognizedUser.semester || 'Semester 1'
                              : 'Administrator'}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-teal-800 bg-teal-100/80 px-2 py-0.5 rounded shrink-0">
                        {recognizedUser.username}
                      </span>
                    </div>
                  )}
                </div>

                {/* 2. Password Input */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700">
                      Kata Sandi Akun <span className="text-rose-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPasswordHint(!showPasswordHint)}
                      className="text-[10px] text-teal-700 hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <KeyRound className="w-3 h-3" />
                      <span>{showPasswordHint ? 'Tutup Petunjuk' : 'Lupa sandi?'}</span>
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setError('');
                      }}
                      placeholder="Masukkan kata sandi..."
                      className="w-full pl-10 pr-10 py-2.5 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 transition-all text-slate-900"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      title={showPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Password helper hint */}
                  {showPasswordHint && (
                    <div className="mt-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1">
                      <p className="font-semibold text-slate-800">Petunjuk Kata Sandi Standar:</p>
                      <ul className="list-disc list-inside space-y-0.5 text-slate-600 text-[10px]">
                        <li>Admin: <code className="font-mono text-teal-700 font-bold">admin123</code></li>
                        <li>Ustadz: <code className="font-mono text-teal-700 font-bold">ustadz123</code></li>
                        <li>Santri: <code className="font-mono text-teal-700 font-bold">santri123</code></li>
                      </ul>
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-gradient-to-r from-sky-900 via-teal-800 to-teal-700 hover:from-sky-950 hover:to-teal-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer mt-2"
                >
                  <span>Masuk Sekarang</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* Bottom Footer */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>SIAKAD Ponpes El Bayan 2</span>
              <span>Kajian Kitab Kuning Digital</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
