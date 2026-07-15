import React, { useState, useEffect, useRef } from 'react';
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
  initGoogleSheetsAuth,
  fetchReportsFromSheets,
  importAnnouncementsFromSheets,
  exportReportsToSheets,
  exportAnnouncementsToSheets,
  getSheetsAccessToken,
  ensureAllSheetsExist,
} from './lib/google-sheets';
import { auth, googleAuthProvider } from './lib/firebase';
import { signInWithPopup } from 'firebase/auth';
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

  // Real-time toast/banner notification state for admins
  const [toasts, setToasts] = useState<Array<{ id: string; reportId: string; title: string; desc: string; rt: string; category: string; citizenName: string }>>([]);
  const [activeAdminReportId, setActiveAdminReportId] = useState<string | null>(null);
  const prevReportsRef = useRef<Report[]>(reports);
  const isReportsInitializedRef = useRef<boolean>(false);

  // Google Sheets Sync States & Refs
  const [isSheetsConnected, setIsSheetsConnected] = useState<boolean>(() => {
    return !!sessionStorage.getItem('google_sheets_access_token');
  });
  const [isSheetsSyncing, setIsSheetsSyncing] = useState<boolean>(false);
  const [sheetsSyncError, setSheetsSyncError] = useState<string | null>(null);
  const hasInitialLoadedSheets = useRef<boolean>(false);

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
  const [regPassword, setRegPassword] = useState<string>('');
  const [regConfirmPassword, setRegConfirmPassword] = useState<string>('');

  // Google Auth states
  const [googleAuthStep, setGoogleAuthStep] = useState<'none' | 'simulation_select' | 'complete_registration'>('none');
  const [googleAuthUser, setGoogleAuthUser] = useState<{ email: string; displayName: string; photoURL: string } | null>(null);
  const [googleRegRt, setGoogleRegRt] = useState<string>('RT 01');
  const [googleRegPhone, setGoogleRegPhone] = useState<string>('');
  const [customGmailInput, setCustomGmailInput] = useState<string>('');
  const [customGmailName, setCustomGmailName] = useState<string>('');

  // Dark Mode State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('rw_dark_mode') === 'true';
  });

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  // Portal Identity Branding Customization State
  const [rwTitle, setRwTitle] = useState<string>(() => {
    const title = localStorage.getItem('rw_portal_title');
    if (title === 'RW 05' || !title) return 'RW 07';
    return title;
  });
  const [rwSubTitle, setRwSubTitle] = useState<string>(() => {
    const subtitle = localStorage.getItem('rw_portal_subtitle');
    if (subtitle === 'Mekar Wangi' || !subtitle) return 'Palmeriam';
    return subtitle;
  });
  const [rwLogoUrl, setRwLogoUrl] = useState<string>(() => {
    return localStorage.getItem('rw_portal_logo_url') || '';
  });

  // Contact Info states
  const [contactAddress, setContactAddress] = useState<string>(() => {
    const addr = localStorage.getItem('rw_contact_address');
    if (!addr || addr.includes('RW 05') || addr.includes('Mekar Wangi')) {
      return 'Balai RW 07, Jl. Palmeriam Raya, Kel. Palmeriam, Kec. Matraman, RT 03/RW 07, Jakarta Timur';
    }
    return addr;
  });
  const [contactPhone, setContactPhone] = useState<string>(() => {
    return localStorage.getItem('rw_contact_phone') || '0811-2233-4455';
  });
  const [contactEmail, setContactEmail] = useState<string>(() => {
    const email = localStorage.getItem('rw_contact_email');
    if (!email || email.includes('rw05')) {
      return 'sekretariat@rw07.warga.id';
    }
    return email;
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

  // Google Sheets Auto-Loader function
  const loadDataFromSheets = async (token: string, spreadsheetId: string) => {
    setIsSheetsSyncing(true);
    setSheetsSyncError(null);
    try {
      // 1. Ensure essential tabs are created
      await ensureAllSheetsExist(token, spreadsheetId);

      // 2. Fetch reports from "Laporan Aduan" worksheet
      const fetchedReports = await fetchReportsFromSheets(token, spreadsheetId);
      if (fetchedReports && fetchedReports.length > 0) {
        setReports(fetchedReports);
      }

      // 3. Fetch announcements from "Pengumuman" worksheet
      const fetchedAnnouncements = await importAnnouncementsFromSheets(token, spreadsheetId);
      if (fetchedAnnouncements && fetchedAnnouncements.length > 0) {
        setAnnouncements(fetchedAnnouncements);
      }

      hasInitialLoadedSheets.current = true;
    } catch (err: any) {
      console.error('Failed to load data from Google Sheets:', err);
      setSheetsSyncError('Gagal memuat data dari Google Sheets. Menggunakan penyimpanan cadangan lokal.');
    } finally {
      setIsSheetsSyncing(false);
    }
  };

  // Google Sheets Auth listener
  useEffect(() => {
    const unsubscribe = initGoogleSheetsAuth(
      async (user, token) => {
        setIsSheetsConnected(true);
        const spreadsheetId = localStorage.getItem('rw_google_spreadsheet_id');
        if (spreadsheetId) {
          await loadDataFromSheets(token, spreadsheetId);
        } else {
          // No spreadsheet connected yet, allow local state fallback
          hasInitialLoadedSheets.current = true;
        }
      },
      () => {
        setIsSheetsConnected(false);
        // Not connected to Sheets, allow local state
        hasInitialLoadedSheets.current = true;
      }
    );
    return () => unsubscribe();
  }, []);

  // 1. Initial LocalStorage loader (runs once on startup)
  useEffect(() => {
    const savedUser = localStorage.getItem('rw_current_user');
    const savedUsersList = localStorage.getItem('rw_users_list');
    const savedReports = localStorage.getItem('rw_reports_list');
    const savedAnnouncements = localStorage.getItem('rw_announcements');
    const savedGallery = localStorage.getItem('rw_gallery_items');
    const savedNotifications = localStorage.getItem('rw_notifications');

    if (savedUser) setCurrentUser(JSON.parse(savedUser));
    if (savedUsersList) setUsersList(JSON.parse(savedUsersList));
    
    // Only load local storage if Google Sheets is not loading/connected yet
    const hasSpreadsheet = !!localStorage.getItem('rw_google_spreadsheet_id');
    const hasAccessToken = !!sessionStorage.getItem('google_sheets_access_token');
    
    if (!hasSpreadsheet || !hasAccessToken) {
      if (savedReports) setReports(JSON.parse(savedReports));
      if (savedAnnouncements) setAnnouncements(JSON.parse(savedAnnouncements));
    }
    
    if (savedGallery) setGalleryItems(JSON.parse(savedGallery));

    if (savedNotifications) {
      setNotifications(JSON.parse(savedNotifications));
    } else {
      // Preload a sample welcome notification
      const sampleNotif: Notification[] = [
        {
          id: 'notif-pre-1',
          userId: 'user-1',
          title: 'Selamat Datang di Portal RW 07',
          message:
            'Halo Budi Santoso, selamat bergabung di sistem informasi warga RW 07. Sampaikan aspirasimu sekarang!',
          date: '13:00',
          isRead: false,
        },
      ];
      setNotifications(sampleNotif);
    }
  }, []);

  // 2. LocalStorage & Google Sheets persistence updates
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

  // Sync reports
  useEffect(() => {
    const token = getSheetsAccessToken();
    const spreadsheetId = localStorage.getItem('rw_google_spreadsheet_id');
    
    if (isSheetsConnected && token && spreadsheetId && hasInitialLoadedSheets.current) {
      const syncReports = async () => {
        setIsSheetsSyncing(true);
        try {
          await exportReportsToSheets(token, spreadsheetId, reports);
        } catch (err) {
          console.error('Failed to auto-sync reports to Google Sheets:', err);
        } finally {
          setIsSheetsSyncing(false);
        }
      };
      syncReports();
    }
    
    localStorage.setItem('rw_reports_list', JSON.stringify(reports));
  }, [reports, isSheetsConnected]);

  // Sync announcements
  useEffect(() => {
    const token = getSheetsAccessToken();
    const spreadsheetId = localStorage.getItem('rw_google_spreadsheet_id');
    
    if (isSheetsConnected && token && spreadsheetId && hasInitialLoadedSheets.current) {
      const syncAnnouncements = async () => {
        setIsSheetsSyncing(true);
        try {
          await exportAnnouncementsToSheets(token, spreadsheetId, announcements);
        } catch (err) {
          console.error('Failed to auto-sync announcements to Google Sheets:', err);
        } finally {
          setIsSheetsSyncing(false);
        }
      };
      syncAnnouncements();
    }
    
    localStorage.setItem('rw_announcements', JSON.stringify(announcements));
  }, [announcements, isSheetsConnected]);

  useEffect(() => {
    localStorage.setItem('rw_gallery_items', JSON.stringify(galleryItems));
  }, [galleryItems]);

  useEffect(() => {
    localStorage.setItem('rw_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Effect to wait for initial loaded reports before triggering live toasts
  useEffect(() => {
    const timer = setTimeout(() => {
      isReportsInitializedRef.current = true;
      prevReportsRef.current = reports;
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Monitor reports for new complaints and trigger real-time toast
  useEffect(() => {
    if (!isReportsInitializedRef.current) {
      prevReportsRef.current = reports;
      return;
    }

    const newReports = reports.filter(
      (r) => !prevReportsRef.current.some((prev) => prev.id === r.id)
    );

    if (newReports.length > 0) {
      // Show toast if admin is logged in
      if (currentUser?.role === 'admin') {
        newReports.forEach((report) => {
          const id = `toast-${Date.now()}-${Math.random()}`;
          setToasts((prev) => [
            ...prev,
            {
              id,
              reportId: report.id,
              title: report.title,
              desc: report.description,
              rt: report.rt,
              category: report.category,
              citizenName: report.citizenName,
            },
          ]);
          // Automatically clear the toast after 8 seconds
          setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
          }, 8000);
        });
      }
    }

    prevReportsRef.current = reports;
  }, [reports, currentUser]);

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
      if (foundUser.password && foundUser.password !== loginPassword) {
        setLoginErrorWithShake('Kata sandi yang Anda masukkan salah.');
        return;
      }
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

  // Handle Register submission
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regEmail || !regPhone || !regPassword || !regConfirmPassword) {
      setLoginErrorWithShake('Harap lengkapi semua kolom pendaftaran.');
      return;
    }

    if (regPassword.length < 6) {
      setLoginErrorWithShake('Kata sandi minimal harus terdiri dari 6 karakter.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setLoginErrorWithShake('Konfirmasi kata sandi tidak cocok.');
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
      password: regPassword,
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
      message: `Pendaftaran berhasil. Selamat datang ${regName} di Portal Resmi ${rwTitle} ${rwSubTitle}. Silakan lengkapi profil Anda.`,
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
    setRegPassword('');
    setRegConfirmPassword('');
    setIsRegistering(false);
    setShowLoginModal(false);
    setActiveTab('citizen');
  };

  // Helper to reset Google Auth states
  const resetGoogleAuthStates = () => {
    setGoogleAuthStep('none');
    setGoogleAuthUser(null);
    setGoogleRegPhone('');
    setGoogleRegRt('RT 01');
    setCustomGmailInput('');
    setCustomGmailName('');
    setLoginError('');
  };

  // Process the Google/Gmail user details
  const processGoogleUser = (email: string, displayName: string, photoURL: string) => {
    const foundUser = usersList.find(
      (u) => u.email.toLowerCase() === email.toLowerCase().trim()
    );

    if (foundUser) {
      setCurrentUser(foundUser);
      setShowLoginModal(false);
      resetGoogleAuthStates();
      setActiveTab(foundUser.role === 'admin' ? 'admin' : 'citizen');
      
      const newToast = {
        id: `toast-g-${Date.now()}`,
        reportId: '',
        title: 'Masuk dengan Google Berhasil',
        desc: `Selamat datang kembali, ${foundUser.name}!`,
        rt: foundUser.rt,
        category: 'Informasi',
        citizenName: foundUser.name,
      };
      setToasts((prev) => [newToast, ...prev]);
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== newToast.id)), 4000);
    } else {
      setGoogleAuthUser({ email, displayName, photoURL });
      setGoogleAuthStep('complete_registration');
    }
  };

  // Google popup sign in trigger
  const handleGoogleSignInClick = async () => {
    setLoginError('');
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      if (result.user) {
        processGoogleUser(
          result.user.email || '',
          result.user.displayName || 'Pengguna Gmail',
          result.user.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'
        );
      }
    } catch (error: any) {
      console.warn('Real Google Auth popup was blocked or failed. Switching to custom selector.', error);
      // Seamlessly switch to beautiful Google Accounts Simulation select
      setGoogleAuthStep('simulation_select');
    }
  };

  // Custom Gmail Submission (Simulation/Manual Entry)
  const handleCustomGmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customGmailInput) {
      setLoginError('Harap masukkan alamat Gmail.');
      return;
    }
    if (!customGmailInput.toLowerCase().endsWith('@gmail.com')) {
      setLoginError('Harap masukkan alamat email Gmail yang valid (akhiran @gmail.com).');
      return;
    }
    
    const email = customGmailInput.toLowerCase().trim();
    // Try to find if user exists
    const foundUser = usersList.find((u) => u.email.toLowerCase() === email);
    if (foundUser) {
      processGoogleUser(foundUser.email, foundUser.name, foundUser.avatarUrl);
    } else {
      const defaultName = customGmailName.trim() || email.split('@')[0].replace(/[^a-zA-Z0-9]/g, ' ');
      const cleanName = defaultName.charAt(0).toUpperCase() + defaultName.slice(1);
      const randomAvatar = `https://images.unsplash.com/photo-${['1535713875002-d1d0cf377fde', '1494790108377-be9c29b29330', '1570295999919-56ceb5ecca61', '1580489944761-15a19d654956'][Math.floor(Math.random() * 4)]}?auto=format&fit=crop&q=80&w=150`;
      
      processGoogleUser(email, cleanName, randomAvatar);
    }
  };

  // Google Registered User Submit
  const handleGoogleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleAuthUser) return;
    if (!googleRegPhone) {
      setLoginError('Harap masukkan nomor WhatsApp Anda.');
      return;
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      username: googleAuthUser.email.split('@')[0],
      email: googleAuthUser.email.toLowerCase().trim(),
      name: googleAuthUser.displayName,
      avatarUrl: googleAuthUser.photoURL,
      role: 'citizen',
      rt: googleRegRt,
      phone: googleRegPhone,
    };

    setUsersList([...usersList, newUser]);
    setCurrentUser(newUser);
    setShowLoginModal(false);
    resetGoogleAuthStates();
    setActiveTab('citizen');

    // Initial Welcome Notification
    const initialWelcome: Notification = {
      id: `notif-welcome-${Date.now()}`,
      userId: newUser.id,
      title: 'Selamat Datang!',
      message: `Pendaftaran berhasil via Gmail. Selamat datang ${newUser.name} di Portal Resmi ${rwTitle} ${rwSubTitle}. Silakan jelajahi fitur portal warga Anda.`,
      date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
      isRead: false,
    };
    setNotifications([initialWelcome, ...notifications]);
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
        isSheetsConnected={isSheetsConnected}
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

            {activeTab === 'about' && <About rwTitle={rwTitle} rwSubTitle={rwSubTitle} />}

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
                rwTitle={rwTitle}
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
                activeAdminReportId={activeAdminReportId}
                setActiveAdminReportId={setActiveAdminReportId}
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
              {googleAuthStep === 'simulation_select' ? (
                <div className="space-y-4" id="google-sim-select">
                  <div className="flex items-center space-x-2 text-indigo-600 font-bold text-xs">
                    <Sparkles className="w-4 h-4 text-indigo-500 shrink-0" />
                    <span>Hubungkan Akun Gmail Warga</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Karena kendala sistem sandboxing preview, Anda dapat memilih dari akun demo Google di bawah ini atau mengetik alamat Gmail kustom Anda secara langsung:
                  </p>
                  
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {usersList.slice(0, 4).map((u) => {
                      const simulatedGmail = u.email.endsWith('@warga.id') 
                        ? u.email.replace('@warga.id', '@gmail.com') 
                        : u.email;
                      return (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => processGoogleUser(simulatedGmail, u.name, u.avatarUrl)}
                          className="w-full flex items-center justify-between p-2.5 border border-slate-100 hover:border-indigo-100 bg-slate-50/50 hover:bg-indigo-50/20 rounded-xl transition-all text-left"
                        >
                          <div className="flex items-center space-x-2.5 min-w-0">
                            <img src={u.avatarUrl} alt={u.name} className="w-7 h-7 rounded-full object-cover border border-slate-200 shrink-0" />
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-slate-850 truncate leading-tight">{u.name}</div>
                              <div className="text-[9px] text-slate-400 font-medium truncate">{simulatedGmail}</div>
                            </div>
                          </div>
                          <span className="text-[8px] bg-indigo-50 text-indigo-600 font-extrabold px-2 py-0.5 rounded-full shrink-0">Pilih</span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="relative py-1 flex items-center justify-center">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-100"></span></div>
                    <span className="relative bg-white px-2 text-[9px] font-extrabold text-slate-400 uppercase">Atau Ketik Gmail Kustom</span>
                  </div>

                  <form onSubmit={handleCustomGmailSubmit} className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-500 uppercase mb-1">Nama Lengkap</label>
                      <input
                        type="text"
                        value={customGmailName}
                        onChange={(e) => setCustomGmailName(e.target.value)}
                        placeholder="Nama Lengkap Anda (Contoh: Ahmad Dhani)"
                        className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-500 uppercase mb-1">Alamat Email Gmail</label>
                      <input
                        type="email"
                        required
                        value={customGmailInput}
                        onChange={(e) => setCustomGmailInput(e.target.value)}
                        placeholder="budi.santoso@gmail.com"
                        className="w-full text-xs px-3.5 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                    >
                      <span>Masuk dengan Gmail Baru</span>
                    </button>
                  </form>

                  <button
                    type="button"
                    onClick={resetGoogleAuthStates}
                    className="w-full py-1 text-center text-[11px] text-slate-400 font-bold hover:text-slate-600 hover:underline cursor-pointer"
                  >
                    Kembali ke Form Utama
                  </button>
                </div>
              ) : googleAuthStep === 'complete_registration' ? (
                <form onSubmit={handleGoogleRegisterSubmit} className="space-y-4" id="google-complete-reg">
                  <div className="p-3 bg-indigo-50 border border-indigo-100/50 rounded-2xl flex items-center space-x-3">
                    <img src={googleAuthUser?.photoURL} alt={googleAuthUser?.displayName} className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-sm shrink-0" />
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-850 truncate">{googleAuthUser?.displayName}</h4>
                      <p className="text-[10px] text-slate-400 font-medium truncate">{googleAuthUser?.email}</p>
                      <span className="inline-block mt-0.5 text-[8px] bg-indigo-600 text-white px-1.5 py-0.5 rounded-full font-extrabold uppercase">Tersambung via Google</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed">
                    Satu langkah lagi! Alamat Gmail Anda belum terdaftar sebagai warga di wilayah kami. Silakan tentukan RT domisili dan WhatsApp untuk menyelesaikan pendaftaran instan:
                  </p>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Sektor RT</label>
                      <select
                        value={googleRegRt}
                        onChange={(e) => setGoogleRegRt(e.target.value)}
                        className="w-full text-sm px-4 py-2 border border-slate-200 rounded-xl focus:outline-none"
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
                      <label className="block text-xs font-bold text-slate-700 mb-1">No. HP (WhatsApp)</label>
                      <input
                        type="text"
                        required
                        value={googleRegPhone}
                        onChange={(e) => setGoogleRegPhone(e.target.value)}
                        placeholder="0812xxxxxxxx"
                        className="w-full text-sm px-4 py-2 border border-slate-200 rounded-xl focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl shadow-lg transition-all cursor-pointer"
                  >
                    Selesaikan Pendaftaran Warga
                  </button>

                  <button
                    type="button"
                    onClick={resetGoogleAuthStates}
                    className="w-full py-1 text-center text-xs text-slate-400 font-bold hover:text-slate-600 hover:underline cursor-pointer"
                  >
                    Batal
                  </button>
                </form>
              ) : (
                <>
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
                        <label className="block text-xs font-bold text-slate-700 mb-1">Kata Sandi (Warga Demo: password, Admin: admin)</label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-2.5 w-4.5 h-4.5 text-slate-400" />
                          <input
                            type="password"
                            required
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            placeholder="******"
                            className="w-full text-sm pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-100 transition-all cursor-pointer"
                      >
                        Masuk Sekarang
                      </button>

                      <div className="relative py-1 flex items-center justify-center">
                        <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-100"></span></div>
                        <span className="relative bg-white px-3 text-[10px] font-extrabold text-slate-400 uppercase">Atau</span>
                      </div>

                      <button
                        type="button"
                        onClick={handleGoogleSignInClick}
                        className="w-full flex items-center justify-center space-x-2.5 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all bg-white cursor-pointer"
                        id="google-signin-btn"
                      >
                        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                          <path
                            fill="#4285F4"
                            d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.53-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-8.83z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 24c3.24 0 5.97-1.08 7.96-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.08 1.16-3.14 0-5.8-2.11-6.75-4.96H1.31v3.15C3.29 22.36 7.37 24 12 24z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.25 14.24a7.13 7.13 0 0 1 0-4.48V6.61H1.31a12 12 0 0 0 0 10.78l3.94-3.15z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.37 0 3.29 1.64 1.31 4.75l3.94 3.15c.95-2.85 3.61-4.96 6.75-4.96z"
                          />
                        </svg>
                        <span className="text-xs font-bold text-slate-700">Masuk dengan Akun Gmail / Google</span>
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

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Kata Sandi</label>
                          <input
                            type="password"
                            required
                            value={regPassword}
                            onChange={(e) => setRegPassword(e.target.value)}
                            placeholder="Min. 6 karakter"
                            className="w-full text-sm px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Konfirmasi Sandi</label>
                          <input
                            type="password"
                            required
                            value={regConfirmPassword}
                            onChange={(e) => setRegConfirmPassword(e.target.value)}
                            placeholder="Ulangi kata sandi"
                            className="w-full text-sm px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl shadow-lg transition-all cursor-pointer"
                      >
                        Daftar Akun Baru
                      </button>

                      <div className="relative py-1 flex items-center justify-center">
                        <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-100"></span></div>
                        <span className="relative bg-white px-3 text-[10px] font-extrabold text-slate-400 uppercase">Atau</span>
                      </div>

                      <button
                        type="button"
                        onClick={handleGoogleSignInClick}
                        className="w-full flex items-center justify-center space-x-2.5 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all bg-white cursor-pointer"
                        id="google-register-btn"
                      >
                        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                          <path
                            fill="#4285F4"
                            d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.53-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-8.83z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 24c3.24 0 5.97-1.08 7.96-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.08 1.16-3.14 0-5.8-2.11-6.75-4.96H1.31v3.15C3.29 22.36 7.37 24 12 24z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.25 14.24a7.13 7.13 0 0 1 0-4.48V6.61H1.31a12 12 0 0 0 0 10.78l3.94-3.15z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.37 0 3.29 1.64 1.31 4.75l3.94 3.15c.95-2.85 3.61-4.96 6.75-4.96z"
                          />
                        </svg>
                        <span className="text-xs font-bold text-slate-700">Daftar dengan Akun Gmail / Google</span>
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
                          className="text-indigo-600 font-bold hover:underline cursor-pointer"
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
                          className="text-emerald-600 font-bold hover:underline cursor-pointer"
                        >
                          Buat Akun Baru
                        </button>
                      </span>
                    )}
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. Custom Real-time Toast/Banner System for Admin */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full px-4 sm:px-0">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8, x: 100 }}
              className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-indigo-100 dark:border-indigo-950/80 p-4 rounded-2xl shadow-2xl flex flex-col gap-3 relative overflow-hidden"
            >
              {/* Top ambient highlight line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
              
              <div className="flex items-start gap-3">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-xl shrink-0 mt-0.5">
                  <Bell className="w-5 h-5 animate-bounce" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400 tracking-wider">
                      Laporan Masuk Baru • {toast.rt}
                    </span>
                    <button
                      onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 mt-1 leading-snug">
                    {toast.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {toast.desc}
                  </p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1.5 italic">
                    Oleh: {toast.citizenName} • {toast.category}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-end gap-2 border-t border-slate-50 dark:border-slate-800/60 pt-2.5">
                <button
                  onClick={() => {
                    setToasts((prev) => prev.filter((t) => t.id !== toast.id));
                  }}
                  className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                >
                  Tutup
                </button>
                <button
                  onClick={() => {
                    // Navigate to admin tab
                    setActiveTab('admin');
                    // Set active admin report ID to open detail modal
                    setActiveAdminReportId(toast.reportId);
                    // Dismiss toast
                    setToasts((prev) => prev.filter((t) => t.id !== toast.id));
                  }}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold rounded-lg transition-all shadow-md shadow-indigo-600/10 flex items-center gap-1"
                >
                  Lihat Detail
                  <Sparkles className="w-3 h-3" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
