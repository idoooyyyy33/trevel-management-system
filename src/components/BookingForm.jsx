import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';
import { 
  Bus, 
  Users, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Building2, 
  Phone, 
  User, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  Minus,
  Plus
} from 'lucide-react';
import RangeCalendar from './RangeCalendar';
import TicketPreview from './TicketPreview';
import { calculateDurationDays, formatIDR, generateBookingId, checkRangeCollision } from '../utils';

export default function BookingForm({ 
  fleet = [], 
  partners = [], 
  bookings = [], 
  preselectedBusId = null,
  preselectedDestination = '',
  onBookingSubmitted 
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [confirmedBookingCode, setConfirmedBookingCode] = useState(null);

  const initialBusId = preselectedBusId || (fleet[0] ? fleet[0].id : 'zotopia');
  const initialBus = fleet.find(b => b.id === initialBusId) || fleet[0] || {};
  const initialPartner = partners[0] || {};

  const { register, handleSubmit, watch, setValue, reset, control, formState: { errors } } = useForm({
    defaultValues: {
      busId: initialBus.id || 'zotopia',
      busName: initialBus.name || 'Zotopia',
      plateNumber: initialBus.plateNumber || 'N 7122 UZ',
      dailyRate: initialBus.dailyRate || 3500000,
      busCapacity: initialBus.capacity || 33,

      partnerId: initialPartner.id || '',
      partnerName: initialPartner.name || '',
      picName: initialPartner.pic || '',
      picPhone: initialPartner.phone || '',

      startDate: '',
      endDate: '',
      durationDays: 1,

      destination: preselectedDestination || '',
      passengers: 30,
      
      baseCost: 3500000,
      tollFuel: 1000000,
      dealPrice: 4500000,
      notes: ''
    }
  });

  const watchBusId = watch('busId');
  const watchStartDate = watch('startDate');
  const watchEndDate = watch('endDate');
  const watchDurationDays = watch('durationDays');
  const watchDailyRate = watch('dailyRate');
  const watchTollFuel = watch('tollFuel');
  const watchPassengers = watch('passengers');
  const watchAll = watch();

  // Handle preselected bus or destination props change
  useEffect(() => {
    if (preselectedBusId) {
      const bus = fleet.find(b => b.id === preselectedBusId);
      if (bus) {
        setValue('busId', bus.id);
        setValue('busName', bus.name);
        setValue('plateNumber', bus.plateNumber);
        setValue('dailyRate', bus.dailyRate);
        setValue('busCapacity', bus.capacity);
      }
    }
  }, [preselectedBusId, fleet, setValue]);

  useEffect(() => {
    if (preselectedDestination) {
      setValue('destination', preselectedDestination);
    }
  }, [preselectedDestination, setValue]);

  // Recalculate duration & costs on date or bus changes
  useEffect(() => {
    if (watchStartDate) {
      const days = calculateDurationDays(watchStartDate, watchEndDate || watchStartDate);
      setValue('durationDays', days);
      const base = days * Number(watchDailyRate || 3500000);
      setValue('baseCost', base);
      const toll = Number(watchTollFuel || 0);
      setValue('dealPrice', base + toll);
    }
  }, [watchStartDate, watchEndDate, watchDailyRate, setValue]);

  // Bus selection handler
  const handleBusSelect = (bus) => {
    setValue('busId', bus.id);
    setValue('busName', bus.name);
    setValue('plateNumber', bus.plateNumber);
    setValue('dailyRate', bus.dailyRate);
    setValue('busCapacity', bus.capacity);

    // If dates are already chosen, re-check collision for the newly selected bus
    if (watchStartDate) {
      const { hasCollision, conflict } = checkRangeCollision(
        watchStartDate, 
        watchEndDate || watchStartDate, 
        bus.id, 
        bookings
      );
      if (hasCollision) {
        toast.warning(`Perhatian: Tanggal terpilih bertabrakan dengan jadwal ${bus.name}! Rentang tanggal direset.`);
        setValue('startDate', '');
        setValue('endDate', '');
      }
    }
  };

  // Partner selection handler
  const handlePartnerSelect = (partnerId) => {
    const p = partners.find(item => item.id === partnerId);
    if (p) {
      setValue('partnerId', p.id);
      setValue('partnerName', p.name);
      setValue('picName', p.pic);
      setValue('picPhone', p.phone);
    }
  };

  // Destination autocomplete recommendations
  const destinationSuggestions = [
    'Kawah Ijen & TN Baluran, Banyuwangi',
    'Sunrise Bromo & Sukapura, Probolinggo',
    'Jatim Park 3 & Museum Angkut, Batu',
    'Telaga Sarangan & Tawangmangu, Magetan',
    'Denpasar, Kuta & Bedugul, Bali Overland',
    'Pantai Klayar & Pacitan Explorer',
    'Candi Borobudur & Malioboro, D.I. Yogyakarta'
  ];

  const handlePaxChange = (delta) => {
    const current = Number(watchPassengers) || 0;
    const maxCapacity = Number(watchAll.busCapacity) || 33;
    const updated = Math.min(maxCapacity, Math.max(1, current + delta));
    setValue('passengers', updated);
  };

  const onSubmit = async (data) => {
    // Validate dates
    if (!data.startDate) {
      toast.error('Silakan pilih tanggal jadwal keberangkatan bus.');
      return;
    }

    const endDateFinal = data.endDate || data.startDate;

    // Final collision verification check
    const { hasCollision, conflict } = checkRangeCollision(
      data.startDate, 
      endDateFinal, 
      data.busId, 
      bookings
    );

    if (hasCollision) {
      toast.error(`Gagal: Jadwal bertabrakan dengan reservasi ${conflict.partnerName} (${conflict.bookingCode})!`);
      return;
    }

    setIsSubmitting(true);
    const newBookingCode = generateBookingId();

    try {
      const payload = {
        ...data,
        id: newBookingCode,
        bookingCode: newBookingCode,
        endDate: endDateFinal,
        days: data.durationDays,
        status: 'Terkonfirmasi',
        createdAt: new Date().toISOString()
      };

      if (onBookingSubmitted) {
        await onBookingSubmitted(payload);
      }

      setConfirmedBookingCode(newBookingCode);
      setIsConfirmed(true);

      // Trigger celebration confetti
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });

      toast.success(`Tiket Resmi ${newBookingCode} Berhasil Diterbitkan!`, {
        description: `Armada ${data.busName} dijadwalkan untuk ${data.partnerName}`
      });

    } catch (err) {
      toast.error('Gagal menerbitkan reservasi. Silakan periksa koneksi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setIsConfirmed(false);
    setConfirmedBookingCode(null);
    reset({
      busId: initialBus.id,
      busName: initialBus.name,
      plateNumber: initialBus.plateNumber,
      dailyRate: initialBus.dailyRate,
      busCapacity: initialBus.capacity,

      partnerId: initialPartner.id,
      partnerName: initialPartner.name,
      picName: initialPartner.pic,
      picPhone: initialPartner.phone,

      startDate: '',
      endDate: '',
      durationDays: 1,

      destination: '',
      passengers: 30,
      baseCost: 3500000,
      tollFuel: 1000000,
      dealPrice: 4500000,
      notes: ''
    });
    toast.info('Formulir reservasi berhasil direset ke draf kosong.');
  };

  return (
    <div className="space-y-8 py-6 pb-20">
      
      {/* Header Editorial */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cobalt/10 text-cobalt text-xs font-bold uppercase tracking-widest">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Interactive Booking Engine & Ticket Generator</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-obsidian tracking-tight">
          Reservasi Baru & Penerbitan Surat Jalan
        </h1>
        <p className="text-sm sm:text-base text-caption max-w-2xl leading-relaxed">
          Pemesanan armada bus eksekutif dengan deteksi bentrok jadwal real-time, 
          kalkulasi biaya transparan, dan pratinjau tiket taktil termal langsung.
        </p>
      </div>

      {/* Split Layout: 7/12 Form vs 5/12 Ticket Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column (7/12) - Intelligent Booking Form */}
        <div className="lg:col-span-7 bg-surface rounded-3xl border border-slate-200/90 shadow-tactile p-6 sm:p-8 space-y-8">
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-7">
            
            {/* Step 1: Partner Selection */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-cobalt" />
                  <span>1. Biro Perjalanan Rekanan (Mitra Wisata)</span>
                </span>
                <span className="text-[10px] text-caption font-semibold">Wajib Dipilih</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="col-span-1 sm:col-span-2">
                  <select
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-obsidian text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-cobalt focus:border-cobalt transition-all"
                    value={watchAll.partnerId}
                    onChange={(e) => handlePartnerSelect(e.target.value)}
                  >
                    {partners.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} — {p.city} ({p.tier})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Quick Partner PIC details info */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-caption uppercase font-bold block">Penanggung Jawab (PIC):</span>
                    <span className="font-semibold text-obsidian">{watchAll.picName || '-'}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-caption uppercase font-bold block">Kontak Telepon:</span>
                    <span className="font-semibold text-obsidian font-mono">{watchAll.picPhone || '-'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: Bus Fleet Selection */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Bus className="w-3.5 h-3.5 text-cobalt" />
                <span>2. Pilih Unit Armada Bus Pariwisata</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {fleet.map((bus) => {
                  const isSelected = watchBusId === bus.id;
                  return (
                    <div
                      key={bus.id}
                      onClick={() => handleBusSelect(bus)}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'border-cobalt bg-blue-50/50 shadow-sm ring-1 ring-cobalt'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-xs font-bold font-mono text-cobalt">
                            {bus.plateNumber}
                          </div>
                          <div className="font-display font-extrabold text-base text-obsidian mt-0.5">
                            {bus.name}
                          </div>
                          <div className="text-[11px] text-slate-500 line-clamp-1">
                            {bus.bodyType}
                          </div>
                        </div>

                        <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                          isSelected ? 'bg-cobalt border-cobalt text-white' : 'border-slate-300'
                        }`}>
                          {isSelected && <CheckCircle2 className="w-4 h-4" />}
                        </div>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-medium">33 Seat Eksekutif</span>
                        <span className="font-mono font-bold text-obsidian">{formatIDR(bus.dailyRate)}/hari</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Anti-Collision Custom Range Calendar */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-cobalt" />
                  <span>3. Jadwal Tanggal Keberangkatan (Anti-Bentrok Matrix)</span>
                </span>
                <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                  Deteksi Tabrakan Aktif
                </span>
              </label>

              <RangeCalendar
                selectedBusId={watchBusId}
                selectedBusName={watchAll.busName}
                startDate={watchStartDate}
                endDate={watchEndDate}
                bookings={bookings}
                onChangeRange={(start, end) => {
                  setValue('startDate', start);
                  setValue('endDate', end);
                }}
              />
            </div>

            {/* Step 4: Destination with Quick Suggestions */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-cobalt" />
                <span>4. Tujuan Wisata & Rute Perjalanan</span>
              </label>

              <input
                type="text"
                placeholder="Contoh: Kawah Ijen & TN Baluran, Banyuwangi"
                {...register('destination', { required: 'Tujuan wisata harus diisi' })}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-obsidian text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-cobalt focus:border-cobalt transition-all"
              />
              {errors.destination && (
                <p className="text-xs text-alert font-medium">{errors.destination.message}</p>
              )}

              {/* Suggestions Chips */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] font-bold uppercase text-caption mr-1">Rekomendasi Cepat:</span>
                {destinationSuggestions.map((dest, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setValue('destination', dest)}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                  >
                    {dest}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 5: Passenger Counter */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-cobalt" />
                  <span>5. Jumlah Penumpang (Maksimal 33 Kursi)</span>
                </span>
                <span className="text-xs font-mono font-bold text-cobalt">
                  Okupansi {Math.round((watchPassengers / 33) * 100)}%
                </span>
              </label>

              <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handlePaxChange(-1)}
                    className="w-11 h-11 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-obsidian flex items-center justify-center font-bold text-lg active:scale-95 transition-all shadow-sm"
                  >
                    <Minus className="w-4 h-4" />
                  </button>

                  <div className="w-16 text-center font-mono font-extrabold text-2xl text-obsidian tabular-nums">
                    {watchPassengers}
                  </div>

                  <button
                    type="button"
                    onClick={() => handlePaxChange(1)}
                    className="w-11 h-11 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-obsidian flex items-center justify-center font-bold text-lg active:scale-95 transition-all shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-xs text-slate-600 flex-1">
                  <span>Total alokasi kapasitas armada: </span>
                  <strong className="text-obsidian">{watchPassengers} Penumpang</strong>
                  <span className="text-slate-400"> + 1 Tour Leader + 1 Supir.</span>
                  {watchPassengers >= 33 && (
                    <div className="text-amber-700 font-semibold text-[11px] mt-0.5">
                      Kapasitas penuh 100%. Denah kursi terisi seluruhnya.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Step 6: Cost Breakdown Calculator */}
            <div className="space-y-4 p-5 rounded-2xl bg-slate-50 border border-slate-200">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-cobalt" />
                <span>6. Rincian Perhitungan Biaya (Cost Calculator)</span>
              </label>

              <div className="space-y-3 text-xs">
                {/* Daily Base Rate Calculation */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="text-slate-600">
                    Biaya Pokok Sewa ({watchDurationDays} Hari x {formatIDR(watchDailyRate)}):
                  </span>
                  <span className="font-mono font-bold text-obsidian">
                    {formatIDR(watchAll.baseCost)}
                  </span>
                </div>

                {/* Optional Toll & Fuel Estimate */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-slate-600">
                    Taksiran BBM & Tol Operasional (Opsional):
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-mono text-xs">Rp</span>
                    <input
                      type="number"
                      step="100000"
                      {...register('tollFuel', {
                        onChange: (e) => {
                          const toll = Number(e.target.value) || 0;
                          setValue('dealPrice', Number(watchAll.baseCost || 0) + toll);
                        }
                      })}
                      className="w-36 px-3 py-1.5 rounded-lg border border-slate-300 font-mono text-xs font-semibold text-right"
                    />
                  </div>
                </div>

                {/* Negotiated Final Deal Price */}
                <div className="pt-2 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="font-display font-bold text-sm text-obsidian block">
                      Harga Kesepakatan Final (Rp):
                    </span>
                    <span className="text-[10px] text-caption">Dapat disesuaikan jika ada diskon biro rekanan</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-cobalt font-mono font-bold text-sm">Rp</span>
                    <input
                      type="number"
                      step="50000"
                      {...register('dealPrice', { required: true })}
                      className="w-44 px-3 py-2 rounded-xl border-2 border-cobalt font-mono font-extrabold text-base text-cobalt text-right bg-white focus:outline-none focus:ring-2 focus:ring-cobalt/50"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Special Notes textarea */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                Catatan Operasional Khusus (Opsional):
              </label>
              <textarea
                rows={2}
                placeholder="Contoh: Rombongan membawa bagasi sepeda lipat, mohon bagasi belakang dikosongkan..."
                {...register('notes')}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white text-obsidian text-xs font-medium focus:outline-none focus:ring-2 focus:ring-cobalt focus:border-cobalt transition-all"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:flex-1 py-4 px-6 rounded-2xl bg-cobalt hover:bg-cobalt-hover text-white font-bold text-sm uppercase tracking-wider transition-all shadow-lg shadow-cobalt/30 flex items-center justify-center gap-2 disabled:opacity-50 hover:translate-y-[-1px] active:translate-y-[0px]"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Menerbitkan Surat Jalan...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-300" />
                    <span>Konfirmasi & Terbitkan Tiket</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="w-full sm:w-auto py-3.5 px-5 rounded-2xl border border-slate-300 hover:border-obsidian bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset Form</span>
              </button>
            </div>

          </form>

        </div>

        {/* Right Column (5/12) - Sticky Live Tactile Ticket Preview */}
        <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-4">
          <TicketPreview
            formData={{
              ...watchAll,
              startDate: watchStartDate,
              endDate: watchEndDate,
              durationDays: watchDurationDays,
            }}
            isConfirmed={isConfirmed}
            confirmedBookingCode={confirmedBookingCode}
            onPrint={() => window.print()}
          />
        </div>

      </div>

    </div>
  );
}
