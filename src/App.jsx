import React, { useState, lazy, Suspense } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Navbar from './components/Navbar';
import HomeHero from './components/HomeHero';
import FleetCatalog from './components/FleetCatalog';
import BookingForm from './components/BookingForm';
import { fetchPublicData, submitPublicBooking, FLEET_DATA } from './api';
import { Bus, Lock } from 'lucide-react';

const AdminApp = lazy(() => import('./admin/AdminApp'));

export default function App() {
  const isAdminRoute = window.location.pathname.startsWith('/admin');
  if (isAdminRoute) {
    return (
      <Suspense fallback={<FullScreenLoader label="Memuat Panel Admin Trevel..." />}>
        <AdminApp />
      </Suspense>
    );
  }
  return <PublicSite />;
}

export function FullScreenLoader({ label }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
      <div className="w-10 h-10 border-[3px] border-cobalt border-t-transparent rounded-full animate-spin" />
      <p className="text-xs font-mono font-semibold text-slate-500">{label}</p>
    </div>
  );
}

function PublicSite() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('beranda');
  const [preselectedBusId, setPreselectedBusId] = useState(null);
  const [preselectedDestination, setPreselectedDestination] = useState('');

  // Publik hanya menerima data armada + tanggal terisi (tanpa identitas pelanggan lain)
  const { data, isLoading } = useQuery({
    queryKey: ['publicAvailability'],
    queryFn: fetchPublicData,
    staleTime: 30_000,
  });

  const bookingMutation = useMutation({
    mutationFn: submitPublicBooking,
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['publicAvailability'] }),
  });

  const handleSelectBusForBooking = (busId) => {
    setPreselectedBusId(busId);
    setActiveTab('reservasi');
  };

  const handleQuickBookDestination = (destTitle) => {
    setPreselectedDestination(destTitle);
    setActiveTab('reservasi');
  };

  const fleet = data?.fleet || FLEET_DATA;
  const blocked = data?.blocked || [];

  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-cobalt selection:text-white">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 mt-2">
        {activeTab === 'beranda' && (
          <HomeHero onSelectTab={setActiveTab} onQuickBookDestination={handleQuickBookDestination} />
        )}

        {activeTab === 'katalog' && (
          <FleetCatalog fleet={fleet} onSelectBusForBooking={handleSelectBusForBooking} />
        )}

        {activeTab === 'reservasi' && (
          isLoading ? (
            <div className="py-24 flex flex-col items-center justify-center space-y-4">
              <div className="w-10 h-10 border-[3px] border-cobalt border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-mono font-semibold text-slate-500">Memuat ketersediaan armada...</p>
            </div>
          ) : (
            <BookingForm
              mode="public"
              fleet={fleet}
              bookings={blocked}
              preselectedBusId={preselectedBusId}
              preselectedDestination={preselectedDestination}
              onBookingSubmitted={(payload) => bookingMutation.mutateAsync(payload)}
            />
          )
        )}
      </main>

      {/* Footer Editorial */}
      <footer className="relative overflow-hidden mt-20 border-t border-slate-200/80 bg-gradient-to-br from-white via-blue-50 to-emerald-50 text-obsidian no-print">
        <div className="pointer-events-none absolute -top-32 right-0 w-[28rem] h-[28rem] rounded-full bg-cobalt-glow/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -left-20 w-[26rem] h-[26rem] rounded-full bg-terminal-light/15 blur-3xl" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cobalt/40 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            
            {/* Brand column */}
            <div className="space-y-3 md:col-span-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cobalt to-terminal flex items-center justify-center text-white shadow-md shadow-cobalt/20">
                  <Bus className="w-4 h-4" />
                </div>
                <span className="font-display font-extrabold text-xl text-obsidian tracking-tight">
                  trevel<span className="text-cobalt">.</span>
                </span>
              </div>
              <p className="text-xs text-caption leading-relaxed">
                PO. Trevel Wisata Nusantara — Perusahaan otobus pariwisata eksekutif Jawa Timur & Bali.
              </p>
              <div className="pt-1">
                <a
                  href="/admin"
                  className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-400 hover:text-cobalt transition-colors"
                >
                  <Lock className="w-3 h-3" />
                  Portal Staf
                </a>
              </div>
            </div>

            {/* Hub Operasional */}
            <div className="space-y-2 text-xs">
              <h5 className="font-display font-bold uppercase tracking-wider text-obsidian">
                Garasi & Pool Armada
              </h5>
              <div className="text-slate-600 space-y-1">
                <p>Jl. Raya Surabaya - Malang KM 48</p>
                <p>Pandaan, Pasuruan, Jawa Timur 67156</p>
                <p className="font-mono text-slate-500">Koordinat: -7.6521, 112.6984</p>
              </div>
            </div>

            {/* Layanan Operasional */}
            <div className="space-y-2 text-xs">
              <h5 className="font-display font-bold uppercase tracking-wider text-obsidian">
                Dispatch & Dispatcher
              </h5>
              <div className="text-slate-600 space-y-1">
                <p>Hotline Biro: 0812-3456-7890 (24 Jam)</p>
                <p>Layanan Reservasi: 0343-631234</p>
                <p>Email: charter@trevelwisata.id</p>
              </div>
            </div>

            {/* Legalitas & Safety */}
            <div className="space-y-2 text-xs">
              <h5 className="font-display font-bold uppercase tracking-wider text-obsidian">
                Izin Penyelenggaraan
              </h5>
              <div className="text-slate-600 space-y-1">
                <p>SK Izin Trayek: 503/108/KPTS/DISPERHUB/2024</p>
                <p>Sertifikat Uji KIR: Elektronik Blue Dishub RI</p>
                <p>Proteksi: Asuransi Penumpang Jasa Raharja</p>
              </div>
            </div>

          </div>

          <div className="mt-8 pt-6 border-t border-slate-200/70 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
            <div>
              © 2026 PO. Trevel Wisata Nusantara. Hak Cipta Dilindungi Undang-Undang.
            </div>
            <div className="font-mono text-[10px] text-slate-400">
              Swiss Editorial Transit Design System • React 18 + Vite
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
