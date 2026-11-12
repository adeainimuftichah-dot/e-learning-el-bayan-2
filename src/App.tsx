/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { CheckCircle, RotateCcw } from 'lucide-react';
import { User, Role, Materi, Tugas, PengumpulanTugas, Kuis, JawabanKuisSantri, Kelas, NilaiSantri, isGuruForKitab } from './types';
import { PesantrenDB } from './services/storage';

// Common Components
import { Sidebar } from './components/common/Sidebar';
import { Header } from './components/common/Header';

// Auth
import { LoginPage } from './components/auth/LoginPage';

// Dashboards
import { AdminDashboard } from './components/dashboard/AdminDashboard';
import { GuruDashboard } from './components/dashboard/GuruDashboard';
import { SantriDashboard } from './components/dashboard/SantriDashboard';

// Kitab & Academic
import { KitabDirectory } from './components/kitab/KitabDirectory';
import { MateriList } from './components/materi/MateriList';
import { TugasList } from './components/tugas/TugasList';
import { KuisList } from './components/kuis/KuisList';
import { JadwalHalaqahView } from './components/jadwal/JadwalHalaqahView';
import { NilaiManagement } from './components/nilai/NilaiManagement';

// Admin Entities
import { SantriManagement } from './components/santri/SantriManagement';
import { GuruManagement } from './components/guru/GuruManagement';
import { KelasManagement } from './components/kelas/KelasManagement';
import { SqlExportModal } from './components/database/SqlExportModal';

// Modals
import { MateriViewerModal } from './components/materi/MateriViewerModal';
import { MateriFormModal } from './components/materi/MateriFormModal';
import { TugasSubmitModal } from './components/tugas/TugasSubmitModal';
import { TugasGradeModal } from './components/tugas/TugasGradeModal';
import { TugasFormModal } from './components/tugas/TugasFormModal';
import { KuisTakingModal } from './components/kuis/KuisTakingModal';
import { KuisFormModal } from './components/kuis/KuisFormModal';
import { EditUstazModal } from './components/guru/EditUstazModal';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => PesantrenDB.getCurrentUser());
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);

  // Database Data States
  const [users, setUsers] = useState(() => PesantrenDB.getUsers());
  const [kelasList, setKelasList] = useState(() => PesantrenDB.getKelas());
  const [kitabList, setKitabList] = useState(() => PesantrenDB.getKitab());
  const [materiList, setMateriList] = useState(() => PesantrenDB.getMateri());
  const [tugasList, setTugasList] = useState(() => PesantrenDB.getTugas());
  const [pengumpulanList, setPengumpulanList] = useState(() => PesantrenDB.getPengumpulan());
  const [kuisList, setKuisList] = useState(() => PesantrenDB.getKuis());
  const [jawabanKuisList, setJawabanKuisList] = useState(() => PesantrenDB.getJawabanKuis());
  const [nilaiList, setNilaiList] = useState(() => PesantrenDB.getNilai());
  const [jadwalList, setJadwalList] = useState(() => PesantrenDB.getJadwal());
  const [aktivitasList, setAktivitasList] = useState(() => PesantrenDB.getAktivitas());

  // Modal active states
  const [viewingMateri, setViewingMateri] = useState<Materi | null>(null);
  const [isUploadMateriOpen, setIsUploadMateriOpen] = useState<boolean>(false);
  const [editingMateri, setEditingMateri] = useState<Materi | null>(null);

  const [submittingTugas, setSubmittingTugas] = useState<{
    tugas: Tugas;
    submission?: PengumpulanTugas;
  } | null>(null);

  const [gradingSubmission, setGradingSubmission] = useState<{
    submission: PengumpulanTugas;
    tugas: Tugas;
  } | null>(null);

  const [isCreateTugasOpen, setIsCreateTugasOpen] = useState<boolean>(false);
  const [editingTugas, setEditingTugas] = useState<Tugas | null>(null);

  const [takingKuis, setTakingKuis] = useState<Kuis | null>(null);
  const [isCreateKuisOpen, setIsCreateKuisOpen] = useState<boolean>(false);

  // Edit Ustadz Profile state
  const [isEditUstazModalOpen, setIsEditUstazModalOpen] = useState<boolean>(false);
  const [editingUstazUser, setEditingUstazUser] = useState<User | null>(null);

  // Meta navigation state (e.g. selectedKitabId or selectedMateriId from search)
  const [metaParam, setMetaParam] = useState<any>(null);

  // Pending tasks count for teacher badge
  const pendingTasksCount = pengumpulanList.filter((p) => p.status === 'menunggu_diperiksa').length;


  const handleLoginSuccess = (user: User) => {
    PesantrenDB.setCurrentUser(user);
    setCurrentUser(user);
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    PesantrenDB.setCurrentUser(null);
    setCurrentUser(null);
  };

  const handleSwitchUser = (user: User) => {
    PesantrenDB.setCurrentUser(user);
    setCurrentUser(user);
    setActiveTab('dashboard');
  };

  const handleResetData = () => {
    PesantrenDB.resetToDefault();
    setUsers(PesantrenDB.getUsers());
    setKelasList(PesantrenDB.getKelas());
    setKitabList(PesantrenDB.getKitab());
    setMateriList(PesantrenDB.getMateri());
    setTugasList(PesantrenDB.getTugas());
    setPengumpulanList(PesantrenDB.getPengumpulan());
    setKuisList(PesantrenDB.getKuis());
    setJawabanKuisList(PesantrenDB.getJawabanKuis());
    setNilaiList(PesantrenDB.getNilai());
    setJadwalList(PesantrenDB.getJadwal());
    setAktivitasList(PesantrenDB.getAktivitas());
    setCurrentUser(PesantrenDB.getCurrentUser());
  };

  const handleNavigateTab = (tab: string, meta?: any) => {
    setActiveTab(tab);
    setMetaParam(meta || null);
    if (meta?.selectedMateriId) {
      const target = materiList.find((m) => m.id === meta.selectedMateriId);
      if (target) setViewingMateri(target);
    }
  };

  // Toast Feedback State
  const [toastMessage, setToastMessage] = useState<{ text: string; onUndo?: () => void } | null>(null);

  const showToast = (text: string, onUndo?: () => void) => {
    setToastMessage({ text, onUndo });
    setTimeout(() => {
      setToastMessage((prev) => (prev?.text === text ? null : prev));
    }, 5000);
  };

  // Materi Handlers
  const handleSaveMateri = (materi: Materi) => {
    PesantrenDB.saveMateri(materi);
    setMateriList(PesantrenDB.getMateri());
    setAktivitasList(PesantrenDB.getAktivitas());
    setIsUploadMateriOpen(false);
    setEditingMateri(null);
    showToast('Materi berhasil disimpan.');
  };

  const handleRestoreMateri = (id?: string) => {
    PesantrenDB.restoreMateri(id);
    setMateriList(PesantrenDB.getMateri());
    setAktivitasList(PesantrenDB.getAktivitas());
    showToast(id ? 'Materi berhasil dipulihkan.' : 'Semua materi terhapus berhasil dipulihkan.');
  };

  const handleClearTrashMateri = () => {
    PesantrenDB.clearTrashMateri();
    setMateriList(PesantrenDB.getMateri());
    showToast('Kotak sampah materi telah dikosongkan.');
  };

  const handleDeleteMateri = (id: string) => {
    PesantrenDB.deleteMateri(id);
    setMateriList(PesantrenDB.getMateri());
    setAktivitasList(PesantrenDB.getAktivitas());
    showToast('Materi berhasil dihapus.', () => handleRestoreMateri(id));
  };

  const handleOpenMateriViewer = (materi: Materi) => {
    PesantrenDB.incrementMateriViews(materi.id);
    setMateriList(PesantrenDB.getMateri());
    setViewingMateri(materi);
  };

  // Tugas Handlers
  const handleRestoreTugas = (id?: string) => {
    PesantrenDB.restoreTugas(id);
    setTugasList(PesantrenDB.getTugas());
    showToast(id ? 'Tugas berhasil dipulihkan.' : 'Semua tugas terhapus berhasil dipulihkan.');
  };

  const handleSaveTugas = (tugas: Tugas) => {
    PesantrenDB.saveTugas(tugas);
    setTugasList(PesantrenDB.getTugas());
    setIsCreateTugasOpen(false);
    setEditingTugas(null);
    showToast('Tugas berhasil disimpan.');
  };

  const handleDeleteTugas = (id: string) => {
    PesantrenDB.deleteTugas(id);
    setTugasList(PesantrenDB.getTugas());
    showToast('Tugas berhasil dihapus.', () => handleRestoreTugas(id));
  };

  const handleSaveSubmission = (submission: PengumpulanTugas) => {
    PesantrenDB.savePengumpulan(submission);
    setPengumpulanList(PesantrenDB.getPengumpulan());
    setSubmittingTugas(null);
    showToast('Tugas berhasil disetor.');
  };

  const handleDeleteSubmission = (id: string) => {
    PesantrenDB.deletePengumpulan(id);
    setPengumpulanList(PesantrenDB.getPengumpulan());
    showToast('Berkas setoran tugas berhasil dihapus.');
  };

  const handleSaveGrade = (submission: PengumpulanTugas) => {
    PesantrenDB.savePengumpulan(submission);
    setPengumpulanList(PesantrenDB.getPengumpulan());
    setGradingSubmission(null);
    showToast('Nilai dan evaluasi setoran berhasil disimpan.');
  };

  // Kuis Handlers
  const handleFinishKuis = (jawaban: JawabanKuisSantri) => {
    PesantrenDB.saveJawabanKuis(jawaban);
    setJawabanKuisList(PesantrenDB.getJawabanKuis());
    showToast('Jawaban kuis berhasil dikumpulkan.');
  };

  const handleDeleteKuis = (id: string) => {
    PesantrenDB.deleteKuis(id);
    setKuisList(PesantrenDB.getKuis());
    showToast('Kuis berhasil dihapus.');
  };

  const handleSaveKuis = (newKuis: Kuis) => {
    PesantrenDB.saveKuis(newKuis);
    setKuisList(PesantrenDB.getKuis());
    setAktivitasList(PesantrenDB.getAktivitas());
    setIsCreateKuisOpen(false);
    showToast('Kuis baru berhasil dibuat.');
  };

  // Nilai Handlers
  const handleSaveNilai = (nilai: NilaiSantri) => {
    PesantrenDB.saveNilai(nilai);
    setNilaiList(PesantrenDB.getNilai());
    showToast('Data nilai berhasil disimpan.');
  };

  const handleDeleteNilai = (id: string) => {
    PesantrenDB.deleteNilai(id);
    setNilaiList(PesantrenDB.getNilai());
    showToast('Data nilai berhasil dihapus.');
  };

  // Jadwal Halaqah Handlers
  const handleDeleteJadwal = (id: string) => {
    PesantrenDB.deleteJadwal(id);
    setJadwalList(PesantrenDB.getJadwal());
    showToast('Jadwal halaqah berhasil dihapus.');
  };

  // Admin CRUD Handlers
  const handleSaveSantri = (santri: User) => {
    PesantrenDB.saveUser(santri);
    setUsers(PesantrenDB.getUsers());
    showToast('Data santri berhasil disimpan.');
  };

  const handleDeleteSantri = (id: string) => {
    PesantrenDB.deleteUser(id);
    setUsers(PesantrenDB.getUsers());
    setNilaiList(PesantrenDB.getNilai());
    setPengumpulanList(PesantrenDB.getPengumpulan());
    if (currentUser?.id === id) {
      setCurrentUser(null);
    }
    showToast('Data santri berhasil dihapus.');
  };

  const handleOpenEditUstaz = (targetUser?: User) => {
    const guruUsersList = users.filter((u) => u.role === 'guru');
    const userToEdit = targetUser || (currentUser?.role === 'guru' ? currentUser : guruUsersList[0]);
    if (userToEdit) {
      setEditingUstazUser(userToEdit);
      setIsEditUstazModalOpen(true);
    }
  };

  const handleSaveGuru = (guru: User) => {
    PesantrenDB.saveUser(guru);
    setUsers(PesantrenDB.getUsers());
    setKitabList(PesantrenDB.getKitab());
    setMateriList(PesantrenDB.getMateri());
    setTugasList(PesantrenDB.getTugas());
    setKuisList(PesantrenDB.getKuis());
    setJadwalList(PesantrenDB.getJadwal());
    setKelasList(PesantrenDB.getKelas());
    setAktivitasList(PesantrenDB.getAktivitas());
    if (currentUser?.id === guru.id) {
      setCurrentUser(guru);
    }
    setIsEditUstazModalOpen(false);
    setEditingUstazUser(null);
    showToast('Data ustadz berhasil diperbarui.');
  };

  const handleDeleteGuru = (id: string) => {
    PesantrenDB.deleteUser(id);
    setUsers(PesantrenDB.getUsers());
    setKitabList(PesantrenDB.getKitab());
    if (currentUser?.id === id) {
      setCurrentUser(null);
    }
    showToast('Data ustadz berhasil dihapus.');
  };

  const handleSaveKelas = (kelas: Kelas) => {
    PesantrenDB.saveKelas(kelas);
    setKelasList(PesantrenDB.getKelas());
    showToast('Data kelas berhasil disimpan.');
  };

  const handleDeleteKelas = (id: string) => {
    PesantrenDB.deleteKelas(id);
    setKelasList(PesantrenDB.getKelas());
    showToast('Data kelas berhasil dihapus.');
  };

  // If user is not logged in, render LoginPage
  if (!currentUser) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} users={users} />;
  }

  const santriUsers = users.filter((u) => u.role === 'santri');
  const guruUsers = users.filter((u) => u.role === 'guru');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={(tab) => handleNavigateTab(tab)}
        currentUser={currentUser}
        onLogout={handleLogout}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        pendingTasksCount={pendingTasksCount}
        onOpenEditProfile={handleOpenEditUstaz}
      />

      {/* Top Header */}
      <Header
        currentUser={currentUser}
        onLogout={handleLogout}
        onSwitchUser={handleSwitchUser}
        allUsers={users}
        activeTab={activeTab}
        onNavigateTab={handleNavigateTab}
        collapsed={sidebarCollapsed}
        onResetData={handleResetData}
        onOpenEditProfile={handleOpenEditUstaz}
      />

      {/* Main Content Viewport */}
      <main
        className={`pt-20 pb-12 px-6 transition-all duration-300 ${
          sidebarCollapsed ? 'ml-20' : 'ml-64'
        }`}
      >
        <div className="max-w-7xl mx-auto space-y-6">
          {/* DASHBOARD TAB */}
          {activeTab === 'dashboard' && (
            <>
              {currentUser.role === 'admin' && (
                <AdminDashboard
                  santriList={santriUsers}
                  guruList={guruUsers}
                  kitabList={kitabList}
                  materiList={materiList}
                  tugasList={tugasList}
                  pengumpulanList={pengumpulanList}
                  kelasList={kelasList}
                  aktivitasList={aktivitasList}
                  onNavigateTab={handleNavigateTab}
                />
              )}

              {currentUser.role === 'guru' && (
                <GuruDashboard
                  currentUser={currentUser}
                  allKitab={kitabList}
                  allMateri={materiList}
                  allTugas={tugasList}
                  allPengumpulan={pengumpulanList}
                  santriList={santriUsers}
                  onOpenUploadMateri={() => setIsUploadMateriOpen(true)}
                  onOpenCreateTugas={() => setIsCreateTugasOpen(true)}
                  onGradeSubmission={(sub) => {
                    const task = tugasList.find((t) => t.id === sub.tugasId);
                    if (task) setGradingSubmission({ submission: sub, tugas: task });
                  }}
                  onNavigateTab={handleNavigateTab}
                  onOpenEditProfile={() => handleOpenEditUstaz(currentUser)}
                />
              )}

              {currentUser.role === 'santri' && (
                <SantriDashboard
                  currentUser={currentUser}
                  allKitab={kitabList}
                  allMateri={materiList}
                  allTugas={tugasList}
                  allPengumpulan={pengumpulanList}
                  allJadwal={jadwalList}
                  allNilai={nilaiList}
                  onOpenMateriViewer={handleOpenMateriViewer}
                  onOpenSubmitTugas={(tugas, sub) =>
                    setSubmittingTugas({ tugas, submission: sub })
                  }
                  onNavigateTab={handleNavigateTab}
                />
              )}
            </>
          )}

          {/* KITAB DIRECTORY TAB (12 KITAB) */}
          {activeTab === 'kitab' && (
            <KitabDirectory
              kitabList={kitabList}
              materiList={materiList}
              tugasList={tugasList}
              kuisList={kuisList}
              currentUser={currentUser}
              initialSelectedKitabId={metaParam?.selectedKitabId}
              onOpenMateriViewer={handleOpenMateriViewer}
              onOpenSubmitTugas={(tugas) => setSubmittingTugas({ tugas })}
              onOpenUploadMateri={() => setIsUploadMateriOpen(true)}
            />
          )}

          {/* MATERI PEMBELAJARAN TAB */}
          {activeTab === 'materi' && (
            <MateriList
              materiList={materiList}
              kitabList={kitabList}
              kelasList={kelasList}
              currentUser={currentUser}
              trashList={PesantrenDB.getTrashMateri()}
              onOpenViewer={handleOpenMateriViewer}
              onOpenUpload={() => setIsUploadMateriOpen(true)}
              onOpenEdit={(mat) => setEditingMateri(mat)}
              onDeleteMateri={handleDeleteMateri}
              onRestoreMateri={handleRestoreMateri}
              onClearTrash={handleClearTrashMateri}
            />
          )}

          {/* TUGAS & SETORAN TAB */}
          {activeTab === 'tugas' && (
            <TugasList
              tugasList={tugasList}
              pengumpulanList={pengumpulanList}
              kitabList={kitabList}
              currentUser={currentUser}
              santriList={santriUsers}
              onOpenCreateTugas={() => setIsCreateTugasOpen(true)}
              onOpenEditTugas={(tugas) => setEditingTugas(tugas)}
              onDeleteTugas={handleDeleteTugas}
              onDeleteSubmission={handleDeleteSubmission}
              onOpenSubmitTugas={(tugas, sub) => setSubmittingTugas({ tugas, submission: sub })}
              onOpenGradeSubmission={(sub, task) =>
                setGradingSubmission({ submission: sub, tugas: task })
              }
            />
          )}

          {/* KUIS & UJIAN TAB */}
          {activeTab === 'kuis' && (
            <KuisList
              kuisList={kuisList}
              jawabanList={jawabanKuisList}
              kitabList={kitabList}
              currentUser={currentUser}
              onOpenTakeKuis={(kuis) => setTakingKuis(kuis)}
              onOpenCreateKuis={() => setIsCreateKuisOpen(true)}
              onDeleteKuis={handleDeleteKuis}
            />
          )}

          {/* JADWAL HALAQAH TAB */}
          {activeTab === 'jadwal' && (
            <JadwalHalaqahView
              jadwalList={jadwalList}
              currentUser={currentUser}
              onDeleteJadwal={handleDeleteJadwal}
            />
          )}

          {/* REKAP NILAI & RAPOR TAB (ADMIN, USTADZ, SANTRI) */}
          {activeTab === 'nilai' && (
            <NilaiManagement
              nilaiList={nilaiList}
              kitabList={kitabList}
              currentUser={currentUser}
              santriList={santriUsers}
              tugasList={tugasList}
              pengumpulanList={pengumpulanList}
              onOpenGradeSubmission={(sub, task) =>
                setGradingSubmission({ submission: sub, tugas: task })
              }
              onSaveNilai={handleSaveNilai}
              onDeleteNilai={handleDeleteNilai}
            />
          )}

          {/* DATA SANTRI (ADMIN & GURU) */}
          {activeTab === 'santri' && (currentUser.role === 'admin' || currentUser.role === 'guru') && (
            <SantriManagement
              santriList={santriUsers}
              kelasList={kelasList}
              onSaveSantri={handleSaveSantri}
              onDeleteSantri={handleDeleteSantri}
            />
          )}

          {/* DATA DEWAN GURU / USTADZ (ADMIN & GURU) */}
          {activeTab === 'guru' && (currentUser.role === 'admin' || currentUser.role === 'guru') && (
            <GuruManagement
              guruList={guruUsers}
              onSaveGuru={handleSaveGuru}
              onDeleteGuru={handleDeleteGuru}
              currentUser={currentUser}
            />
          )}

          {/* ADMIN EXCLUSIVE: DATA KELAS & HALAQAH */}
          {activeTab === 'kelas' && currentUser.role === 'admin' && (
            <KelasManagement
              kelasList={kelasList}
              guruList={guruUsers}
              onSaveKelas={handleSaveKelas}
              onDeleteKelas={handleDeleteKelas}
            />
          )}

          {/* ADMIN EXCLUSIVE: SKEMA DATABASE & SQL EXPORT */}
          {activeTab === 'database' && currentUser.role === 'admin' && <SqlExportModal />}
        </div>
      </main>

      {/* MODALS */}
      {/* 1. Materi Viewer Modal */}
      {viewingMateri && (
        <MateriViewerModal
          materi={viewingMateri}
          onClose={() => setViewingMateri(null)}
        />
      )}

      {/* 2. Upload / Edit Materi Modal */}
      {(isUploadMateriOpen || editingMateri) && (
        <MateriFormModal
          materiToEdit={editingMateri}
          kitabList={kitabList}
          kelasList={kelasList}
          currentUser={currentUser}
          onSave={handleSaveMateri}
          onClose={() => {
            setIsUploadMateriOpen(false);
            setEditingMateri(null);
          }}
        />
      )}

      {/* 3. Tugas Submit Modal (Santri) */}
      {submittingTugas && (
        <TugasSubmitModal
          tugas={submittingTugas.tugas}
          existingSubmission={submittingTugas.submission}
          currentUser={currentUser}
          onSave={handleSaveSubmission}
          onDelete={handleDeleteSubmission}
          onClose={() => setSubmittingTugas(null)}
        />
      )}

      {/* 4. Tugas Grading Modal (Guru) */}
      {gradingSubmission && (
        <TugasGradeModal
          submission={gradingSubmission.submission}
          tugas={gradingSubmission.tugas}
          onSaveGrade={handleSaveGrade}
          onClose={() => setGradingSubmission(null)}
        />
      )}

      {/* 5. Create / Edit Tugas Modal */}
      {(isCreateTugasOpen || editingTugas) && (
        <TugasFormModal
          tugasToEdit={editingTugas}
          kitabList={
            currentUser.role === 'guru'
              ? kitabList.filter((k) => isGuruForKitab(currentUser, k))
              : kitabList
          }
          kelasList={kelasList}
          currentUser={currentUser}
          onSave={handleSaveTugas}
          onClose={() => {
            setIsCreateTugasOpen(false);
            setEditingTugas(null);
          }}
        />
      )}

      {/* 6. Taking Online Quiz Modal */}
      {takingKuis && (
        <KuisTakingModal
          kuis={takingKuis}
          currentUser={currentUser}
          onFinishKuis={handleFinishKuis}
          onClose={() => setTakingKuis(null)}
        />
      )}

      {/* 6b. Create Quiz Modal (Guru / Ustadz) */}
      {isCreateKuisOpen && (
        <KuisFormModal
          isOpen={isCreateKuisOpen}
          onClose={() => setIsCreateKuisOpen(false)}
          onSave={handleSaveKuis}
          kitabList={
            currentUser?.role === 'guru'
              ? kitabList.filter((k) => isGuruForKitab(currentUser, k))
              : kitabList
          }
          currentUser={currentUser}
        />
      )}

      {/* 7. Edit Ustadz Name & Profile Modal */}
      {isEditUstazModalOpen && editingUstazUser && (
        <EditUstazModal
          isOpen={isEditUstazModalOpen}
          guru={editingUstazUser}
          allKitab={kitabList}
          onSave={handleSaveGuru}
          onClose={() => {
            setIsEditUstazModalOpen(false);
            setEditingUstazUser(null);
          }}
        />
      )}

      {/* Floating Action Feedback Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900/95 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700/80 backdrop-blur-md transition-all animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage.text}</span>
          {toastMessage.onUndo && (
            <button
              onClick={() => {
                toastMessage.onUndo?.();
                setToastMessage(null);
              }}
              className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Urungkan</span>
            </button>
          )}
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 text-slate-400 hover:text-white text-xs px-1 py-0.5 rounded transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
