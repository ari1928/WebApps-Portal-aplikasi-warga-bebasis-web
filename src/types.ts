export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  avatarUrl: string;
  role: 'citizen' | 'admin';
  rt: string;
  phone: string;
}

export interface Report {
  id: string;
  title: string;
  category: 'Keamanan' | 'Infrastruktur' | 'Kebersihan' | 'Administrasi' | 'Lainnya';
  description: string;
  rt: string;
  status: 'pending' | 'diproses' | 'selesai' | 'ditolak';
  imageUrl?: string;
  citizenId: string;
  citizenName: string;
  citizenAvatar?: string;
  date: string;
  adminNotes?: string;
  createdAt: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: string;
  description: string;
  imageUrl: string;
  date: string;
  likes: number;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  date: string;
  isRead: boolean;
  reportId?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  author: string;
  category: 'Penting' | 'Informasi' | 'Kegiatan';
}

export interface MapFeature {
  id: string;
  name: string;
  type: 'fasilitas' | 'keamanan' | 'laporan';
  coords: { x: number; y: number }; // percentage coords on svg 0-100
  description: string;
  status?: string;
}
