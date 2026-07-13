import { Shield, BookOpen, Heart, Users, Map, Award } from 'lucide-react';
import { motion } from 'motion/react';

export default function About() {
  const structure = [
    {
      name: 'Bp. Bambang Hermawan',
      role: 'Ketua RW 05',
      desc: 'Memimpin koordinasi seluruh RT, perwakilan resmi tingkat desa, dan penentu kebijakan lingkungan.',
      image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=300'
    },
    {
      name: 'Ibu Ratna Sari',
      role: 'Sekretaris RW',
      desc: 'Mengurus persuratan administrasi warga, pendataan kependudukan, pengarsipan berkas dan agenda rapat.',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300'
    },
    {
      name: 'Bp. Hendra Wijaya',
      role: 'Bendahara RW',
      desc: 'Mengelola kas iuran warga, penyusunan laporan keuangan bulanan, serta pengeluaran pembangunan.',
      image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=300'
    },
    {
      name: 'Bp. Sukardi',
      role: 'Seksi Keamanan & Ketertiban',
      desc: 'Mengkoordinir jadwal pos ronda, satpam perumahan, penanganan ketertiban dan pencegahan tindak kriminal.',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=300'
    },
    {
      name: 'Ibu Wiwin Sianipar',
      role: 'Seksi PKK & Kesehatan (Posyandu)',
      desc: 'Membina pemberdayaan perempuan, koordinator program Posyandu Melati, imunisasi anak, dan gizi keluarga.',
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=300'
    },
    {
      name: 'Bp. Aris Munandar',
      role: 'Seksi Kebersihan & Pembangunan',
      desc: 'Memantau saluran air warga, kebersihan truk sampah, pemeliharaan lampu jalan, portal dan perbaikan jalan.',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300'
    }
  ];

  const rts = [
    { name: 'RT 01', leader: 'Bp. Joko Priyono', kk: 112, desc: 'Meliputi area barat, didominasi komplek perumahan asri.' },
    { name: 'RT 02', leader: 'Bp. Ahmad Fauzi', kk: 98, desc: 'Meliputi area tengah, sentra perdagangan kecil warga dan UMKM.' },
    { name: 'RT 03', leader: 'Bp. Teddy Setiadi', kk: 125, desc: 'Meliputi area timur, lingkungan padat asri dekat perkebunan warga.' },
    { name: 'RT 04', leader: 'Bp. M. Supriyadi', kk: 115, desc: 'Meliputi area selatan, dekat gerbang perbatasan luar dan pos ronda utama.' }
  ];

  return (
    <div className="space-y-16 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" id="about-view">
      
      {/* 1. Header Section */}
      <section className="text-center space-y-4 pt-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="inline-flex p-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-full mb-2"
        >
          <Award className="w-8 h-8" />
        </motion.div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-800 dark:text-slate-100 tracking-tight animate-fade-in">
          Profil Pengurus RW 05
        </h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
          Mengenal lebih dekat visi, misi, jajaran kepengurusan aktif, serta pembagian wilayah administratif Rukun Tetangga (RT) di lingkungan RW 05 Mekar Wangi.
        </p>
      </section>

      {/* 2. Vision and Mission */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -15 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col justify-between transition-colors duration-300"
        >
          <div>
            <div className="inline-flex p-2.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-lg mb-4">
              <BookOpen className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-3">Visi RW 05</h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
              "Terwujudnya lingkungan RW 05 Mekar Wangi yang Rukun, Aman, Sejahtera, Sehat, dan Berkelanjutan melalui sinergi komunikasi digital yang transparan dan semangat gotong royong warga."
            </p>
          </div>
          <div className="mt-6 border-t border-slate-100 dark:border-slate-700/50 pt-4 flex items-center text-xs text-slate-400 dark:text-slate-500 font-semibold">
            <Shield className="w-4 h-4 mr-1 text-indigo-500 dark:text-indigo-400" />
            Keamanan & Ketertiban Utama
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 15 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col justify-between transition-colors duration-300"
        >
          <div>
            <div className="inline-flex p-2.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-lg mb-4">
              <Heart className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-3">Misi RW 05</h2>
            <ul className="space-y-2 text-slate-600 dark:text-slate-300 text-sm list-disc pl-5">
              <li>Meningkatkan sistem keamanan lingkungan yang aktif dan terintegrasi.</li>
              <li>Menyelenggarakan tata kelola keuangan kas RW yang transparan dan akuntabel.</li>
              <li>Mendorong partisipasi aktif warga dalam kegiatan kebersihan gotong royong dan kesehatan sosial.</li>
              <li>Memanfaatkan teknologi digital untuk kemudahan layanan administrasi dan respon pengaduan cepat.</li>
            </ul>
          </div>
          <div className="mt-6 border-t border-slate-100 dark:border-slate-700/50 pt-4 flex items-center text-xs text-slate-400 dark:text-slate-500 font-semibold">
            <Users className="w-4 h-4 mr-1 text-emerald-500 dark:text-emerald-400" />
            Sinergi Kekeluargaan Warga
          </div>
        </motion.div>
      </section>

      {/* 3. Structure Organization */}
      <section className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100">Struktur Kepengurusan</h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">Dedikasi para pengurus RW 05 dalam melayani kebutuhan administratif dan keamanan warga.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" id="about-structure-grid">
          {structure.map((member, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.03, rotate: [-0.4, 0.4, 0], y: -3 }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group"
            >
              <div className="aspect-video w-full overflow-hidden bg-slate-100 dark:bg-slate-900 relative">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 right-2 bg-indigo-600 dark:bg-indigo-500 text-white font-bold text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider">
                  Pengurus RW
                </div>
              </div>
              <div className="p-5 space-y-2">
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base">{member.name}</h3>
                  <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{member.role}</p>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{member.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 4. RT Administrative Divisions */}
      <section className="bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 rounded-3xl p-8 sm:p-10 space-y-8 transition-colors duration-300">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 flex items-center">
              <Map className="w-6 h-6 mr-2 text-indigo-600 dark:text-indigo-400" />
              Pembagian Wilayah RT
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">Rincian Ketua Rukun Tetangga (RT) yang bernaung di bawah wilayah koordinasi RW 05.</p>
          </div>
          <span className="self-start md:self-center text-xs font-semibold bg-indigo-100 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-full border border-indigo-200/20">
            Total 4 RT Pendukung
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6" id="about-rts-grid">
          {rts.map((rt, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.03, rotate: [-0.4, 0.4, 0], y: -3 }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col justify-between transition-colors duration-300"
            >
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-extrabold text-slate-800 dark:text-slate-100">{rt.name}</span>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                    {rt.kk} Kepala Keluarga
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{rt.desc}</p>
              </div>
              
              <div className="mt-4 pt-3 border-t border-slate-50 dark:border-slate-700/50 flex items-center justify-between text-xs">
                <span className="text-slate-400 dark:text-slate-500 font-medium">Ketua RT:</span>
                <strong className="text-slate-700 dark:text-slate-300 font-bold">{rt.leader}</strong>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

    </div>
  );
}
