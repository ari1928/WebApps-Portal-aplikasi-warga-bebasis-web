import React, { useState, useEffect } from 'react';
import { Announcement, Report, User } from '../types';
import {
  Megaphone,
  MessageSquare,
  Shield,
  Users,
  CheckCircle,
  Clock,
  ArrowRight,
  MapPin,
  Calendar,
  Heart,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HomeProps {
  reports: Report[];
  announcements: Announcement[];
  currentUser: User | null;
  setActiveTab: (tab: string) => void;
  onLoginClick: () => void;
}

const DOCUMENTATION_SLIDES = [
  {
    id: 'slide-1',
    title: 'Gotong Royong Kebersihan Saluran Air RT 03',
    category: 'Gotong Royong',
    description: 'Warga RT 03 berkolaborasi membersihkan tumpukan sampah plastik di selokan utama guna melancarkan aliran air menjelang musim hujan basah.',
    imageUrl: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&q=80&w=1200',
    date: '10 Juli 2026',
    initialLikes: 24,
    badgeColor: 'bg-emerald-600'
  },
  {
    id: 'slide-2',
    title: 'Pelayanan Imunisasi Balita Posyandu Melati',
    category: 'Posyandu & Kesehatan',
    description: 'Kegiatan posyandu bulanan untuk balita, meliputi penimbangan berkala, pemberian vitamin A, imunisasi polio, dan makanan tambahan bergizi.',
    imageUrl: 'https://images.unsplash.com/photo-1531983412531-1f49a365ffed?auto=format&fit=crop&q=80&w=1200',
    date: '08 Juli 2026',
    initialLikes: 18,
    badgeColor: 'bg-indigo-600'
  },
  {
    id: 'slide-3',
    title: 'Rapat Musyawarah Rencana Kerja Bakti HUT RI',
    category: 'Rapat Warga',
    description: 'Musyawarah bersama pengurus RW 05 dan para ketua RT untuk membahas persiapan kerja bakti akbar, perlombaan tradisional, dan panggung gembira kemerdekaan.',
    imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=1200',
    date: '05 Juli 2026',
    initialLikes: 15,
    badgeColor: 'bg-amber-600'
  },
  {
    id: 'slide-4',
    title: 'Senam Pagi Kebugaran Keluarga RW 05',
    category: 'Olahraga & Sosial',
    description: 'Ratusan warga berpartisipasi dalam senam kebugaran jasmani bersama instruktur profesional di halaman Balai RW untuk menjaga imunitas dan kebersamaan.',
    imageUrl: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=1200',
    date: '28 Juni 2026',
    initialLikes: 31,
    badgeColor: 'bg-rose-600'
  }
];

export default function Home({
  reports,
  announcements,
  currentUser,
  setActiveTab,
  onLoginClick,
  rwTitle = 'RW 05',
  rwSubTitle = 'Mekar Wangi',
  rwLogoUrl = '',
}: HomeProps & { rwTitle?: string; rwSubTitle?: string; rwLogoUrl?: string }) {
  // Statistics Calculations
  const stats = {
    totalWarga: 450, // Static simulation for design
    totalLaporan: reports.length,
    laporanPending: reports.filter((r) => r.status === 'pending').length,
    laporanDiproses: reports.filter((r) => r.status === 'diproses').length,
    laporanSelesai: reports.filter((r) => r.status === 'selesai').length,
  };

  // Carousel States
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoplay, setIsAutoplay] = useState(true);
  const [slideLikes, setSlideLikes] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('rw_slide_likes');
    if (saved) return JSON.parse(saved);
    return {
      'slide-1': 24,
      'slide-2': 18,
      'slide-3': 15,
      'slide-4': 31,
    };
  });
  const [likedSlides, setLikedSlides] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('rw_liked_slides');
    return saved ? JSON.parse(saved) : {};
  });

  // Save likes to localStorage
  useEffect(() => {
    localStorage.setItem('rw_slide_likes', JSON.stringify(slideLikes));
  }, [slideLikes]);

  useEffect(() => {
    localStorage.setItem('rw_liked_slides', JSON.stringify(likedSlides));
  }, [likedSlides]);

  // Autoplay handler
  useEffect(() => {
    if (!isAutoplay) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % DOCUMENTATION_SLIDES.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [isAutoplay]);

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % DOCUMENTATION_SLIDES.length);
  };

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + DOCUMENTATION_SLIDES.length) % DOCUMENTATION_SLIDES.length);
  };

  const handleLikeSlide = (slideId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const isAlreadyLiked = likedSlides[slideId];
    setLikedSlides((prev) => ({ ...prev, [slideId]: !isAlreadyLiked }));
    setSlideLikes((prev) => ({
      ...prev,
      [slideId]: isAlreadyLiked ? prev[slideId] - 1 : prev[slideId] + 1,
    }));
  };

  const handleLaporClick = () => {
    if (currentUser) {
      if (currentUser.role === 'admin') {
        setActiveTab('admin');
      } else {
        setActiveTab('citizen');
      }
    } else {
      onLoginClick();
    }
  };

  return (
    <div className="space-y-8 sm:space-y-12 pb-16" id="home-view">
      
      {/* NEW: 2.5. Sliding Photo Documentation Carousel (Slide Foto Dokumentasi Kegiatan) - MOVED TO TOP & CLEANED */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="space-y-4">
          {/* Premium Carousel Frame */}
          <div 
            className="relative bg-slate-900 rounded-2xl overflow-hidden aspect-video max-h-[480px] w-full shadow-lg group border border-slate-800"
            onMouseEnter={() => setIsAutoplay(false)}
            onMouseLeave={() => setIsAutoplay(true)}
            id="activity-documentation-slider"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, scale: 1.02 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 w-full h-full"
              >
                {/* Background Image */}
                <img
                  src={DOCUMENTATION_SLIDES[currentSlide].imageUrl}
                  alt={DOCUMENTATION_SLIDES[currentSlide].title}
                  className="w-full h-full object-cover select-none"
                />
                
                {/* Visual Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                
                {/* Content Overlay */}
                <div className="absolute bottom-0 inset-x-0 p-5 sm:p-8 md:p-10 text-white space-y-2.5 sm:space-y-4 text-left">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2.5 py-1 text-[9px] sm:text-xs font-bold uppercase tracking-wider rounded-md ${DOCUMENTATION_SLIDES[currentSlide].badgeColor}`}>
                      {DOCUMENTATION_SLIDES[currentSlide].category}
                    </span>
                    <span className="text-[10px] sm:text-xs font-semibold text-slate-300 flex items-center">
                      <Calendar className="w-3.5 h-3.5 mr-1" />
                      {DOCUMENTATION_SLIDES[currentSlide].date}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-2xl md:text-3xl font-black tracking-tight leading-snug max-w-3xl text-white">
                    {DOCUMENTATION_SLIDES[currentSlide].title}
                  </h3>

                  <div className="pt-2 flex items-center justify-between border-t border-white/10">
                    <button
                      onClick={(e) => handleLikeSlide(DOCUMENTATION_SLIDES[currentSlide].id, e)}
                      className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold transition-all min-h-[36px] ${
                        likedSlides[DOCUMENTATION_SLIDES[currentSlide].id]
                          ? 'bg-rose-600 text-white shadow'
                          : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${likedSlides[DOCUMENTATION_SLIDES[currentSlide].id] ? 'fill-white' : ''}`} />
                      <span>{slideLikes[DOCUMENTATION_SLIDES[currentSlide].id]} Likes</span>
                    </button>
                    
                    <span className="text-[10px] sm:text-xs text-indigo-300 font-extrabold uppercase tracking-widest hidden sm:inline-block">
                      DOKUMENTASI RESMI {rwTitle.toUpperCase()}
                    </span>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Manual Slide Controls - Floating Arrows */}
            <button
              onClick={handlePrevSlide}
              className="absolute left-2.5 sm:left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-900/40 hover:bg-slate-950/80 border border-white/10 text-white opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity duration-200 hidden sm:flex items-center justify-center min-h-[44px] min-w-[44px]"
              aria-label="Slide sebelumnya"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNextSlide}
              className="absolute right-2.5 sm:right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-900/40 hover:bg-slate-950/80 border border-white/10 text-white opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity duration-200 hidden sm:flex items-center justify-center min-h-[44px] min-w-[44px]"
              aria-label="Slide berikutnya"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Play/Pause Autoplay Indicator & Manual Buttons on Mobile */}
            <div className="absolute top-4 right-4 flex items-center space-x-2 bg-slate-950/70 border border-white/10 px-2.5 py-1 rounded-full text-xs text-white backdrop-blur-sm">
              <button
                onClick={() => setIsAutoplay(!isAutoplay)}
                className="hover:text-indigo-400 p-0.5"
                title={isAutoplay ? 'Pause Autoplay' : 'Play Autoplay'}
              >
                {isAutoplay ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </button>
              <span className="text-[10px] font-bold text-slate-300">
                {currentSlide + 1} / {DOCUMENTATION_SLIDES.length}
              </span>
            </div>

            {/* Touch swipe indicators at the bottom */}
            <div className="absolute top-4 left-4 flex items-center space-x-1.5 sm:space-x-2 z-10">
              {DOCUMENTATION_SLIDES.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    currentSlide === index ? 'w-6 sm:w-8 bg-indigo-500' : 'w-2 bg-white/40 hover:bg-white/75'
                  }`}
                  aria-label={`Buka slide ${index + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Swipe text hint for small screens */}
          <div className="flex sm:hidden items-center justify-between px-1.5 text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
            <button onClick={handlePrevSlide} className="flex items-center text-indigo-600 dark:text-indigo-400 py-1"><ChevronLeft className="w-4 h-4 mr-0.5" /> Prev</button>
            <span>Ketuk indikator di atas untuk berpindah</span>
            <button onClick={handleNextSlide} className="flex items-center text-indigo-600 dark:text-indigo-400 py-1">Next <ChevronRight className="w-4 h-4 ml-0.5" /></button>
          </div>
        </div>
      </section>

      {/* 1. Hero Section - Mobile optimized margins and sizes */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 text-white py-12 sm:py-20 md:py-24 rounded-2xl mx-2 sm:mx-4 mt-2 sm:mt-4 shadow-xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.15),transparent_50%)] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
            <div className="text-center lg:text-left md:max-w-2xl md:mx-auto lg:col-span-7">
              <motion.span
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-bold bg-indigo-500/15 text-indigo-200 ring-1 ring-inset ring-indigo-400/30 mb-5 gap-1.5"
              >
                {rwLogoUrl ? (
                  <img src={rwLogoUrl} className="w-4 h-4 rounded-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <span>🇮🇩</span>
                )}
                Portal Resmi {rwTitle} {rwSubTitle}
              </motion.span>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight text-white"
              >
                Gotong Royong & <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-indigo-200 to-emerald-300">
                  Transparansi Digital
                </span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mt-4 text-sm sm:text-lg text-slate-300 leading-relaxed max-w-xl mx-auto lg:mx-0"
              >
                Selamat datang di platform digital resmi {rwTitle} {rwSubTitle}.
                Sampaikan aspirasi, pantau pengaduan secara real-time, dan akses informasi kegiatan warga terlengkap dalam satu pintu.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              >
                <button
                  onClick={handleLaporClick}
                  className="w-full sm:w-auto px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-indigo-500/30 transition-all duration-200 flex items-center justify-center min-h-[44px]"
                  id="hero-lapor-now"
                >
                  <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Laporkan Pengaduan
                </button>
                <button
                  onClick={() => setActiveTab('map')}
                  className="w-full sm:w-auto px-6 py-3.5 bg-slate-900/80 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm rounded-xl border border-slate-700/60 hover:border-slate-600 transition-all duration-200 flex items-center justify-center min-h-[44px]"
                >
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-indigo-400" />
                  Peta Wilayah RW
                </button>
              </motion.div>
            </div>

            {/* Illustration Card / Image Panel - Hides or shrinks smartly on mobile */}
            <div className="mt-10 sm:mt-12 lg:mt-0 lg:col-span-5 w-full">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7 }}
                className="relative mx-auto w-full max-w-md rounded-2xl overflow-hidden shadow-2xl bg-slate-900/65 backdrop-blur-md border border-slate-800/80 p-5 sm:p-6 space-y-4 text-left"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="text-xs font-bold text-indigo-400 tracking-wide uppercase">Laporan Aktif</span>
                  <span className="flex h-2, w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                </div>
                <div className="space-y-3">
                  <div className="bg-slate-800/80 rounded-lg p-3 text-sm border border-slate-700/50">
                    <div className="flex justify-between font-bold text-slate-200 text-xs sm:text-sm">
                      <span>#REP-003 Keamanan</span>
                      <span className="text-emerald-400 text-[10px] bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-900/50">Selesai</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-1">Portal Keamanan Jalan Cempaka RT 04 sudah diperbaiki...</p>
                  </div>
                  <div className="bg-slate-800/80 rounded-lg p-3 text-sm border border-slate-700/50">
                    <div className="flex justify-between font-bold text-slate-200 text-xs sm:text-sm">
                      <span>#REP-002 Infrastruktur</span>
                      <span className="text-amber-400 text-[10px] bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-900/50">Diproses</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-1">Lampu mati depan Masjid Al-Ikhlas sedang ditangani...</p>
                  </div>
                </div>
                <div className="text-center pt-2">
                  <button
                    onClick={() => setActiveTab(currentUser ? (currentUser.role === 'admin' ? 'admin' : 'citizen') : 'gallery')}
                    className="text-xs font-bold text-indigo-300 hover:text-indigo-200 inline-flex items-center"
                  >
                    Selengkapnya <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Statistics Bar - Highly responsive spacing for phone viewports */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4" id="stats-dashboard-bar">
          {[
            { label: 'Estimasi Warga', val: stats.totalWarga, icon: Users, color: 'text-indigo-600 bg-indigo-50 border-indigo-100 dark:text-indigo-400 dark:bg-indigo-950/40 dark:border-indigo-900/40' },
            { label: 'Total Laporan', val: stats.totalLaporan, icon: MessageSquare, color: 'text-slate-600 bg-slate-50 border-slate-100 dark:text-slate-400 dark:bg-slate-900/60 dark:border-slate-800' },
            { label: 'Dalam Proses', val: stats.laporanDiproses, icon: Clock, color: 'text-amber-600 bg-amber-50 border-amber-100 dark:text-amber-400 dark:bg-amber-950/40 dark:border-amber-900/40' },
            { label: 'Selesai Ditangani', val: stats.laporanSelesai, icon: CheckCircle, color: 'text-emerald-600 bg-emerald-50 border-emerald-100 dark:text-emerald-400 dark:bg-emerald-950/40 dark:border-emerald-900/40' }
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.03, rotate: [-0.4, 0.4, 0], y: -3 }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                className="bg-white dark:bg-slate-800 p-3.5 sm:p-5 rounded-xl border border-slate-100 dark:border-slate-700 flex items-center space-x-2.5 sm:space-x-4 shadow-sm transition-colors duration-300"
              >
                <div className={`p-2 sm:p-3 rounded-lg shrink-0 ${item.color}`}>
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <div className="text-lg sm:text-2xl font-black text-slate-800 dark:text-slate-100 leading-tight">{item.val}</div>
                  <div className="text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">{item.label}</div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Original Carousel section removed and moved to the very top */}

      {/* 3. Main Content: Announcements & Quick Access */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
          
          {/* Announcements (Pengumuman Terkini) - Left 7 Cols */}
          <div className="lg:col-span-8 space-y-5 sm:space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Megaphone className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600 dark:text-indigo-400" />
                <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-100">Pengumuman Terkini</h2>
              </div>
              <span className="text-xs font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-300 px-3 py-1 rounded-full border border-indigo-100 dark:border-indigo-900/50">{rwTitle}</span>
            </div>

            <div className="space-y-4" id="home-announcements-list">
              {announcements.map((ann, idx) => (
                <motion.div
                  key={ann.id}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.015, rotate: [-0.2, 0.2, 0], x: 2 }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                  className="bg-white dark:bg-slate-800 p-5 sm:p-6 rounded-xl border border-slate-150/80 dark:border-slate-700/80 shadow-sm hover:shadow-md dark:hover:shadow-indigo-950/20 transition-all duration-200 relative overflow-hidden"
                >
                  {/* Decorative tag background */}
                  <div className={`absolute top-0 left-0 w-1.5 h-full ${
                    ann.category === 'Penting' ? 'bg-rose-500' :
                    ann.category === 'Kegiatan' ? 'bg-emerald-500' : 'bg-indigo-500'
                  }`} />
                                <div className="flex items-center justify-between mb-2">
                    <span className={`inline-block text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      ann.category === 'Penting' ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/40' :
                      ann.category === 'Kegiatan' ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40' :
                      'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40'
                    }`}>
                      {ann.category}
                    </span>
                    <span className="flex items-center text-[11px] sm:text-xs text-slate-400 dark:text-slate-500 font-semibold">
                      <Calendar className="w-3.5 h-3.5 mr-1" />
                      {ann.date}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 mb-2 leading-snug">{ann.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">{ann.content}</p>
                  
                  <div className="flex justify-between items-center text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 font-semibold pt-3 border-t border-slate-550/30 dark:border-slate-700/50">
                    <span>Oleh: <strong className="text-slate-600 dark:text-slate-300 font-bold">{ann.author}</strong></span>
                    <span>Admin RW 05</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Quick Info & Services Menu - Right 4 Cols */}
          <div className="lg:col-span-4 space-y-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-100 mb-4 sm:mb-6">Layanan Cepat</h2>
              <div className="space-y-4.5" id="quick-services-box">
                {[
                  {
                    title: 'Lapor Pengaduan Warga',
                    desc: 'Laporkan masalah lingkungan seperti jalan rusak, lampu padam, keamanan, atau kebersihan secara instan.',
                    action: handleLaporClick,
                    badge: 'Aspirasi',
                    color: 'hover:border-indigo-200 bg-indigo-50/20'
                  },
                  {
                    title: 'Galeri Kegiatan & Foto',
                    desc: 'Dokumentasi berbagai kegiatan RW mulai dari gotong royong, posyandu, pos ronda, hingga perlombaan.',
                    action: () => setActiveTab('gallery'),
                    badge: 'Dokumentasi',
                    color: 'hover:border-emerald-200 bg-emerald-50/20'
                  },
                  {
                    title: 'Hubungi Sektor RW',
                    desc: 'Ada keadaan darurat atau butuh pengantar surat? Hubungi kami langsung via formulir online atau kontak WhatsApp.',
                    action: () => setActiveTab('contact'),
                    badge: 'Layanan',
                    color: 'hover:border-amber-200 bg-amber-50/20'
                  }
                ].map((serv, index) => (
                  <motion.div
                    key={index}
                    onClick={serv.action}
                    whileHover={{ scale: 1.025, rotate: [-0.5, 0.5, 0], y: -3 }}
                    className="p-5 rounded-xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md dark:hover:shadow-indigo-950/20 transition-all duration-200 cursor-pointer hover:border-indigo-200 dark:hover:border-indigo-800 group text-left min-h-[44px]"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-full uppercase tracking-wider">{serv.badge}</span>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{serv.title}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{serv.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Quick Map Highlight teaser */}
            <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700 p-5 sm:p-6 rounded-xl space-y-4 text-left">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center">
                <MapPin className="w-4 h-4 mr-1.5 text-indigo-600 dark:text-indigo-400" />
                Highlight Wilayah {rwTitle}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Wilayah kami terdiri dari 4 Rukun Tetangga (RT 01 s/d RT 04) dengan pusat administrasi di Balai {rwTitle}.
                Seluruh pengaduan terpetakan berdasarkan RT masing-masing.
              </p>
              <button
                onClick={() => setActiveTab('map')}
                className="w-full py-2.5 bg-white dark:bg-slate-800 hover:bg-slate-150 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 rounded-lg transition-all flex items-center justify-center min-h-[40px]"
              >
                Buka Peta Interaktif
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* 4. Citizens Say / Kerukunan Warga Quote Banner - Mobile friendly padding */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-teal-500 to-emerald-600 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg shadow-teal-100/30">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full translate-x-10 -translate-y-10 pointer-events-none" />
          <div className="max-w-3xl space-y-3 sm:space-y-4 relative z-10 text-left">
            <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-teal-100 fill-teal-100" />
            <h3 className="text-xl sm:text-2xl font-black">"Sarendeuk Saigel Sabobot Sapihanean"</h3>
            <p className="text-xs sm:text-sm md:text-base text-teal-550 leading-relaxed italic">
              "Saling seia sekata, sejalan satu arah, bersama-sama dalam memikul beban dan berbagi kebahagiaan demi mewujudkan ketentraman lingkungan {rwTitle} {rwSubTitle}."
            </p>
            <div className="text-[10px] sm:text-xs font-bold text-teal-100">
              — Pepatah Kerukunan & Sinergi Warga
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
