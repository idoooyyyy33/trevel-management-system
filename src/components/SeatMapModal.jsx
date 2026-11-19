import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Tv, 
  Coffee, 
  DoorClosed, 
  ShieldAlert, 
  Info, 
  Check, 
  Wifi, 
  Zap,
  Armchair
} from 'lucide-react';

export default function SeatMapModal({ isOpen, onClose, bus, onSelectBusForBooking }) {
  const [selectedSeat, setSelectedSeat] = useState(null);

  if (!isOpen || !bus) return null;

  // 7 standard rows of 2-2 = 28 seats
  const rows = [1, 2, 3, 4, 5, 6, 7];
  // Back row lounge = 5 seats (8A, 8B, 8C, 8D, 8E)
  const rearLounge = ['8A', '8B', '8C', '8D', '8E'];

  const handleSeatClick = (seatCode) => {
    setSelectedSeat(seatCode);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-obsidian/60 backdrop-blur-sm transition-opacity"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative bg-surface rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden z-10 my-8"
        >
          {/* Header */}
          <div className="px-6 py-4 bg-obsidian text-white flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-cobalt flex items-center justify-center text-white shadow-sm">
                <Armchair className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg leading-tight flex items-center gap-2">
                  <span>Denah Kabin: {bus.name}</span>
                  <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-full bg-white/10 border border-white/20 text-slate-200">
                    {bus.plateNumber}
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Konfigurasi 33 Kursi Eksekutif (2-2 Formasi + 5 Sofa Belakang)
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
            
            {/* Legend & Seat Info Box */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded-md bg-cobalt text-white flex items-center justify-center text-[9px] font-bold">A</div>
                  <span className="text-slate-600 font-medium">Kursi Penumpang Reclining</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 rounded-md bg-emerald-600 text-white flex items-center justify-center text-[9px] font-bold">TL</div>
                  <span className="text-slate-600 font-medium">Tour Leader / Co-Driver</span>
                </div>
              </div>

              {selectedSeat ? (
                <div className="flex items-center gap-2 font-mono text-cobalt font-semibold bg-cobalt/10 px-2.5 py-1 rounded-md">
                  <span>Terpilih: Kursi {selectedSeat} (Reclining + Port USB Aktif)</span>
                </div>
              ) : (
                <div className="text-caption text-[11px]">
                  Klik salah satu kursi untuk melihat detail fasilitas individual
                </div>
              )}
            </div>

            {/* Bus Blueprint Visual Container */}
            <div className="border-2 border-dashed border-slate-300 rounded-3xl p-6 bg-slate-100/60 relative">
              
              {/* Bus Exterior Frame Shell */}
              <div className="max-w-md mx-auto bg-white rounded-3xl border-2 border-slate-800 shadow-lifted p-5 relative overflow-hidden">
                
                {/* Windshield / Front Area */}
                <div className="h-10 border-b-2 border-slate-800 rounded-t-2xl bg-gradient-to-b from-slate-200 to-slate-100 flex items-center justify-between px-6 mb-4 text-xs font-mono font-bold text-slate-600">
                  <span>KACA DEPAN AERODINAMIS</span>
                  <div className="flex items-center gap-1 text-[11px] text-cobalt">
                    <Tv className="w-3.5 h-3.5" />
                    <span>Smart TV 43"</span>
                  </div>
                </div>

                {/* Cockpit Front Row (Driver & Co-Driver & Door) */}
                <div className="grid grid-cols-5 gap-2 items-center mb-6 pb-4 border-b border-slate-200">
                  {/* Driver Seat */}
                  <div className="col-span-2 flex items-center gap-2 bg-slate-900 text-white p-2.5 rounded-xl text-xs font-semibold">
                    <div className="w-7 h-7 rounded-lg bg-slate-700 flex items-center justify-center font-bold text-[10px]">
                      DRV
                    </div>
                    <div>
                      <div className="text-[11px]">KURSISUPIR</div>
                      <div className="text-[9px] text-slate-300">Air Suspension Seat</div>
                    </div>
                  </div>

                  {/* Front Gangway */}
                  <div className="col-span-1 text-center font-mono text-[9px] text-slate-400">
                    LORONG
                  </div>

                  {/* Co-Driver / Tour Leader & Front Door */}
                  <div className="col-span-2 flex flex-col gap-1.5">
                    <div className="flex items-center gap-2 bg-emerald-700 text-white p-2 rounded-xl text-xs font-semibold">
                      <div className="w-6 h-6 rounded-lg bg-emerald-900 flex items-center justify-center font-bold text-[10px]">
                        TL
                      </div>
                      <div className="text-[10px]">Tour Leader</div>
                    </div>
                    <div className="flex items-center justify-center gap-1 bg-amber-50 border border-amber-200 text-amber-800 py-1 rounded-lg text-[9px] font-bold">
                      <DoorClosed className="w-3 h-3" />
                      <span>PINTU DEPAN</span>
                    </div>
                  </div>
                </div>

                {/* Passenger Seats Rows (1 s/d 7) -> 28 Seats */}
                <div className="space-y-2.5">
                  {rows.map((row) => {
                    const seatLeftA = `${row}A`;
                    const seatLeftB = `${row}B`;
                    const seatRightC = `${row}C`;
                    const seatRightD = `${row}D`;

                    return (
                      <div key={row} className="grid grid-cols-5 gap-2 items-center">
                        {/* Left Side: 2 Seats (A, B) */}
                        <div className="col-span-2 grid grid-cols-2 gap-1.5">
                          {[seatLeftA, seatLeftB].map((seat) => (
                            <button
                              key={seat}
                              onClick={() => handleSeatClick(seat)}
                              className={`p-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center relative ${
                                selectedSeat === seat
                                  ? 'bg-cobalt text-white shadow-md scale-105 ring-2 ring-cobalt ring-offset-1'
                                  : 'bg-slate-100 hover:bg-slate-200 text-obsidian border border-slate-200'
                              }`}
                            >
                              <Armchair className="w-4 h-4 mb-0.5 opacity-80" />
                              <span className="font-mono text-[11px]">{seat}</span>
                              <div className="absolute top-0.5 right-0.5 w-1 h-1 rounded-full bg-emerald-500" title="USB Port Aktif" />
                            </button>
                          ))}
                        </div>

                        {/* Central Aisle */}
                        <div className="col-span-1 text-center font-mono text-[10px] text-slate-400 font-medium">
                          R{row}
                        </div>

                        {/* Right Side: 2 Seats (C, D) */}
                        <div className="col-span-2 grid grid-cols-2 gap-1.5">
                          {[seatRightC, seatRightD].map((seat) => (
                            <button
                              key={seat}
                              onClick={() => handleSeatClick(seat)}
                              className={`p-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center relative ${
                                selectedSeat === seat
                                  ? 'bg-cobalt text-white shadow-md scale-105 ring-2 ring-cobalt ring-offset-1'
                                  : 'bg-slate-100 hover:bg-slate-200 text-obsidian border border-slate-200'
                              }`}
                            >
                              <Armchair className="w-4 h-4 mb-0.5 opacity-80" />
                              <span className="font-mono text-[11px]">{seat}</span>
                              <div className="absolute top-0.5 right-0.5 w-1 h-1 rounded-full bg-emerald-500" title="USB Port Aktif" />
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Amenities Bar (Dispenser, P3K, Coolbox) */}
                <div className="my-3 py-2 px-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-around text-[10px] text-slate-600 font-medium">
                  <div className="flex items-center gap-1 text-amber-700">
                    <Coffee className="w-3.5 h-3.5" />
                    <span>Dispenser Hot/Cold</span>
                  </div>
                  <div className="flex items-center gap-1 text-emerald-700">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>APAR & P3K</span>
                  </div>
                  <div className="flex items-center gap-1 text-cobalt">
                    <Zap className="w-3.5 h-3.5" />
                    <span>Inverter 220V</span>
                  </div>
                </div>

                {/* Rear 5-Seat Continuous Lounge (Row 8: 8A-8E) */}
                <div className="mt-2 pt-3 border-t-2 border-slate-200">
                  <div className="text-[10px] font-bold text-center uppercase tracking-wider text-slate-500 mb-1.5">
                    Sofa Belakang (5 Kursi Eksekutif)
                  </div>
                  <div className="grid grid-cols-5 gap-1.5">
                    {rearLounge.map((seat) => (
                      <button
                        key={seat}
                        onClick={() => handleSeatClick(seat)}
                        className={`p-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center relative ${
                          selectedSeat === seat
                            ? 'bg-cobalt text-white shadow-md scale-105 ring-2 ring-cobalt ring-offset-1'
                            : 'bg-slate-100 hover:bg-slate-200 text-obsidian border border-slate-200'
                        }`}
                      >
                        <Armchair className="w-4 h-4 mb-0.5 opacity-80" />
                        <span className="font-mono text-[11px]">{seat}</span>
                        <div className="absolute top-0.5 right-0.5 w-1 h-1 rounded-full bg-emerald-500" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Back Rear Windshield */}
                <div className="mt-4 h-3 bg-slate-800 rounded-b-xl" />
              </div>
            </div>

            {/* Individual Seat Spec Sheet */}
            {selectedSeat && (
              <div className="p-4 rounded-2xl bg-cobalt/5 border border-cobalt/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-display font-bold text-sm text-cobalt">
                    Spesifikasi Kursi #{selectedSeat}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    Ready & Disanitasi
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-slate-600">
                  <div>Tipe: <strong className="text-obsidian">Reclining 135°</strong></div>
                  <div>Material: <strong className="text-obsidian">Fabric Alcantara</strong></div>
                  <div>Daya: <strong className="text-obsidian">USB A+C 18W</strong></div>
                  <div>Cup Holder: <strong className="text-obsidian">Tersedia</strong></div>
                </div>
              </div>
            )}

          </div>

          {/* Footer Action */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-caption">
              Kapasitas total <strong className="text-obsidian">33 Penumpang</strong> terkonfirmasi regulasi keselamatan Kemenhub.
            </div>
            
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors"
              >
                Tutup Denah
              </button>
              <button
                onClick={() => {
                  onClose();
                  onSelectBusForBooking(bus.id);
                }}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-cobalt hover:bg-cobalt-hover text-white text-xs font-bold transition-all shadow-md shadow-cobalt/20 flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>Pilih Armada Ini & Buat Jadwal</span>
              </button>
            </div>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
