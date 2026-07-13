import React, { useState, useEffect } from 'react';
import { User, Report, Announcement, GalleryItem, Notification } from './types';
import {
  INITIAL_USERS,
  INITIAL_REPORTS,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_GALLERY,
} from './data';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './components/Home';
import About from './components/About';
import Contact from './components/Contact';
import Gallery from './components/Gallery';
import InteractiveMap from './components/InteractiveMap';
import CitizenPortal from './components/CitizenPortal';
import AdminPanel from './components/AdminPanel';
import {
  LogIn,
  X,
  User as UserIcon,
  Mail,
  Lock,
  Compass,
  AlertCircle,
  Bell,
  CheckCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  // Navigation active tab
  const [activeTab, setActiveTab] = useState<string>('home');

  // Multi-user & Persistent states
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [usersList, setUsersList] = useState<User[]>(INITIAL_USERS);
  const [reports, setReports] = useState<Report[]>(INITIAL_REPORTS);
  const [announcements, setAnnouncements] = useState<Announcement[]>(
    INITIAL_ANNOUNCEMENTS
  );
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(INITIAL_GALLERY);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Modals visibility
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [showNotifModal, setShowNotifModal] = useState<boolean>(false);

  // Login Form States
  const [loginEmail, setLoginEmail] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string>('');
  const [shake, setShake] = useState<boolean>(false);

  const setLoginErrorWithShake = (error: string) => {
    setLoginError(error);
    if (error) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  // Register Form States
  const [regName, setRegName] = useState<string>('');
  const [regEmail, setRegEmail] = useState<string>('');
  const [regRt, setRegRt] = useState<string>('RT 01');
  const [regPhone, setRegPhone] = useState<string>('');

  // Dark Mode State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('rw_dark_mode') === 'true';
  });

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  // Portal Identity Branding Customization State
  const [rwTitle, setRwTitle] = useState<string>(() => {
    return localStorage.getItem('rw_portal_title') || 'RW 05';
  });
  const [rwSubTitle, setRwSubTitle] = useState<string>(() => {
    return localStorage.getItem('rw_portal_subtitle') || 'Mekar Wangi';
  });
  const [rwLogoUrl, setRwLogoUrl] = useState<string>(() => {
    return localStorage.getItem('rw_portal_logo_url') || '';
  });

  // Contact Info states
  const [contactAddress, setContactAddress] = useState<string>(() => {
    return localStorage.getItem('rw_contact_address') || 'Balai RW 05, Jl. Kenanga No. 12, Desa Mekar Wangi, RT 03/RW 05, Jawa Barat';
  });
  const [contactPhone, setContactPhone] = useState<string>(() => {
    return localStorage.getItem('rw_contact_phone') || '0811-2233-4455';
  });
  const [contactEmail, setContactEmail] = useState<string>(() => {
    return localStorage.getItem('rw_contact_email') || 'sekretariat@rw05.warga.id';
  });
  const [contactHours, setContactHours] = useState<string>(() => {
    return localStorage.getItem('rw_contact_hours') || 'Senin - Sabtu pukul 15:00 - 20:00 WIB';
  });

  // Save branding updates to localStorage
  useEffect(() => {
    localStorage.setItem('rw_portal_title', rwTitle);
  }, [rwTitle]);

  useEffect(() => {
    localStorage.setItem('rw_portal_subtitle', rwSubTitle);
  }, [rwSubTitle]);

  useEffect(() => {
    localStorage.setItem('rw_portal_logo_url', rwLogoUrl);
  }, [rwLogoUrl]);

  useEffect(() => {
    localStorage.setItem('rw_contact_address', contactAddress);
  }, [contactAddress]);

  useEffect(() => {
    localStorage.setItem('rw_contact_phone', contactPhone);
  }, [contactPhone]);

  useEffect(() => {
    localStorage.setItem('rw_contact_email', contactEmail);
  }, [contactEmail]);

  useEffect(() => {
    localStorage.setItem('rw_contact_hours', contactHours);
  }, [contactHours]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('rw_dark_mode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('rw_dark_mode', 'false');
    }
  }, [isDarkMode]);

  // 1. Initial LocalStorage loader
  useEffect(() => {
    const savedUser = localStorage.getItem('rw_current_user');
    const savedUsersList = localStorage.getItem('rw_users_list');
    const savedReports = localStorage.getItem('rw_reports_list');
    const savedAnnouncements = localStorage.getItem('rw_announcements');
    const savedGallery = localStorage.getItem('rw_gallery_items');
    const savedNotifications = localStorage.getItem('rw_notifications');

    if (savedUser) setCurrentUser(JSON.parse(savedUser));
    if (savedUsersList) setUsersList(JSON.parse(savedUsersList));
    if (savedReports) setReports(JSON.parse(savedReports));
    if (savedAnnouncements) setAnnouncements(JSON.parse(savedAnnouncements));
    if (savedGallery) setGalleryItems(JSON.parse(savedGallery));

    if (savedNotifications) {
      setNotifications(JSON.parse(savedNotifications));
    } else {
      // Preload a sample welcome notification
      const sampleNotif: Notification[] = [
        {
          id: 'notif-pre-1',
          userId: 'user-1',
          title: 'Selamat Datang di Portal RW 05',
          message:
            'Halo Budi Santoso, selamat bergabung di sistem informasi warga RW 05. Sampaikan aspirasimu sekarang!',
          date: '13:00',
          isRead: false,
        },
      ];
      setNotifications(sampleNotif);
    }
  }, []);

  // 2. LocalStorage persistence updates
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('rw_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('rw_current_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('rw_users_list', JSON.stringify(usersList));
  }, [usersList]);

  useEffect(() => {
    localStorage.setItem('rw_reports_list', JSON.stringify(reports));
  }, [reports]);

  useEffect(() => {
    localStorage.setItem('rw_announcements', JSON.stringify(announcements));
  }, [announcements]);

  useEffect(() => {
    localStorage.setItem('rw_gallery_items', JSON.stringify(galleryItems));
  }, [galleryItems]);

  useEffect(() => {
    localStorage.setItem('rw_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Handle Logout
  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTab('home');
  };

  // Handle Login submission
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginErrorWithShake('');

    if (!loginEmail) {
      setLoginErrorWithShake('Harap masukkan alamat email.');
      return;
    }

    // Find user by email
    const foundUser = usersList.find(
      (u) => u.email.toLowerCase() === loginEmail.toLowerCase().trim()
    );

    if (foundUser) {
      setCurrentUser(foundUser);
      setShowLoginModal(false);
      setLoginEmail('');
      setLoginPassword('');
      // Redirect to their profile/management tab
      setActiveTab(foundUser.role === 'admin' ? 'admin' : 'citizen');
    } else {
      setLoginErrorWithShake(
        'Akun tidak ditemukan. Gunakan demo akun atau silakan mendaftar terlebih dahulu.'
      );
    }
  };

  // Quick sign-in helper
  const handleQuickSignIn = (roleType: 'citizen' | 'admin') => {
    setLoginErrorWithShake('');
    const targetEmail = roleType === 'admin' ? 'admin@warga.id' : 'warga@warga.id';
    const foundUser = usersList.find((u) => u.email === targetEmail);
    if (foundUser) {
      setCurrentUser(foundUser);
      setShowLoginModal(false);
      setActiveTab(roleType === 'admin' ? 'admin' : 'citizen');
    }
  };

  // Handle Register submission
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regEmail || !regPhone) {
      setLoginErrorWithShake('Harap lengkapi semua kolom pendaftaran.');
      return;
    }

    // Verify duplication
    const duplicate = usersList.find(
      (u) => u.email.toLowerCase() === regEmail.toLowerCase().trim()
    );
    if (duplicate) {
      setLoginErrorWithShake('Email ini sudah terdaftar. Silakan gunakan email lain.');
      return;
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      username: regEmail.split('@')[0],
      email: regEmail.toLowerCase().trim(),
      name: regName,
      avatarUrl:
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
      role: 'citizen',
      rt: regRt,
      phone: regPhone,
    };

    setUsersList([...usersList, newUser]);
    setCurrentUser(newUser);

    // Initial Welcome Notification
    const initialWelcome: Notification = {
      id: `notif-welcome-${Date.now()}`,
      userId: newUser.id,
      title: 'Selamat Datang!',
      message: `Pendaftaran berhasil. Selamat datang ${regName} di Portal Resmi RW 05 Mekar Wangi. Silakan lengkapi profil Anda.`,
      date: new Date().toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      isRead: false,
    };
    setNotifications([initialWelcome, ...notifications]);

    // Reset forms
    setRegName('');
    setRegEmail('');
    setRegPhone('');
    setIsRegistering(false);
    setShowLoginModal(false);
    setActiveTab('citizen');
  };

  const activeUserNotificationsCount = currentUser
    ? notifications.filter((n) => n.userId === currentUser.id && !n.isRead).length
    : 0;

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-800'} font-sans flex flex-col justify-between transition-colors duration-300`} id="app-root-container">
      
      {/* Dynamic Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onLogout={handleLogout}
        onLoginClick={() => setShowLoginModal(true)}
        notificationsCount={activeUserNotificationsCount}
        onNotificationsClick={() => {
          if (currentUser) {
            setActiveTab(currentUser.role === 'admin' ? 'admin' : 'citizen');
            setShowNotifModal(true);
          } else {
            setShowLoginModal(true);
          }
        }}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        rwTitle={rwTitle}
        rwSubTitle={rwSubTitle}
        rwLogoUrl={rwLogoUrl}
      />

      {/* Main Container */}
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: -15, rotate: -1, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, x: 15, rotate: 1, scale: 0.98 }}
            transition={{ 
              type: 'spring', 
              stiffness: 150, 
              damping: 16, 
              mass: 0.8
            }}
            className="w-full"
          >
            {activeTab === 'home' && (
              <Home
                reports={reports}
                announcements={announcements}
                currentUser={currentUser}
                setActiveTab={setActiveTab}
                onLoginClick={() => setShowLoginModal(true)}
                rwTitle={rwTitle}
                rwSubTitle={rwSubTitle}
                rwLogoUrl={rwLogoUrl}
              />
            )}

            {activeTab === 'gallery' && (
              <Gallery
                galleryItems={galleryItems}
                setGalleryItems={setGalleryItems}
                currentUser={currentUser}
                rwTitle={rwTitle}
              />
            )}

            {activeTab === 'map' && <InteractiveMap reports={reports} />}

            {activeTab === 'about' && <About />}

            {activeTab === 'contact' && (
              <Contact
                contactAddress={contactAddress}
                contactPhone={contactPhone}
                contactEmail={contactEmail}
                contactHours={contactHours}
                rwTitle={rwTitle}
              />
            )}

            {activeTab === 'citizen' && currentUser && (
              <CitizenPortal
                currentUser={currentUser}
                setCurrentUser={setCurrentUser}
                reports={reports}
                setReports={setReports}
                notifications={notifications}
                setNotifications={setNotifications}
                usersList={usersList}
                setUsersList={setUsersList}
              />
            )}

            {activeTab === 'admin' && currentUser && (
              <AdminPanel
                currentUser={currentUser}
                setCurrentUser={setCurrentUser}
                reports={reports}
                setReports={setReports}
                announcements={announcements}
                setAnnouncements={setAnnouncements}
                notifications={notifications}
                setNotifications={setNotifications}
                usersList={usersList}
                setUsersList={setUsersList}
                rwTitle={rwTitle}
                setRwTitle={setRwTitle}
                rwSubTitle={rwSubTitle}
                setRwSubTitle={setRwSubTitle}
                rwLogoUrl={rwLogoUrl}
                setRwLogoUrl={setRwLogoUrl}
                contactAddress={contactAddress}
                setContactAddress={setContactAddress}
                contactPhone={contactPhone}
                setContactPhone={setContactPhone}
                contactEmail={contactEmail}
                setContactEmail={setContactEmail}
                contactHours={contactHours}
                setContactHours={setContactHours}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Dynamic Styled Footer */}
      <Footer
        setActiveTab={setActiveTab}
        rwTitle={rwTitle}
        rwSubTitle={rwSubTitle}
        rwLogoUrl={rwLogoUrl}
        contactAddress={contactAddress}
        contactPhone={contactPhone}
        contactEmail={contactEmail}
      />

      {/* 1. Universal User Access Login / Registration Modal */}
      <AnimatePresence>
        {showLoginModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLoginModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 30, x: 0 }}
              animate={shake 
                ? { opacity: 1, scale: 1, y: 0, x: [0, -10, 10, -10, 10, -5, 5, -2, 2, 0] } 
                : { opacity: 1, scale: 1, y: 0, x: 0 }
              }
              exit={{ opacity: 0, scale: 0.85, y: 30, x: 0 }}
              transition={{ 
                type: 'spring', 
                stiffness: 300, 
                damping: 25, 
                mass: 0.9,
                x: { duration: 0.4, ease: "easeInOut" }
              }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative z-10 border border-slate-100 max-h-[90vh] overflow-y-auto space-y-6"
            >
              <button
                onClick={() => setShowLoginModal(false)}
                className="absolute top-4 right-4 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center space-y-1.5">
                <div className="mx-auto w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner">
                  <LogIn className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-black text-slate-800">
                  {isRegistering ? 'Daftar Akun Warga Baru' : 'Masuk Portal Warga'}
                </h3>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  Silakan masuk atau buat akun baru untuk mengakses fitur laporan aduan dan notifikasi instan.
                </p>
              </div>

              {loginError && (
                <div
                  className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-100 flex items-start space-x-1.5"
                  id="login-error-alert"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{loginError}</span>
                </div>
              )}

              {/* Login/Register Tab content */}
              {!isRegistering ? (
                <form onSubmit={handleLoginSubmit} className="space-y-4" id="login-form-main">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Email Warga</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 w-4.5 h-4.5 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="Contoh: warga@warga.id"
                        className="w-full text-sm pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Kata Sandi (Demo: Bebas)</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 w-4.5 h-4.5 text-slate-400" />
                      <input
                        type="password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="******"
                        className="w-full text-sm pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-100 transition-all"
                  >
                    Masuk Sekarang
                  </button>
                </form>
              ) : (
                <form onSubmit={handleRegisterSubmit} className="space-y-4" id="register-form-main">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap (Sesuai KTP)</label>
                    <input
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="Contoh: Budi Santoso"
                      className="w-full text-sm px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Alamat Email</label>
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="Contoh: budi@warga.id"
                      className="w-full text-sm px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Sektor RT</label>
                      <select
                        value={regRt}
                        onChange={(e) => setRegRt(e.target.value)}
                        className="w-full text-sm px-4 py-2 border border-slate-200 rounded-xl focus:outline-none"
                      >
                        <option>RT 01</option>
                        <option>RT 02</option>
                        <option>RT 03</option>
                        <option>RT 04</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">No. HP (WhatsApp)</label>
                      <input
                        type="text"
                        required
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="0812xxxxxxxx"
                        className="w-full text-sm px-4 py-2 border border-slate-200 rounded-xl focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl shadow-lg transition-all"
                  >
                    Daftar Akun Baru
                  </button>
                </form>
              )}

              {/* Toggle Login / Register */}
              <div className="text-center text-xs text-slate-400">
                {isRegistering ? (
                  <span>
                    Sudah punya akun?{' '}
                    <button
                      onClick={() => {
                        setIsRegistering(false);
                        setLoginError('');
                      }}
                      className="text-indigo-600 font-bold hover:underline"
                    >
                      Masuk Di Sini
                    </button>
                  </span>
                ) : (
                  <span>
                    Belum terdaftar?{' '}
                    <button
                      onClick={() => {
                        setIsRegistering(true);
                        setLoginError('');
                      }}
                      className="text-emerald-600 font-bold hover:underline"
                    >
                      Buat Akun Baru
                    </button>
                  </span>
                )}
              </div>

              {/* 4. Demo login shortcuts for tester convenience */}
              <div className="border-t border-slate-100 pt-4 space-y-3">
                <span className="block text-center text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                  Uji Coba Instan (Tanpa Password)
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleQuickSignIn('citizen')}
                    className="py-2 px-3 border border-emerald-100 bg-emerald-50/40 hover:bg-emerald-50 text-[10px] font-bold text-emerald-800 rounded-xl transition-all"
                  >
                    Warga (Budi Santoso)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickSignIn('admin')}
                    className="py-2 px-3 border border-indigo-100 bg-indigo-50/40 hover:bg-indigo-50 text-[10px] font-bold text-indigo-800 rounded-xl transition-all"
                  >
                    Pak RW (Bambang)
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
