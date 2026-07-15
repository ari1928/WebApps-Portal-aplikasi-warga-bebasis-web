import React, { useState, useEffect } from 'react';
import { User, Report, Announcement, Notification } from '../types';
import { Shield, Users, ClipboardList, Megaphone, CheckCircle, Clock, AlertCircle, RefreshCw, Eye, Check, X, FileText, Send, UserCheck, Trash2, Settings, User as UserIcon, Camera, FileSpreadsheet, Download, Upload, ExternalLink, Link as LinkIcon, Database, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import AvatarCustomizer from './AvatarCustomizer';
import { auth } from '../lib/firebase.ts';
import { 
  googleSignInForSheets, 
  googleSignOutForSheets, 
  getSheetsAccessToken, 
  createWargaSpreadsheet, 
  exportReportsToSheets, 
  exportWargaToSheets, 
  importAnnouncementsFromSheets,
  ensureAnnouncementSheetExists
} from '../lib/google-sheets.ts';

interface AdminPanelProps {
  currentUser: User;
  setCurrentUser?: React.Dispatch<React.SetStateAction<User | null>>;
  reports: Report[];
  setReports: React.Dispatch<React.SetStateAction<Report[]>>;
  announcements: Announcement[];
  setAnnouncements: React.Dispatch<React.SetStateAction<Announcement[]>>;
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  usersList: User[];
  setUsersList?: React.Dispatch<React.SetStateAction<User[]>>;
  rwTitle?: string;
  setRwTitle?: (title: string) => void;
  rwSubTitle?: string;
  setRwSubTitle?: (subtitle: string) => void;
  rwLogoUrl?: string;
  setRwLogoUrl?: (logoUrl: string) => void;
  contactAddress?: string;
  setContactAddress?: (address: string) => void;
  contactPhone?: string;
  setContactPhone?: (phone: string) => void;
  contactEmail?: string;
  setContactEmail?: (email: string) => void;
  contactHours?: string;
  setContactHours?: (hours: string) => void;
  activeAdminReportId?: string | null;
  setActiveAdminReportId?: (id: string | null) => void;
}

export default function AdminPanel({
  currentUser,
  setCurrentUser,
  reports,
  setReports,
  announcements,
  setAnnouncements,
  notifications,
  setNotifications,
  usersList,
  setUsersList,
  rwTitle = 'RW 07',
  setRwTitle,
  rwSubTitle = 'Palmeriam',
  setRwSubTitle,
  rwLogoUrl = '',
  setRwLogoUrl,
  contactAddress = 'Balai RW 07, Jl. Palmeriam Raya, Kel. Palmeriam, Kec. Matraman, RT 03/RW 07, Jakarta Timur',
  setContactAddress,
  contactPhone = '0811-2233-4455',
  setContactPhone,
  contactEmail = 'sekretariat@rw07.warga.id',
  setContactEmail,
  contactHours = 'Senin - Sabtu pukul 15:00 - 20:00 WIB',
  setContactHours,
  activeAdminReportId = null,
  setActiveAdminReportId,
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'laporan' | 'warga' | 'pengumuman' | 'pengaturan' | 'profil' | 'sheets'>('laporan');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  useEffect(() => {
    if (activeAdminReportId) {
      const foundReport = reports.find((r) => r.id === activeAdminReportId);
      if (foundReport) {
        setSelectedReport(foundReport);
        setActiveTab('laporan');
        // Clear it once handled so the same report can be clicked again if needed
        if (setActiveAdminReportId) {
          setActiveAdminReportId(null);
        }
      }
    }
  }, [activeAdminReportId, reports, setActiveAdminReportId]);

  // Google Sheets integration state
  const [spreadsheetId, setSpreadsheetId] = useState(() => localStorage.getItem('rw_google_spreadsheet_id') || '');
  const [isSheetsConnected, setIsSheetsConnected] = useState(() => !!getSheetsAccessToken());
  const [googleUserEmail, setGoogleUserEmail] = useState(() => auth.currentUser?.email || '');
  const [googleUserName, setGoogleUserName] = useState(() => auth.currentUser?.displayName || '');
  const [sheetsActionLoading, setSheetsActionLoading] = useState(false);
  const [sheetsMessage, setSheetsMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleConnectSheets = async () => {
    setSheetsActionLoading(true);
    setSheetsMessage(null);
    try {
      const result = await googleSignInForSheets();
      if (result) {
        setIsSheetsConnected(true);
        setGoogleUserEmail(result.user.email || '');
        setGoogleUserName(result.user.displayName || '');
        setSheetsMessage({ type: 'success', text: 'Koneksi ke Google Sheets berhasil didirikan!' });
      }
    } catch (err: any) {
      console.error(err);
      setSheetsMessage({ type: 'error', text: err.message || 'Gagal menyambungkan ke Google Sheets.' });
    } finally {
      setSheetsActionLoading(false);
    }
  };

  const handleDisconnectSheets = async () => {
    setSheetsActionLoading(true);
    setSheetsMessage(null);
    try {
      await googleSignOutForSheets();
      setIsSheetsConnected(false);
      setGoogleUserEmail('');
      setGoogleUserName('');
      setSheetsMessage({ type: 'success', text: 'Koneksi Google Sheets berhasil diputuskan.' });
    } catch (err: any) {
      console.error(err);
      setSheetsMessage({ type: 'error', text: 'Gagal memutuskan koneksi.' });
    } finally {
      setSheetsActionLoading(false);
    }
  };

  const handleCreateSpreadsheet = async () => {
    const token = getSheetsAccessToken();
    if (!token) {
      setSheetsMessage({ type: 'error', text: 'Silakan sambungkan akun Google Anda terlebih dahulu.' });
      return;
    }
    setSheetsActionLoading(true);
    setSheetsMessage(null);
    try {
      const newId = await createWargaSpreadsheet(token, `Portal Warga ${rwTitle} - Data & Laporan`);
      setSpreadsheetId(newId);
      localStorage.setItem('rw_google_spreadsheet_id', newId);
      setSheetsMessage({ type: 'success', text: 'Spreadsheet baru berhasil dibuat dan dihubungkan!' });
    } catch (err: any) {
      console.error(err);
      setSheetsMessage({ type: 'error', text: err.message || 'Gagal membuat spreadsheet baru.' });
    } finally {
      setSheetsActionLoading(false);
    }
  };

  const handleLinkExistingSpreadsheet = (id: string) => {
    const cleanedId = id.trim();
    setSpreadsheetId(cleanedId);
    localStorage.setItem('rw_google_spreadsheet_id', cleanedId);
    setSheetsMessage({ type: 'success', text: 'ID Spreadsheet berhasil disimpan!' });
  };

  const handleExportReports = async () => {
    const token = getSheetsAccessToken();
    if (!token) {
      setSheetsMessage({ type: 'error', text: 'Silakan sambungkan akun Google Anda terlebih dahulu.' });
      return;
    }
    if (!spreadsheetId) {
      setSheetsMessage({ type: 'error', text: 'ID Spreadsheet belum diatur. Buat spreadsheet baru atau masukkan ID yang sudah ada.' });
      return;
    }
    setSheetsActionLoading(true);
    setSheetsMessage(null);
    try {
      await exportReportsToSheets(token, spreadsheetId, reports);
      setSheetsMessage({ type: 'success', text: `Berhasil mengekspor ${reports.length} laporan aduan warga ke Google Sheets!` });
    } catch (err: any) {
      console.error(err);
      setSheetsMessage({ type: 'error', text: err.message || 'Gagal mengekspor laporan aduan.' });
    } finally {
      setSheetsActionLoading(false);
    }
  };

  const handleExportWarga = async () => {
    const token = getSheetsAccessToken();
    if (!token) {
      setSheetsMessage({ type: 'error', text: 'Silakan sambungkan akun Google Anda terlebih dahulu.' });
      return;
    }
    if (!spreadsheetId) {
      setSheetsMessage({ type: 'error', text: 'ID Spreadsheet belum diatur. Buat spreadsheet baru atau masukkan ID yang sudah ada.' });
      return;
    }
    setSheetsActionLoading(true);
    setSheetsMessage(null);
    try {
      await exportWargaToSheets(token, spreadsheetId, usersList);
      setSheetsMessage({ type: 'success', text: `Berhasil mengekspor ${usersList.length} data warga ke Google Sheets!` });
    } catch (err: any) {
      console.error(err);
      setSheetsMessage({ type: 'error', text: err.message || 'Gagal mengekspor data warga.' });
    } finally {
      setSheetsActionLoading(false);
    }
  };

  const handleImportAnnouncements = async () => {
    const token = getSheetsAccessToken();
    if (!token) {
      setSheetsMessage({ type: 'error', text: 'Silakan sambungkan akun Google Anda terlebih dahulu.' });
      return;
    }
    if (!spreadsheetId) {
      setSheetsMessage({ type: 'error', text: 'ID Spreadsheet belum diatur.' });
      return;
    }
    setSheetsActionLoading(true);
    setSheetsMessage(null);
    try {
      await ensureAnnouncementSheetExists(token, spreadsheetId);
      const imported = await importAnnouncementsFromSheets(token, spreadsheetId);
      if (imported.length === 0) {
        setSheetsMessage({ type: 'error', text: 'Tidak ada pengumuman valid yang ditemukan di tab "Pengumuman" (baris 2 ke bawah).' });
        return;
      }
      
      setAnnouncements(prev => {
        const prevMap = new Map<string, Announcement>(prev.map(a => [a.id, a]));
        imported.forEach(a => prevMap.set(a.id, a));
        return Array.from(prevMap.values()).sort((a, b) => b.id.localeCompare(a.id));
      });

      setSheetsMessage({ type: 'success', text: `Berhasil menyinkronkan ${imported.length} pengumuman dari Google Sheets ke portal warga!` });
    } catch (err: any) {
      console.error(err);
      setSheetsMessage({ type: 'error', text: err.message || 'Gagal mengimpor pengumuman. Pastikan tab "Pengumuman" sudah ada dan memiliki kolom yang sesuai.' });
    } finally {
      setSheetsActionLoading(false);
    }
  };

  // Admin Profile Form State
  const [editName, setEditName] = useState(currentUser.name);
  const [editPhone, setEditPhone] = useState(currentUser.phone);
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Handle customized/AI avatar selection for admin
  const handleAvatarSelect = (newUrl: string) => {
    if (!setCurrentUser || !setUsersList) return;
    const updatedUser = { ...currentUser, avatarUrl: newUrl };
    setCurrentUser(updatedUser);

    // Update in usersList too
    setUsersList(prev => prev.map(u => u.id === currentUser.id ? { ...u, avatarUrl: newUrl } : u));
  };

  // Handle profile form save for admin
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!setCurrentUser || !setUsersList) return;
    const updatedUser = {
      ...currentUser,
      name: editName,
      phone: editPhone
    };
    setCurrentUser(updatedUser);

    // Update in list
    setUsersList(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));

    setProfileSuccess(true);
    setTimeout(() => setProfileSuccess(false), 3000);
  };

  const handleToggleRole = (userId: string) => {
    if (!setUsersList) return;
    setUsersList((prevList) =>
      prevList.map((u) => {
        if (u.id === userId) {
          const newRole = u.role === 'admin' ? 'citizen' : 'admin';
          return { ...u, role: newRole };
        }
        return u;
      })
    );
  };
  
  // Verification input states
  const [adminNote, setAdminNote] = useState('');
  const [verificationSuccess, setVerificationSuccess] = useState(false);

  // New Announcement States
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annCategory, setAnnCategory] = useState<'Penting' | 'Informasi' | 'Kegiatan'>('Informasi');
  const [annSuccess, setAnnSuccess] = useState(false);
  const [annImageUrl, setAnnImageUrl] = useState('');

  const handleAnnFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAnnImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const [isDragOverLogo, setIsDragOverLogo] = useState(false);

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setRwLogoUrl?.(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverLogo(true);
  };

  const handleLogoDragLeave = () => {
    setIsDragOverLogo(false);
  };

  const handleLogoDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverLogo(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setRwLogoUrl?.(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Create New Warga states
  const [isCreateWargaOpen, setIsCreateWargaOpen] = useState(false);
  const [newWargaName, setNewWargaName] = useState('');
  const [newWargaEmail, setNewWargaEmail] = useState('');
  const [newWargaPassword, setNewWargaPassword] = useState('');
  const [newWargaRt, setNewWargaRt] = useState('RT 01');
  const [newWargaPhone, setNewWargaPhone] = useState('');
  const [newWargaRole, setNewWargaRole] = useState<'citizen' | 'admin'>('citizen');
  const [newWargaError, setNewWargaError] = useState('');

  const handleCreateWargaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setNewWargaError('');

    if (!newWargaName || !newWargaEmail || !newWargaPhone || !newWargaPassword) {
      setNewWargaError('Harap isi semua kolom wajib.');
      return;
    }

    if (newWargaPassword.length < 6) {
      setNewWargaError('Kata sandi minimal harus terdiri dari 6 karakter.');
      return;
    }

    const emailLower = newWargaEmail.toLowerCase().trim();
    const isDuplicate = usersList.some(u => u.email.toLowerCase() === emailLower);
    if (isDuplicate) {
      setNewWargaError('Email sudah terdaftar. Gunakan email lain.');
      return;
    }

    const newWarga: User = {
      id: `user-${Date.now()}`,
      username: emailLower.split('@')[0],
      email: emailLower,
      password: newWargaPassword,
      name: newWargaName,
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
      role: newWargaRole,
      rt: newWargaRt,
      phone: newWargaPhone
    };

    if (setUsersList) {
      setUsersList(prev => [...prev, newWarga]);
    }

    // Reset form states
    setNewWargaName('');
    setNewWargaEmail('');
    setNewWargaPassword('');
    setNewWargaRt('RT 01');
    setNewWargaPhone('');
    setNewWargaRole('citizen');
    setIsCreateWargaOpen(false);
  };

  // Admin Stats Calculations
  const stats = {
    totalWarga: usersList.filter(u => u.role === 'citizen').length,
    pendingReports: reports.filter((r) => r.status === 'pending').length,
    activeReports: reports.filter((r) => r.status === 'diproses').length,
    resolvedReports: reports.filter((r) => r.status === 'selesai').length,
  };

  // Handle report status change (Verifikasi laporan)
  const handleUpdateStatus = (status: 'diproses' | 'selesai' | 'ditolak') => {
    if (!selectedReport) return;

    // Update report
    setReports((prev) =>
      prev.map((r) =>
        r.id === selectedReport.id
          ? { ...r, status, adminNotes: adminNote || undefined }
          : r
      )
    );

    // Create instan in-app notification for the respective citizen
    const statusText = status === 'diproses' ? 'SEDANG DIPROSES' : status === 'selesai' ? 'SELESAI DITANGANI' : 'DITOLAK';
    const newNotif: Notification = {
      id: `notif-${Date.now()}`,
      userId: selectedReport.citizenId,
      title: `Update Laporan: ${statusText}`,
      message: `Laporan Anda "${selectedReport.title}" telah diverifikasi oleh Ketua RW dan statusnya diubah menjadi [${statusText}]. ${adminNote ? 'Catatan: ' + adminNote : ''}`,
      date: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      isRead: false,
      reportId: selectedReport.id
    };
    setNotifications([newNotif, ...notifications]);

    setVerificationSuccess(true);
    setAdminNote('');
    
    // Refresh modal info
    setSelectedReport(prev => prev ? { ...prev, status, adminNotes: adminNote || undefined } : null);

    setTimeout(() => {
      setVerificationSuccess(false);
      setSelectedReport(null);
    }, 1500);
  };

  // Handle adding a new announcement
  const handleAddAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle || !annContent) return;

    const newAnn: Announcement = {
      id: `ann-${Date.now()}`,
      title: annTitle,
      content: annContent,
      category: annCategory,
      date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
      author: 'Ketua RW',
      imageUrl: annImageUrl || undefined
    };

    setAnnouncements([newAnn, ...announcements]);
    setAnnSuccess(true);
    setAnnTitle('');
    setAnnContent('');
    setAnnImageUrl('');
    
    setTimeout(() => setAnnSuccess(false), 3000);
  };

  const handleSimulateIncomingReport = () => {
    const mockReportTitles = [
      "Pohon Tumbang Menghalangi Jalan Utama",
      "Pipa PDAM Bocor di Selokan",
      "Lampu Jalan Mati dan Gelap Gulita",
      "Sampah Menumpuk di Depan Gapura",
      "Kabel Listrik Menjuntai Sangat Rendah",
      "Pos Kamling Bocor Saat Hujan",
      "Semen Jalan Utama Retak Parah"
    ];
    const mockCategories: Array<"Infrastruktur" | "Kebersihan" | "Keamanan" | "Administrasi" | "Lainnya"> = ["Infrastruktur", "Keamanan", "Kebersihan", "Lainnya"];
    const mockNames = ["Rian", "Dewi", "Budi", "Siti", "Agus", "Lina"];
    const mockRts = Array.from({ length: 14 }, (_, i) => `RT ${String(i + 1).padStart(2, '0')}`);

    const randomTitle = mockReportTitles[Math.floor(Math.random() * mockReportTitles.length)];
    const randomCategory = mockCategories[Math.floor(Math.random() * mockCategories.length)];
    const randomName = mockNames[Math.floor(Math.random() * mockNames.length)];
    const randomRt = mockRts[Math.floor(Math.random() * mockRts.length)];
    
    const newReport: Report = {
      id: `rep-sim-${Date.now()}`,
      title: `${randomTitle} (${randomRt})`,
      category: randomCategory,
      description: `Disimulasikan otomatis oleh sistem untuk pengujian notifikasi real-time. Lapisan jalan dan sarana umum di sekitar ${randomRt} memerlukan pemeriksaan langsung oleh aparat setempat.`,
      rt: randomRt,
      status: 'pending',
      citizenId: `cit-sim-${Date.now()}`,
      citizenName: randomName,
      citizenAvatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 1000000)}?auto=format&fit=crop&q=80&w=150`,
      date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
      createdAt: new Date().toISOString()
    };

    setReports([newReport, ...reports]);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-16" id="admin-panel-view">
      
      {/* 1. Header with stats */}
      <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.15),transparent_40%)]" />
        <div className="flex items-center space-x-4 relative z-10">
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-2xl border border-indigo-500/20">
            <Shield className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black">Panel Administrasi {rwTitle}</h1>
            <p className="text-xs text-slate-400 mt-0.5">Pengurus aktif: <strong className="text-indigo-400">{currentUser.name}</strong></p>
            <p className="text-[10px] text-slate-500 mt-1">Sistem Terorganisir & Transparan</p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex flex-wrap gap-2 relative z-10 w-full md:w-auto">
          {[
            { id: 'laporan', label: 'Verifikasi Aduan', icon: ClipboardList },
            { id: 'warga', label: 'Manajemen Warga', icon: Users },
            { id: 'pengumuman', label: 'Tulis Pengumuman', icon: Megaphone },
            { id: 'sheets', label: 'Integrasi Sheets', icon: FileSpreadsheet },
            { id: 'pengaturan', label: 'Konfigurasi Portal', icon: Settings },
            { id: 'profil', label: 'Profil Pengurus', icon: UserIcon }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center px-4 py-2.5 text-xs font-bold rounded-xl transition-all ${
                  isActive 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' 
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Icon className="w-4 h-4 mr-1.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Admin Mini Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4" id="admin-mini-dashboard-row">
        {[
          { label: 'Warga Terdaftar', val: stats.totalWarga, icon: Users, color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-100' },
          { label: 'Aduan Pending', val: stats.pendingReports, icon: AlertCircle, color: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-100' },
          { label: 'Sedang Diproses', val: stats.activeReports, icon: Clock, color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-100' },
          { label: 'Selesai Ditangani', val: stats.resolvedReports, icon: CheckCircle, color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-100' }
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="bg-white dark:bg-slate-800 p-4 sm:p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center space-x-3 sm:space-x-4 transition-colors duration-300">
              <div className={`p-2.5 rounded-xl ${item.color.split(' ')[1]} ${item.color.split(' ')[0]}`}>
                <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-100">{item.val}</div>
                <div className="text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400">{item.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Tab Contents */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-750 p-6 sm:p-8 shadow-sm transition-colors duration-300">
        <AnimatePresence mode="wait">
          
          {/* Tab: Verify Reports (Aduan Warga) */}
          {activeTab === 'laporan' && (
            <motion.div
              key="laporan"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              className="space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-lg font-black text-slate-800 dark:text-slate-100">Verifikasi & Penanganan Aduan Warga</h2>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Tinjau, verifikasi lampiran foto bukti, dan perbarui status pengerjaan aduan warga secara berkala.</p>
                </div>
                <button
                  onClick={handleSimulateIncomingReport}
                  className="inline-flex items-center self-start sm:self-center px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40 font-bold text-xs rounded-xl transition-all shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1.5 animate-pulse text-indigo-500" />
                  Simulasikan Aduan Masuk
                </button>
              </div>

              {reports.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 dark:bg-slate-900/30 border border-dashed border-slate-200 dark:border-slate-700 rounded-2xl">
                  <ClipboardList className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                  <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">Belum Ada Aduan Masuk</h3>
                </div>
              ) : (
                <div className="overflow-x-auto" id="admin-reports-verifications-table">
                  <table className="w-full text-left border-collapse text-xs sm:text-sm">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-700 text-slate-400 dark:text-slate-500 font-extrabold uppercase text-[10px] tracking-wider">
                        <th className="py-3 px-4">Pelapor / RT</th>
                        <th className="py-3 px-4">Judul Masalah</th>
                        <th className="py-3 px-4">Tanggal</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                      {reports.map((rep) => (
                        <tr key={rep.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-2.5">
                              <img src={rep.citizenAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'} alt={rep.citizenName} className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700" />
                              <div>
                                <div className="font-bold text-slate-800 dark:text-slate-100 leading-tight">{rep.citizenName}</div>
                                <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">{rep.rt}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="max-w-xs font-semibold text-slate-800 dark:text-slate-100 line-clamp-1">{rep.title}</div>
                            <div className="text-[10px] text-slate-400 dark:text-slate-500 font-medium line-clamp-1">{rep.category} • {rep.description}</div>
                          </td>
                          <td className="py-4 px-4 text-slate-500 dark:text-slate-400 font-medium">{rep.date}</td>
                          <td className="py-4 px-4">
                            <span className={`inline-block text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                              rep.status === 'pending' ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/40' :
                              rep.status === 'diproses' ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/40' :
                              'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40'
                            }`}>
                              {rep.status}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <button
                              onClick={() => setSelectedReport(rep)}
                              className="inline-flex items-center px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400 font-bold text-xs rounded-lg transition-all"
                            >
                              <Eye className="w-3.5 h-3.5 mr-1" />
                              Detail
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          )}

          {/* Tab: Citizens list directory (Manajemen Warga) */}
          {activeTab === 'warga' && (
            <motion.div
              key="warga"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              className="space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-lg font-black text-slate-800 dark:text-slate-100">Direktori & Manajemen Akun Warga</h2>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Daftar warga {rwTitle} terdaftar dalam sistem informasi digital portal.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCreateWargaOpen(true)}
                  className="inline-flex items-center justify-center px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer space-x-1.5 self-start sm:self-auto"
                >
                  <Users className="w-4 h-4" />
                  <span>Tambah Warga Baru</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" id="admin-citizens-cards-grid">
                {usersList.map((user) => (
                  <div
                    key={user.id}
                    className="p-5 rounded-2xl border border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 shadow-sm flex items-center space-x-4 hover:border-slate-200 dark:hover:border-slate-600 transition-all duration-250"
                  >
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-indigo-100 dark:border-slate-700"
                    />
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div>
                        <div className="flex items-start justify-between gap-1.5">
                          <h4 className="font-bold text-slate-800 dark:text-slate-100 text-xs sm:text-sm leading-tight truncate">{user.name}</h4>
                          <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded shrink-0 leading-none ${
                            user.role === 'admin'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200/30'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          }`}>
                            {user.role}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold truncate mt-0.5">{user.email}</p>
                      </div>
                      
                      <div className="flex items-center justify-between gap-1 text-[10px] font-bold">
                        <div className="flex items-center space-x-1.5 shrink-0">
                          <span className="text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-full">{user.rt}</span>
                          <span className="text-slate-400 dark:text-slate-500 text-[9px]">{user.phone}</span>
                        </div>
                        {setUsersList && (
                          <button
                            type="button"
                            onClick={() => handleToggleRole(user.id)}
                            disabled={user.id === currentUser.id}
                            className={`px-2 py-1 text-[9px] font-extrabold rounded-lg transition-all ${
                              user.id === currentUser.id
                                ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                                : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/40 dark:text-indigo-300 border border-indigo-100/30 dark:border-indigo-900/30'
                            }`}
                            title={user.id === currentUser.id ? "Tidak dapat mengubah role Anda sendiri" : `Ubah role ${user.name}`}
                          >
                            Ubah Role
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Tab: Post Announcements */}
          {activeTab === 'pengumuman' && (
            <motion.div
              key="pengumuman"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              {/* Form - 7 cols */}
              <div className="lg:col-span-7 space-y-4">
                <div>
                  <h2 className="text-lg font-black text-slate-800 dark:text-slate-100">Tulis Pengumuman Baru</h2>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Posting info penting, gotong royong, atau himbauan langsung ke halaman Beranda portal.</p>
                </div>

                <form onSubmit={handleAddAnnouncement} className="space-y-4" id="post-announcement-form">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Judul Pengumuman</label>
                    <input
                      type="text"
                      required
                      value={annTitle}
                      onChange={(e) => setAnnTitle(e.target.value)}
                      placeholder="Contoh: Jadwal Penyemprotan Fogging Demam Berdarah"
                      className="w-full text-sm px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Kategori Pengumuman</label>
                    <select
                      value={annCategory}
                      onChange={(e) => setAnnCategory(e.target.value as any)}
                      className="w-full text-sm px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    >
                      <option value="Informasi">Informasi Umum</option>
                      <option value="Penting">PENTING (Darurat)</option>
                      <option value="Kegiatan">Agenda / Kegiatan Warga</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Isi Detail Pengumuman</label>
                    <textarea
                      required
                      rows={5}
                      value={annContent}
                      onChange={(e) => setAnnContent(e.target.value)}
                      placeholder="Tuliskan isi detail pengumuman secara padat dan jelas agar warga mudah memahaminya..."
                      className="w-full text-sm px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Unggah Gambar Pendukung Pengumuman (Opsional)</label>
                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-200 dark:border-slate-700 border-dashed rounded-lg cursor-pointer bg-slate-50/50 dark:bg-slate-900/30 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-6 h-6 mb-2 text-slate-400 dark:text-slate-500" />
                          <p className="mb-1 text-xs text-slate-500 dark:text-slate-400 font-medium text-center px-4">
                            <span className="font-semibold text-indigo-600 dark:text-indigo-400">Klik untuk unggah</span> atau seret gambar ke sini
                          </p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500">PNG, JPG, JPEG atau GIF (Maks. 5MB)</p>
                        </div>
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleAnnFileChange} 
                          className="hidden" 
                        />
                      </label>
                    </div>
                  </div>

                  {annImageUrl && (
                    <div className="aspect-video w-full max-h-48 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 relative">
                      <img src={annImageUrl} alt="Preview Pengumuman" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setAnnImageUrl('')}
                        className="absolute top-2 right-2 bg-rose-600 text-white p-1 rounded-full hover:bg-rose-700 transition-colors shadow-md"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg dark:shadow-none flex items-center transition-all"
                  >
                    <Send className="w-4 h-4 mr-1.5" />
                    Publikasikan Pengumuman
                  </button>

                  <AnimatePresence>
                    {annSuccess && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 p-3 rounded-lg border border-emerald-100 dark:border-emerald-900/40 text-xs flex items-center"
                        id="announcement-save-success-banner"
                      >
                        <CheckCircle className="w-4 h-4 mr-1.5 shrink-0" />
                        Pengumuman berhasil diposting ke Beranda!
                      </motion.div>
                    )}
                  </AnimatePresence>
                </form>
              </div>

              {/* Tips column - 5 cols */}
              <div className="lg:col-span-5 bg-slate-50 dark:bg-slate-900/40 p-6 rounded-2xl border border-slate-100 dark:border-slate-750 space-y-4">
                <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center">
                  <UserCheck className="w-4 h-4 mr-1.5 text-indigo-600 dark:text-indigo-400" />
                  Tips Penulisan Himbauan
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  1. Gunakan bahasa Indonesia yang santun, humble, dan mudah dimengerti warga lansia maupun milenial.<br /><br />
                  2. Selalu sebutkan Waktu (Hari, Tanggal, Jam) dan Lokasi secara detail jika mengumumkan agenda kegiatan.<br /><br />
                  3. Jika bersifat darurat (Penting), gunakan opsi kategori "PENTING" agar mendapat penanda khusus berwarna merah mencolok di Beranda.
                </p>
              </div>
            </motion.div>
          )}

          {/* Tab: Settings (Konfigurasi Portal) */}
          {activeTab === 'pengaturan' && (
            <motion.div
              key="pengaturan"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left"
            >
              {/* Form - 7 cols */}
              <div className="lg:col-span-7 space-y-6">
                <div>
                  <h2 className="text-lg font-black text-slate-800 dark:text-slate-100">Konfigurasi Identitas Portal RW</h2>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Kustomisasi judul Rukun Warga (RW), kelurahan, dan logo gambar utama portal secara instan.</p>
                </div>

                <div className="space-y-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Judul Nama RW</label>
                    <input
                      type="text"
                      required
                      value={rwTitle}
                      onChange={(e) => setRwTitle?.(e.target.value)}
                      placeholder="Contoh: RW 07"
                      className="w-full text-sm px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Sub-Judul Wilayah / Desa / Kelurahan</label>
                    <input
                      type="text"
                      required
                      value={rwSubTitle}
                      onChange={(e) => setRwSubTitle?.(e.target.value)}
                      placeholder="Contoh: Mekar Wangi"
                      className="w-full text-sm px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Logo Portal / Navbar RW</label>
                    
                    {/* Upload Box with drag & drop */}
                    <div 
                      onDragOver={handleLogoDragOver}
                      onDragLeave={handleLogoDragLeave}
                      onDrop={handleLogoDrop}
                      className={`flex flex-col items-center justify-center w-full p-4 border-2 border-dashed rounded-xl transition-all ${
                        isDragOverLogo 
                          ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20' 
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-slate-50/50 dark:bg-slate-900/30'
                      }`}
                    >
                      <div className="flex items-center space-x-3 w-full">
                        {/* Preview */}
                        <div className="w-12 h-12 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                          {rwLogoUrl ? (
                            <img src={rwLogoUrl} alt="Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <Shield className="w-6 h-6 text-indigo-500" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1 text-left">
                          <label className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors shadow-xs">
                            <Upload className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                            <span>Pilih File</span>
                            <input 
                              type="file" 
                              accept="image/*" 
                              onChange={handleLogoFileChange} 
                              className="hidden" 
                            />
                          </label>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                            Seret gambar logo ke sini atau klik tombol pilih. PNG, JPG (Maks. 2MB).
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Alternative URL Input */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Atau Alamat URL Logo</span>
                        {rwLogoUrl && (
                          <button 
                            type="button" 
                            onClick={() => setRwLogoUrl?.('')}
                            className="text-[10px] text-rose-500 font-bold hover:underline"
                          >
                            Hapus Logo
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        value={rwLogoUrl}
                        onChange={(e) => setRwLogoUrl?.(e.target.value)}
                        placeholder="Contoh: https://images.unsplash.com/photo-1595878715977-2e84ba47e35b?auto=format"
                        className="w-full text-sm px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">Kosongkan untuk menggunakan logo default Shield.</p>
                    </div>
                  </div>

                  {/* Quick Preset Buttons for testing logo replacement */}
                  <div className="pt-2">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Preset Logo Uji Coba:</span>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { name: 'Merah Putih', url: 'https://images.unsplash.com/photo-1595878715977-2e84ba47e35b?auto=format&fit=crop&q=80&w=150' },
                        { name: 'Garuda Shield', url: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&q=80&w=150' },
                        { name: 'Logo Komunitas', url: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=150' },
                      ].map((preset) => (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => setRwLogoUrl?.(preset.url)}
                          className="px-2.5 py-1 text-[10px] font-semibold border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
                        >
                          {preset.name}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => setRwLogoUrl?.('')}
                        className="px-2.5 py-1 text-[10px] font-semibold border border-rose-200 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 rounded hover:bg-rose-100 dark:hover:bg-rose-900 transition-all"
                      >
                        Reset Logo
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <h2 className="text-lg font-black text-slate-800 dark:text-slate-100">Konfigurasi Kontak & Sekretariat RW</h2>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Kustomisasi alamat fisik sekretariat, nomor handphone WhatsApp, email resmi, dan jam layanan warga secara instan.</p>
                </div>

                <div className="space-y-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm mt-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Alamat Sekretariat</label>
                    <textarea
                      rows={2}
                      required
                      value={contactAddress}
                      onChange={(e) => setContactAddress?.(e.target.value)}
                      placeholder="Contoh: Balai RW 07, Jl. Palmeriam Raya, Kel. Palmeriam, RT 03/RW 07, Jakarta Timur"
                      className="w-full text-sm px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">No. HP / WhatsApp Hotline</label>
                      <input
                        type="text"
                        required
                        value={contactPhone}
                        onChange={(e) => setContactPhone?.(e.target.value)}
                        placeholder="Contoh: 0811-2233-4455"
                        className="w-full text-sm px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Email Resmi RW</label>
                      <input
                        type="email"
                        required
                        value={contactEmail}
                        onChange={(e) => setContactEmail?.(e.target.value)}
                        placeholder="Contoh: sekretariat@rw05.warga.id"
                        className="w-full text-sm px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Jam Operasional / Jam Kerja</label>
                    <input
                      type="text"
                      required
                      value={contactHours}
                      onChange={(e) => setContactHours?.(e.target.value)}
                      placeholder="Contoh: Senin - Sabtu pukul 15:00 - 20:00 WIB"
                      className="w-full text-sm px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>
              </div>

              {/* Preview - 5 cols */}
              <div className="lg:col-span-5 space-y-4">
                <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center">
                  <Shield className="w-4 h-4 mr-1.5 text-indigo-600 dark:text-indigo-400" />
                  Pratinjau Navigasi Portal
                </h4>
                
                <div className="p-6 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-150 dark:border-slate-800 space-y-4">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Tampilan Header/Navbar Baru:</p>
                  
                  <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-850 flex items-center shadow-sm">
                    <div className="relative mr-2.5 flex items-center">
                      <div className="absolute inset-0 bg-indigo-500/20 rounded-xl blur-sm" />
                      <div className="relative bg-gradient-to-tr from-indigo-600 to-violet-600 p-2 rounded-xl text-white font-bold shadow-md flex items-center justify-center border border-indigo-400/20">
                        {rwLogoUrl ? (
                          <img src={rwLogoUrl} alt="Logo" className="w-5 h-5 rounded object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <Shield className="w-5 h-5 text-white" />
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col text-left">
                      <div className="flex items-center">
                        <span className="font-black text-xs sm:text-sm tracking-tight text-slate-800 dark:text-slate-100 leading-none">PORTAL</span>
                        <span className="text-indigo-600 font-black text-xs sm:text-sm ml-1 leading-none">{rwTitle}</span>
                      </div>
                      <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase mt-0.5 leading-none">{rwSubTitle}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed pt-2 text-left">
                    Setiap perubahan yang Anda lakukan di formulir sebelah kiri akan langsung disimpan dan merubah identitas portal di seluruh halaman secara real-time.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Tab: Profile Settings (Admin) */}
          {activeTab === 'profil' && (
            <motion.div
              key="profil"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-lg font-black text-slate-800 dark:text-slate-100">Profil & Data Pengurus</h2>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Kelola data profil personal Anda sebagai pengurus aktif di {rwTitle}.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Side: Info Form - 6 cols */}
                <div className="lg:col-span-6 space-y-4">
                  <form onSubmit={handleSaveProfile} className="space-y-4 text-left" id="save-admin-profile-form">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Lengkap Pengurus</label>
                        <input
                          type="text"
                          required
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full text-sm px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Nomor Handphone (WhatsApp)</label>
                        <input
                          type="text"
                          required
                          value={editPhone}
                          onChange={(e) => setEditPhone(e.target.value)}
                          className="w-full text-sm px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Role / Sektor</label>
                        <input
                          type="text"
                          disabled
                          value={`Administrator ${rwTitle}`}
                          className="w-full text-sm px-4 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-400 dark:text-slate-500 cursor-not-allowed rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Surel (Email)</label>
                        <input
                          type="email"
                          disabled
                          value={currentUser.email}
                          className="w-full text-sm px-4 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-400 dark:text-slate-500 cursor-not-allowed rounded-lg"
                        />
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-all shadow-md dark:shadow-none"
                      >
                        Simpan Perubahan
                      </button>
                    </div>

                    <AnimatePresence>
                      {profileSuccess && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 p-3 rounded-lg border border-emerald-100 dark:border-emerald-900/40 text-xs flex items-center"
                        >
                          <Check className="w-4 h-4 mr-1.5 shrink-0 text-emerald-500" />
                          Profil pengurus berhasil diperbaharui!
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </form>
                </div>

                {/* Right Side: Avatar Customizer - 6 cols */}
                <div className="lg:col-span-6">
                  <AvatarCustomizer
                    currentAvatarUrl={currentUser.avatarUrl}
                    onAvatarSelect={handleAvatarSelect}
                    userName={currentUser.name}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Tab: Google Sheets Integration */}
          {activeTab === 'sheets' && (
            <motion.div
              key="sheets"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              className="space-y-8 text-left"
            >
              <div>
                <h2 className="text-lg font-black text-slate-800 dark:text-slate-100 flex items-center">
                  <FileSpreadsheet className="w-5 h-5 mr-2 text-emerald-600 dark:text-emerald-400" />
                  Integrasi Google Sheets & Sinkronisasi Data
                </h2>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                  Sambungkan portal warga Anda dengan Google Drive untuk mengekspor laporan warga, mengekspor daftar warga, serta mengimpor pengumuman secara real-time.
                </p>
              </div>

              {/* Status Banner / Alert Messages */}
              <AnimatePresence>
                {sheetsMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`p-4 rounded-2xl text-xs flex items-start gap-2.5 border ${
                      sheetsMessage.type === 'success'
                        ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/40'
                        : 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border-rose-100 dark:border-rose-900/40'
                    }`}
                  >
                    {sheetsMessage.type === 'success' ? (
                      <CheckCircle className="w-4.5 h-4.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4.5 h-4.5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="font-bold">{sheetsMessage.type === 'success' ? 'Berhasil!' : 'Gagal!'}</p>
                      <p className="mt-0.5 leading-relaxed">{sheetsMessage.text}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left Side: Authentication Status & Settings (7 Columns) */}
                <div className="lg:col-span-7 space-y-6">
                  
                  {/* Card 1: Connection Status */}
                  <div className="p-6 bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-3xl space-y-4">
                    <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[11px]">
                      1. Status Koneksi Akun Google
                    </h3>

                    {!isSheetsConnected ? (
                      <div className="space-y-4">
                        <div className="p-4 bg-amber-50/50 dark:bg-amber-950/10 rounded-2xl border border-amber-100/60 dark:border-amber-900/20 text-xs text-slate-600 dark:text-slate-400 leading-relaxed text-left">
                          Hubungkan akun Google Anda untuk memberikan hak akses pengelolaan Spreadsheet yang dibutuhkan oleh aplikasi ini. Seluruh data tetap aman.
                        </div>

                        <button
                          onClick={handleConnectSheets}
                          disabled={sheetsActionLoading}
                          className="gsi-material-button flex items-center justify-center w-full py-3 px-4 bg-white hover:bg-slate-50 dark:bg-slate-850 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-250 font-semibold text-xs rounded-2xl shadow-sm transition-all cursor-pointer hover:shadow"
                        >
                          <div className="gsi-material-button-content-wrapper flex items-center justify-center space-x-2">
                            <div className="gsi-material-button-icon w-5 h-5">
                              <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: 'block' }}>
                                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                              </svg>
                            </div>
                            <span className="gsi-material-button-contents font-bold">
                              {sheetsActionLoading ? 'Menyambungkan...' : 'Hubungkan Akun Google'}
                            </span>
                          </div>
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="p-4 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-2xl border border-emerald-500/20 dark:border-emerald-500/30 flex items-center justify-between gap-4">
                          <div className="flex items-center space-x-3 text-left">
                            <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                              <CheckCircle className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-xs font-black text-slate-800 dark:text-slate-100">
                                {googleUserName || 'Akun Google Terhubung'}
                              </p>
                              <p className="text-[10px] text-slate-400 font-semibold">{googleUserEmail || 'Email Aktif'}</p>
                            </div>
                          </div>
                          
                          <button
                            onClick={handleDisconnectSheets}
                            className="text-[10px] font-bold text-rose-600 hover:text-rose-500 bg-rose-50 dark:bg-rose-950/30 px-3 py-1.5 rounded-xl border border-rose-100 dark:border-rose-900/30 transition-all"
                          >
                            Putuskan
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card 2: Spreadsheet Setup */}
                  {isSheetsConnected && (
                    <div className="p-6 bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-3xl space-y-4">
                      <h3 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[11px]">
                        2. Tentukan Berkas Google Spreadsheet
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        
                        {/* Option A: Create New */}
                        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl flex flex-col justify-between space-y-3">
                          <div>
                            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">Buat Baru Otomatis</h4>
                            <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                              Buat otomatis berkas spreadsheet di Google Drive Anda dengan templat tab "Laporan Aduan", "Daftar Warga", dan "Pengumuman".
                            </p>
                          </div>
                          <button
                            onClick={handleCreateSpreadsheet}
                            disabled={sheetsActionLoading}
                            className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow transition-all flex items-center justify-center"
                          >
                            {sheetsActionLoading ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1.5" />
                            ) : (
                              <Database className="w-3.5 h-3.5 mr-1.5" />
                            )}
                            Buat Spreadsheet Baru
                          </button>
                        </div>

                        {/* Option B: Link Existing */}
                        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl flex flex-col justify-between space-y-3">
                          <div>
                            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">Hubungkan ID Spreadsheet Lama</h4>
                            <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                              Gunakan Google Spreadsheet yang sudah ada di Drive Anda dengan menyalin ID unik dokumen tersebut.
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              id="spreadsheet-id-input"
                              placeholder="Masukkan ID Spreadsheet..."
                              defaultValue={spreadsheetId}
                              className="flex-1 text-xs px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 rounded-lg focus:outline-none"
                            />
                            <button
                              onClick={() => {
                                const val = (document.getElementById('spreadsheet-id-input') as HTMLInputElement)?.value;
                                if (val) handleLinkExistingSpreadsheet(val);
                              }}
                              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[10px] font-bold rounded-lg transition-all"
                            >
                              Hubungkan
                            </button>
                          </div>
                        </div>

                      </div>

                      {spreadsheetId && (
                        <div className="p-3 bg-indigo-50 dark:bg-indigo-950/20 rounded-xl border border-indigo-100 dark:border-indigo-900/40 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
                          <div className="flex items-center space-x-2 min-w-0">
                            <Database className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                            <div className="truncate">
                              <p className="font-extrabold text-indigo-900 dark:text-indigo-300 uppercase text-[9px] tracking-wider leading-none">Linked Spreadsheet ID</p>
                              <p className="text-[10px] text-indigo-700 dark:text-indigo-400 truncate mt-1 font-mono">{spreadsheetId}</p>
                            </div>
                          </div>

                          <a
                            href={`https://docs.google.com/spreadsheets/d/${spreadsheetId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold rounded-lg flex items-center justify-center shrink-0 shadow-sm transition-all"
                          >
                            <ExternalLink className="w-3.5 h-3.5 mr-1" />
                            Buka di Google Sheets
                          </a>
                        </div>
                      )}

                    </div>
                  )}

                </div>

                {/* Right Side: Synchronization Control Bento Cards (5 Columns) */}
                <div className="lg:col-span-5 space-y-4">
                  <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center">
                    <RefreshCw className="w-4 h-4 mr-1.5 text-indigo-600 dark:text-indigo-400" />
                    Bento Sinkronisasi Data
                  </h4>

                  {!isSheetsConnected || !spreadsheetId ? (
                    <div className="p-6 bg-slate-100/50 dark:bg-slate-900/20 rounded-3xl border border-slate-150 dark:border-slate-800 text-center text-xs text-slate-400 dark:text-slate-500 leading-relaxed py-12">
                      <FileSpreadsheet className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                      Silakan hubungkan akun Google dan tentukan berkas Google Spreadsheet terlebih dahulu untuk mengaktifkan sinkronisasi data.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      
                      {/* Sync Card 1: Export Reports */}
                      <div className="p-5 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl text-left space-y-2.5">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">Ekspor Laporan Aduan Warga</h4>
                            <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">
                              Ekspor dan perbarui seluruh {reports.length} laporan warga ke lembar <strong>"Laporan Aduan"</strong>.
                            </p>
                          </div>
                          <span className="p-1.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-lg shrink-0">
                            <Download className="w-4 h-4" />
                          </span>
                        </div>
                        <button
                          onClick={handleExportReports}
                          disabled={sheetsActionLoading}
                          className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-extrabold rounded-lg transition-all"
                        >
                          {sheetsActionLoading ? 'Menyinkronkan...' : 'Sinkronkan Laporan Sekarang'}
                        </button>
                      </div>

                      {/* Sync Card 2: Export Citizens list */}
                      <div className="p-5 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl text-left space-y-2.5">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">Ekspor Daftar Warga</h4>
                            <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">
                              Ekspor dan perbarui seluruh {usersList.length} profil warga terdaftar ke lembar <strong>"Daftar Warga"</strong>.
                            </p>
                          </div>
                          <span className="p-1.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-lg shrink-0">
                            <Download className="w-4 h-4" />
                          </span>
                        </div>
                        <button
                          onClick={handleExportWarga}
                          disabled={sheetsActionLoading}
                          className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-extrabold rounded-lg transition-all"
                        >
                          {sheetsActionLoading ? 'Menyinkronkan...' : 'Sinkronkan Warga Sekarang'}
                        </button>
                      </div>

                      {/* Sync Card 3: Import Announcements */}
                      <div className="p-5 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl text-left space-y-2.5">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">Impor Pengumuman dari Google Sheets</h4>
                            <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">
                              Ambil pengumuman yang ditulis di lembar <strong>"Pengumuman"</strong> untuk dipublikasikan langsung ke Portal Warga.
                            </p>
                          </div>
                          <span className="p-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-lg shrink-0">
                            <Upload className="w-4 h-4" />
                          </span>
                        </div>
                        
                        <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-850 text-[9px] text-slate-500 dark:text-slate-400 leading-relaxed space-y-1">
                          <p className="font-extrabold text-slate-700 dark:text-slate-300">Format Kolom Tab "Pengumuman":</p>
                          <p>B: Judul | C: Detail Pengumuman | D: Kategori (Penting / Informasi / Kegiatan) | E: Penulis | F: Tanggal</p>
                        </div>

                        <button
                          onClick={handleImportAnnouncements}
                          disabled={sheetsActionLoading}
                          className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-extrabold rounded-lg transition-all"
                        >
                          {sheetsActionLoading ? 'Mengimpor...' : 'Impor & Publikasikan Pengumuman'}
                        </button>
                      </div>

                    </div>
                  )}

                </div>

              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* 4. Report Details & Verification Dialog / Modal */}
      <AnimatePresence>
        {selectedReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedReport(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-slate-800 rounded-2xl p-6 sm:p-8 max-w-xl w-full shadow-2xl relative z-10 border border-slate-100 dark:border-slate-700 max-h-[90vh] overflow-y-auto space-y-6"
            >
              <button
                onClick={() => setSelectedReport(null)}
                className="absolute top-4 right-4 p-1 rounded-full text-slate-400 hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-1">
                <span className={`inline-block text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                  selectedReport.status === 'pending' ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/40' :
                  selectedReport.status === 'diproses' ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/40' :
                  'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40'
                }`}>
                  Laporan: {selectedReport.status}
                </span>
                <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 leading-tight">{selectedReport.title}</h3>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase">ID Laporan: {selectedReport.id}</p>
              </div>

              {/* Details and Photo proof */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-900/40 p-3 rounded-xl text-xs font-semibold">
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 block text-[9px] uppercase">Sektor Lokasi</span>
                    <span className="text-slate-800 dark:text-slate-200">{selectedReport.rt}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 block text-[9px] uppercase">Tanggal Lapor</span>
                    <span className="text-slate-800 dark:text-slate-200">{selectedReport.date}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50/50 dark:bg-slate-900/20 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                  {selectedReport.description}
                </p>

                {selectedReport.imageUrl && (
                  <div className="aspect-video w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-100 dark:border-slate-700">
                    <img src={selectedReport.imageUrl} alt="Bukti Penunjang" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {/* Reporter citizen summary */}
              <div className="flex items-center space-x-2 border-t border-b border-slate-100 dark:border-slate-700 py-3">
                <img src={selectedReport.citizenAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'} alt={selectedReport.citizenName} className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-750" />
                <div className="text-xs">
                  <div className="font-bold text-slate-800 dark:text-slate-100">{selectedReport.citizenName}</div>
                  <div className="text-[10px] text-slate-400 dark:text-slate-500">Kontak Warga Pelapor</div>
                </div>
              </div>

              {/* Status Update Interactive actions */}
              <div className="space-y-3" id="admin-report-actions-box">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Catatan / Tanggapan Tambahan (Ditampilkan ke Warga)</label>
                  <textarea
                    rows={2}
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    placeholder="Contoh: Petugas teknisi sedang dikirim sore ini..."
                    className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div className="flex flex-wrap gap-2 justify-end pt-2">
                  <button
                    onClick={() => handleUpdateStatus('ditolak')}
                    className="px-3.5 py-1.5 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-700 dark:text-rose-400 text-xs font-extrabold rounded-lg transition-all"
                  >
                    Tolak Laporan
                  </button>
                  <button
                    onClick={() => handleUpdateStatus('diproses')}
                    className="px-3.5 py-1.5 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/40 text-amber-700 dark:text-amber-400 text-xs font-extrabold rounded-lg transition-all"
                  >
                    Tandai Sedang Diproses
                  </button>
                  <button
                    onClick={() => handleUpdateStatus('selesai')}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold rounded-lg shadow-md dark:shadow-none transition-all"
                  >
                    Selesaikan Aduan
                  </button>
                </div>

                <AnimatePresence>
                  {verificationSuccess && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 p-3 rounded-lg border border-emerald-100 dark:border-emerald-900/40 text-xs text-center"
                    >
                      Status aduan warga berhasil diperbarui & notifikasi terkirim!
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Tambah Warga Baru Dialog / Modal */}
      <AnimatePresence>
        {isCreateWargaOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreateWargaOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-slate-800 rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative z-10 border border-slate-100 dark:border-slate-700 max-h-[90vh] overflow-y-auto space-y-6"
            >
              <button
                type="button"
                onClick={() => setIsCreateWargaOpen(false)}
                className="absolute top-4 right-4 p-1 rounded-full text-slate-400 hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-800 dark:text-slate-100">
                  Daftarkan Warga Baru
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  Masukkan data warga di bawah ini secara lengkap untuk membuat akun resmi sistem warga.
                </p>
              </div>

              <form onSubmit={handleCreateWargaSubmit} className="space-y-4">
                {newWargaError && (
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 text-xs font-semibold rounded-xl text-center">
                    {newWargaError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Nama Lengkap <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newWargaName}
                    onChange={(e) => setNewWargaName(e.target.value)}
                    placeholder="Contoh: Budi Santoso"
                    className="w-full text-sm px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Email Warga <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={newWargaEmail}
                      onChange={(e) => setNewWargaEmail(e.target.value)}
                      placeholder="warga@email.com"
                      className="w-full text-sm px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Kata Sandi <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      value={newWargaPassword}
                      onChange={(e) => setNewWargaPassword(e.target.value)}
                      placeholder="Min. 6 karakter"
                      className="w-full text-sm px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      No. HP / WhatsApp <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={newWargaPhone}
                      onChange={(e) => setNewWargaPhone(e.target.value)}
                      placeholder="Contoh: 0812-3456-7890"
                      className="w-full text-sm px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Wilayah Rukun Tetangga (RT) <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={newWargaRt}
                      onChange={(e) => setNewWargaRt(e.target.value)}
                      className="w-full text-sm px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    >
                      {Array.from({ length: 14 }, (_, i) => {
                        const num = String(i + 1).padStart(2, '0');
                        return (
                          <option key={num} value={`RT ${num}`}>
                            RT {num}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Tingkat Akses / Role <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setNewWargaRole('citizen')}
                      className={`py-2.5 px-4 text-xs font-bold rounded-xl transition-all border ${
                        newWargaRole === 'citizen'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50'
                          : 'bg-white text-slate-500 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-850'
                      }`}
                    >
                      Warga (Citizen)
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewWargaRole('admin')}
                      className={`py-2.5 px-4 text-xs font-bold rounded-xl transition-all border ${
                        newWargaRole === 'admin'
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/30 dark:text-indigo-400 dark:border-indigo-900/50'
                          : 'bg-white text-slate-500 border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-850'
                      }`}
                    >
                      Admin (Pengurus RW)
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => setIsCreateWargaOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-750 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold rounded-xl shadow-lg transition-all"
                  >
                    Simpan Akun Warga
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
