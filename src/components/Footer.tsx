import { Map, Phone, Mail, MapPin, Heart } from 'lucide-react';

interface FooterProps {
  setActiveTab: (tab: string) => void;
  rwTitle?: string;
  rwSubTitle?: string;
  rwLogoUrl?: string;
  contactAddress?: string;
  contactPhone?: string;
  contactEmail?: string;
}

export default function Footer({
  setActiveTab,
  rwTitle = 'RW 05',
  rwSubTitle = 'Mekar Wangi',
  rwLogoUrl = '',
  contactAddress = 'Balai RW 05, Jl. Kenanga No. 12, Desa Mekar Wangi, RT 03/RW 05, Jawa Barat',
  contactPhone = '0811-2233-4455',
  contactEmail = 'sekretariat@rw05.warga.id',
}: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800" id="main-footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Column */}
          <div className="md:col-span-2">
            <div className="flex items-center mb-4">
              <div className="bg-indigo-600 p-2 rounded-lg text-white font-bold mr-2">
                {rwLogoUrl ? (
                  <img src={rwLogoUrl} className="w-5 h-5 rounded object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <Map className="w-5 h-5" />
                )}
              </div>
              <span className="font-extrabold text-xl tracking-tight text-white">Portal Warga <span className="text-indigo-400">{rwTitle}</span></span>
            </div>
            <p className="text-slate-400 text-sm max-w-md leading-relaxed">
              Sistem Informasi Manajemen dan Pelaporan Pengaduan Warga {rwTitle}, Desa {rwSubTitle}. 
              Membangun komunikasi yang transparan, aman, responsif, dan terintegrasi demi kenyamanan bersama.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Navigasi</h3>
            <ul className="space-y-2">
              {[
                { id: 'home', label: 'Beranda' },
                { id: 'gallery', label: 'Galeri Kegiatan' },
                { id: 'map', label: 'Peta Wilayah' },
                { id: 'about', label: 'Tentang RW' },
                { id: 'contact', label: 'Hubungi Kami' }
              ].map((link) => (
                <li key={link.id}>
                  <button
                    onClick={() => setActiveTab(link.id)}
                    className="text-slate-400 hover:text-white transition-colors duration-200 text-sm focus:outline-none"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Kontak RW</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start text-slate-400">
                <MapPin className="w-5 h-5 mr-2 text-indigo-400 shrink-0" />
                <span>{contactAddress}</span>
              </li>
              <li className="flex items-center text-slate-400">
                <Phone className="w-5 h-5 mr-2 text-indigo-400 shrink-0" />
                <span>{contactPhone}</span>
              </li>
              <li className="flex items-center text-slate-400">
                <Mail className="w-5 h-5 mr-2 text-indigo-400 shrink-0" />
                <span>{contactEmail}</span>
              </li>
            </ul>
          </div>

        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500">
          <p>© {currentYear} Portal Warga {rwTitle}. Hak Cipta Dilindungi.</p>
          <p className="flex items-center mt-2 sm:mt-0">
            Dibuat dengan <Heart className="w-3.5 h-3.5 mx-1 text-rose-500 fill-rose-500" /> untuk Kerukunan Warga
          </p>
        </div>
      </div>
    </footer>
  );
}
