import React, { useState } from 'react';
import { Phone, Mail, MapPin, Send, CheckCircle2, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ContactProps {
  contactAddress?: string;
  contactPhone?: string;
  contactEmail?: string;
  contactHours?: string;
  rwTitle?: string;
}

export default function Contact({
  contactAddress = 'Balai RW 07, Jl. Palmeriam Raya, Kel. Palmeriam, Kec. Matraman, RT 03/RW 07, Jakarta Timur',
  contactPhone = '0811-2233-4455',
  contactEmail = 'sekretariat@rw07.warga.id',
  contactHours = 'Senin - Sabtu pukul 15:00 - 20:00 WIB',
  rwTitle = 'RW 07',
}: ContactProps) {
  const cleanWaNumber = contactPhone.replace(/[^0-9]/g, '').replace(/^0/, '62');

  const [formData, setFormData] = useState({
    name: '',
    phoneOrEmail: '',
    rt: 'RT 01',
    subject: 'Administrasi',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phoneOrEmail || !formData.message) return;

    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
      setFormData({
        name: '',
        phoneOrEmail: '',
        rt: 'RT 01',
        subject: 'Administrasi',
        message: '',
      });
      // Hide success after some seconds
      setTimeout(() => setSubmitSuccess(false), 5000);
    }, 1500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 pb-16" id="contact-view">
      
      {/* 1. Header Title */}
      <div className="text-center space-y-3">
        <h1 className="text-2xl sm:text-4xl font-display font-bold text-slate-800 dark:text-slate-100 tracking-tight">Hubungi Pengurus RW</h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
          Punya pertanyaan terkait pengurusan surat domisili, iuran, saran keamanan, atau membutuhkan bantuan darurat? Hubungi kami langsung.
        </p>
      </div>

      {/* 2. Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Contact info cards - 5 Cols */}
        <div className="lg:col-span-5 space-y-6">
          <motion.div
            whileHover={{ scale: 1.02, rotate: [-0.3, 0.3, 0], y: -2 }}
            className="bg-indigo-900 text-white rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(99,102,241,0.2),transparent_50%)]" />
            <div className="relative z-10 space-y-2">
              <h3 className="text-xl font-bold">Sekretariat {rwTitle}</h3>
              <p className="text-indigo-200 text-xs">Balai RW aktif melayani warga setiap {contactHours}.</p>
            </div>
            
            <div className="space-y-4 relative z-10 text-sm">
              <div className="flex items-start">
                <MapPin className="w-5 h-5 mr-3 text-indigo-300 shrink-0" />
                <span>{contactAddress}</span>
              </div>
              <div className="flex items-center">
                <Phone className="w-5 h-5 mr-3 text-indigo-300 shrink-0" />
                <span>{contactPhone} (Hotline RW)</span>
              </div>
              <div className="flex items-center">
                <Mail className="w-5 h-5 mr-3 text-indigo-300 shrink-0" />
                <span>{contactEmail}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-indigo-800 flex items-center justify-between relative z-10">
              <span className="text-xs text-indigo-200 font-semibold">Tersambung Langsung</span>
              <a
                href={`https://wa.me/${cleanWaNumber}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 px-3.5 py-1.5 rounded-full transition-all"
              >
                <MessageCircle className="w-4 h-4 mr-1.5 fill-white text-emerald-600" />
                WhatsApp RW
              </a>
            </div>
          </motion.div>

          {/* Quick Guidance Info Card */}
          <motion.div
            whileHover={{ scale: 1.02, rotate: [-0.3, 0.3, 0], y: -2 }}
            className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 space-y-4"
          >
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">Alur Pengurusan Surat Pengantar</h4>
            <ol className="text-xs text-slate-500 dark:text-slate-400 space-y-2 list-decimal pl-4 leading-relaxed">
              <li>Hubungi Ketua RT setempat untuk meminta tanda tangan Surat Pengantar RT.</li>
              <li>Bawa surat tersebut beserta fotokopi KTP dan KK ke Balai {rwTitle} sore hari.</li>
              <li>Seksi Administrasi RW akan menandatangani dan membubuhi stempel resmi RW.</li>
              <li>Surat siap dibawa ke Kantor Kelurahan/Desa Mekar Wangi.</li>
            </ol>
          </motion.div>
        </div>

        {/* Contact Form - 7 Cols */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm transition-colors duration-300">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">Kirim Formulir Online</h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 mb-6">Pesan Anda akan diteruskan secara instan ke Sekretaris {rwTitle} untuk ditindaklanjuti.</p>

          <form onSubmit={handleSubmit} className="space-y-4" id="contact-form-portal">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Budi Santoso"
                  className="w-full text-sm px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">No. HP / Email</label>
                <input
                  type="text"
                  required
                  value={formData.phoneOrEmail}
                  onChange={(e) => setFormData({ ...formData, phoneOrEmail: e.target.value })}
                  placeholder="Contoh: 0812xxx atau budi@mail.com"
                  className="w-full text-sm px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Pilih Rukun Tetangga (RT)</label>
                <select
                  value={formData.rt}
                  onChange={(e) => setFormData({ ...formData, rt: e.target.value })}
                  className="w-full text-sm px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
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
                  <option>Luar Wilayah</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Perihal Kontak</label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full text-sm px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  <option>Administrasi & Surat</option>
                  <option>Saran & Masukan Keamanan</option>
                  <option>Iuran & Keuangan</option>
                  <option>Pertanyaan Kegiatan</option>
                  <option>Keadaan Darurat</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Isi Pesan / Saran</label>
              <textarea
                required
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Tuliskan pesan Anda secara jelas dan lengkap..."
                className="w-full text-sm px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-all flex items-center justify-center shadow-lg shadow-indigo-100 dark:shadow-none ${
                isSubmitting ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500'
              }`}
              id="contact-form-submit-btn"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-4 w-4 mr-2 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Mengirimkan...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Kirim Pesan Warga
                </>
              )}
            </button>

            <AnimatePresence>
              {submitSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 p-4 rounded-lg border border-emerald-100 dark:border-emerald-900/40 text-sm flex items-start space-x-2"
                  id="contact-form-success-alert"
                >
                  <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <div>
                    <h4 className="font-bold">Pesan Terkirim!</h4>
                    <p className="text-xs text-emerald-600/90 dark:text-emerald-400/90 mt-0.5">Terima kasih atas laporan/saran Anda. Pengurus RW akan merespon segera.</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </div>

      </div>

    </div>
  );
}
