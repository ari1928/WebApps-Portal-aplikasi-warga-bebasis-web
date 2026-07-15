import { useState, useRef, useEffect } from 'react';
import { MapFeature, Report } from '../types';
import { INITIAL_MAP_FEATURES } from '../data';
import { MapPin, Info, Tag, AlertCircle, Shield, Building, Compass, Sparkles, X, CheckCircle, Clock, Send, MessageSquare, Loader2, Search, Map } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface InteractiveMapProps {
  reports: Report[];
}

export default function InteractiveMap({ reports }: InteractiveMapProps) {
  const [selectedFeature, setSelectedFeature] = useState<MapFeature | null>(null);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [activeTab, setActiveTab] = useState<'semua' | 'fasilitas' | 'keamanan' | 'pengaduan'>('semua');
  const [hoveredRt, setHoveredRt] = useState<string | null>(null);

  // New Modes & Tab states
  const [mapMode, setMapMode] = useState<'schematic' | 'google'>('schematic');
  const [rightTab, setRightTab] = useState<'info' | 'assistant'>('info');

  // AI Assistant states
  const [aiQuery, setAiQuery] = useState('');
  const [aiMessages, setAiMessages] = useState<Array<{ sender: 'user' | 'assistant'; text: string; chunks?: any[] }>>([
    {
      sender: 'assistant',
      text: 'Halo! Saya Asisten Peta AI RW 07 Palmeriam. Tanyakan apa saja mengenai rute, lokasi penting, fasilitas kesehatan, tempat makan, halte busway, atau tempat menarik lainnya di sekitar Palmeriam dan Matraman! Jawaban saya didukung oleh pencarian Google Maps nyata secara real-time.'
    }
  ]);
  const [aiLoading, setAiLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiMessages, aiLoading]);

  // AI assistant handlers
  const handleSendQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim() || aiLoading) return;

    const userText = aiQuery.trim();
    setAiQuery('');
    setAiMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setAiLoading(true);

    try {
      // Default coordinates to Palmeriam, Jakarta Timur
      let lat = -6.2069;
      let lng = 106.8576;
      
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            fetchAiResponse(userText, position.coords.latitude, position.coords.longitude);
          },
          () => {
            fetchAiResponse(userText, lat, lng);
          },
          { timeout: 4000 }
        );
      } else {
        fetchAiResponse(userText, lat, lng);
      }
    } catch (error) {
      console.error(error);
      setAiLoading(false);
    }
  };

  const fetchAiResponse = async (query: string, lat: number, lng: number) => {
    try {
      const res = await fetch('/api/maps/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: query, latitude: lat, longitude: lng }),
      });

      if (!res.ok) {
        throw new Error('Gagal menghubungi asisten AI');
      }

      const data = await res.json();
      setAiMessages(prev => [...prev, {
        sender: 'assistant',
        text: data.text,
        chunks: data.chunks
      }]);
    } catch (err: any) {
      setAiMessages(prev => [...prev, {
        sender: 'assistant',
        text: 'Maaf, terjadi kesalahan koneksi dengan server AI. Silakan coba sesaat lagi.'
      }]);
    } finally {
      setAiLoading(false);
    }
  };

  const getChunkLink = (chunk: any) => {
    if (chunk.maps) {
      return {
        uri: chunk.maps.uri || '',
        title: chunk.maps.title || 'Buka di Google Maps'
      };
    }
    if (chunk.web) {
      return {
        uri: chunk.web.uri || '',
        title: chunk.web.title || 'Sumber Informasi'
      };
    }
    return null;
  };

  // Map features
  const staticFeatures = INITIAL_MAP_FEATURES;

  // Let's dynamically map reports to specific locations inside their selected RT to represent them real-time!
  const getReportCoordinates = (report: Report, index: number) => {
    // Generate predictable coordinates based on RT and ID to place them neatly on the map
    const idHash = report.id.charCodeAt(report.id.length - 1) || index;
    const rtStr = report.rt;
    
    if (['RT 01', 'RT 05', 'RT 09', 'RT 13'].includes(rtStr)) {
      // Sektor Barat (RT 01, 05, 09, 13)
      return { x: 18 + (idHash % 20), y: 12 + (idHash % 20) };
    } else if (['RT 02', 'RT 06', 'RT 10', 'RT 14'].includes(rtStr)) {
      // Sektor Utara (RT 02, 06, 10, 14)
      return { x: 58 + (idHash % 20), y: 12 + (idHash % 20) };
    } else if (['RT 03', 'RT 07', 'RT 11'].includes(rtStr)) {
      // Sektor Selatan (RT 03, 07, 11)
      return { x: 18 + (idHash % 20), y: 58 + (idHash % 20) };
    } else if (['RT 04', 'RT 08', 'RT 12'].includes(rtStr)) {
      // Sektor Timur (RT 04, 08, 12)
      return { x: 58 + (idHash % 20), y: 58 + (idHash % 20) };
    } else {
      // Default to randomized placement in some quadrant
      const sector = idHash % 4;
      if (sector === 0) return { x: 18 + (idHash % 20), y: 12 + (idHash % 20) };
      if (sector === 1) return { x: 58 + (idHash % 20), y: 12 + (idHash % 20) };
      if (sector === 2) return { x: 18 + (idHash % 20), y: 58 + (idHash % 20) };
      return { x: 58 + (idHash % 20), y: 58 + (idHash % 20) };
    }
  };

  const dynamicReportPins = reports.map((rep, idx) => ({
    id: rep.id,
    name: rep.title,
    type: 'laporan' as const,
    coords: getReportCoordinates(rep, idx),
    description: rep.description,
    status: rep.status,
    reportData: rep,
  }));

  const handlePinClick = (pin: any) => {
    if (pin.type === 'laporan') {
      setSelectedReport(pin.reportData);
      setSelectedFeature(null);
    } else {
      setSelectedFeature({
        id: pin.id,
        name: pin.name,
        type: pin.type,
        coords: pin.coords,
        description: pin.description,
      });
      setSelectedReport(null);
    }
  };

  // Filter Pins
  const allPins = [
    ...staticFeatures.map(f => ({ ...f, type: f.type as 'fasilitas' | 'keamanan' | 'laporan' })),
    ...dynamicReportPins
  ];

  const filteredPins = allPins.filter(pin => {
    if (activeTab === 'semua') return true;
    if (activeTab === 'fasilitas' && pin.type === 'fasilitas') return true;
    if (activeTab === 'keamanan' && pin.type === 'keamanan') return true;
    if (activeTab === 'pengaduan' && pin.type === 'laporan') return true;
    return false;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-16" id="interactive-map-view">
      
      {/* 1. Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 dark:border-slate-750 pb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-display font-bold text-slate-800 dark:text-slate-100 tracking-tight flex items-center">
            <Compass className="w-6 h-6 text-indigo-600 dark:text-indigo-400 mr-2 shrink-0 animate-spin-slow" />
            Peta Sektor Wilayah RW 07
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Sistem pemetaan digital RT 01 - RT 14 terintegrasi penanda laporan pengaduan warga secara real-time.</p>
        </div>

        {/* Filters and legend */}
        <div className="flex items-center space-x-1 sm:space-x-2 bg-slate-50 dark:bg-slate-900/40 p-1 rounded-xl border border-slate-200/60 dark:border-slate-750 self-start md:self-center">
          <button
            onClick={() => setActiveTab('semua')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'semua' ? 'bg-indigo-600 text-white shadow-md dark:shadow-none' : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400'
            }`}
          >
            Semua Pin
          </button>
          <button
            onClick={() => setActiveTab('fasilitas')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'fasilitas' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-indigo-100 dark:border-indigo-900/30' : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400'
            }`}
          >
            Fasilitas
          </button>
          <button
            onClick={() => setActiveTab('keamanan')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'keamanan' ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow-sm border border-amber-100 dark:border-amber-900/30' : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400'
            }`}
          >
            Keamanan
          </button>
          <button
            onClick={() => setActiveTab('pengaduan')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all relative ${
              activeTab === 'pengaduan' ? 'bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 shadow-sm border border-rose-100 dark:border-rose-900/30' : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400'
            }`}
          >
            Pengaduan
            <span className="absolute -top-1 -right-1 block h-2.5 w-2.5 rounded-full ring-2 ring-white dark:ring-slate-800 bg-rose-500" />
          </button>
        </div>
      </div>

      {/* 2. Map Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* SVG Map Container - 8 Cols */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white dark:bg-slate-800 p-4 rounded-3xl border border-slate-100 dark:border-slate-750 shadow-sm relative overflow-hidden transition-colors duration-300">
            <div className="absolute top-4 left-4 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border border-slate-100 dark:border-slate-700 p-3 rounded-2xl shadow-md z-10 text-xs space-y-1.5">
              <h4 className="font-extrabold text-slate-800 dark:text-slate-100">Keterangan Sektor Wilayah</h4>
              <div className="space-y-1 text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                <div className="flex items-center"><span className="w-3.5 h-2.5 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/50 rounded mr-1.5" />Barat (RT 01, 05, 09, 13)</div>
                <div className="flex items-center"><span className="w-3.5 h-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 rounded mr-1.5" />Utara (RT 02, 06, 10, 14)</div>
                <div className="flex items-center"><span className="w-3.5 h-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 rounded mr-1.5" />Selatan (RT 03, 07, 11)</div>
                <div className="flex items-center"><span className="w-3.5 h-2.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50 rounded mr-1.5" />Timur (RT 04, 08, 12)</div>
              </div>
            </div>

            <div className="aspect-video w-full relative bg-slate-50 dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200/50 dark:border-slate-700">
              {/* SVG vector representing Map layout */}
              <svg
                viewBox="0 0 800 500"
                className="w-full h-full select-none"
                id="neighborhood-svg-map"
              >
                {/* GRID LINES background */}
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" className="text-slate-100 dark:text-slate-800/40" strokeWidth="1" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />

                {/* Sektor Barat Area - Top Left */}
                <path
                  d="M 100 20 L 420 20 L 420 250 L 100 250 Z"
                  fill={hoveredRt === 'RT 01' || hoveredRt === 'sektor-barat' ? 'rgba(99,102,241,0.08)' : 'rgba(99,102,241,0.02)'}
                  stroke="rgba(99,102,241,0.3)"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                  className="transition-colors duration-200 cursor-pointer"
                  onMouseEnter={() => setHoveredRt('sektor-barat')}
                  onMouseLeave={() => setHoveredRt(null)}
                />
                <text x="120" y="50" className="fill-indigo-400 font-black text-[9px] sm:text-xs uppercase tracking-wider opacity-60">Sektor Barat (RT 01, 05, 09, 13)</text>

                {/* Sektor Utara Area - Top Right */}
                <path
                  d="M 420 20 L 780 20 L 780 250 L 420 250 Z"
                  fill={hoveredRt === 'RT 02' || hoveredRt === 'sektor-utara' ? 'rgba(16,185,129,0.08)' : 'rgba(16,185,129,0.02)'}
                  stroke="rgba(16,185,129,0.3)"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                  className="transition-colors duration-200 cursor-pointer"
                  onMouseEnter={() => setHoveredRt('sektor-utara')}
                  onMouseLeave={() => setHoveredRt(null)}
                />
                <text x="440" y="50" className="fill-emerald-400 font-black text-[9px] sm:text-xs uppercase tracking-wider opacity-60">Sektor Utara (RT 02, 06, 10, 14)</text>

                {/* Sektor Selatan Area - Bottom Left */}
                <path
                  d="M 100 250 L 420 250 L 420 480 L 100 480 Z"
                  fill={hoveredRt === 'RT 03' || hoveredRt === 'sektor-selatan' ? 'rgba(245,158,11,0.08)' : 'rgba(245,158,11,0.02)'}
                  stroke="rgba(245,158,11,0.3)"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                  className="transition-colors duration-200 cursor-pointer"
                  onMouseEnter={() => setHoveredRt('sektor-selatan')}
                  onMouseLeave={() => setHoveredRt(null)}
                />
                <text x="120" y="290" className="fill-amber-400 font-black text-[9px] sm:text-xs uppercase tracking-wider opacity-60">Sektor Selatan (RT 03, 07, 11)</text>

                {/* Sektor Timur Area - Bottom Right */}
                <path
                  d="M 420 250 L 780 250 L 780 480 L 420 480 Z"
                  fill={hoveredRt === 'RT 04' || hoveredRt === 'sektor-timur' ? 'rgba(244,63,94,0.08)' : 'rgba(244,63,94,0.02)'}
                  stroke="rgba(244,63,94,0.3)"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                  className="transition-colors duration-200 cursor-pointer"
                  onMouseEnter={() => setHoveredRt('sektor-timur')}
                  onMouseLeave={() => setHoveredRt(null)}
                />
                <text x="440" y="290" className="fill-rose-400 font-black text-[9px] sm:text-xs uppercase tracking-wider opacity-60">Sektor Timur (RT 04, 08, 12)</text>

                {/* 1. Jl. Matraman Raya (Left main highway, x: 0 to 100, center is x:50) */}
                <rect x="0" y="0" width="100" height="500" className="fill-slate-200 dark:fill-slate-800" />
                <line x1="50" y1="0" x2="50" y2="500" stroke="currentColor" className="text-white dark:text-slate-600" strokeWidth="2" strokeDasharray="10 10" />
                {/* TransJakarta special lane border */}
                <line x1="90" y1="0" x2="90" y2="500" stroke="currentColor" className="text-red-500/30 dark:text-red-500/20" strokeWidth="3" />
                <rect x="90" y="0" width="10" height="500" className="fill-red-500/10 dark:fill-red-500/5" />

                {/* 2. Jl. Palmeriam I (Horizontal street crossing entire map from x:100 to 800 at y:250) */}
                <path d="M 100 250 L 800 250" stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeWidth="24" strokeLinecap="square" />

                {/* 3. Jl. Palmeriam II (Vertical street from y:0 to 500 at x:420) */}
                <path d="M 420 0 L 420 500" stroke="currentColor" className="text-slate-200 dark:text-slate-800" strokeWidth="20" strokeLinecap="square" />

                {/* 4. Jl. Palmeriam III (Vertical street from y:250 to 500 at x:700) */}
                <path d="M 700 250 L 700 500" stroke="currentColor" className="text-slate-100 dark:text-slate-850" strokeWidth="16" strokeLinecap="square" />

                {/* Alleys / Gang-gang */}
                <path d="M 100 120 L 420 120" stroke="currentColor" className="text-slate-300 dark:text-slate-700" strokeWidth="8" strokeDasharray="4 4" />
                <path d="M 420 380 L 800 380" stroke="currentColor" className="text-slate-300 dark:text-slate-700" strokeWidth="8" strokeDasharray="4 4" />

                {/* Street Names */}
                <text x="35" y="250" className="fill-slate-400 dark:fill-slate-500 font-black text-[10px] uppercase tracking-widest" transform="rotate(-90 35 250)">Jl. Matraman Raya</text>
                <text x="93" y="210" className="fill-red-500/60 dark:fill-red-400/50 font-black text-[8px] uppercase tracking-wider" transform="rotate(-90 93 210)">Jalur Busway</text>
                
                <text x="180" y="254" className="fill-slate-400 dark:fill-slate-500 font-extrabold text-[9px] uppercase tracking-wider">Jl. Palmeriam I</text>
                <text x="415" y="120" className="fill-slate-400 dark:fill-slate-500 font-extrabold text-[9px] uppercase tracking-wider" transform="rotate(-90 415 120)">Jl. Palmeriam II</text>
                <text x="695" y="340" className="fill-slate-400 dark:fill-slate-500 font-extrabold text-[9px] uppercase tracking-wider" transform="rotate(-90 695 340)">Jl. Palmeriam III</text>
                
                <text x="180" y="115" className="fill-slate-400 dark:fill-slate-500 font-medium text-[8px] uppercase tracking-wider">Gang Masjid</text>
                <text x="500" y="375" className="fill-slate-400 dark:fill-slate-500 font-medium text-[8px] uppercase tracking-wider">Gang Pos RW</text>
              </svg>

              {/* HTML Floating Pins on the SVG Canvas */}
              {filteredPins.map((pin) => {
                const isSelected = selectedFeature?.id === pin.id || selectedReport?.id === pin.id;
                return (
                  <button
                    key={pin.id}
                    onClick={() => handlePinClick(pin)}
                    style={{ left: `${pin.coords.x}%`, top: `${pin.coords.y}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 focus:outline-none z-20 group animate-fade-in"
                  >
                    <div className="relative flex items-center justify-center">
                      {/* Interactive ping radar effect for reports */}
                      {pin.type === 'laporan' && (
                        <span className={`absolute inline-flex h-8 w-8 rounded-full opacity-60 animate-ping ${
                          pin.status === 'pending' ? 'bg-rose-400' :
                          pin.status === 'diproses' ? 'bg-amber-400' : 'bg-emerald-400'
                        }`} />
                      )}

                      <div className={`p-1.5 rounded-full shadow-lg border transition-all duration-150 ${
                        isSelected 
                          ? 'scale-125 bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-white dark:border-slate-900' 
                          : pin.type === 'fasilitas' 
                            ? 'bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-100 hover:scale-110' 
                            : pin.type === 'keamanan'
                              ? 'bg-amber-500 hover:bg-amber-600 text-white border-amber-100 hover:scale-110'
                              : pin.status === 'pending'
                                ? 'bg-rose-500 text-white border-rose-100 hover:scale-110'
                                : pin.status === 'diproses'
                                  ? 'bg-amber-50 text-amber-700 dark:bg-amber-500 dark:text-white border-amber-100 hover:scale-110'
                                  : 'bg-emerald-500 text-white border-emerald-100 hover:scale-110'
                      }`}>
                        {pin.type === 'fasilitas' && <Building className="w-3.5 h-3.5" />}
                        {pin.type === 'keamanan' && <Shield className="w-3.5 h-3.5" />}
                        {pin.type === 'laporan' && <AlertCircle className="w-3.5 h-3.5" />}
                      </div>

                      {/* Tooltip name */}
                      <span className="absolute bottom-full mb-1 bg-slate-900 dark:bg-slate-750 text-white font-semibold text-[9px] px-1.5 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-30 shadow-md">
                        {pin.name}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Info panel - 4 Cols */}
        <div className="lg:col-span-4" id="map-detail-panel">
          <AnimatePresence mode="wait">
            {selectedFeature && (
              <motion.div
                key="feature"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-750 shadow-sm space-y-4 transition-colors duration-300"
              >
                <div className="flex justify-between items-start">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    selectedFeature.type === 'fasilitas' ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40' : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-900/40'
                  }`}>
                    {selectedFeature.type}
                  </span>
                  <button onClick={() => setSelectedFeature(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-1.5">
                  <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-lg leading-tight">{selectedFeature.name}</h3>
                  <div className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 flex items-center">
                    <MapPin className="w-3 h-3 mr-1 text-slate-300 dark:text-slate-600" />
                    RW 07 Palmeriam
                  </div>
                </div>

                <p className="text-xs text-slate-505 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-900/30 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                  {selectedFeature.description}
                </p>

                <div className="pt-2">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase">Fasilitas Bersama</span>
                </div>
              </motion.div>
            )}

            {selectedReport && (
              <motion.div
                key="report"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-750 shadow-sm space-y-4 transition-colors duration-300"
              >
                <div className="flex justify-between items-start">
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                    selectedReport.status === 'pending' ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/40' :
                    selectedReport.status === 'diproses' ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/40' :
                    'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40'
                  }`}>
                    {selectedReport.status}
                  </span>
                  <button onClick={() => setSelectedReport(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-1.5">
                  <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-base leading-tight">Pengaduan: {selectedReport.title}</h3>
                  <div className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center justify-between">
                    <span className="flex items-center">
                      <MapPin className="w-3 h-3 mr-0.5 text-indigo-500" />
                      Sektor {selectedReport.rt}
                    </span>
                    <span className="text-slate-400 dark:text-slate-500 font-semibold">{selectedReport.date}</span>
                  </div>
                </div>

                {selectedReport.imageUrl && (
                  <div className="aspect-video w-full rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                    <img src={selectedReport.imageUrl} alt={selectedReport.title} className="w-full h-full object-cover" />
                  </div>
                )}

                <p className="text-xs text-slate-500 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-900/30 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
                  {selectedReport.description}
                </p>

                <div className="border-t border-slate-100 dark:border-slate-700 pt-3 flex items-center justify-between text-[11px]">
                  <div className="flex items-center space-x-1.5">
                    <img src={selectedReport.citizenAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'} alt={selectedReport.citizenName} className="w-5 h-5 rounded-full border border-slate-200 dark:border-slate-700" />
                    <span className="text-slate-600 dark:text-slate-300 font-bold">{selectedReport.citizenName}</span>
                  </div>
                  <span className="text-slate-400 dark:text-slate-500 font-medium">Pelapor</span>
                </div>

                {selectedReport.adminNotes && (
                  <div className="bg-amber-50/10 p-3 rounded-xl border border-amber-500/20 text-amber-800 dark:text-amber-200 space-y-1">
                    <h4 className="text-[10px] font-extrabold text-amber-700 dark:text-amber-400 flex items-center uppercase">
                      <Compass className="w-3 h-3 mr-1" /> Catatan Admin RW
                    </h4>
                    <p className="text-[11px] text-amber-850 dark:text-amber-200 font-medium leading-relaxed">{selectedReport.adminNotes}</p>
                  </div>
                )}
              </motion.div>
            )}

            {!selectedFeature && !selectedReport && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-slate-50 dark:bg-slate-900/30 border border-slate-200/60 dark:border-slate-750 p-6 rounded-3xl text-center space-y-4"
              >
                <div className="bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 p-4 rounded-full w-fit mx-auto">
                  <Compass className="w-6 h-6 animate-pulse" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">Jelajahi Peta RW</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">
                    Klik pada penanda peta (Pin) untuk melihat info lengkap fasilitas umum atau laporan aduan warga secara real-time.
                  </p>
                </div>
                <div className="border-t border-slate-200/80 dark:border-slate-750 pt-3 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  PORTAL WARGA RW 07
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

    </div>
  );
}
