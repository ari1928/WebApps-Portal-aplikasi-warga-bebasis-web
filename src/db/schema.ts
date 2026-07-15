import { integer, pgTable, serial, text, timestamp, boolean } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  username: text('username').notNull(),
  email: text('email').notNull(),
  name: text('name').notNull(),
  avatarUrl: text('avatar_url'),
  role: text('role').notNull().default('citizen'), // 'citizen' | 'admin'
  rt: text('rt'),
  phone: text('phone'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const reports = pgTable('reports', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  category: text('category').notNull(), // 'Keamanan' | 'Infrastruktur' | 'Kebersihan' | 'Administrasi' | 'Lainnya'
  description: text('description').notNull(),
  rt: text('rt').notNull(),
  status: text('status').notNull().default('pending'), // 'pending' | 'diproses' | 'selesai' | 'ditolak'
  imageUrl: text('image_url'),
  citizenId: text('citizen_id').notNull(), // References users.uid or is free-form
  citizenName: text('citizen_name').notNull(),
  citizenAvatar: text('citizen_avatar'),
  date: text('date').notNull(),
  adminNotes: text('admin_notes'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const galleryItems = pgTable('gallery_items', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  category: text('category').notNull(),
  description: text('description').notNull(),
  imageUrl: text('image_url').notNull(),
  date: text('date').notNull(),
  likes: integer('likes').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow(),
});

export const notifications = pgTable('notifications', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  date: text('date').notNull(),
  isRead: boolean('is_read').notNull().default(false),
  reportId: text('report_id'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const announcements = pgTable('announcements', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  date: text('date').notNull(),
  author: text('author').notNull(),
  category: text('category').notNull(), // 'Penting' | 'Informasi' | 'Kegiatan'
  createdAt: timestamp('created_at').defaultNow(),
});
