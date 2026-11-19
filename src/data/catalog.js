// Katalog armada & mitra resmi PO. Trevel — dipakai oleh frontend dan Netlify Server.

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

export const BOOKING_STATUSES = ['Menunggu Konfirmasi', 'Terkonfirmasi', 'Selesai', 'Dibatalkan'];
