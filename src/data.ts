import { GalleryItem, Announcement, User, Report, MapFeature } from './types';

export const INITIAL_USERS: User[] = [
  {
    id: 'user-1',
    username: 'budi_warga',
    email: 'warga@warga.id',
    name: 'Budi Santoso',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
    role: 'citizen',
    rt: 'RT 03',
    phone: '081234567890'
  },
  {
    id: 'user-2',
    username: 'siti_rahma',
    email: 'siti@warga.id',
    name: 'Siti Rahma',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
    role: 'citizen',
    rt: 'RT 01',
    phone: '081298765432'
  },
  {
    id: 'user-3',
    username: 'pak_rw_admin',
    email: 'admin@warga.id',
    name: 'Bp. Bambang Hermawan (Ketua RW)',
    avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=150',
    role: 'admin',
    rt: 'RW 05',
    phone: '081122334455'
  },
  {
    id: 'user-4',
    username: 'superadmin_rw',
    email: 'superadmin@warga.id',
    name: 'Ibu Rahayu (Admin Utama / Role Manager)',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150',
    role: 'admin',
    rt: 'RW 05',
    phone: '081233445566'
  }
];

export const INITIAL_GALLERY: GalleryItem[] = [
  {
    id: 'gal-1',
    title: 'Gotong Royong Bersama warga RT 03',
    category: 'Gotong Royong',
    description: 'Kegiatan membersihkan saluran air dan perapihan tanaman liar di sepanjang jalan utama RT 03 guna mencegah genangan air dan sarang nyamuk.',
    imageUrl: '/src/assets/images/gotong_royong_warga_1783887046888.jpg',
    date: '10 Juli 2026',
    likes: 24
  },
  {
    id: 'gal-2',
    title: 'Pelayanan Posyandu Balita Melati',
    category: 'Posyandu',
    description: 'Pemeriksaan rutin berkala, penimbangan berat badan, imunisasi, dan pembagian makanan tambahan (PMT) untuk balita di wilayah RW 05.',
    imageUrl: '/src/assets/images/posyandu_kegiatan_1783887058946.jpg',
    date: '08 Juli 2026',
    likes: 18
  },
  {
    id: 'gal-3',
    title: 'Pemasangan Lampu Jalan Baru di RT 02',
    category: 'Infrastruktur',
    description: 'Sinergi warga dalam memasang lampu penerangan jalan umum berbasis LED di area gang sempit untuk meningkatkan kenyamanan malam hari.',
    imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?auto=format&fit=crop&q=80&w=800',
    date: '03 Juli 2026',
    likes: 15
  },
  {
    id: 'gal-4',
    title: 'Senam Sehat Minggu Pagi',
    category: 'Olahraga',
    description: 'Olahraga bersama para ibu-ibu dan lansia yang diadakan setiap Minggu pagi di halaman Balai RW untuk menjaga kebugaran tubuh.',
    imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=800',
    date: '28 Juni 2026',
    likes: 31
  }
];

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-1',
    title: 'Kerja Bakti Akbar Menyambut Hari Kemerdekaan',
    content: 'Dihimbau kepada seluruh warga RW 05 untuk berpartisipasi dalam Kerja Bakti Akbar yang akan dilaksanakan pada hari Minggu, 19 Juli 2026 mulai pukul 07:00 WIB. Mohon membawa peralatan masing-masing.',
    date: '12 Juli 2026',
    author: 'Ketua RW',
    category: 'Penting'
  },
  {
    id: 'ann-2',
    title: 'Jadwal Ronda Malam Terintegrasi RT 01 - RT 04',
    content: 'Jadwal ronda malam triwulan ketiga telah dirilis. Mohon para koordinator keamanan RT memastikan kehadiran petugas ronda sesuai jadwal demi menjaga ketertiban lingkungan.',
    date: '10 Juli 2026',
    author: 'Seksi Keamanan',
    category: 'Informasi'
  },
  {
    id: 'ann-3',
    title: 'Penyuluhan Kesehatan Demam Berdarah (DBD)',
    content: 'Puskesmas Kecamatan bekerjasama dengan Kader PKK RW akan mengadakan penyuluhan pencegahan DBD melalui program 3M Plus. Hari Sabtu, 18 Juli 2026 di Balai RW pukul 09:00 WIB.',
    date: '08 Juli 2026',
    author: 'Kader PKK',
    category: 'Kegiatan'
  }
];

export const INITIAL_REPORTS: Report[] = [
  {
    id: 'rep-1',
    title: 'Saluran Air Tersumbat Sampah di RT 03',
    category: 'Kebersihan',
    description: 'Terdapat tumpukan sampah plastik di selokan utama dekat pertigaan RT 03 yang menyebabkan air meluap ke jalan saat hujan deras kemarin sore. Perlu tindakan pembersihan darurat.',
    rt: 'RT 03',
    status: 'pending',
    imageUrl: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&q=80&w=800',
    citizenId: 'user-1',
    citizenName: 'Budi Santoso',
    citizenAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
    date: '12 Juli 2026',
    createdAt: '2026-07-12T10:00:00Z'
  },
  {
    id: 'rep-2',
    title: 'Penerangan Jalan Mati di Depan Masjid Al-Ikhlas',
    category: 'Infrastruktur',
    description: 'Lampu jalan utama dekat gerbang Masjid Al-Ikhlas (RT 01) padam sejak dua hari yang lalu. Kondisi jalan menjadi sangat gelap gulita di malam hari, rawan tindakan kriminalitas dan kecelakaan.',
    rt: 'RT 01',
    status: 'diproses',
    imageUrl: 'https://images.unsplash.com/photo-1509024644558-2f56ce76c090?auto=format&fit=crop&q=80&w=800',
    citizenId: 'user-2',
    citizenName: 'Siti Rahma',
    citizenAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150',
    date: '11 Juli 2026',
    adminNotes: 'Petugas teknisi RW sudah dihubungi dan sedang memesan bohlam pengganti. Pemasangan dijadwalkan besok sore.',
    createdAt: '2026-07-11T14:30:00Z'
  },
  {
    id: 'rep-3',
    title: 'Portal Keamanan Jalan Cempaka Rusak',
    category: 'Keamanan',
    description: 'Engsel portal besi di ujung Jalan Cempaka RT 04 lepas, sehingga portal tidak bisa ditutup secara rapat saat malam hari tiba. Membahayakan sistem pengamanan satu pintu (one gate system).',
    rt: 'RT 04',
    status: 'selesai',
    imageUrl: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&q=80&w=800',
    citizenId: 'user-1',
    citizenName: 'Budi Santoso',
    citizenAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150',
    date: '09 Juli 2026',
    adminNotes: 'Tim Keamanan RT 04 bersama tukang las setempat sudah merapikan dan memperkokoh engsel portal. Kini portal berfungsi kembali normal 100%.',
    createdAt: '2026-07-09T08:15:00Z'
  }
];

export const INITIAL_MAP_FEATURES: MapFeature[] = [
  {
    id: 'feat-1',
    name: 'Balai Pertemuan RW 05',
    type: 'fasilitas',
    coords: { x: 50, y: 45 },
    description: 'Pusat administrasi RW, aula rapat, kegiatan posyandu, dan sekretariat.'
  },
  {
    id: 'feat-2',
    name: 'Pos Keamanan RT 01',
    type: 'keamanan',
    coords: { x: 20, y: 30 },
    description: 'Pos ronda utama RT 01, dilengkapi dengan CCTV pemantau gang utama.'
  },
  {
    id: 'feat-3',
    name: 'Pos Keamanan RT 04',
    type: 'keamanan',
    coords: { x: 80, y: 70 },
    description: 'Pos jaga malam RT 04 yang mengawasi portal perbatasan luar.'
  },
  {
    id: 'feat-4',
    name: 'Masjid Al-Ikhlas',
    type: 'fasilitas',
    coords: { x: 32, y: 65 },
    description: 'Tempat ibadah utama sekaligus pusat kajian remaja masjid dan pengajian warga.'
  },
  {
    id: 'feat-5',
    name: 'Taman Bermain & Lapangan Olahraga',
    type: 'fasilitas',
    coords: { x: 65, y: 25 },
    description: 'Area hijau bersantai, arena bermain anak-anak, lapangan futsal dan bulu tangkis.'
  }
];
