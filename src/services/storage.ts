/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  User,
  Kelas,
  MataPelajaran,
  Materi,
  Tugas,
  PengumpulanTugas,
  Kuis,
  JawabanKuisSantri,
  NilaiSantri,
  JadwalHalaqah,
  AktivitasLog,
  Notifikasi,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_KELAS,
  INITIAL_KITAB,
  INITIAL_MATERI,
  INITIAL_TUGAS,
  INITIAL_PENGUMPULAN,
  INITIAL_KUIS,
  INITIAL_JAWABAN_KUIS,
  INITIAL_NILAI,
  INITIAL_JADWAL,
  INITIAL_AKTIVITAS,
  INITIAL_NOTIFIKASI,
  MYSQL_DATABASE_SCHEMA_SQL,
} from '../data/initialData';

const STORAGE_KEYS = {
  CURRENT_USER: 'pesantren_current_user',
  USERS: 'pesantren_users',
  KELAS: 'pesantren_kelas',
  KITAB: 'pesantren_kitab',
  MATERI: 'pesantren_materi',
  TRASH_MATERI: 'pesantren_trash_materi',
  TUGAS: 'pesantren_tugas',
  TRASH_TUGAS: 'pesantren_trash_tugas',
  PENGUMPULAN: 'pesantren_pengumpulan',
  KUIS: 'pesantren_kuis',
  TRASH_KUIS: 'pesantren_trash_kuis',
  JAWABAN_KUIS: 'pesantren_jawaban_kuis',
  NILAI: 'pesantren_nilai',
  JADWAL: 'pesantren_jadwal',
  AKTIVITAS: 'pesantren_aktivitas',
  NOTIFIKASI: 'pesantren_notifikasi',
};

function getStoredItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) {
      localStorage.setItem(key, JSON.stringify(defaultValue));
      return defaultValue;
    }
    return JSON.parse(item) as T;
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error);
    return defaultValue;
  }
}

function setStoredItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing ${key} to localStorage:`, error);
  }
}

export class PesantrenDB {
  // Current logged in user
  static getCurrentUser(): User | null {
    return getStoredItem<User | null>(STORAGE_KEYS.CURRENT_USER, INITIAL_USERS[0]);
  }

  static setCurrentUser(user: User | null): void {
    setStoredItem(STORAGE_KEYS.CURRENT_USER, user);
  }

  // Users
  static getUsers(): User[] {
    return getStoredItem<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
  }

  static saveUser(user: User): void {
    const users = this.getUsers();
    const existingIndex = users.findIndex((u) => u.id === user.id);
    const oldUser = existingIndex >= 0 ? users[existingIndex] : null;

    if (existingIndex >= 0) {
      users[existingIndex] = user;
    } else {
      users.push(user);
    }
    setStoredItem(STORAGE_KEYS.USERS, users);

    // If currentUser is this user, update currentUser storage as well
    const cur = this.getCurrentUser();
    if (cur && cur.id === user.id) {
      this.setCurrentUser(user);
    }

    // If teacher name is saved/updated, automatically cascade to Kitab, Materi, Tugas, Kuis, Jadwal, and Kelas
    if (user.role === 'guru') {
      // 1. Kitab
      const kitabList = getStoredItem<MataPelajaran[]>(STORAGE_KEYS.KITAB, INITIAL_KITAB);
      let kitabUpdated = false;
      const updatedKitab = kitabList.map((k) => {
        if (k.guruId === user.id || (oldUser && k.guruNama === oldUser.nama)) {
          kitabUpdated = true;
          return { ...k, guruId: user.id, guruNama: user.nama };
        }
        return k;
      });
      if (kitabUpdated) {
        setStoredItem(STORAGE_KEYS.KITAB, updatedKitab);
      }

      // 2. Materi
      const materiList = getStoredItem<Materi[]>(STORAGE_KEYS.MATERI, INITIAL_MATERI);
      let materiUpdated = false;
      const updatedMateri = materiList.map((m) => {
        if (m.guruId === user.id || (oldUser && m.guruNama === oldUser.nama)) {
          materiUpdated = true;
          return { ...m, guruId: user.id, guruNama: user.nama };
        }
        return m;
      });
      if (materiUpdated) {
        setStoredItem(STORAGE_KEYS.MATERI, updatedMateri);
      }

      // 3. Tugas
      const tugasList = getStoredItem<Tugas[]>(STORAGE_KEYS.TUGAS, INITIAL_TUGAS);
      let tugasUpdated = false;
      const updatedTugas = tugasList.map((t) => {
        if (t.guruId === user.id || (oldUser && t.guruNama === oldUser.nama)) {
          tugasUpdated = true;
          return { ...t, guruId: user.id, guruNama: user.nama };
        }
        return t;
      });
      if (tugasUpdated) {
        setStoredItem(STORAGE_KEYS.TUGAS, updatedTugas);
      }

      // 4. Kuis
      const kuisList = getStoredItem<Kuis[]>(STORAGE_KEYS.KUIS, INITIAL_KUIS);
      let kuisUpdated = false;
      const updatedKuis = kuisList.map((k) => {
        if (k.guruId === user.id || (oldUser && k.guruNama === oldUser.nama)) {
          kuisUpdated = true;
          return { ...k, guruId: user.id, guruNama: user.nama };
        }
        return k;
      });
      if (kuisUpdated) {
        setStoredItem(STORAGE_KEYS.KUIS, updatedKuis);
      }

      // 5. Jadwal & Kelas
      if (oldUser) {
        const jadwalList = getStoredItem<JadwalHalaqah[]>(STORAGE_KEYS.JADWAL, INITIAL_JADWAL);
        let jadwalUpdated = false;
        const updatedJadwal = jadwalList.map((j) => {
          if (
            j.guruNama === oldUser.nama ||
            (oldUser.nama && j.guruNama.includes(oldUser.nama.split(',')[0].trim())) ||
            (oldUser.id && j.guruId === oldUser.id)
          ) {
            jadwalUpdated = true;
            return { ...j, guruNama: user.nama, guruId: user.id };
          }
          return j;
        });
        if (jadwalUpdated) {
          setStoredItem(STORAGE_KEYS.JADWAL, updatedJadwal);
        }

        const kelasList = getStoredItem<Kelas[]>(STORAGE_KEYS.KELAS, INITIAL_KELAS);
        let kelasUpdated = false;
        const updatedKelas = kelasList.map((kls) => {
          if (
            kls.waliKelas === oldUser.nama ||
            (oldUser.nama && kls.waliKelas.includes(oldUser.nama.split(',')[0].trim()))
          ) {
            kelasUpdated = true;
            return { ...kls, waliKelas: user.nama };
          }
          return kls;
        });
        if (kelasUpdated) {
          setStoredItem(STORAGE_KEYS.KELAS, updatedKelas);
        }
      }

      this.logActivity({
        id: `act-${Date.now()}`,
        userId: user.id,
        userName: user.nama,
        userRole: user.role,
        aksi: 'Memperbarui profil ustadz',
        target: `Nama ustadz diperbarui menjadi ${user.nama}`,
        waktu: new Date().toISOString().replace('T', ' ').substring(0, 16),
      });
    }
  }

  static deleteUser(id: string): void {
    const users = this.getUsers().filter((u) => u.id !== id);
    setStoredItem(STORAGE_KEYS.USERS, users);
    const cur = this.getCurrentUser();
    if (cur && cur.id === id) {
      this.setCurrentUser(null);
    }
  }

  // Classes
  static getKelas(): Kelas[] {
    const list = getStoredItem<Kelas[]>(STORAGE_KEYS.KELAS, INITIAL_KELAS);
    const users = this.getUsers();
    const guruUsers = users.filter((u) => u.role === 'guru');
    let hasUpdated = false;
    const migrated = list.map((k) => {
      const matchedGuru = guruUsers.find(
        (g) =>
          g.nama === k.waliKelas ||
          (g.nama && k.waliKelas && (k.waliKelas.includes(g.nama) || g.nama.includes(k.waliKelas)))
      );
      if (matchedGuru && k.waliKelas !== matchedGuru.nama) {
        hasUpdated = true;
        return { ...k, waliKelas: matchedGuru.nama };
      }
      return k;
    });
    if (hasUpdated) {
      setStoredItem(STORAGE_KEYS.KELAS, migrated);
      return migrated;
    }
    return list;
  }

  static saveKelas(kelas: Kelas): void {
    const list = this.getKelas();
    const idx = list.findIndex((k) => k.id === kelas.id);
    if (idx >= 0) list[idx] = kelas;
    else list.push(kelas);
    setStoredItem(STORAGE_KEYS.KELAS, list);
  }

  static deleteKelas(id: string): void {
    const list = this.getKelas().filter((k) => k.id !== id);
    setStoredItem(STORAGE_KEYS.KELAS, list);
  }

  // Mata Pelajaran (Kitab)
  static getKitab(): MataPelajaran[] {
    const list = getStoredItem<MataPelajaran[]>(STORAGE_KEYS.KITAB, INITIAL_KITAB);
    const users = this.getUsers();
    const guruUsers = users.filter((u) => u.role === 'guru');
    let hasUpdated = false;
    const migrated = list.map((k) => {
      const initKitab = INITIAL_KITAB.find((ik) => ik.id === k.id);

      // 1. Check if any active teacher has this kitab in their spesialisasi
      const teacherBySpesialisasi = guruUsers.find((g) => {
        if (!g.spesialisasi) return false;
        const spec = g.spesialisasi.toLowerCase();
        const kTitle = k.namaKitab.toLowerCase();
        if (spec.includes(kTitle) || kTitle.includes(spec)) return true;
        if (kTitle.includes('jurumiyah') && spec.includes('jurumiyah')) return true;
        if (kTitle.includes('safina') && spec.includes('safina')) return true;
        if (kTitle.includes('ta\'lim') && (spec.includes('ta\'lim') || spec.includes('talim'))) return true;
        if (kTitle.includes('arbain') && spec.includes('arbain')) return true;
        if (kTitle.includes('tilawah') && spec.includes('tilawah')) return true;
        if (kTitle.includes('aqidatul') && spec.includes('aqidatul')) return true;
        if (kTitle.includes('duror') && spec.includes('duror')) return true;
        if (kTitle.includes('taqrib') && spec.includes('taqrib')) return true;
        if (kTitle.includes('nurul mubin') && spec.includes('nurul mubin')) return true;
        if (kTitle.includes('fuadi') && spec.includes('fuadi')) return true;
        if (kTitle.includes('akhlaq') && spec.includes('akhlaq')) return true;
        return false;
      });

      // 2. Or check if teacher matches by ID or Name
      const matchedTeacher =
        teacherBySpesialisasi ||
        guruUsers.find((g) => g.id === k.guruId) ||
        guruUsers.find((g) => g.nama && k.guruNama && g.nama.toLowerCase().replace(/[^a-z]/g, '') === k.guruNama.toLowerCase().replace(/[^a-z]/g, '')) ||
        guruUsers.find((g) => g.id === initKitab?.guruId);

      const targetGuruId = matchedTeacher?.id || k.guruId || initKitab?.guruId || '';
      const expectedGuruNama = matchedTeacher?.nama || k.guruNama || initKitab?.guruNama || '';

      let item = { ...k };
      if (k.id === 'kitab-10' && (k.namaKitab === 'Duror' || !k.namaKitab.includes('Durorul Bahiyah'))) {
        hasUpdated = true;
        item = {
          ...item,
          namaKitab: 'Durorul Bahiyah',
          arabTitle: 'الدرر البهية في المسائل الفقهية',
          mushannif: 'Al-Imam Muhammad bin Ali Asy-Syaukani',
          kategori: 'Fiqih & Ushul Fiqih' as const,
          deskripsi: 'Kitab matan fiqih ringkas nan padat yang merangkum dalil-dalil hukum ibadah thaharah, shalat, zakat, puasa, dan muamalah berlandaskan Al-Qur\'an dan As-Sunnah ash-Shahihah.',
          warnaTema: 'amber',
          jumlahBab: 22,
        };
      }
      if (item.guruId !== targetGuruId || item.guruNama !== expectedGuruNama) {
        hasUpdated = true;
        item = {
          ...item,
          guruId: targetGuruId,
          guruNama: expectedGuruNama,
        };
      }
      return item;
    });
    if (hasUpdated) {
      setStoredItem(STORAGE_KEYS.KITAB, migrated);
      return migrated;
    }
    return list;
  }

  static saveKitab(kitab: MataPelajaran): void {
    const list = this.getKitab();
    const idx = list.findIndex((k) => k.id === kitab.id);
    if (idx >= 0) list[idx] = kitab;
    else list.push(kitab);
    setStoredItem(STORAGE_KEYS.KITAB, list);
  }

  static deleteKitab(id: string): void {
    const list = this.getKitab().filter((k) => k.id !== id);
    setStoredItem(STORAGE_KEYS.KITAB, list);
  }

  // Materi
  static getMateri(): Materi[] {
    const list = getStoredItem<Materi[]>(STORAGE_KEYS.MATERI, INITIAL_MATERI);
    const users = this.getUsers();
    const guruUsers = users.filter((u) => u.role === 'guru');
    let hasUpdated = false;
    let migrated = list.map((m) => {
      if (m.mapelId === 'kitab-10' && m.mapelNama === 'Duror') {
        hasUpdated = true;
        m = { ...m, mapelNama: 'Durorul Bahiyah' };
      }
      const matchedGuru = guruUsers.find((g) => g.id === m.guruId);
      if (matchedGuru && m.guruNama !== matchedGuru.nama) {
        hasUpdated = true;
        return { ...m, guruNama: matchedGuru.nama };
      }
      if (m.videoEmbedUrl && !m.videoSourceType) {
        hasUpdated = true;
        m = { ...m, videoSourceType: 'youtube' };
      }
      if (m.id === 'mat-2' && !m.videoDirectUrl) {
        const initMat2 = INITIAL_MATERI.find((i) => i.id === 'mat-2');
        if (initMat2?.videoDirectUrl) {
          hasUpdated = true;
          m = { ...m, jenisMateri: 'video', videoSourceType: 'upload', videoDirectUrl: initMat2.videoDirectUrl, videoFileName: initMat2.videoFileName, videoFileSize: initMat2.videoFileSize };
        }
      }
      return m;
    });

    // Recovery for user's recent deletion request: restore any missing initial materials into the list
    const hasRecoveredTurn = localStorage.getItem('pesantren_materi_restored_turn_recovery_v1');
    if (!hasRecoveredTurn) {
      localStorage.setItem('pesantren_materi_restored_turn_recovery_v1', 'true');
      let restoredCount = 0;
      for (const initM of INITIAL_MATERI) {
        if (!migrated.some((m) => m.id === initM.id)) {
          migrated.push(initM);
          hasUpdated = true;
          restoredCount++;
        }
      }
      if (restoredCount > 0) {
        this.logActivity({
          id: `act-${Date.now()}`,
          userId: 'system',
          userName: 'Sistem Pesantren',
          userRole: 'admin',
          aksi: 'Memulihkan materi terhapus',
          target: `${restoredCount} materi pembelajaran berhasil dipulihkan kembali`,
          waktu: new Date().toISOString().replace('T', ' ').substring(0, 16),
        });
      }
    }

    if (hasUpdated) {
      setStoredItem(STORAGE_KEYS.MATERI, migrated);
      return migrated;
    }
    return list;
  }

  static saveMateri(materi: Materi): void {
    const list = this.getMateri();
    const idx = list.findIndex((m) => m.id === materi.id);
    if (idx >= 0) {
      list[idx] = materi;
    } else {
      list.unshift(materi); // Add to top
    }
    setStoredItem(STORAGE_KEYS.MATERI, list);

    // Record activity
    const currentUser = this.getCurrentUser();
    if (currentUser) {
      this.logActivity({
        id: `act-${Date.now()}`,
        userId: currentUser.id,
        userName: currentUser.nama,
        userRole: currentUser.role,
        aksi: idx >= 0 ? 'Memperbarui materi' : 'Mengunggah materi baru',
        target: `${materi.judul} (${materi.mapelNama})`,
        waktu: new Date().toISOString().replace('T', ' ').substring(0, 16),
      });
    }
  }

  static deleteMateri(id: string): Materi | null {
    const list = this.getMateri();
    const toDelete = list.find((m) => m.id === id);
    const updated = list.filter((m) => m.id !== id);
    setStoredItem(STORAGE_KEYS.MATERI, updated);

    if (toDelete) {
      const trash = getStoredItem<Materi[]>(STORAGE_KEYS.TRASH_MATERI, []);
      const filteredTrash = trash.filter((t) => t.id !== id);
      filteredTrash.unshift({
        ...toDelete,
        tanggalUnggah: toDelete.tanggalUnggah || new Date().toISOString().substring(0, 10),
      });
      setStoredItem(STORAGE_KEYS.TRASH_MATERI, filteredTrash);

      const currentUser = this.getCurrentUser();
      if (currentUser) {
        this.logActivity({
          id: `act-${Date.now()}`,
          userId: currentUser.id,
          userName: currentUser.nama,
          userRole: currentUser.role,
          aksi: 'Menghapus materi ke kotak sampah',
          target: `${toDelete.judul} (${toDelete.mapelNama})`,
          waktu: new Date().toISOString().replace('T', ' ').substring(0, 16),
        });
      }
      return toDelete;
    }
    return null;
  }

  static getTrashMateri(): Materi[] {
    const trash = getStoredItem<Materi[]>(STORAGE_KEYS.TRASH_MATERI, []);
    const current = getStoredItem<Materi[]>(STORAGE_KEYS.MATERI, INITIAL_MATERI);
    const currentIds = new Set(current.map((m) => m.id));
    const trashIds = new Set(trash.map((t) => t.id));

    // Also include any INITIAL_MATERI that is missing from current and not yet in trash
    for (const initM of INITIAL_MATERI) {
      if (!currentIds.has(initM.id) && !trashIds.has(initM.id)) {
        trash.push(initM);
      }
    }
    return trash;
  }

  static restoreMateri(id?: string): Materi[] {
    const current = this.getMateri();
    const currentIds = new Set(current.map((m) => m.id));
    const trash = getStoredItem<Materi[]>(STORAGE_KEYS.TRASH_MATERI, []);
    let restoredItems: Materi[] = [];
    let remainingTrash: Materi[] = [];

    if (id) {
      const target = trash.find((t) => t.id === id) || INITIAL_MATERI.find((i) => i.id === id);
      if (target) {
        restoredItems.push(target);
        remainingTrash = trash.filter((t) => t.id !== id);
      } else {
        remainingTrash = trash;
      }
    } else {
      restoredItems = [...trash];
      for (const initM of INITIAL_MATERI) {
        if (!currentIds.has(initM.id) && !restoredItems.some((r) => r.id === initM.id)) {
          restoredItems.push(initM);
        }
      }
      remainingTrash = [];
    }

    const filteredRestored = restoredItems.filter((r) => !currentIds.has(r.id));
    const updated = [...filteredRestored, ...current];
    setStoredItem(STORAGE_KEYS.MATERI, updated);
    setStoredItem(STORAGE_KEYS.TRASH_MATERI, remainingTrash);

    const currentUser = this.getCurrentUser();
    if (currentUser && restoredItems.length > 0) {
      this.logActivity({
        id: `act-${Date.now()}`,
        userId: currentUser.id,
        userName: currentUser.nama,
        userRole: currentUser.role,
        aksi: 'Memulihkan materi terhapus',
        target: `${restoredItems.map((r) => r.judul).slice(0, 2).join(', ')}${restoredItems.length > 2 ? '...' : ''}`,
        waktu: new Date().toISOString().replace('T', ' ').substring(0, 16),
      });
    }

    return updated;
  }

  static clearTrashMateri(): void {
    setStoredItem(STORAGE_KEYS.TRASH_MATERI, []);
  }

  static incrementMateriViews(id: string): void {
    const list = this.getMateri();
    const idx = list.findIndex((m) => m.id === id);
    if (idx >= 0) {
      list[idx].viewsCount = (list[idx].viewsCount || 0) + 1;
      setStoredItem(STORAGE_KEYS.MATERI, list);
    }
  }

  // Tugas
  static getTugas(): Tugas[] {
    const list = getStoredItem<Tugas[]>(STORAGE_KEYS.TUGAS, INITIAL_TUGAS);
    const users = this.getUsers();
    const guruUsers = users.filter((u) => u.role === 'guru');
    const kitabList = this.getKitab();
    let hasUpdated = false;

    let migrated = list.map((t) => {
      // 1. Sync with kitab's official pengampu
      const matchedKitab = kitabList.find((k) => k.id === t.mapelId || k.namaKitab.toLowerCase() === (t.mapelNama || '').toLowerCase());
      if (matchedKitab) {
        if (t.guruId !== matchedKitab.guruId || t.guruNama !== matchedKitab.guruNama || t.mapelNama !== matchedKitab.namaKitab) {
          hasUpdated = true;
          t = {
            ...t,
            guruId: matchedKitab.guruId,
            guruNama: matchedKitab.guruNama,
            mapelNama: matchedKitab.namaKitab,
          };
        }
      } else {
        const matchedGuru = guruUsers.find((g) => g.id === t.guruId);
        if (matchedGuru && t.guruNama !== matchedGuru.nama) {
          hasUpdated = true;
          t = { ...t, guruNama: matchedGuru.nama };
        }
      }
      return t;
    });

    if (hasUpdated) {
      setStoredItem(STORAGE_KEYS.TUGAS, migrated);
      return migrated;
    }
    return list;
  }

  static saveTugas(tugas: Tugas): void {
    const list = this.getTugas();
    const idx = list.findIndex((t) => t.id === tugas.id);
    if (idx >= 0) list[idx] = tugas;
    else list.unshift(tugas);
    setStoredItem(STORAGE_KEYS.TUGAS, list);

    // Notify santri
    this.addNotification({
      id: `notif-${Date.now()}`,
      targetRole: 'santri',
      judul: `Tugas Baru: ${tugas.judul}`,
      pesan: `Tugas baru untuk mata pelajaran ${tugas.mapelNama} telah ditambahkan oleh ${tugas.guruNama}.`,
      waktu: 'Baru saja',
      dibaca: false,
      kategori: 'tugas',
      linkTab: 'tugas',
    });
  }

  static deleteTugas(id: string): Tugas | null {
    const list = this.getTugas();
    const toDelete = list.find((t) => t.id === id);
    const updated = list.filter((t) => t.id !== id);
    setStoredItem(STORAGE_KEYS.TUGAS, updated);

    if (toDelete) {
      const trash = getStoredItem<Tugas[]>(STORAGE_KEYS.TRASH_TUGAS, []);
      const filteredTrash = trash.filter((t) => t.id !== id);
      filteredTrash.unshift(toDelete);
      setStoredItem(STORAGE_KEYS.TRASH_TUGAS, filteredTrash);
      return toDelete;
    }
    return null;
  }

  static restoreTugas(id?: string): Tugas[] {
    const current = this.getTugas();
    const currentIds = new Set(current.map((t) => t.id));
    const trash = getStoredItem<Tugas[]>(STORAGE_KEYS.TRASH_TUGAS, []);
    let restored: Tugas[] = [];
    let remaining: Tugas[] = [];

    if (id) {
      const target = trash.find((t) => t.id === id) || INITIAL_TUGAS.find((i) => i.id === id);
      if (target) {
        restored.push(target);
        remaining = trash.filter((t) => t.id !== id);
      } else {
        remaining = trash;
      }
    } else {
      restored = [...trash];
      for (const initT of INITIAL_TUGAS) {
        if (!currentIds.has(initT.id) && !restored.some((r) => r.id === initT.id)) {
          restored.push(initT);
        }
      }
      remaining = [];
    }

    const filtered = restored.filter((r) => !currentIds.has(r.id));
    const updated = [...filtered, ...current];
    setStoredItem(STORAGE_KEYS.TUGAS, updated);
    setStoredItem(STORAGE_KEYS.TRASH_TUGAS, remaining);
    return updated;
  }

  // Pengumpulan Tugas
  static getPengumpulan(): PengumpulanTugas[] {
    const list = getStoredItem<PengumpulanTugas[]>(STORAGE_KEYS.PENGUMPULAN, INITIAL_PENGUMPULAN);
    const users = this.getUsers();
    const santriUsers = users.filter((u) => u.role === 'santri');
    let hasUpdated = false;

    let migrated = list.map((p) => {
      // 1. Resolve and sanitize student names against registered santri
      const matched = santriUsers.find((s) => s.id === p.santriId);
      if (matched) {
        if (p.santriNama !== matched.nama || (matched.nomorInduk && p.santriNis !== matched.nomorInduk)) {
          hasUpdated = true;
          p = {
            ...p,
            santriNama: matched.nama,
            santriNis: matched.nomorInduk || p.santriNis,
            kelasNama: matched.semester || p.kelasNama,
          };
        }
      } else {
        // Fallback mapping for any old placeholder names
        if (p.santriNama === 'Zaid bin Tsabit' || p.santriNama?.includes('Zaid')) {
          const s1 = santriUsers[0];
          if (s1) {
            hasUpdated = true;
            p = {
              ...p,
              santriId: s1.id,
              santriNama: s1.nama,
              santriNis: s1.nomorInduk || 'NIS-20240101',
            };
          }
        } else if (p.santriNama === 'Abdullah Azzam' || p.santriNama?.includes('Azzam')) {
          const s2 = santriUsers[1] || santriUsers[0];
          if (s2) {
            hasUpdated = true;
            p = {
              ...p,
              santriId: s2.id,
              santriNama: s2.nama,
              santriNis: s2.nomorInduk || 'NIS-20240102',
            };
          }
        }
      }

      const initP = INITIAL_PENGUMPULAN.find((ip) => ip.id === p.id);
      if (initP && p.catatanEvaluasi !== initP.catatanEvaluasi) {
        hasUpdated = true;
        p = { ...p, catatanEvaluasi: initP.catatanEvaluasi };
      }
      return p;
    });

    if (hasUpdated) {
      setStoredItem(STORAGE_KEYS.PENGUMPULAN, migrated);
      return migrated;
    }
    return list;
  }

  static savePengumpulan(submission: PengumpulanTugas): void {
    const list = this.getPengumpulan();
    const idx = list.findIndex((p) => p.id === submission.id);
    if (idx >= 0) {
      list[idx] = submission;
    } else {
      list.unshift(submission);
    }
    setStoredItem(STORAGE_KEYS.PENGUMPULAN, list);

    // If it was submitted by santri
    if (submission.status === 'menunggu_diperiksa') {
      this.addNotification({
        id: `notif-${Date.now()}`,
        targetRole: 'guru',
        judul: `Tugas Dikumpulkan: ${submission.santriNama}`,
        pesan: `Santri ${submission.santriNama} (${submission.santriNis}) telah mengumpulkan tugas yang menunggu pemeriksaan.`,
        waktu: 'Baru saja',
        dibaca: false,
        kategori: 'tugas',
        linkTab: 'tugas',
      });
    } else if (submission.status === 'sudah_dinilai') {
      this.addNotification({
        id: `notif-${Date.now()}`,
        targetRole: 'santri',
        userId: submission.santriId,
        judul: `Nilai Tugas Keluar`,
        pesan: `Tugas Anda telah dinilai: ${submission.nilai}/100. Evaluasi: ${submission.catatanEvaluasi || 'Alhamdulillah'}`,
        waktu: 'Baru saja',
        dibaca: false,
        kategori: 'nilai',
        linkTab: 'tugas',
      });
    }
  }

  // Kuis
  static getKuis(): Kuis[] {
    const list = getStoredItem<Kuis[]>(STORAGE_KEYS.KUIS, INITIAL_KUIS);
    const users = this.getUsers();
    const guruUsers = users.filter((u) => u.role === 'guru');
    const kitabList = this.getKitab();
    let hasUpdated = false;

    let migrated = list.map((k) => {
      // 1. Strictly align quiz pengampu with the official kitab definition
      const matchedKitab = kitabList.find(
        (ktb) => ktb.id === k.mapelId || ktb.namaKitab.toLowerCase() === (k.mapelNama || '').toLowerCase()
      );
      if (matchedKitab) {
        if (k.guruId !== matchedKitab.guruId || k.guruNama !== matchedKitab.guruNama || k.mapelNama !== matchedKitab.namaKitab) {
          hasUpdated = true;
          k = {
            ...k,
            mapelId: matchedKitab.id,
            mapelNama: matchedKitab.namaKitab,
            guruId: matchedKitab.guruId,
            guruNama: matchedKitab.guruNama,
          };
        }
      } else {
        const matchedGuru = guruUsers.find((g) => g.id === k.guruId);
        if (matchedGuru && k.guruNama !== matchedGuru.nama) {
          hasUpdated = true;
          k = { ...k, guruNama: matchedGuru.nama };
        }
      }
      return k;
    });

    if (hasUpdated) {
      setStoredItem(STORAGE_KEYS.KUIS, migrated);
      return migrated;
    }
    return list;
  }

  static saveKuis(kuis: Kuis): void {
    const list = this.getKuis();
    const idx = list.findIndex((k) => k.id === kuis.id);
    if (idx >= 0) list[idx] = kuis;
    else list.unshift(kuis);
    setStoredItem(STORAGE_KEYS.KUIS, list);
  }

  static deleteKuis(id: string): void {
    const list = this.getKuis().filter((k) => k.id !== id);
    setStoredItem(STORAGE_KEYS.KUIS, list);
  }

  // Jawaban Kuis Santri
  static getJawabanKuis(): JawabanKuisSantri[] {
    const list = getStoredItem<JawabanKuisSantri[]>(STORAGE_KEYS.JAWABAN_KUIS, INITIAL_JAWABAN_KUIS);
    const users = this.getUsers();
    const santriUsers = users.filter((u) => u.role === 'santri');
    let hasUpdated = false;

    let migrated = list.map((j) => {
      const matched = santriUsers.find((s) => s.id === j.santriId);
      if (matched && j.santriNama !== matched.nama) {
        hasUpdated = true;
        j = { ...j, santriNama: matched.nama };
      } else if (j.santriNama === 'Zaid bin Tsabit' || j.santriNama?.includes('Zaid')) {
        const s1 = santriUsers[0];
        if (s1) {
          hasUpdated = true;
          j = { ...j, santriId: s1.id, santriNama: s1.nama };
        }
      }
      const initJ = INITIAL_JAWABAN_KUIS.find((ij) => ij.id === j.id);
      if (initJ && j.catatanGuru !== initJ.catatanGuru) {
        hasUpdated = true;
        j = { ...j, catatanGuru: initJ.catatanGuru };
      }
      return j;
    });

    if (hasUpdated) {
      setStoredItem(STORAGE_KEYS.JAWABAN_KUIS, migrated);
      return migrated;
    }
    return list;
  }

  static saveJawabanKuis(jwb: JawabanKuisSantri): void {
    const list = this.getJawabanKuis();
    const idx = list.findIndex((j) => j.id === jwb.id);
    if (idx >= 0) list[idx] = jwb;
    else list.unshift(jwb);
    setStoredItem(STORAGE_KEYS.JAWABAN_KUIS, list);
  }

  // Nilai
  static getNilai(): NilaiSantri[] {
    const isInitial = !localStorage.getItem(STORAGE_KEYS.NILAI);
    const list = getStoredItem<NilaiSantri[]>(STORAGE_KEYS.NILAI, INITIAL_NILAI);
    const users = this.getUsers();
    const santriUsers = users.filter((u) => u.role === 'santri');
    const kitabList = getStoredItem<MataPelajaran[]>(STORAGE_KEYS.KITAB, INITIAL_KITAB);
    let hasUpdated = false;

    // 1. Sync names and NIS from active santri users
    let result = list.map((n) => {
      const matched = santriUsers.find((s) => s.id === n.santriId);
      if (matched && (n.santriNama !== matched.nama || (matched.nomorInduk && n.santriNis !== matched.nomorInduk))) {
        hasUpdated = true;
        return {
          ...n,
          santriNama: matched.nama,
          santriNis: matched.nomorInduk || n.santriNis,
          kelasNama: matched.semester || n.kelasNama,
        };
      }
      return n;
    });

    // 2. Only on very first app load, seed initial records if completely empty
    if (isInitial && result.length === 0) {
      for (const santri of santriUsers) {
        for (const ktb of kitabList) {
          hasUpdated = true;
          result.push({
            id: `nil-${santri.id}-${ktb.id}`,
            santriId: santri.id,
            santriNama: santri.nama,
            santriNis: santri.nomorInduk || 'NIS-202401',
            kelasNama: santri.semester || 'Semester 1',
            mapelId: ktb.id,
            mapelNama: ktb.namaKitab,
            nilaiTugasRata: 85,
            nilaiKuisRata: 88,
            nilaiHafalanSetoran: 90,
            nilaiUjianAkhir: 87,
            nilaiAkhir: 88,
            predikat: 'Jayyid Jiddan (B+)',
            catatan: `Pemahaman santri terhadap materi kitab ${ktb.namaKitab} cukup baik. (${ktb.guruNama})`,
          });
        }
      }
    }

    if (hasUpdated) {
      setStoredItem(STORAGE_KEYS.NILAI, result);
      return result;
    }
    return list;
  }

  static saveNilai(nilai: NilaiSantri): void {
    const list = this.getNilai();
    const idx = list.findIndex((n) => n.id === nilai.id);
    if (idx >= 0) list[idx] = nilai;
    else list.unshift(nilai);
    setStoredItem(STORAGE_KEYS.NILAI, list);
  }

  static deleteNilai(id: string): void {
    const list = this.getNilai().filter((n) => n.id !== id);
    setStoredItem(STORAGE_KEYS.NILAI, list);
  }

  static deletePengumpulan(id: string): void {
    const list = this.getPengumpulan().filter((p) => p.id !== id);
    setStoredItem(STORAGE_KEYS.PENGUMPULAN, list);
  }

  // Jadwal Halaqah
  static getJadwal(): JadwalHalaqah[] {
    const list = getStoredItem<JadwalHalaqah[]>(STORAGE_KEYS.JADWAL, INITIAL_JADWAL);
    const users = this.getUsers();
    const guruUsers = users.filter((u) => u.role === 'guru');
    let hasUpdated = false;
    let migrated = list.map((j) => {
      const matchedGuru = guruUsers.find(
        (g) =>
          g.id === j.guruId ||
          (g.nama && (j.guruNama === g.nama || j.guruNama.includes(g.nama) || g.nama.includes(j.guruNama)))
      );
      if (matchedGuru && j.guruNama !== matchedGuru.nama) {
        hasUpdated = true;
        return { ...j, guruNama: matchedGuru.nama, guruId: matchedGuru.id };
      }
      return j;
    });

    if (hasUpdated) {
      setStoredItem(STORAGE_KEYS.JADWAL, migrated);
      return migrated;
    }
    return list;
  }

  static saveJadwal(jadwal: JadwalHalaqah): void {
    const list = this.getJadwal();
    const idx = list.findIndex((j) => j.id === jadwal.id);
    if (idx >= 0) list[idx] = jadwal;
    else list.push(jadwal);
    setStoredItem(STORAGE_KEYS.JADWAL, list);
  }

  static deleteJadwal(id: string): void {
    const list = this.getJadwal().filter((j) => j.id !== id);
    setStoredItem(STORAGE_KEYS.JADWAL, list);
  }

  // Aktivitas Log
  static getAktivitas(): AktivitasLog[] {
    return getStoredItem<AktivitasLog[]>(STORAGE_KEYS.AKTIVITAS, INITIAL_AKTIVITAS);
  }

  static logActivity(log: AktivitasLog): void {
    const list = this.getAktivitas();
    list.unshift(log);
    if (list.length > 50) list.pop(); // Keep 50
    setStoredItem(STORAGE_KEYS.AKTIVITAS, list);
  }

  // Notifikasi
  static getNotifikasi(): Notifikasi[] {
    const list = getStoredItem<Notifikasi[]>(STORAGE_KEYS.NOTIFIKASI, INITIAL_NOTIFIKASI);
    let hasUpdated = false;
    let migrated = list.map((n) => {
      const initN = INITIAL_NOTIFIKASI.find((inItem) => inItem.id === n.id);
      if (initN && (n.pesan !== initN.pesan || n.judul !== initN.judul)) {
        hasUpdated = true;
        return { ...n, pesan: initN.pesan, judul: initN.judul };
      }
      // Sanitize old placeholder student names
      if (n.pesan.includes('Zaid') || n.pesan.includes('Azzam')) {
        hasUpdated = true;
        return {
          ...n,
          pesan: n.pesan
            .replace(/Zaid bin Tsabit/g, 'Aini Muftichah')
            .replace(/Abdullah Azzam/g, 'Ana fiki hidayatul m')
            .replace(/Zaid/g, 'Aini Muftichah')
            .replace(/Azzam/g, 'Ana fiki hidayatul m'),
        };
      }
      return n;
    });

    if (hasUpdated) {
      setStoredItem(STORAGE_KEYS.NOTIFIKASI, migrated);
      return migrated;
    }
    return list;
  }

  static addNotification(notif: Notifikasi): void {
    const list = this.getNotifikasi();
    list.unshift(notif);
    if (list.length > 30) list.pop();
    setStoredItem(STORAGE_KEYS.NOTIFIKASI, list);
  }

  static markNotifAsRead(id: string): void {
    const list = this.getNotifikasi();
    const item = list.find((n) => n.id === id);
    if (item) {
      item.dibaca = true;
      setStoredItem(STORAGE_KEYS.NOTIFIKASI, list);
    }
  }

  static markAllNotifsAsRead(): void {
    const list = this.getNotifikasi().map((n) => ({ ...n, dibaca: true }));
    setStoredItem(STORAGE_KEYS.NOTIFIKASI, list);
  }

  // Export SQL
  static getMySqlDump(): string {
    return MYSQL_DATABASE_SCHEMA_SQL;
  }

  // Reset database to initial seed data
  static resetToDefault(): void {
    setStoredItem(STORAGE_KEYS.CURRENT_USER, INITIAL_USERS[0]);
    setStoredItem(STORAGE_KEYS.USERS, INITIAL_USERS);
    setStoredItem(STORAGE_KEYS.KELAS, INITIAL_KELAS);
    setStoredItem(STORAGE_KEYS.KITAB, INITIAL_KITAB);
    setStoredItem(STORAGE_KEYS.MATERI, INITIAL_MATERI);
    setStoredItem(STORAGE_KEYS.TUGAS, INITIAL_TUGAS);
    setStoredItem(STORAGE_KEYS.PENGUMPULAN, INITIAL_PENGUMPULAN);
    setStoredItem(STORAGE_KEYS.KUIS, INITIAL_KUIS);
    setStoredItem(STORAGE_KEYS.JAWABAN_KUIS, INITIAL_JAWABAN_KUIS);
    setStoredItem(STORAGE_KEYS.NILAI, INITIAL_NILAI);
    setStoredItem(STORAGE_KEYS.JADWAL, INITIAL_JADWAL);
    setStoredItem(STORAGE_KEYS.AKTIVITAS, INITIAL_AKTIVITAS);
    setStoredItem(STORAGE_KEYS.NOTIFIKASI, INITIAL_NOTIFIKASI);
  }
}
