import React, { useState } from 'react';
import { User, Report, Notification } from '../types';
import { User as UserIcon, Camera, Plus, ClipboardList, Send, X, AlertCircle, MapPin, Tag, CheckCircle, Clock, Bell, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import AvatarCustomizer from './AvatarCustomizer';

interface CitizenPortalProps {
  currentUser: User;
  setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
  reports: Report[];
  setReports: React.Dispatch<React.SetStateAction<Report[]>>;
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  usersList: User[];
  setUsersList: React.Dispatch<React.SetStateAction<User[]>>;
  rwTitle?: string;
}

export default function CitizenPortal({
  currentUser,
  setCurrentUser,
  reports,
  setReports,
  notifications,
  setNotifications,
  usersList,
  setUsersList,
  rwTitle = 'RW 07',
}: CitizenPortalProps) {
  const [activeTab, setActiveTab] = useState<'profil' | 'lapor' | 'riwayat'>('profil');
  
  // Profile Form State
  const [editName, setEditName] = useState(currentUser.name);
  const [editPhone, setEditPhone] = useState(currentUser.phone);
  const [editRt, setEditRt] = useState(currentUser.rt);
  const [profileSuccess, setProfileSuccess] = useState(false);

  // New Complaint State
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'Keamanan' | 'Infrastruktur' | 'Kebersihan' | 'Administrasi' | 'Lainnya'>('Kebersihan');
  const [newDesc, setNewDesc] = useState('');
  const [newRt, setNewRt] = useState(currentUser.rt);
  const [newImage, setNewImage] = useState('');
  const [complaintSuccess, setComplaintSuccess] = useState(false);

  // Filter citizen-specific reports
  const myReports = reports.filter((r) => r.citizenId === currentUser.id);

  // Filter citizen-specific notifications
  const myNotifications = notifications.filter((n) => n.userId === currentUser.id);

  // Handle Profile Photo Upload
  const handleProfilePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Str = reader.result as string;
        
        // Update active user state
        const updatedUser = { ...currentUser, avatarUrl: base64Str };
        setCurrentUser(updatedUser);

        // Update in usersList too
        setUsersList(prev => prev.map(u => u.id === currentUser.id ? { ...u, avatarUrl: base64Str } : u));
        
        // Update all citizen records in active reports
        setReports(prev => prev.map(r => r.citizenId === currentUser.id ? { ...r, citizenAvatar: base64Str } : r));

        setProfileSuccess(true);
        setTimeout(() => setProfileSuccess(false), 3000);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle customized/AI avatar selection
  const handleAvatarSelect = (newUrl: string) => {
    const updatedUser = { ...currentUser, avatarUrl: newUrl };
    setCurrentUser(updatedUser);

    // Update in usersList too
    setUsersList(prev => prev.map(u => u.id === currentUser.id ? { ...u, avatarUrl: newUrl } : u));
    
    // Update all citizen records in active reports
    setReports(prev => prev.map(r => r.citizenId === currentUser.id ? { ...r, citizenAvatar: newUrl } : r));
  };

  // Handle profile form save
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedUser = {
      ...currentUser,
      name: editName,
      phone: editPhone,
      rt: editRt
    };
    setCurrentUser(updatedUser);

    // Update in list
    setUsersList(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));

    // Update in all active reports
    setReports(prev => prev.map(r => r.citizenId === currentUser.id ? { ...r, citizenName: editName } : r));

    setProfileSuccess(true);
    setTimeout(() => setProfileSuccess(false), 3000);
  };

  // Handle supporting photo file selection for complaints
  const handleComplaintFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle submitting a new complaint
  const handleAddComplaint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDesc) return;

    const newReport: Report = {
      id: `rep-${Date.now()}`,
      title: newTitle,
      category: newCategory,
      description: newDesc,
      rt: newRt,
      status: 'pending',
      imageUrl: newImage || undefined,
      citizenId: currentUser.id,
      citizenName: currentUser.name,
      citizenAvatar: currentUser.avatarUrl,
      date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
      createdAt: new Date().toISOString()
    };

    // Add to reports list
    setReports([newReport, ...reports]);

    // Send instant in-app notification confirming submission
    const newNotif: Notification = {
      id: `notif-${Date.now()}`,
      userId: currentUser.id,
      title: 'Laporan Berhasil Terkirim',
      message: `Laporan "${newTitle}" berhasil dikirimkan ke Admin ${rwTitle} dan sedang menunggu verifikasi.`,
      date: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      isRead: false,
      reportId: newReport.id
    };
    setNotifications([newNotif, ...notifications]);

    // Reset Form
    setNewTitle('');
    setNewDesc('');
    setNewImage('');
    setComplaintSuccess(true);
    setActiveTab('riwayat'); // Instantly redirect to history so they see it
    
    setTimeout(() => setComplaintSuccess(false), 5000);
  };

  const handleMarkNotifAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const handleDeleteNotif = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-16" id="citizen-portal-view">
      
      {/* 1. Header with Active Profile summary */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent_40%)]" />
        <div className="flex items-center space-x-4 relative z-10">
          <div className="relative group">
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-4 border-emerald-400 shadow-md"
            />
            <label className="absolute bottom-0 right-0 p-1.5 bg-slate-900 text-white rounded-full cursor-pointer hover:bg-slate-800 transition-all border border-emerald-400">
              <Camera className="w-3.5 h-3.5" />
              <input type="file" accept="image/*" onChange={handleProfilePhotoChange} className="hidden" />
            </label>
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black">{currentUser.name}</h1>
            <p className="text-xs text-emerald-100 font-semibold mt-0.5">Sektor Wilayah: <span className="bg-emerald-500/50 px-2 py-0.5 rounded-full">{currentUser.rt}</span></p>
            <p className="text-[10px] text-emerald-200 mt-1">Status Keanggotaan: Warga Terverifikasi</p>
          </div>
        </div>

        {/* Menu selections */}
        <div className="flex flex-wrap gap-2 relative z-10 w-full md:w-auto">
          {[
            { id: 'profil', label: 'Profil Saya', icon: UserIcon },
            { id: 'lapor', label: 'Tulis Pengaduan Baru', icon: Plus },
            { id: 'riwayat', label: 'Riwayat Aduan', icon: ClipboardList }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                  isActive 
                    ? 'bg-white text-emerald-800 shadow-lg' 
                    : 'bg-emerald-800/40 text-emerald-100 hover:bg-emerald-800/60'
                }`}
              >
                <Icon className="w-4 h-4 mr-1.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Grid contents layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Main interactive panel - Left 8 Cols */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-750 p-6 sm:p-8 shadow-sm transition-colors duration-300">
          <AnimatePresence mode="wait">
            
            {/* Tab: Profile Settings */}
            {activeTab === 'profil' && (
              <motion.div
                key="profil"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-lg font-black text-slate-800 dark:text-slate-100">Profil & Data Warga</h2>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Kelola informasi diri Anda agar pengurus RW dapat dengan mudah mengenali laporan Anda.</p>
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-4" id="save-citizen-profile-form">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Lengkap (KTP)</label>
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
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Rukun Tetangga (RT)</label>
                      <select
                        value={editRt}
                        onChange={(e) => setEditRt(e.target.value)}
                        className="w-full text-sm px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      >
                        <option>RT 01</option>
                        <option>RT 02</option>
                        <option>RT 03</option>
                        <option>RT 04</option>
                        <option>RT 05</option>
                        <option>RT 06</option>
                        <option>RT 07</option>
                        <option>RT 08</option>
                        <option>RT 09</option>
                        <option>RT 10</option>
                        <option>RT 11</option>
                        <option>RT 12</option>
                        <option>RT 13</option>
                        <option>RT 14</option>
                      </select>
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
                        id="profile-save-success-banner"
                      >
                        <CheckCircle className="w-4 h-4 mr-1.5 shrink-0" />
                        Profil warga berhasil diperbaharui!
                      </motion.div>
                    )}
                  </AnimatePresence>
                </form>

                <div className="border-t border-slate-100 dark:border-slate-700/60 pt-6">
                  <AvatarCustomizer
                    currentAvatarUrl={currentUser.avatarUrl}
                    onAvatarSelect={handleAvatarSelect}
                    userName={currentUser.name}
                  />
                </div>
              </motion.div>
            )}

            {/* Tab: Submit Complaint */}
            {activeTab === 'lapor' && (
              <motion.div
                key="lapor"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-lg font-black text-slate-800 dark:text-slate-100">Tulis Laporan / Aspirasi Baru</h2>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Sampaikan laporan Anda beserta bukti visual agar tim keamanan dan kebersihan RW dapat segera melakukan penanganan.</p>
                </div>

                <form onSubmit={handleAddComplaint} className="space-y-4" id="submit-complaint-form">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Judul Kejadian / Masalah</label>
                    <input
                      type="text"
                      required
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="Contoh: Ada Tumpukan Sampah Plastik Menumpuk di Selokan"
                      className="w-full text-sm px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Kategori Masalah</label>
                      <select
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value as any)}
                        className="w-full text-sm px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      >
                        <option value="Kebersihan">Kebersihan Sektor</option>
                        <option value="Keamanan">Keamanan & Ketertiban</option>
                        <option value="Infrastruktur">Infrastruktur & Jalan</option>
                        <option value="Administrasi">Administrasi RT/RW</option>
                        <option value="Lainnya">Lain-Lain</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Lokasi Sektor Rukun Tetangga (RT)</label>
                      <select
                        value={newRt}
                        onChange={(e) => setNewRt(e.target.value)}
                        className="w-full text-sm px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      >
                        <option>RT 01</option>
                        <option>RT 02</option>
                        <option>RT 03</option>
                        <option>RT 04</option>
                        <option>RT 05</option>
                        <option>RT 06</option>
                        <option>RT 07</option>
                        <option>RT 08</option>
                        <option>RT 09</option>
                        <option>RT 10</option>
                        <option>RT 11</option>
                        <option>RT 12</option>
                        <option>RT 13</option>
                        <option>RT 14</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Unggah Foto Bukti Kejadian (Pendukung Valid)</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleComplaintFileChange}
                      className="w-full text-xs text-slate-500 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 dark:file:bg-indigo-950/50 file:text-indigo-700 dark:file:text-indigo-400 hover:file:bg-indigo-100 dark:hover:file:bg-indigo-900/30"
                    />
                  </div>

                  {newImage && (
                    <div className="aspect-video w-full rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 relative">
                      <img src={newImage} alt="Preview Bukti" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setNewImage('')}
                        className="absolute top-2 right-2 bg-rose-600 text-white p-1 rounded-full hover:bg-rose-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Deskripsi & Kronologi Masalah</label>
                    <textarea
                      required
                      rows={4}
                      value={newDesc}
                      onChange={(e) => setNewDesc(e.target.value)}
                      placeholder="Sampaikan kronologi kejadian secara lengkap. Sebutkan alamat gang atau patokan lokasi terdekat..."
                      className="w-full text-sm px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg dark:shadow-none flex items-center transition-all"
                    >
                      <Send className="w-4 h-4 mr-1.5" />
                      Kirim Laporan Pengaduan
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* Tab: History Lists */}
            {activeTab === 'riwayat' && (
              <motion.div
                key="riwayat"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-lg font-black text-slate-800 dark:text-slate-100">Riwayat Pengaduan Saya</h2>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Berikut daftar keluhan yang telah Anda kirimkan berserta update status verifikasi dari Admin {rwTitle}.</p>
                </div>

                {myReports.length === 0 ? (
                  <div className="text-center py-12 bg-slate-50 dark:bg-slate-900/30 border border-dashed border-slate-200 dark:border-slate-700 rounded-2xl">
                    <ClipboardList className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                    <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">Belum Ada Pengaduan</h3>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Anda belum pernah mengirimkan laporan pengaduan warga. Laporkan masalah sekarang!</p>
                  </div>
                ) : (
                  <div className="space-y-4" id="citizen-complaints-history">
                    {myReports.map((report) => (
                      <div
                        key={report.id}
                        className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4 hover:border-slate-200 dark:hover:border-slate-700 transition-all duration-300"
                      >
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                          <span className={`inline-block text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            report.status === 'pending' ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/40' :
                            report.status === 'diproses' ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/40' :
                            'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40'
                          }`}>
                            {report.status === 'pending' ? 'Menunggu Verifikasi' :
                             report.status === 'diproses' ? 'Sedang Ditangani' :
                             report.status === 'selesai' ? 'Selesai Ditangani' : 'Ditolak Admin'}
                          </span>
                          
                          <div className="flex items-center text-xs text-slate-400 dark:text-slate-500 font-semibold space-x-2">
                            <span>Sektor {report.rt}</span>
                            <span>•</span>
                            <span>{report.date}</span>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm sm:text-base">{report.title}</h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{report.description}</p>
                        </div>

                        {report.imageUrl && (
                          <div className="max-w-md aspect-video w-full rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-750">
                            <img src={report.imageUrl} alt="Bukti Kejadian" className="w-full h-full object-cover" />
                          </div>
                        )}

                        {/* Admin Feedback notes */}
                        {report.adminNotes && (
                          <div className="bg-amber-50/10 p-4 rounded-xl border border-amber-500/20 text-amber-950 dark:text-amber-200 space-y-1">
                            <h5 className="text-[10px] font-extrabold text-amber-800 dark:text-amber-400 flex items-center uppercase tracking-wider">
                              <Tag className="w-3 h-3 mr-1" /> Tanggapan Admin RW
                            </h5>
                            <p className="text-xs text-amber-950 dark:text-amber-200 font-medium leading-relaxed">{report.adminNotes}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Real-time Notification hub panel - Right 4 Cols */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-50 dark:bg-slate-900/30 rounded-3xl p-6 border border-slate-200/60 dark:border-slate-750 space-y-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center">
              <Bell className="w-4 h-4 mr-1.5 text-indigo-600 dark:text-indigo-400" />
              Notifikasi Instan ({myNotifications.filter(n => !n.isRead).length} Belum Dibaca)
            </h3>
            
            {myNotifications.length === 0 ? (
              <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-6 leading-relaxed">Belum ada notifikasi update status pengaduan warga.</p>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1" id="citizen-notifications-hub">
                {myNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-3 rounded-xl border text-xs relative space-y-1.5 transition-all duration-300 ${
                      notif.isRead 
                        ? 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-100 dark:border-slate-750' 
                        : 'bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-100 dark:border-indigo-900/40 text-slate-700 dark:text-slate-300 font-medium'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-extrabold text-[10px] uppercase text-indigo-600 dark:text-indigo-400 tracking-wider">Status Laporan</span>
                      <div className="flex items-center space-x-1 shrink-0">
                        {!notif.isRead && (
                          <button
                            onClick={() => handleMarkNotifAsRead(notif.id)}
                            className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-800 border border-indigo-100 dark:border-indigo-900/30 px-1.5 py-0.5 rounded"
                          >
                            Baca
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteNotif(notif.id)}
                          className="text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 p-0.5 rounded"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    
                    <h4 className="font-bold text-slate-800 dark:text-slate-100 text-[11px] leading-tight">{notif.title}</h4>
                    <p className="leading-relaxed text-[11px]">{notif.message}</p>
                    
                    <div className="text-[10px] text-slate-400 dark:text-slate-500 text-right font-semibold">
                      {notif.date}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
