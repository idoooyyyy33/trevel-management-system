import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bus, 
  Calendar, 
  Ticket, 
  BarChart3, 
  Home, 
  Clock, 
  RefreshCw, 
  ShieldCheck,
  Sparkles,
  Menu,
  X
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab }) {
  const [currentTime, setCurrentTime] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Compact the bar slightly once the page is scrolled
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Clock WIB (UTC+7)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Format WIB
      const timeStr = now.toLocaleTimeString('id-ID', {
        timeZone: 'Asia/Jakarta',
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      setCurrentTime(timeStr + ' WIB');
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { id: 'beranda', label: 'Beranda', icon: Home, badge: null },
    { id: 'katalog', label: 'Katalog Bus', icon: Bus, badge: '2 Unit' },
    { id: 'reservasi', label: 'Cek Jadwal & Pesan', icon: Ticket, badge: 'Live' },
  ];

  const handleNavClick = (id) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
  };

  return (
    <header
      className={`sticky z-40 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full no-print transition-all duration-300 ${
        scrolled ? 'top-2' : 'top-4'
      }`}
    >
      <div className="relative rounded-2xl p-[1px] bg-gradient-to-r from-cobalt/40 via-white to-terminal/40 shadow-lifted">
        <div
          className={`relative overflow-hidden rounded-[15px] bg-white/80 backdrop-blur-xl px-3 sm:px-4 transition-all duration-300 ${
            scrolled ? 'py-2' : 'py-2.5'
          }`}
        >
          {/* Soft glows inside the bar */}
          <div className="pointer-events-none absolute -left-10 -top-10 w-40 h-24 rounded-full bg-cobalt-glow/20 blur-2xl" />
          <div className="pointer-events-none absolute -right-10 -bottom-10 w-40 h-24 rounded-full bg-terminal-light/20 blur-2xl" />

          <div className="relative flex items-center justify-between gap-3">
            {/* Logo & Identity */}
            <button
              type="button"
              onClick={() => handleNavClick('beranda')}
              className="flex items-center gap-3 group select-none shrink-0 text-left"
            >
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-cobalt via-cobalt-light to-terminal flex items-center justify-center text-white shadow-md shadow-cobalt/30 transition-transform duration-300 group-hover:rotate-[-6deg] group-hover:scale-105">
                <Bus className="w-5 h-5" />
                <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                </span>
              </div>
              <div>
                <div className="flex items-baseline font-display font-extrabold text-2xl tracking-tight text-obsidian leading-none">
                  trevel
                  <span className="bg-gradient-to-r from-cobalt to-terminal bg-clip-text text-transparent">.</span>
                </div>
                <p className="text-[10px] font-semibold tracking-[0.14em] uppercase text-caption mt-0.5 hidden sm:block">
                  PO. Trevel Wisata Nusantara
                </p>
              </div>
            </button>

            {/* Desktop Capsule Navigation */}
            <nav className="hidden lg:flex items-center gap-0.5 bg-slate-100/70 p-1 rounded-xl border border-slate-200/60">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`relative flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors z-10 ${
                      isActive ? 'text-white' : 'text-slate-600 hover:text-obsidian hover:bg-white/70'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="navbar-pill"
                        className="absolute inset-0 rounded-lg bg-gradient-to-r from-cobalt to-cobalt-light shadow-md shadow-cobalt/30 -z-10"
                        transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                      />
                    )}
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                    <span>{item.label}</span>
                    {item.badge && (
                      <span
                        className={`flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                          isActive ? 'bg-white/20 text-white' : 'bg-white text-slate-600 border border-slate-200'
                        }`}
                      >
                        {item.badge === 'Live' && (
                          <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${isActive ? 'bg-white' : 'bg-emerald-500'}`} />
                        )}
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Right Status Bar & Clock */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Live WIB Clock */}
              <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg bg-white/80 border border-slate-200/80 text-obsidian text-xs font-mono font-medium shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                <Clock className="w-3.5 h-3.5 text-cobalt" />
                <span className="tabular-nums tracking-wide">{currentTime || '00:00:00 WIB'}</span>
              </div>

              {/* CTA Pesan */}
              <button
                onClick={() => handleNavClick('reservasi')}
                className="group hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-cobalt to-terminal text-white text-xs font-bold transition-all hover:shadow-lg hover:shadow-cobalt/30 hover:-translate-y-px active:scale-95 shadow-md shadow-cobalt/20"
              >
                <Sparkles className="w-3.5 h-3.5 transition-transform duration-300 group-hover:rotate-12" />
                <span>Pesan Sekarang</span>
              </button>

              {/* Mobile Menu Toggle Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label={mobileMenuOpen ? 'Tutup menu' : 'Buka menu'}
                className="lg:hidden p-2 rounded-lg bg-white/80 hover:bg-white text-obsidian border border-slate-200 shadow-sm"
              >
                {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Mobile Dropdown Navigation */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="lg:hidden relative overflow-hidden"
              >
                <div className="mt-3 pt-3 border-t border-slate-200/80 grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNavClick(item.id)}
                        className={`flex items-center gap-2 p-3 rounded-xl text-xs font-semibold transition-colors ${
                          isActive
                            ? 'bg-gradient-to-r from-cobalt to-cobalt-light text-white shadow-md shadow-cobalt/20'
                            : 'bg-white/70 border border-slate-200/70 text-slate-700 hover:bg-white'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                  <button
                    onClick={() => handleNavClick('reservasi')}
                    className="sm:hidden flex items-center justify-center gap-2 p-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cobalt to-terminal shadow-md shadow-cobalt/20"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Pesan Sekarang</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
