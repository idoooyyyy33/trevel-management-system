const API = 'https://script.google.com/macros/s/ID_PENERAPAN_ANDA/exec';

// Local storage key for persistent demo updates
const STORAGE_KEY_BOOKINGS = 'trevel_demo_bookings_v1';

export const FLEET_DATA = [
  {
    id: 'zotopia',
    name: 'Zotopia',
    bodyType: 'Jetbus 5 Royal Coach Single Glass',
    chassis: 'Mercedes-Benz OH 1626 Air Suspension',
    plateNumber: 'N 7122 UZ',
    capacity: 33,
    seatLayout: '2-2 Executive + 5 Rear Lounge',
    dailyRate: 3500000,
    status: 'Siap Dinas',
    year: 2025,
    tagline: 'Kemewahan Suspensi Udara & Akustik Suara Jernih JBL',
    colorHex: '#1D4ED8',
    image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80',
    facilities: [
      'AC Ducting Individual Louver',
      'Reclining Seats 2-2 Alcantara Fabric',
      'Smart TV Karaoke 43" + JBL Sound System',
      'Port USB Type-A & Type-C Tiap Baris',
      'Dispenser Air Panas & Coolbox Dingin',
      'Bagasi Luas Tembus Kanan-Kiri',
      'Lampu Baca LED & Ambiance Cabin Light',
      'Air Purifier Medis HEPA Filter'
    ]
  },
  {
    id: 'cocomelon',
    name: 'Cocomelon',
    bodyType: 'Avante H8 Prime Facelift',
    chassis: 'Hino RN 285 Custom Air Suspension',
    plateNumber: 'N 7890 UZ',
    capacity: 33,
    seatLayout: '2-2 Executive + 5 Rear Lounge',
    dailyRate: 3500000,
    status: 'Siap Dinas',
    year: 2024,
    tagline: 'Visibilitas Pandangan Ekstra Luas dengan Kaca Aerodinamis',
    colorHex: '#059669',
    image: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=1200&q=80',
    facilities: [
      'AC Ducting Individual Louver',
      'Reclining Seats 2-2 Ergonomic Plush',
      'Dual TV 32" Depan & Tengah + Subwoofer',
      'Fast Charging Port USB Tiap Kursi',
      'Dispenser Teh/Kopi & Kulkas Mini',
      'Bagasi Ekstra Tinggi Muat Kargo Sepeda',
      'Tirai UV Protection Block 99%',
      'Sistem Suspensi Udara Terkalibrasi'
    ]
  }
];

export const PARTNERS_DATA = [
  {
    id: 'mitra-wisata',
    name: 'Mitra Wisata Tour',
    pic: 'Bpk. Bambang Sutrisno',
    phone: '0812-3456-7890',
    city: 'Surabaya',
    tier: 'Mitra Prioritas',
    totalTrips: 38,
    rating: 4.9
  },
  {
    id: 'bromo-adventure',
    name: 'Bromo Adventure Tour & Travel',
    pic: 'Ibu Ratih Puspa',
    phone: '0813-9876-5432',
    city: 'Probolinggo',
    tier: 'Mitra Prioritas',
    totalTrips: 27,
    rating: 4.9
  },
  {
    id: 'surabaya-travel-club',
    name: 'Surabaya Travel Club',
    pic: 'Bpk. Hendra Gunawan',
    phone: '0811-2345-6789',
    city: 'Surabaya',
    tier: 'Mitra Prioritas',
    totalTrips: 21,
    rating: 4.8
  },
  {
    id: 'malang-heritage',
    name: 'Malang Heritage Holiday',
    pic: 'Bpk. Dimas Aryo',
    phone: '0819-8765-4321',
    city: 'Malang',
    tier: 'Mitra Reguler',
    totalTrips: 15,
    rating: 4.7
  },
  {
    id: 'pesona-ijen',
    name: 'Pesona Ijen Tour Organizer',
    pic: 'Ibu Siti Nurhaliza',
    phone: '0852-3344-5566',
    city: 'Banyuwangi',
    tier: 'Mitra Reguler',
    totalTrips: 12,
    rating: 4.8
  },
  {
    id: 'java-overland',
    name: 'Java Overland Transport',
    pic: 'Bpk. Arif Wijaya',
    phone: '0857-1122-3344',
    city: 'Sidoarjo',
    tier: 'Mitra Reguler',
    totalTrips: 9,
    rating: 4.6
  }
];

export const INITIAL_DEMO_BOOKINGS = [
  {
    id: 'TRV-261023-901',
    bookingCode: 'TRV-261023-901',
    partnerId: 'mitra-wisata',
    partnerName: 'Mitra Wisata Tour',
    busId: 'zotopia',
    busName: 'Zotopia',
    plateNumber: 'N 7122 UZ',
    destination: 'Kawah Ijen & Taman Nasional Baluran, Banyuwangi',
    startDate: '2026-10-23',
    endDate: '2026-10-25',
    days: 3,
    passengers: 32,
    baseRate: 3500000,
    tollFuelEstimate: 1200000,
    dealPrice: 11700000,
    status: 'Terkonfirmasi',
    picName: 'Bpk. Bambang Sutrisno',
    picPhone: '0812-3456-7890',
    notes: 'Rombongan VIP guru dinas pendidikan. Minta driver senior yang ramah.',
    createdAt: '2026-10-10T08:30:00Z'
  },
  {
    id: 'TRV-261027-402',
    bookingCode: 'TRV-261027-402',
    partnerId: 'bromo-adventure',
    partnerName: 'Bromo Adventure Tour & Travel',
    busId: 'cocomelon',
    busName: 'Cocomelon',
    plateNumber: 'N 7890 UZ',
    destination: 'Sunrise Bromo - Sukapura, Probolinggo',
    startDate: '2026-10-27',
    endDate: '2026-10-28',
    days: 2,
    passengers: 30,
    baseRate: 3500000,
    tollFuelEstimate: 800000,
    dealPrice: 7800000,
    status: 'Terkonfirmasi',
    picName: 'Ibu Ratih Puspa',
    picPhone: '0813-9876-5432',
    notes: 'Kunjungan fotografer alam terbuka. Bagasi bawa perlengkapan kamera.',
    createdAt: '2026-10-12T10:15:00Z'
  },
  {
    id: 'TRV-261029-103',
    bookingCode: 'TRV-261029-103',
    partnerId: 'surabaya-travel-club',
    partnerName: 'Surabaya Travel Club',
    busId: 'zotopia',
    busName: 'Zotopia',
    plateNumber: 'N 7122 UZ',
    destination: 'Wisata Edukasi Jatim Park 3 & Museum Angkut, Batu',
    startDate: '2026-10-29',
    endDate: '2026-10-30',
    days: 2,
    passengers: 33,
    baseRate: 3500000,
    tollFuelEstimate: 700000,
    dealPrice: 7700000,
    status: 'Terkonfirmasi',
    picName: 'Bpk. Hendra Gunawan',
    picPhone: '0811-2345-6789',
    notes: 'Full capacity 33 pax. Snack box pagi disediakan biro.',
    createdAt: '2026-10-14T11:00:00Z'
  },
  {
    id: 'TRV-261102-504',
    bookingCode: 'TRV-261102-504',
    partnerId: 'malang-heritage',
    partnerName: 'Malang Heritage Holiday',
    busId: 'cocomelon',
    busName: 'Cocomelon',
    plateNumber: 'N 7890 UZ',
    destination: 'Pantai Klayar & Gua Gong, Pacitan',
    startDate: '2026-11-02',
    endDate: '2026-11-04',
    days: 3,
    passengers: 28,
    baseRate: 3500000,
    tollFuelEstimate: 1400000,
    dealPrice: 11900000,
    status: 'Terkonfirmasi',
    picName: 'Bpk. Dimas Aryo',
    picPhone: '0819-8765-4321',
    notes: 'Rute jalur lintas selatan. Mohon kondisi rem dan ban dicek prima.',
    createdAt: '2026-10-16T14:20:00Z'
  },
  {
    id: 'TRV-261106-605',
    bookingCode: 'TRV-261106-605',
    partnerId: 'pesona-ijen',
    partnerName: 'Pesona Ijen Tour Organizer',
    busId: 'zotopia',
    busName: 'Zotopia',
    plateNumber: 'N 7122 UZ',
    destination: 'Denpasar & Bedugul Tour, Bali',
    startDate: '2026-11-06',
    endDate: '2026-11-09',
    days: 4,
    passengers: 31,
    baseRate: 3500000,
    tollFuelEstimate: 2500000,
    dealPrice: 16500000,
    status: 'Terkonfirmasi',
    picName: 'Ibu Siti Nurhaliza',
    picPhone: '0852-3344-5566',
    notes: 'Tiket kapal feri penyeberangan Ketapang-Gilimanuk ditanggung biro.',
    createdAt: '2026-10-18T09:40:00Z'
  },
  {
    id: 'TRV-261111-706',
    bookingCode: 'TRV-261111-706',
    partnerId: 'java-overland',
    partnerName: 'Java Overland Transport',
    busId: 'cocomelon',
    busName: 'Cocomelon',
    plateNumber: 'N 7890 UZ',
    destination: 'Telaga Sarangan & Tawangmangu, Magetan-Karanganyar',
    startDate: '2026-11-11',
    endDate: '2026-11-12',
    days: 2,
    passengers: 29,
    baseRate: 3500000,
    tollFuelEstimate: 900000,
    dealPrice: 7900000,
    status: 'Terkonfirmasi',
    picName: 'Bpk. Arif Wijaya',
    picPhone: '0857-1122-3344',
    notes: 'Jalur tanjakan cemorosewu. Driver berpengalaman pegunungan.',
    createdAt: '2026-10-19T13:10:00Z'
  },
  {
    id: 'TRV-261115-807',
    bookingCode: 'TRV-261115-807',
    partnerId: 'mitra-wisata',
    partnerName: 'Mitra Wisata Tour',
    busId: 'zotopia',
    busName: 'Zotopia',
    plateNumber: 'N 7122 UZ',
    destination: 'Candi Borobudur & Malioboro, D.I. Yogyakarta',
    startDate: '2026-11-15',
    endDate: '2026-11-17',
    days: 3,
    passengers: 33,
    baseRate: 3500000,
    tollFuelEstimate: 1600000,
    dealPrice: 12100000,
    status: 'Terkonfirmasi',
    picName: 'Bpk. Bambang Sutrisno',
    picPhone: '0812-3456-7890',
    notes: 'Via Tol Trans Jawa Mojokerto - Solo tembus Klaten.',
    createdAt: '2026-10-20T16:00:00Z'
  },
  {
    id: 'TRV-261119-908',
    bookingCode: 'TRV-261119-908',
    partnerId: 'bromo-adventure',
    partnerName: 'Bromo Adventure Tour & Travel',
    busId: 'cocomelon',
    busName: 'Cocomelon',
    plateNumber: 'N 7890 UZ',
    destination: 'Coban Rondo & Petik Apel Selecta, Batu',
    startDate: '2026-11-20',
    endDate: '2026-11-21',
    days: 2,
    passengers: 30,
    baseRate: 3500000,
    tollFuelEstimate: 600000,
    dealPrice: 7600000,
    status: 'Terkonfirmasi',
    picName: 'Ibu Ratih Puspa',
    picPhone: '0813-9876-5432',
    notes: 'Family gathering perusahaan swasta Surabaya.',
    createdAt: '2026-10-21T10:00:00Z'
  },
  {
    id: 'TRV-261124-209',
    bookingCode: 'TRV-261124-209',
    partnerId: 'surabaya-travel-club',
    partnerName: 'Surabaya Travel Club',
    busId: 'zotopia',
    busName: 'Zotopia',
    plateNumber: 'N 7122 UZ',
    destination: 'Ziarah Wali Songo Jalur Pantura Jawa Timur',
    startDate: '2026-11-24',
    endDate: '2026-11-26',
    days: 3,
    passengers: 33,
    baseRate: 3500000,
    tollFuelEstimate: 1300000,
    dealPrice: 11800000,
    status: 'Terkonfirmasi',
    picName: 'Bpk. Hendra Gunawan',
    picPhone: '0811-2345-6789',
    notes: 'Rute Ampel, Giri, Maulana Malik Ibrahim, Sunan Drajat, Sunan Bonang.',
    createdAt: '2026-10-22T11:45:00Z'
  },
  {
    id: 'TRV-261128-310',
    bookingCode: 'TRV-261128-310',
    partnerId: 'malang-heritage',
    partnerName: 'Malang Heritage Holiday',
    busId: 'cocomelon',
    busName: 'Cocomelon',
    plateNumber: 'N 7890 UZ',
    destination: 'Tumpak Sewu Waterfall & Goa Tetes, Lumajang',
    startDate: '2026-11-28',
    endDate: '2026-11-29',
    days: 2,
    passengers: 27,
    baseRate: 3500000,
    tollFuelEstimate: 850000,
    dealPrice: 7850000,
    status: 'Terkonfirmasi',
    picName: 'Bpk. Dimas Aryo',
    picPhone: '0819-8765-4321',
    notes: 'Trip wisata alam ekstrem. Mohon siapkan P3K lengkap.',
    createdAt: '2026-10-23T07:15:00Z'
  }
];

export const DEMO = {
  fleet: FLEET_DATA,
  partners: PARTNERS_DATA,
  bookings: INITIAL_DEMO_BOOKINGS
};

// Helper to get cached bookings or initialize
function getStoredBookings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_BOOKINGS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to read from localStorage', e);
  }
  return INITIAL_DEMO_BOOKINGS;
}

function saveStoredBookings(bookings) {
  try {
    localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify(bookings));
  } catch (e) {
    console.warn('Failed to save to localStorage', e);
  }
}

/**
 * Fetch Initial Enterprise System Data
 * With 8s timeout and seamless DEMO fallback
 */
export async function fetchSystemData() {
  const isDefaultUrl = API.includes('ID_PENERAPAN_ANDA');
  
  if (isDefaultUrl) {
    // Immediate clean fallback to DEMO state
    return {
      fleet: FLEET_DATA,
      partners: PARTNERS_DATA,
      bookings: getStoredBookings(),
      isDemo: true,
      lastSync: new Date().toISOString()
    };
  }

  // Real fetch with 8s abort controller timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(API + '?action=getData', {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP Error ${response.status}`);
    }

    const data = await response.json();
    return {
      fleet: data.fleet || FLEET_DATA,
      partners: data.partners || PARTNERS_DATA,
      bookings: data.bookings || getStoredBookings(),
      isDemo: false,
      lastSync: new Date().toISOString()
    };
  } catch (error) {
    clearTimeout(timeoutId);
    console.info('Menggunakan Data Cadangan Lokal Trevel Enterprise (Demo Mode):', error.message);
    return {
      fleet: FLEET_DATA,
      partners: PARTNERS_DATA,
      bookings: getStoredBookings(),
      isDemo: true,
      lastSync: new Date().toISOString()
    };
  }
}

/**
 * Save new reservation (with optimistic state & localStorage support)
 */
export async function saveReservation(bookingData) {
  const isDefaultUrl = API.includes('ID_PENERAPAN_ANDA');

  const newBooking = {
    ...bookingData,
    id: bookingData.id || `TRV-${Date.now()}`,
    status: 'Terkonfirmasi',
    createdAt: new Date().toISOString()
  };

  // Always update local storage for persistence
  const current = getStoredBookings();
  const updated = [newBooking, ...current];
  saveStoredBookings(updated);

  if (isDefaultUrl) {
    // Artificial small delay for realistic UX feedback
    await new Promise(r => setTimeout(r, 600));
    return newBooking;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'createBooking', payload: newBooking }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (!response.ok) throw new Error('Gagal simpan ke server remote');
    const result = await response.json();
    return result.booking || newBooking;
  } catch (err) {
    clearTimeout(timeoutId);
    console.warn('Fallback ke penyimpanan lokal:', err.message);
    return newBooking;
  }
}

/**
 * Update reservation status
 */
export async function updateBookingStatus(bookingId, status) {
  const current = getStoredBookings();
  const updated = current.map(b => b.id === bookingId ? { ...b, status } : b);
  saveStoredBookings(updated);
  return { success: true, bookingId, status };
}

/**
 * Reset Demo Data
 */
export function resetDemoData() {
  localStorage.removeItem(STORAGE_KEY_BOOKINGS);
  return INITIAL_DEMO_BOOKINGS;
}
