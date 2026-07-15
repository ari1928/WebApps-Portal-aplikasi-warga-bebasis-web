import React, { useState } from 'react';
import { GalleryItem, User } from '../types';
import { Heart, Plus, Calendar, Image as ImageIcon, X, Sparkles, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface GalleryProps {
  galleryItems: GalleryItem[];
  setGalleryItems: React.Dispatch<React.SetStateAction<GalleryItem[]>>;
  currentUser: User | null;
  rwTitle?: string;
}

export default function Gallery({ galleryItems, setGalleryItems, currentUser, rwTitle = 'RW 07' }: GalleryProps) {
  const [activeFilter, setActiveFilter] = useState('Semua');
  const [showAddModal, setShowAddModal] = useState(false);
  const [likedItems, setLikedItems] = useState<string[]>([]);
  
  // New Item State
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Gotong Royong');
  const [newDesc, setNewDesc] = useState('');
  const [newImage, setNewImage] = useState('');

  const categories = ['Semua', 'Gotong Royong', 'Posyandu', 'Olahraga', 'Infrastruktur', 'Sosial'];

  const handleLike = (id: string) => {
    if (likedItems.includes(id)) {
      // Unlike
      setLikedItems(likedItems.filter((item) => item !== id));
      setGalleryItems(prev => prev.map(item => item.id === id ? { ...item, likes: item.likes - 1 } : item));
    } else {
      // Like
      setLikedItems([...likedItems, id]);
      setGalleryItems(prev => prev.map(item => item.id === id ? { ...item, likes: item.likes + 1 } : item));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDesc) return;

    // Use default or base64 image
    const finalImage = newImage || 'https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?auto=format&fit=crop&q=80&w=800';

    const newItem: GalleryItem = {
      id: `gal-${Date.now()}`,
      title: newTitle,
      category: newCategory,
      description: newDesc,
      imageUrl: finalImage,
      date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
      likes: 0
    };

    setGalleryItems([newItem, ...galleryItems]);
    setShowAddModal(false);
    
    // Reset form
    setNewTitle('');
    setNewCategory('Gotong Royong');
    setNewDesc('');
    setNewImage('');
  };

  const filteredItems = activeFilter === 'Semua' 
    ? galleryItems 
    : galleryItems.filter(item => item.category.toLowerCase() === activeFilter.toLowerCase());

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-16" id="gallery-view">
      
      {/* 1. Header and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-display font-bold text-slate-800 dark:text-slate-100 tracking-tight flex items-center">
            <Sparkles className="w-6 h-6 text-indigo-600 dark:text-indigo-400 mr-2 shrink-0 animate-pulse" />
            Galeri Kegiatan {rwTitle}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Dokumentasi momen gotong royong, posyandu, dan kemeriahan aktivitas warga sekitar.</p>
        </div>
        
        {/* Dynamic button if user is authenticated */}
        {currentUser && (
          <button
            onClick={() => setShowAddModal(true)}
            className="self-start sm:self-center inline-flex items-center px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-md shadow-indigo-100 dark:shadow-none transition-all"
            id="btn-add-gallery-item"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Tambah Kegiatan Warga
          </button>
        )}
      </div>

      {/* 2. Filters */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none" id="gallery-category-filters">
        <Filter className="w-4 h-4 text-slate-400 dark:text-slate-500 mr-1 shrink-0 hidden sm:block" />
        {categories.map((cat) => {
          const isActive = activeFilter === cat;
          return (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100 dark:shadow-none'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750 border border-slate-200/60 dark:border-slate-700'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* 3. Items Grid */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-750 rounded-2xl">
          <ImageIcon className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700 dark:text-slate-200">Belum Ada Dokumentasi</h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-sm mx-auto">Kategori "{activeFilter}" belum memiliki postingan kegiatan warga. Tambahkan kegiatan baru sekarang!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8" id="gallery-posts-grid">
          {filteredItems.map((item) => {
            const isLiked = likedItems.includes(item.id);
            return (
              <motion.article
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden group"
              >
                {/* Media Container */}
                <div>
                  <div className="aspect-video relative overflow-hidden bg-slate-100 dark:bg-slate-900">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm text-indigo-700 dark:text-indigo-400 font-extrabold text-[10px] px-2.5 py-1 rounded-full shadow-sm">
                      {item.category}
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <div className="flex items-center text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wide">
                      <Calendar className="w-3.5 h-3.5 mr-1" />
                      {item.date}
                    </div>
                    
                    <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 line-clamp-2 leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {item.title}
                    </h3>
                    
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="px-5 pb-5 pt-3 border-t border-slate-50 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/40">
                  <button
                    onClick={() => handleLike(item.id)}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                      isLiked 
                        ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 shadow' 
                        : 'bg-white dark:bg-slate-850 hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:text-rose-600 dark:hover:text-rose-400 text-slate-500 dark:text-slate-400 border border-slate-200/50 dark:border-slate-700/60'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-500 text-rose-500 animate-pulse' : ''}`} />
                    <span>{item.likes} Dukungan</span>
                  </button>
                  
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase">Warga {rwTitle}</span>
                </div>
              </motion.article>
            );
          })}
        </div>
      )}

      {/* 4. Add Activity Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-slate-800 rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative z-10 border border-slate-100 dark:border-slate-700 max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setShowAddModal(false)}
                className="absolute top-4 right-4 p-1 rounded-full text-slate-400 hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 mb-2 flex items-center">
                <ImageIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mr-1.5" />
                Tambah Dokumentasi Kegiatan
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 mb-6">Unggah foto kegiatan gotong royong atau pelayanan kesehatan di sekitar lingkungan {rwTitle} Anda.</p>

              <form onSubmit={handleAddActivity} className="space-y-4" id="add-gallery-post-form">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Judul Dokumentasi</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Contoh: Kerja Bakti Perbaikan Selokan RT 02"
                    className="w-full text-sm px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Kategori Kegiatan</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full text-sm px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    >
                      <option>Gotong Royong</option>
                      <option>Posyandu</option>
                      <option>Olahraga</option>
                      <option>Infrastruktur</option>
                      <option>Sosial</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Foto Bukti Kegiatan</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="w-full text-xs text-slate-500 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 dark:file:bg-indigo-950/40 file:text-indigo-700 dark:file:text-indigo-300 hover:file:bg-indigo-100 dark:hover:file:bg-indigo-900/30"
                    />
                  </div>
                </div>

                {newImage && (
                  <div className="aspect-video w-full rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 relative">
                    <img src={newImage} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setNewImage('')}
                      className="absolute top-2 right-2 bg-rose-600 text-white p-1 rounded-full hover:bg-rose-700"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Deskripsi Singkat Kejadian</label>
                  <textarea
                    required
                    rows={3}
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="Tuliskan detail perihal kegiatan warga yang dilakukan..."
                    className="w-full text-sm px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div className="flex space-x-2 pt-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-200 font-semibold text-xs rounded-xl transition-all"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-md dark:shadow-none transition-all"
                  >
                    Simpan & Publikasikan
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
