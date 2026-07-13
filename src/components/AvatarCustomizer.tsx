import React, { useState, useEffect } from 'react';
import { Sparkles, Cpu, Check, Loader2, RefreshCw, Smile, Wand2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AvatarCustomizerProps {
  currentAvatarUrl: string;
  onAvatarSelect: (newUrl: string) => void;
  userName: string;
}

const PREDEFINED_AVATARS = [
  {
    id: 'pria-kacamata',
    name: 'Warga Kacamata',
    url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
    category: 'Casual'
  },
  {
    id: 'wanita-senyum',
    name: 'Warga Ramah',
    url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
    category: 'Casual'
  },
  {
    id: 'pria-jas',
    name: 'Pengurus Profesional',
    url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=150',
    category: 'Formal'
  },
  {
    id: 'wanita-profesional',
    name: 'Sekretaris Anggun',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150',
    category: 'Formal'
  },
  {
    id: 'pria-keren',
    name: 'Pemuda Kreatif',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
    category: 'Casual'
  },
  {
    id: 'wanita-hijab',
    name: 'Warga Hijab Elok',
    url: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&q=80&w=150',
    category: 'Casual'
  },
  {
    id: 'robot-ai',
    name: 'Robot Pelayanan AI',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=150',
    category: 'Siber'
  },
  {
    id: 'siber-punk',
    name: 'Warga Siberpunk',
    url: 'https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?auto=format&fit=crop&q=80&w=150',
    category: 'Siber'
  }
];

const PROMPT_SUGGESTIONS = [
  'Kucing astronot siberpunk dengan kacamata neon',
  'Robot asisten warga yang ramah dan penuh warna',
  'Pengurus RW futuristik dengan helm holografik',
  'Garuda siber bersinar emas dengan sirkuit biru',
  'Karakter anime warga digital dengan headphone canggih',
];

const LOADING_STEPS = [
  'Menghubungkan ke Jaringan AI...',
  'Merancang konsep struktur visual...',
  'Merangkai baris kode vector SVG...',
  'Mengaplikasikan gradien warna siber...',
  'Menyempurnakan detail estetika siber...',
  'Selesai! Menyajikan avatar unik Anda...'
];

export default function AvatarCustomizer({
  currentAvatarUrl,
  onAvatarSelect,
  userName,
}: AvatarCustomizerProps) {
  const [activeTab, setActiveTab] = useState<'predefined' | 'ai'>('predefined');
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('Cyberpunk Neon');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [generatedSvg, setGeneratedSvg] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Rotate loading step messages
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % LOADING_STEPS.length);
      }, 1500);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleSelectPredefined = (url: string) => {
    onAvatarSelect(url);
    setSuccessMessage('Avatar berhasil diperbarui!');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleGenerateAiAvatar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setErrorMessage(null);
    setGeneratedSvg(null);

    const fullPrompt = `${prompt.trim()} in style of ${selectedStyle}, beautiful circular profile vector badge, solid vibrant colors, modern clean aesthetic.`;

    try {
      const response = await fetch('/api/avatar/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: fullPrompt }),
      });

      if (!response.ok) {
        throw new Error('Gagal menghasilkan avatar. Pastikan server aktif.');
      }

      const data = await response.json();
      if (data.svg) {
        setGeneratedSvg(data.svg);
      } else {
        throw new Error('Format respon tidak sesuai. SVG tidak ditemukan.');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Terjadi kesalahan saat menghubungi server AI.');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyAiAvatar = () => {
    if (!generatedSvg) return;
    const dataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(generatedSvg)}`;
    onAvatarSelect(dataUrl);
    setSuccessMessage('Avatar AI berhasil dipasang di profil Anda!');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800 p-5 sm:p-6 rounded-2xl space-y-6 text-left">
      <div>
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 rounded-lg">
            <Cpu className="w-5 h-5" />
          </div>
          <h3 className="font-extrabold text-sm sm:text-base text-slate-800 dark:text-slate-100">Kustomisasi Avatar Profil</h3>
        </div>
        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
          Kustomisasikan tampilan foto profil Anda di Portal Warga menggunakan preset keren atau buat karya seni AI orisinal instan.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
        <button
          type="button"
          onClick={() => setActiveTab('predefined')}
          className={`flex-1 flex items-center justify-center py-2 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'predefined'
              ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
              : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <Smile className="w-4 h-4 mr-1.5 shrink-0" />
          Preset Karakter
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('ai')}
          className={`flex-1 flex items-center justify-center py-2 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'ai'
              ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
              : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-4 h-4 mr-1.5 shrink-0 text-amber-500" />
          Avatar Kreator AI
        </button>
      </div>

      <AnimatePresence mode="wait">
        {/* TAB 1: PREDEFINED AVATARS */}
        {activeTab === 'predefined' && (
          <motion.div
            key="predefined"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {PREDEFINED_AVATARS.map((avatar) => {
                const isSelected = currentAvatarUrl === avatar.url;
                return (
                  <button
                    key={avatar.id}
                    type="button"
                    onClick={() => handleSelectPredefined(avatar.url)}
                    className={`relative p-2 rounded-xl border text-center transition-all group overflow-hidden ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/20 dark:border-indigo-500 ring-2 ring-indigo-500/10'
                        : 'border-slate-100 dark:border-slate-850 bg-white dark:bg-slate-900 hover:border-slate-200 dark:hover:border-slate-700 hover:scale-[1.02]'
                    }`}
                  >
                    <div className="relative mx-auto w-16 h-16 sm:w-18 sm:h-18 mb-2">
                      <img
                        src={avatar.url}
                        alt={avatar.name}
                        className="w-full h-full rounded-full object-cover border-2 border-slate-100 dark:border-slate-800"
                        referrerPolicy="no-referrer"
                      />
                      {isSelected && (
                        <div className="absolute -bottom-1 -right-1 bg-indigo-600 text-white p-1 rounded-full border border-white dark:border-slate-900 shadow">
                          <Check className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                    <div className="text-[10px] font-bold text-slate-700 dark:text-slate-300 line-clamp-1">{avatar.name}</div>
                    <span className="text-[8px] font-semibold text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800 px-1.5 py-0.5 rounded-full mt-1 inline-block">
                      {avatar.category}
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* TAB 2: AI AVATAR CREATOR */}
        {activeTab === 'ai' && (
          <motion.div
            key="ai"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-5"
          >
            <form onSubmit={handleGenerateAiAvatar} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Konsep Ide / Prompt Avatar
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Contoh: kucing gamer cyberpunk dengan visor menyala..."
                    className="w-full text-xs sm:text-sm pl-4 pr-10 py-3 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-sm"
                  />
                  <div className="absolute right-3 top-3.5 text-slate-400">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                  </div>
                </div>
              </div>

              {/* Suggestions */}
              <div className="space-y-1.5">
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Ide Inspirasi:</span>
                <div className="flex flex-wrap gap-1.5">
                  {PROMPT_SUGGESTIONS.map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => setPrompt(sug)}
                      className="px-2.5 py-1 text-[9px] font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg transition-colors border border-slate-200/20"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom options: preset style & action button */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Gaya Preset Seni AI</label>
                  <select
                    value={selectedStyle}
                    onChange={(e) => setSelectedStyle(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option>Cyberpunk Neon Glow</option>
                    <option>Minimalist Vector Badge</option>
                    <option>3D Glossy Clay Character</option>
                    <option>Retro 8-Bit Pixel Art</option>
                    <option>Vibrant Cosmic Fantasy</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={loading || !prompt.trim()}
                    className={`w-full py-2 px-4 rounded-lg text-xs font-bold text-white flex items-center justify-center transition-all gap-1.5 ${
                      loading || !prompt.trim()
                        ? 'bg-slate-300 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                        : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-md shadow-indigo-100 dark:shadow-none hover:scale-[1.01]'
                    }`}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Sedang Merancang...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                        Hasilkan Avatar AI ✨
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border border-rose-100 dark:border-rose-900/40 rounded-xl text-xs">
                {errorMessage}
              </div>
            )}

            {/* AI Generator Loading Animation Area */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-8 bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                <div className="relative">
                  <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-xl animate-pulse" />
                  <div className="relative border-4 border-indigo-600/20 border-t-indigo-600 w-12 h-12 rounded-full animate-spin" />
                </div>
                <div className="mt-4 text-center">
                  <p className="text-xs font-extrabold text-slate-700 dark:text-slate-200">
                    {LOADING_STEPS[loadingStep]}
                  </p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">Gagasan Anda sedang diwujudkan oleh AI</p>
                </div>
              </div>
            )}

            {/* AI Result Area */}
            {generatedSvg && !loading && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-5 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl flex flex-col sm:flex-row items-center gap-6"
              >
                <div className="relative w-28 h-28 shrink-0 bg-slate-50 dark:bg-slate-950/40 p-2 rounded-full border border-slate-100 dark:border-slate-800 flex items-center justify-center">
                  <div 
                    className="w-full h-full rounded-full overflow-hidden"
                    dangerouslySetInnerHTML={{ __html: generatedSvg }}
                  />
                  <div className="absolute -bottom-1 -right-1 bg-amber-500 text-white p-1 rounded-full border border-white dark:border-slate-900 shadow">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div className="text-center sm:text-left space-y-3">
                  <div>
                    <h4 className="text-xs font-black text-slate-800 dark:text-slate-100 flex items-center justify-center sm:justify-start">
                      Avatar AI Tercipta!
                    </h4>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                      Karya seni vector SVG orisinal beresolusi tinggi, siap diaplikasikan langsung ke akun Anda.
                    </p>
                  </div>

                  <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                    <button
                      type="button"
                      onClick={handleApplyAiAvatar}
                      className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-extrabold uppercase tracking-wider rounded-lg transition-all flex items-center gap-1 shadow-md hover:scale-[1.01]"
                    >
                      <Check className="w-3 h-3" />
                      Gunakan Avatar Ini
                    </button>
                    <button
                      type="button"
                      onClick={handleGenerateAiAvatar}
                      className="px-3.5 py-1.5 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-extrabold uppercase tracking-wider rounded-lg transition-all flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Hasilkan Ulang
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instant Success Banner */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 p-3 rounded-lg border border-emerald-100 dark:border-emerald-900/40 text-[11px] font-semibold flex items-center"
          >
            <Check className="w-4 h-4 mr-1.5 text-emerald-500 shrink-0" />
            {successMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
