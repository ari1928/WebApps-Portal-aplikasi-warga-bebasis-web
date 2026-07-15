import React, { useState } from 'react';
import { User } from '../types';
import { Home, Info, Phone, Image as ImageIcon, Map, FileText, LogIn, LogOut, Bell, User as UserIcon, ShieldCheck, Sparkles, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: User | null;
  onLogout: () => void;
  onLoginClick: () => void;
  notificationsCount: number;
  onNotificationsClick: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  rwTitle?: string;
  rwSubTitle?: string;
  rwLogoUrl?: string;
  isSheetsConnected?: boolean;
}

export default function Navbar({
  activeTab,
  setActiveTab,
  currentUser,
  onLogout,
  onLoginClick,
  notificationsCount,
  onNotificationsClick,
  isDarkMode,
  toggleDarkMode,
  rwTitle = 'RW 07',
  rwSubTitle = 'Palmeriam',
  rwLogoUrl = '',
  isSheetsConnected = false,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Beranda', icon: Home },
    { id: 'gallery', label: 'Galeri Kegiatan', icon: ImageIcon },
    { id: 'map', label: 'Peta Wilayah', icon: Map },
    { id: 'about', label: 'Tentang RW', icon: Info },
    { id: 'contact', label: 'Hubungi Kami', icon: Phone },
  ];

  return (
    <nav className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-150/80 dark:border-slate-800/80 sticky top-3 sm:top-4 mt-3 z-50 shadow-md shadow-slate-100/50 dark:shadow-none transition-all duration-300 mx-auto w-[94%] sm:w-[96%] max-w-5xl rounded-2xl overflow-hidden" id="main-navbar">
      <div className="px-4 sm:px-6">
        <div className="flex justify-between h-13 sm:h-14">
          {/* Logo Section */}
          <div className="flex items-center">
            <div 
              className="flex-shrink-0 flex items-center cursor-pointer group" 
              onClick={() => setActiveTab('home')}
              id="navbar-logo-container"
            >
              <div className="relative mr-2 flex items-center">
                <div className="absolute inset-0 bg-indigo-500/20 rounded-lg blur-sm group-hover:bg-indigo-500/30 transition-all duration-300" />
                <div className="relative bg-gradient-to-tr from-indigo-600 to-violet-600 p-1.5 rounded-lg text-white font-bold shadow-sm shadow-indigo-100 flex items-center justify-center border border-indigo-400/20">
                  {rwLogoUrl ? (
                    <img src={rwLogoUrl} alt="Logo" className="w-4 h-4 sm:w-4.5 sm:h-4.5 rounded object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <ShieldCheck className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-white" />
                  )}
                </div>
              </div>
              <div className="flex flex-col text-left">
                <div className="flex items-center">
                  <span className="font-black text-sm sm:text-base tracking-tight text-slate-800 dark:text-slate-100 leading-none">PORTAL</span>
                  <span className="text-indigo-600 font-black text-sm sm:text-base ml-1 leading-none">{rwTitle}</span>
                </div>
                <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase mt-0.5 leading-none">{rwSubTitle}</span>
              </div>
            </div>
            {isSheetsConnected && (
              <div className="hidden lg:flex items-center space-x-1.5 ml-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/40 px-2.5 py-0.5 rounded-full text-[9px] text-emerald-700 dark:text-emerald-400 font-bold" id="navbar-sheets-sync-pill">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Sheets Connected</span>
              </div>
            )}
          </div>

          {/* Desktop Nav Items */}
          <div className="hidden md:flex items-center space-x-0.5 lg:space-x-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-indigo-400'
                  }`}
                  id={`nav-item-${item.id}`}
                >
                  <Icon className="w-3.5 h-3.5 mr-1" />
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Right Side Controls */}
          <div className="flex items-center space-x-1.5 sm:space-x-2">
            {/* Global Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-amber-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-all duration-200"
              title={isDarkMode ? 'Aktifkan Mode Terang' : 'Aktifkan Mode Gelap'}
              id="dark-mode-toggle-btn"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4" />}
            </button>

            {currentUser ? (
              <>
                {/* Citizen/Admin Portal Buttons */}
                <button
                  onClick={() => setActiveTab(currentUser.role === 'admin' ? 'admin' : 'citizen')}
                  className={`flex items-center px-2.5 py-1 text-[10px] font-bold rounded-full border transition-all duration-200 ${
                    currentUser.role === 'admin'
                      ? 'bg-amber-50 text-amber-700 border-amber-250 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200/50 hover:bg-amber-100/50'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-250 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200/50 hover:bg-emerald-100/50'
                  }`}
                  id="nav-role-button"
                >
                  <FileText className="w-3 h-3 mr-1" />
                  {currentUser.role === 'admin' ? 'Admin' : 'Layanan'}
                </button>

                {/* Notifications Bell */}
                <button
                  onClick={onNotificationsClick}
                  className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-full relative transition-all duration-200"
                  id="notifications-bell-btn"
                >
                  <Bell className="w-4 h-4" />
                  {notificationsCount > 0 && (
                    <span className="absolute top-1 right-1 block h-3.5 w-3.5 rounded-full ring-2 ring-white dark:ring-slate-900 bg-rose-500 text-[8px] font-bold text-white text-center leading-3.5">
                      {notificationsCount}
                    </span>
                  )}
                </button>

                {/* User Dropdown Profile Summary */}
                <div className="flex items-center space-x-1.5 pl-1.5 border-l border-slate-100 dark:border-slate-800">
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.name}
                    className="w-7 h-7 rounded-full object-cover border-2 border-indigo-100 dark:border-indigo-900/40 cursor-pointer"
                    onClick={() => setActiveTab(currentUser.role === 'admin' ? 'admin' : 'citizen')}
                    id="navbar-profile-pic"
                  />
                  <div className="hidden lg:block text-left cursor-pointer" onClick={() => setActiveTab(currentUser.role === 'admin' ? 'admin' : 'citizen')}>
                    <div className="text-[10px] font-bold text-slate-800 dark:text-slate-200 line-clamp-1 leading-none">{currentUser.name}</div>
                    <div className="text-[8px] text-slate-400 dark:text-slate-500 font-semibold mt-0.5 leading-none">{currentUser.role === 'admin' ? 'Administrator' : currentUser.rt}</div>
                  </div>
                  <button
                    onClick={onLogout}
                    className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all duration-150"
                    title="Keluar"
                    id="logout-btn"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              </>
            ) : (
              <button
                onClick={onLoginClick}
                className="flex items-center px-2 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-[9px] uppercase tracking-wider rounded-lg transition-all duration-200 shadow-sm hover:shadow hover:scale-[1.02] active:scale-[0.98] min-h-[28px]"
                id="login-trigger-btn"
              >
                <LogIn className="w-2.5 h-2.5 mr-1" />
                Masuk
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-50 dark:hover:bg-slate-800 focus:outline-none"
                id="mobile-menu-toggle"
              >
                <span className="sr-only">Open main menu</span>
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shadow-inner transition-colors duration-300"
            id="mobile-nav-menu"
          >
            {/* Primary Nav Links */}
            <div className="px-3 pt-3 pb-2 space-y-1 border-b border-slate-50 dark:border-slate-800">
              <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 mb-1">Menu Utama</span>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center w-full px-3 py-2.5 rounded-xl text-sm font-bold transition-all min-h-[44px] ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-indigo-400'
                    }`}
                    id={`mobile-nav-item-${item.id}`}
                  >
                    <Icon className="w-4.5 h-4.5 mr-2.5 shrink-0 text-slate-500 dark:text-slate-400" />
                    {item.label}
                  </button>
                );
              })}
            </div>

            {/* Mobile Dark Mode Toggle */}
            <div className="px-5 py-3.5 flex items-center justify-between border-b border-slate-100 bg-slate-50/40 dark:bg-slate-900/40">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center">
                {isDarkMode ? <Moon className="w-4 h-4 mr-2 text-indigo-400" /> : <Sun className="w-4 h-4 mr-2 text-amber-500" />}
                Mode Gelap (Malam)
              </span>
              <button
                onClick={toggleDarkMode}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isDarkMode ? 'bg-indigo-600' : 'bg-slate-200'
                }`}
                role="switch"
                aria-checked={isDarkMode}
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    isDarkMode ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Mobile User Profile Panel */}
            <div className="p-4 bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
              {currentUser ? (
                <div className="space-y-3" id="mobile-user-panel-details">
                  <div className="flex items-center space-x-3 bg-white dark:bg-slate-800 p-3 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                    <img
                      src={currentUser.avatarUrl}
                      alt={currentUser.name}
                      className="w-10 h-10 rounded-full object-cover border-2 border-indigo-100"
                    />
                    <div className="text-left flex-1 min-w-0">
                      <div className="text-sm font-extrabold text-slate-800 dark:text-slate-100 truncate">{currentUser.name}</div>
                      <div className="text-xs text-indigo-600 dark:text-indigo-400 font-bold mt-0.5">
                        {currentUser.role === 'admin' ? 'Administrator RW' : `Warga (${currentUser.rt})`}
                      </div>
                    </div>
                  </div>

                  {/* Actions inside mobile panel */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        setActiveTab(currentUser.role === 'admin' ? 'admin' : 'citizen');
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center justify-center py-2.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-100 min-h-[44px]"
                    >
                      <FileText className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                      Layanan
                    </button>
                    
                    <button
                      onClick={() => {
                        onNotificationsClick();
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center justify-center py-2.5 px-3 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl relative min-h-[44px]"
                    >
                      <Bell className="w-3.5 h-3.5 mr-1.5 shrink-0 text-slate-500" />
                      Notifikasi
                      {notificationsCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white">
                          {notificationsCount}
                        </span>
                      )}
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      onLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center py-2.5 text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/20 hover:bg-rose-100 dark:hover:bg-rose-900/30 rounded-xl transition-all border border-rose-100 dark:border-rose-900/50 min-h-[44px]"
                  >
                    <LogOut className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                    Keluar dari Akun Warga
                  </button>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-xs text-slate-400 font-bold mb-2 uppercase text-center tracking-wider">Akses Akun Anda</p>
                  <button
                    onClick={() => {
                      onLoginClick();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm rounded-xl transition-all shadow-md shadow-indigo-100 min-h-[44px]"
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    Masuk Akun Warga
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
