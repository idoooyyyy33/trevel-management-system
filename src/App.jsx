import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import Navbar from './components/Navbar';
import HomeHero from './components/HomeHero';
import FleetCatalog from './components/FleetCatalog';
import BookingForm from './components/BookingForm';
import ScheduleView from './components/ScheduleView';
import ExecutiveRecap from './components/ExecutiveRecap';
import { fetchSystemData, saveReservation, resetDemoData } from './api';
import { Bus, MapPin, Phone, ShieldCheck, Heart } from 'lucide-react';

export default function App() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('beranda');
  const [preselectedBusId, setPreselectedBusId] = useState(null);
  const [preselectedDestination, setPreselectedDestination] = useState('');

  // Fetch initial data using TanStack Query
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['systemData'],
    queryFn: fetchSystemData,
    initialData: () => ({
      fleet: [],
      partners: [],
      bookings: [],
      isDemo: true,
      lastSync: new Date().toISOString()
    })
  });

  // Mutation for creating new booking with optimistic cache updates
  const bookingMutation = useMutation({
    mutationFn: saveReservation,
    onMutate: async (newBooking) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ['systemData'] });

      // Snapshot previous value
      const previousData = queryClient.getQueryData(['systemData']);

      // Optimistically update query data
      queryClient.setQueryData(['systemData'], (old) => {
        if (!old) return old;
        return {
          ...old,
          bookings: [newBooking, ...(old.bookings || [])]
        };
      });

      return { previousData };
    },
    onError: (err, newBooking, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(['systemData'], context.previousData);
      }
      toast.error('Terjadi kesalahan saat memproses data reservasi.');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['systemData'] });
    }
  });

  const handleSync = async () => {
    toast.promise(refetch(), {
      loading: 'Menghubungkan ke server data PO. Trevel...',
      success: 'Data operasional & reservasi berhasil disinkronisasi!',
      error: 'Sinkronisasi gagal, tetap dalam mode lokal.',
    });
  };

  const handleSelectBusForBooking = (busId) => {
    setPreselectedBusId(busId);
    setActiveTab('reservasi');
  };

  const handleQuickBookDestination = (destTitle) => {
    setPreselectedDestination(destTitle);
    setActiveTab('reservasi');
  };

  const handleResetData = () => {
    resetDemoData();
    queryClient.invalidateQueries({ queryKey: ['systemData'] });
    toast.success('Data demo sistem berhasil dikembalikan ke pengaturan awal!');
  };

  const fleet = data?.fleet || [];
  const partners = data?.partners || [];
  const bookings = data?.bookings || [];
  const isDemo = data?.isDemo ?? true;

  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-cobalt selection:text-white">
      
      {/* Floating Glassmorphism Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isDemo={isDemo}
        isSyncing={isFetching}
        onSync={handleSync}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 mt-2">
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center space-y-4">
            <div className="w-10 h-10 border-3 border-cobalt border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-mono font-semibold text-slate-500">
              Memuat Sistem Operasional Trevel...
            </p>
          </div>
        ) : (
          <>
            {activeTab === 'beranda' && (
              <HomeHero
                onSelectTab={setActiveTab}
                onQuickBookDestination={handleQuickBookDestination}
              />
            )}

            {activeTab === 'katalog' && (
              <FleetCatalog
                fleet={fleet}
                onSelectBusForBooking={handleSelectBusForBooking}
              />
            )}

            {activeTab === 'reservasi' && (
              <BookingForm
                fleet={fleet}
                partners={partners}
                bookings={bookings}
                preselectedBusId={preselectedBusId}
                preselectedDestination={preselectedDestination}
                onBookingSubmitted={async (bookingPayload) => {
                  await bookingMutation.mutateAsync(bookingPayload);
                }}
              />
            )}

            {activeTab === 'jadwal' && (
              <ScheduleView
                bookings={bookings}
                fleet={fleet}
              />
            )}

            {activeTab === 'rekap' && (
              <ExecutiveRecap
                bookings={bookings}
                fleet={fleet}
                partners={partners}
              />
            )}
          </>
        )}
      </main>

      {/* Footer Editorial */}
      <footer className="mt-20 border-t border-slate-200 bg-surface text-obsidian no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            
            {/* Brand column */}
            <div className="space-y-3 md:col-span-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-obsidian flex items-center justify-center text-white">
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
                <button
                  type="button"
                  onClick={handleResetData}
                  className="text-[11px] font-mono text-slate-500 hover:text-alert underline transition-colors"
                >
                  Reset Ulang Data Demo Bawaan
                </button>
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

          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
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
