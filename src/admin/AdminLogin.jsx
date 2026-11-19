import React, { useState } from 'react';
import { toast } from 'sonner';
import {
  login, acceptInvite, recoverPassword, requestPasswordRecovery, updateUser,
  AuthError, MissingIdentityError
} from '@netlify/identity';
import { Bus, Lock, Mail, ArrowRight, ShieldCheck, Sparkles, KeyRound } from 'lucide-react';

export default function AdminLogin({ callback, onDone }) {
  // callback: { type: 'invite', token } | { type: 'recovery', user }
  const initialView = callback?.type === 'invite' ? 'invite' : callback?.type === 'recovery' ? 'reset' : 'login';
  const [view, setView] = useState(initialView);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const explain = (err) => {
    if (err instanceof MissingIdentityError) return 'Layanan login belum aktif di lingkungan ini.';
    if (err instanceof AuthError) {
      if (err.status === 401 || err.status === 400) return 'Email atau kata sandi salah.';
      if (err.status === 422) return 'Data tidak valid. Kata sandi minimal 8 karakter.';
      return err.message;
    }
    return 'Terjadi kesalahan. Silakan coba lagi.';
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (view === 'login') {
        await login(email.trim(), password);
        toast.success('Selamat datang di Trevel Control Center.');
        await onDone();
      } else if (view === 'invite') {
        await acceptInvite(callback.token, password);
        toast.success('Akun admin berhasil diaktifkan.');
        await onDone();
      } else if (view === 'reset') {
        if (callback?.token) await recoverPassword(callback.token, password);
        else await updateUser({ password });
        toast.success('Kata sandi baru tersimpan.');
        await onDone();
      } else if (view === 'forgot') {
        await requestPasswordRecovery(email.trim());
        toast.success('Tautan reset kata sandi telah dikirim ke email Anda.');
        setView('login');
      }
    } catch (err) {
      setError(explain(err));
    } finally {
      setBusy(false);
    }
  };

  const titles = {
    login: ['Masuk Panel Admin', 'Khusus staf operasional & manajemen PO. Trevel.'],
    forgot: ['Lupa Kata Sandi', 'Masukkan email admin untuk menerima tautan reset.'],
    invite: ['Aktivasi Akun Admin', 'Buat kata sandi untuk menerima undangan Anda.'],
    reset: ['Atur Kata Sandi Baru', 'Masukkan kata sandi baru untuk akun Anda.'],
  };

  const needsEmail = view === 'login' || view === 'forgot';
  const needsPassword = view !== 'forgot';

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Panel kiri: editorial brand */}
      <div className="hidden lg:flex ai-aurora relative overflow-hidden p-12 flex-col justify-between text-white">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] bg-[size:18px_18px]" />
        <a href="/" className="relative flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur">
            <Bus className="w-5 h-5" />
          </div>
          <span className="font-display font-extrabold text-2xl tracking-tight">
            trevel<span className="text-ticket-gold">.</span>ops
          </span>
        </a>

        <div className="relative space-y-6 max-w-md">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[11px] font-bold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 text-ticket-gold" />
            AI-Powered Fleet Control Center
          </div>
          <h1 className="font-display font-extrabold text-5xl leading-[1.05] tracking-tight">
            Kendalikan armada, reservasi & omset dalam satu layar.
          </h1>
          <p className="text-slate-300 text-sm leading-relaxed">
            Konfirmasi permintaan pelanggan, pantau utilisasi Zotopia & Cocomelon, dan dapatkan rekomendasi
            bisnis dari AI Analyst yang membaca data operasional secara langsung.
          </p>
          <div className="grid grid-cols-3 gap-3 pt-4">
            {[['2', 'Unit Armada'], ['33', 'Kursi / Bus'], ['24/7', 'Dispatch']].map(([v, l]) => (
              <div key={l} className="p-3 rounded-2xl bg-white/5 border border-white/10">
                <div className="font-mono font-extrabold text-2xl text-ticket-gold">{v}</div>
                <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">{l}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative flex items-center gap-2 text-[11px] text-slate-400 font-mono">
          <ShieldCheck className="w-3.5 h-3.5" />
          Akses terenkripsi • Sesi diverifikasi server
        </div>
      </div>

      {/* Panel kanan: form */}
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm space-y-8">
          <div className="lg:hidden flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-obsidian flex items-center justify-center text-white">
              <Bus className="w-5 h-5" />
            </div>
            <span className="font-display font-extrabold text-2xl text-obsidian">trevel<span className="text-cobalt">.</span>ops</span>
          </div>

          <div className="space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-cobalt/10 text-cobalt flex items-center justify-center">
              {view === 'login' ? <Lock className="w-5 h-5" /> : <KeyRound className="w-5 h-5" />}
            </div>
            <h2 className="font-display font-extrabold text-3xl text-obsidian tracking-tight">{titles[view][0]}</h2>
            <p className="text-sm text-caption">{titles[view][1]}</p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            {needsEmail && (
              <label className="block space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Email</span>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@trevelwisata.id"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 bg-white text-sm font-semibold text-obsidian focus:outline-none focus:ring-2 focus:ring-cobalt focus:border-cobalt"
                  />
                </div>
              </label>
            )}
            {needsPassword && (
              <label className="block space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 flex justify-between">
                  {view === 'login' ? 'Kata Sandi' : 'Kata Sandi Baru'}
                  {view === 'login' && (
                    <button type="button" onClick={() => { setView('forgot'); setError(''); }} className="normal-case tracking-normal text-cobalt font-semibold hover:underline">
                      Lupa?
                    </button>
                  )}
                </span>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    minLength={view === 'login' ? undefined : 8}
                    autoComplete={view === 'login' ? 'current-password' : 'new-password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 bg-white text-sm font-semibold text-obsidian focus:outline-none focus:ring-2 focus:ring-cobalt focus:border-cobalt"
                  />
                </div>
              </label>
            )}

            {error && (
              <div className="p-3 rounded-xl bg-alert-subtle border border-rose-200 text-xs font-semibold text-alert">{error}</div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full py-3.5 rounded-xl bg-obsidian hover:bg-cobalt text-white text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
            >
              {busy ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{view === 'login' ? 'Masuk' : view === 'forgot' ? 'Kirim Tautan' : 'Simpan & Masuk'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {view === 'forgot' && (
              <button type="button" onClick={() => setView('login')} className="w-full text-xs text-caption hover:text-obsidian font-semibold">
                ← Kembali ke halaman masuk
              </button>
            )}
          </form>

          <p className="text-[11px] text-slate-400 leading-relaxed">
            Akun admin hanya dibuat melalui undangan. Bukan staf?{' '}
            <a href="/" className="text-cobalt font-semibold hover:underline">Kembali ke situs Trevel</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
