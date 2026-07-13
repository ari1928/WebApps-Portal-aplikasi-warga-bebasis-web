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
  rwTitle = 'RW 05',
  rwSubTitle = 'Mekar Wangi',
  rwLogoUrl = '',
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
    <nav className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 sticky top-0 z-50 shadow-sm transition-colors duration-300" id="main-navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo Section */}
          <div className="flex items-center">
            <div 
              className="flex-shrink-0 flex items-center cursor-pointer group" 
              onClick={() => setActiveTab('home')}
              id="navbar-logo-container"
            >
              <div className="relative mr-2.5 flex items-center">
                <div className="absolute inset-0 bg-indigo-500/20 rounded-xl blur-sm group-hover:bg-indigo-500/30 transition-all duration-300" />
                <div className="relative bg-gradient-to-tr from-indigo-600 to-violet-600 p-2 rounded-xl text-white font-bold shadow-md shadow-indigo-100 flex items-center justify-center border border-indigo-400/20">
                  {rwLogoUrl ? (
                    <img src={rwLogoUrl} alt="Logo" className="w-5 h-5 rounded object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <ShieldCheck className="w-5 h-5 text-white" />
                  )}
                </div>
              </div>
              <div className="flex flex-col text-left">
                <div className="flex items-center">
                  <span className="font-black text-base sm:text-lg tracking-tight text-slate-800 dark:text-slate-100 leading-none">PORTAL</span>
                  <span className="text-indigo-600 font-black text-base sm:text-lg ml-1 leading-none">{rwTitle}</span>
                </div>
                <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase mt-0.5 leading-none">{rwSubTitle}</span>
              </div>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-indigo-400'
                  }`}
                  id={`nav-item-${item.id}`}
                >
                  <Icon className="w-4 h-4 mr-1.5" />
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Right Side Controls */}
          <div className="flex items-center space-x-2">
            {/* Global Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-amber-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all duration-200"
              title={isDarkMode ? 'Aktifkan Mode Terang' : 'Aktifkan Mode Gelap'}
              id="dark-mode-toggle-btn"
            >
              {isDarkMode ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5" />}
            </button>

            {currentUser ? (
              <>
                {/* Citizen/Admin Portal Buttons */}
                <button
                  onClick={() => setActiveTab(currentUser.role === 'admin' ? 'admin' : 'citizen')}
                  className={`flex items-center px-3 py-1.5 text-xs font-semibold rounded-full border transition-all duration-200 ${
                    currentUser.role === 'admin'
                      ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                  }`}
                  id="nav-role-button"
                >
                  <FileText className="w-3.5 h-3.5 mr-1" />
                  {currentUser.role === 'admin' ? 'Panel Admin' : 'Layanan Warga'}
                </button>

                {/* Notifications Bell */}
                <button
                  onClick={onNotificationsClick}
                  className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-full relative transition-all duration-200"
                  id="notifications-bell-btn"
                >
                  <Bell className="w-5 h-5" />
                  {notificationsCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 block h-4 w-4 rounded-full ring-2 ring-white bg-rose-500 text-[10px] font-bold text-white text-center leading-4">
                      {notificationsCount}
                    </span>
                  )}
                </button>

                {/* User Dropdown Profile Summary */}
                <div className="flex items-center space-x-2 pl-2 border-l border-slate-100">
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-full object-cover border-2 border-indigo-100 cursor-pointer"
                    onClick={() => setActiveTab(currentUser.role === 'admin' ? 'admin' : 'citizen')}
                    id="navbar-profile-pic"
                  />
                  <div className="hidden lg:block text-left cursor-pointer" onClick={() => setActiveTab(currentUser.role === 'admin' ? 'admin' : 'citizen')}>
                    <div className="text-xs font-bold text-slate-800 line-clamp-1">{currentUser.name}</div>
                    <div className="text-[10px] text-slate-500 font-semibold">{currentUser.role === 'admin' ? 'Administrator' : currentUser.rt}</div>
                  </div>
                  <button
                    onClick={onLogout}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all duration-150"
                    title="Keluar"
                    id="logout-btn"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <button
                onClick={onLoginClick}
                className="flex items-center px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-lg transition-all duration-200 shadow-sm hover:shadow hover:scale-[1.02] active:scale-[0.98] min-h-[30px]"
                id="login-trigger-btn"
              >
                <LogIn className="w-3 h-3 mr-1" />
                Masuk Akun
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-slate-50 focus:outline-none"
                id="mobile-menu-toggle"
              >
                <span className="sr-only">Open main menu</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
            className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 shadow-inner transition-colors duration-300"
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
