import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
    <header className="sticky top-4 z-40 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full no-print">
      <div className="bg-surface/90 backdrop-blur-xl border border-slate-200/80 rounded-2xl shadow-lifted px-4 py-2.5 transition-all">
        <div className="flex items-center justify-between gap-3">
          
          {/* Logo & Identity */}
          <div 
            onClick={() => setActiveTab('beranda')}
            className="flex items-center gap-3 cursor-pointer group select-none shrink-0"
          >
            <div className="w-10 h-10 rounded-xl bg-obsidian flex items-center justify-center text-white shadow-subtle group-hover:bg-cobalt transition-colors duration-200">
              <Bus className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-baseline">
                <span className="font-display font-extrabold text-2xl tracking-tight text-obsidian">
                  trevel
                </span>
                <span className="w-2 h-2 rounded-full bg-cobalt ml-0.5 animate-pulse inline-block" />
              </div>
              <p className="text-[10px] font-semibold tracking-wider uppercase text-caption -mt-1 hidden sm:block">
                PO. Trevel Wisata Nusantara
              </p>
            </div>
          </div>

          {/* Desktop Capsule Navigation */}
          <nav className="hidden lg:flex items-center bg-slate-100/90 p-1 rounded-xl border border-slate-200/60 relative">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`relative flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors z-10 ${
                    isActive ? 'text-obsidian' : 'text-slate-600 hover:text-obsidian'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="navbar-pill"
                      className="absolute inset-0 bg-white rounded-lg shadow-sm border border-slate-200/50 -z-10"
                      transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                    />
                  )}
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cobalt' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold uppercase tracking-wider ${
                      isActive 
                        ? 'bg-cobalt/10 text-cobalt' 
                        : 'bg-slate-200 text-slate-600'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Status Bar & Clock */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Live WIB Clock */}
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100/80 border border-slate-200/70 text-obsidian text-xs font-mono font-medium">
              <Clock className="w-3.5 h-3.5 text-cobalt" />
              <span className="tabular-nums tracking-wide">{currentTime || '00:00:00 WIB'}</span>
            </div>

            {/* CTA Pesan */}
            <button
              onClick={() => handleNavClick('reservasi')}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-cobalt hover:bg-cobalt-hover text-white text-xs font-bold transition-all active:scale-95 shadow-sm shadow-cobalt/30"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Pesan Sekarang</span>
            </button>

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-obsidian border border-slate-200"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>

        </div>

        {/* Mobile Dropdown Navigation */}
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="lg:hidden mt-3 pt-3 border-t border-slate-200 grid grid-cols-2 sm:grid-cols-3 gap-1.5"
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-semibold transition-colors ${
                    isActive
                      ? 'bg-cobalt text-white shadow-sm'
                      : 'bg-slate-100/80 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </motion.div>
        )}
      </div>
    </header>
  );
}
