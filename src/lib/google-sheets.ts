import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './firebase.ts';
import { Report, User as CitizenUser, Announcement } from '../types.ts';

const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive.file'
];

let cachedAccessToken: string | null = sessionStorage.getItem('google_sheets_access_token');
let isSigningIn = false;

// Initialize Google OAuth provider with required scopes
const provider = new GoogleAuthProvider();
SCOPES.forEach(scope => provider.addScope(scope));

// Initialize Auth State Listener
export const initGoogleSheetsAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      const storedToken = sessionStorage.getItem('google_sheets_access_token');
      if (storedToken) {
        cachedAccessToken = storedToken;
        if (onAuthSuccess) onAuthSuccess(user, storedToken);
      } else if (cachedAccessToken) {
        sessionStorage.setItem('google_sheets_access_token', cachedAccessToken);
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        // If logged in but no token cached, we can trigger login or handle failure
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      sessionStorage.removeItem('google_sheets_access_token');
      if (onAuthFailure) onAuthFailure();
    }
  });
};

// Sign-in with Google to get the access token
export const googleSignInForSheets = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Gagal mendapatkan token akses dari Google Auth.');
    }

    cachedAccessToken = credential.accessToken;
    sessionStorage.setItem('google_sheets_access_token', credential.accessToken);
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Login Google error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

// Logout from authentication
export const googleSignOutForSheets = async () => {
  await auth.signOut();
  sessionStorage.removeItem('google_sheets_access_token');
  cachedAccessToken = null;
};

// Helper to get active token
export const getSheetsAccessToken = (): string | null => {
  return cachedAccessToken;
};

// Set token manually (e.g. if loaded or verified elsewhere)
export const setSheetsAccessToken = (token: string | null) => {
  cachedAccessToken = token;
};

/**
 * Creates a new beautifully styled Google Spreadsheet
 */
export const createWargaSpreadsheet = async (token: string, title: string): Promise<string> => {
  const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title: title || 'Portal Warga - Data & Laporan',
      },
      sheets: [
        {
          properties: {
            title: 'Laporan Aduan',
            gridProperties: {
              frozenRowCount: 1,
            },
          },
        },
        {
          properties: {
            title: 'Daftar Warga',
            gridProperties: {
              frozenRowCount: 1,
            },
          },
        },
        {
          properties: {
            title: 'Pengumuman',
            gridProperties: {
              frozenRowCount: 1,
            },
          },
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || 'Gagal membuat Google Spreadsheet baru.');
  }

  const data = await response.json();
  const spreadsheetId = data.spreadsheetId;

  // Now write some template data/headers into the created spreadsheet
  try {
    await initSpreadsheetTemplates(token, spreadsheetId);
  } catch (err) {
    console.warn('Gagal menginisialisasi template awal, namun Spreadsheet berhasil dibuat.', err);
  }

  return spreadsheetId;
};

/**
 * Initializes Spreadsheet Headers & Templates for newly created spreadsheet
 */
const initSpreadsheetTemplates = async (token: string, spreadsheetId: string) => {
  // We'll write blank rows/headers for reports, warga, and announcements
  const batchData = [
    {
      range: 'Laporan Aduan!A1',
      values: [
        ['ID Laporan', 'Nama Pelapor', 'RT', 'Kategori', 'Judul Aduan', 'Deskripsi', 'Tanggal', 'Status', 'Catatan Admin', 'Tanggal Dibuat', 'Citizen ID', 'Citizen Avatar', 'Image URL']
      ]
    },
    {
      range: 'Daftar Warga!A1',
      values: [
        ['ID Warga', 'Username', 'Email', 'Nama Lengkap', 'Peran', 'Sektor RT', 'No. Telepon / WhatsApp']
      ]
    },
    {
      range: 'Pengumuman!A1',
      values: [
        ['ID Pengumuman', 'Judul', 'Detail Pengumuman', 'Kategori', 'Penulis', 'Tanggal Rilis']
      ]
    }
  ];

  // Also pre-fill one dummy row for Announcements template to guide the user
  batchData[2].values.push([
    'ann-temp-1',
    'Agenda Kerja Bakti Bersama',
    'Diberitahukan kepada seluruh warga bahwa akan dilaksanakan kerja bakti membersihkan saluran air dan lingkungan sekitar balai RW besok minggu mulai pukul 07:00 WIB.',
    'Kegiatan',
    'Ketua RW',
    new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
  ]);

  await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      valueInputOption: 'USER_ENTERED',
      data: batchData,
    }),
  });
};

/**
 * Clears and exports citizen reports into "Laporan Aduan" worksheet
 */
export const exportReportsToSheets = async (token: string, spreadsheetId: string, reports: Report[]) => {
  // 1. Clear existing data
  await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Laporan Aduan!A1:Z2000:clear`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  // 2. Prepare headers and rows
  const headers = ['ID Laporan', 'Nama Pelapor', 'RT', 'Kategori', 'Judul Aduan', 'Deskripsi', 'Tanggal', 'Status', 'Catatan Admin', 'Tanggal Dibuat', 'Citizen ID', 'Citizen Avatar', 'Image URL'];
  const rows = reports.map(r => [
    r.id,
    r.citizenName,
    r.rt,
    r.category,
    r.title,
    r.description,
    r.date,
    r.status.toUpperCase(),
    r.adminNotes || '-',
    r.createdAt ? new Date(r.createdAt).toISOString() : '-',
    r.citizenId || '',
    r.citizenAvatar || '',
    r.imageUrl || ''
  ]);

  const values = [headers, ...rows];

  // 3. Write data
  const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Laporan Aduan!A1?valueInputOption=USER_ENTERED`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      range: 'Laporan Aduan!A1',
      majorDimension: 'ROWS',
      values: values,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || 'Gagal mengekspor data laporan aduan warga.');
  }

  return true;
};

/**
 * Clears and exports citizen users into "Daftar Warga" worksheet
 */
export const exportWargaToSheets = async (token: string, spreadsheetId: string, users: CitizenUser[]) => {
  // 1. Clear existing data
  await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Daftar Warga!A1:Z2000:clear`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  // 2. Prepare headers and rows
  const headers = ['ID Warga', 'Username', 'Email', 'Nama Lengkap', 'Peran', 'Sektor RT', 'No. Telepon / WhatsApp'];
  const rows = users.map(u => [
    u.id,
    u.username,
    u.email,
    u.name,
    u.role,
    u.rt,
    u.phone || '-'
  ]);

  const values = [headers, ...rows];

  // 3. Write data
  const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Daftar Warga!A1?valueInputOption=USER_ENTERED`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      range: 'Daftar Warga!A1',
      majorDimension: 'ROWS',
      values: values,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || 'Gagal mengekspor daftar warga.');
  }

  return true;
};

/**
 * Imports announcements from "Pengumuman" worksheet in Google Sheets
 */
export const importAnnouncementsFromSheets = async (token: string, spreadsheetId: string): Promise<Announcement[]> => {
  const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Pengumuman!A2:G200`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || 'Gagal memuat data pengumuman dari Google Sheets. Pastikan sheet bernama "Pengumuman" ada.');
  }

  const data = await response.json();
  const rows = data.values || [];

  const importedAnnouncements: Announcement[] = [];

  for (const row of rows) {
    if (!row[1] || !row[2]) continue; // Skip empty rows or rows without title/content

    const id = row[0] || `ann-imported-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const title = row[1];
    const content = row[2];
    const categoryRaw = row[3] || 'Informasi';
    const category: 'Penting' | 'Informasi' | 'Kegiatan' = 
      ['Penting', 'Informasi', 'Kegiatan'].includes(categoryRaw) 
        ? (categoryRaw as any) 
        : 'Informasi';
    
    const author = row[4] || 'Ketua RW';
    const date = row[5] || new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    const imageUrl = row[6] || undefined;

    importedAnnouncements.push({
      id,
      title,
      content,
      category,
      author,
      date,
      imageUrl
    });
  }

  return importedAnnouncements;
};

/**
 * Creates/Prepares the "Pengumuman" sheet tab if it's missing in an existing linked sheet
 */
export const ensureAnnouncementSheetExists = async (token: string, spreadsheetId: string) => {
  // Get spreadsheet metadata to see if "Pengumuman" sheet exists
  const metaResponse = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    }
  });

  if (!metaResponse.ok) return;

  const metaData = await metaResponse.json();
  const sheets = metaData.sheets || [];
  const hasAnnouncements = sheets.some((s: any) => s.properties?.title === 'Pengumuman');

  if (!hasAnnouncements) {
    // Add the sheet
    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          {
            addSheet: {
              properties: {
                title: 'Pengumuman',
                gridProperties: {
                  frozenRowCount: 1
                }
              }
            }
          }
        ]
      })
    });

    // Write header
    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Pengumuman!A1?valueInputOption=USER_ENTERED`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        range: 'Pengumuman!A1',
        majorDimension: 'ROWS',
        values: [
          ['ID Pengumuman', 'Judul', 'Detail Pengumuman', 'Kategori', 'Penulis', 'Tanggal Rilis'],
          [
            'ann-temp-1',
            'Agenda Kerja Bakti Bersama',
            'Diberitahukan kepada seluruh warga bahwa akan dilaksanakan kerja bakti membersihkan saluran air dan lingkungan sekitar balai RW besok minggu mulai pukul 07:00 WIB.',
            'Kegiatan',
            'Ketua RW',
            new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
          ]
        ]
      })
    });
  }
};

/**
 * Fetches reports from the Google Sheet
 */
export const fetchReportsFromSheets = async (token: string, spreadsheetId: string): Promise<Report[]> => {
  const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Laporan Aduan!A2:M2000`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || 'Gagal memuat data laporan dari Google Sheets.');
  }

  const data = await response.json();
  const rows = data.values || [];

  const fetchedReports: Report[] = [];

  for (const row of rows) {
    if (!row[0] || !row[4]) continue; // Skip empty row or row without ID/Title

    const id = row[0];
    const citizenName = row[1] || 'Anonim';
    const rt = row[2] || 'RT 01';
    const categoryRaw = row[3] || 'Lainnya';
    const category: Report['category'] = 
      ['Keamanan', 'Infrastruktur', 'Kebersihan', 'Administrasi', 'Lainnya'].includes(categoryRaw)
        ? (categoryRaw as any)
        : 'Lainnya';
    
    const title = row[4];
    const description = row[5] || '';
    const date = row[6] || new Date().toLocaleDateString('id-ID');
    const statusRaw = (row[7] || 'pending').toLowerCase();
    const status: Report['status'] = 
      ['pending', 'diproses', 'selesai', 'ditolak'].includes(statusRaw)
        ? (statusRaw as any)
        : 'pending';

    const adminNotes = row[8] === '-' ? '' : row[8] || '';
    const createdAt = row[9] || new Date().toISOString();
    const citizenId = row[10] || 'user-unknown';
    const citizenAvatar = row[11] || '';
    const imageUrl = row[12] || '';

    fetchedReports.push({
      id,
      title,
      category,
      description,
      rt,
      status,
      citizenId,
      citizenName,
      citizenAvatar,
      date,
      adminNotes,
      createdAt,
      imageUrl: imageUrl || undefined,
    });
  }

  return fetchedReports;
};

/**
 * Exports announcements to Google Sheets
 */
export const exportAnnouncementsToSheets = async (token: string, spreadsheetId: string, announcements: Announcement[]) => {
  // 1. Clear existing data
  await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Pengumuman!A1:Z2000:clear`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  // 2. Prepare headers and rows
  const headers = ['ID Pengumuman', 'Judul', 'Detail Pengumuman', 'Kategori', 'Penulis', 'Tanggal Rilis', 'Gambar (URL)'];
  const rows = announcements.map(a => [
    a.id,
    a.title,
    a.content,
    a.category,
    a.author,
    a.date,
    a.imageUrl || ''
  ]);

  const values = [headers, ...rows];

  // 3. Write data
  const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Pengumuman!A1?valueInputOption=USER_ENTERED`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      range: 'Pengumuman!A1',
      majorDimension: 'ROWS',
      values: values,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || 'Gagal mengekspor data pengumuman ke Google Sheets.');
  }

  return true;
};

/**
 * Ensures all sheets exist in the spreadsheet
 */
export const ensureAllSheetsExist = async (token: string, spreadsheetId: string) => {
  const metaResponse = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    }
  });

  if (!metaResponse.ok) return;

  const metaData = await metaResponse.json();
  const sheets = metaData.sheets || [];
  const existingSheetTitles = sheets.map((s: any) => s.properties?.title);

  const missingSheets = [];
  if (!existingSheetTitles.includes('Laporan Aduan')) missingSheets.push('Laporan Aduan');
  if (!existingSheetTitles.includes('Daftar Warga')) missingSheets.push('Daftar Warga');
  if (!existingSheetTitles.includes('Pengumuman')) missingSheets.push('Pengumuman');

  if (missingSheets.length > 0) {
    const requests = missingSheets.map(title => ({
      addSheet: {
        properties: {
          title,
          gridProperties: {
            frozenRowCount: 1
          }
        }
      }
    }));

    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ requests })
    });

    // Write headers for the newly added sheets
    const batchData = [];
    if (missingSheets.includes('Laporan Aduan')) {
      batchData.push({
        range: 'Laporan Aduan!A1',
        values: [['ID Laporan', 'Nama Pelapor', 'RT', 'Kategori', 'Judul Aduan', 'Deskripsi', 'Tanggal', 'Status', 'Catatan Admin', 'Tanggal Dibuat', 'Citizen ID', 'Citizen Avatar', 'Image URL']]
      });
    }
    if (missingSheets.includes('Daftar Warga')) {
      batchData.push({
        range: 'Daftar Warga!A1',
        values: [['ID Warga', 'Username', 'Email', 'Nama Lengkap', 'Peran', 'Sektor RT', 'No. Telepon / WhatsApp']]
      });
    }
    if (missingSheets.includes('Pengumuman')) {
      batchData.push({
        range: 'Pengumuman!A1',
        values: [['ID Pengumuman', 'Judul', 'Detail Pengumuman', 'Kategori', 'Penulis', 'Tanggal Rilis']]
      });
    }

    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        valueInputOption: 'USER_ENTERED',
        data: batchData
      })
    });
  }
};
