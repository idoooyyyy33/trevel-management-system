import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import {
  Sparkles, Wand2, Send, Square, Copy, RotateCcw, Bot, User, Brain, TrendingUp, CalendarSearch, BadgePercent, Handshake, Printer
} from 'lucide-react';
import { streamAiAnalysis } from '../api';
import { formatIDR, printElement } from '../utils';
import Markdown from './Markdown';

const REPORT_CACHE_KEY = 'trevel_ai_last_report_v1';

const SUGGESTIONS = [
  { icon: CalendarSearch, text: 'Tanggal mana saja yang masih kosong untuk tiap bus dalam 60 hari ke depan, dan bagaimana cara mengisinya?' },
  { icon: BadgePercent, text: 'Apakah harga sewa kita sudah optimal? Beri rekomendasi harga musim ramai vs sepi.' },
  { icon: Handshake, text: 'Mitra mana yang paling bernilai dan mitra mana yang perlu diaktifkan kembali?' },
  { icon: TrendingUp, text: 'Buat proyeksi omset bulan depan berdasarkan data saat ini.' },
  { icon: Brain, text: 'Reservasi mana yang berisiko secara operasional dan apa mitigasinya?' },
];

export default function AiAnalyst({ bookings = [] }) {
  const [report, setReport] = useState(() => {
    try { return JSON.parse(localStorage.getItem(REPORT_CACHE_KEY)) || null; } catch { return null; }
  });
  const [reportStreaming, setReportStreaming] = useState(false);
  const [messages, setMessages] = useState([]);
  const [chatStreaming, setChatStreaming] = useState(false);
  const [input, setInput] = useState('');
  const reportAbort = useRef(null);
  const chatAbort = useRef(null);
  const chatEndRef = useRef(null);
  const reportRef = useRef(null);

  useEffect(() => () => { reportAbort.current?.abort(); chatAbort.current?.abort(); }, []);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }, [messages]);

  const snapshot = useMemo(() => {
    const active = bookings.filter((b) => b.status !== 'Dibatalkan');
    return {
      total: bookings.length,
      pending: bookings.filter((b) => b.status === 'Menunggu Konfirmasi').length,
      revenue: active.reduce((a, b) => a + Number(b.dealPrice || 0), 0),
      partners: new Set(active.map((b) => b.partnerName)).size,
    };
  }, [bookings]);

  const runReport = async () => {
    reportAbort.current?.abort();
    const controller = new AbortController();
    reportAbort.current = controller;
    setReportStreaming(true);
    setReport({ text: '', createdAt: new Date().toISOString() });
    try {
      const text = await streamAiAnalysis({ mode: 'insight' }, (t) => setReport((r) => ({ ...r, text: t })), controller.signal);
      const final = { text, createdAt: new Date().toISOString() };
      setReport(final);
      localStorage.setItem(REPORT_CACHE_KEY, JSON.stringify(final));
    } catch (err) {
      if (err.name !== 'AbortError') toast.error(err.message);
    } finally {
      setReportStreaming(false);
    }
  };

  const ask = async (question) => {
    const q = question.trim();
    if (!q || chatStreaming) return;
    const history = [...messages, { role: 'user', content: q }];
    setMessages([...history, { role: 'assistant', content: '' }]);
    setInput('');
    const controller = new AbortController();
    chatAbort.current = controller;
    setChatStreaming(true);
    try {
      await streamAiAnalysis({ mode: 'chat', messages: history }, (t) => {
        setMessages((m) => {
          const copy = [...m];
          copy[copy.length - 1] = { role: 'assistant', content: t };
          return copy;
        });
      }, controller.signal);
    } catch (err) {
      if (err.name !== 'AbortError') {
        toast.error(err.message);
        setMessages((m) => m.slice(0, -1));
      }
    } finally {
      setChatStreaming(false);
    }
  };

  const copyReport = async () => {
    try {
      await navigator.clipboard.writeText(report?.text || '');
      toast.success('Laporan disalin ke clipboard.');
    } catch {
      toast.error('Gagal menyalin laporan.');
    }
  };

  return (
    <div className="py-8 space-y-6">
      {/* Hero */}
      <section className="ai-aurora rounded-3xl text-white p-6 sm:p-8 relative overflow-hidden shadow-lifted">
        <div className="absolute inset-0 opacity-[0.08] bg-[radial-gradient(#ffffff_1px,transparent_1px)] bg-[size:16px_16px]" />
        <div className="relative flex flex-col lg:flex-row lg:items-center gap-6">
          <div className="flex-1 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[10px] font-bold uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5 text-ticket-gold" /> Trevel AI Analyst
            </div>
            <h1 className="font-display font-extrabold text-3xl sm:text-4xl tracking-tight leading-tight">
              Analis bisnis yang membaca seluruh data operasional Anda.
            </h1>
            <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
              AI menganalisis reservasi, utilisasi armada, harga, dan mitra secara langsung dari database —
              lalu memberi ringkasan eksekutif dan aksi prioritas yang konkret.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 lg:w-80 shrink-0">
            {[
              ['Reservasi dibaca', snapshot.total],
              ['Menunggu keputusan', snapshot.pending],
              ['Nilai aktif', formatIDR(snapshot.revenue)],
              ['Mitra aktif', snapshot.partners],
            ].map(([l, v]) => (
              <div key={l} className="p-3 rounded-2xl bg-white/5 border border-white/10">
                <div className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">{l}</div>
                <div className="font-mono font-extrabold text-sm sm:text-base text-white truncate">{v}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Laporan */}
        <section ref={reportRef} className="xl:col-span-7 bg-surface rounded-3xl border border-slate-200/90 shadow-tactile overflow-hidden">
          <header className="px-6 py-4 border-b border-slate-100 flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-0">
              <h2 className="font-display font-extrabold text-lg text-obsidian flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-cobalt" /> Laporan Analisis Eksekutif
              </h2>
              <p className="text-[11px] text-caption">
                {report?.createdAt && !reportStreaming
                  ? `Dibuat ${format(new Date(report.createdAt), "d MMMM yyyy, HH:mm", { locale: id })} WIB`
                  : 'Ringkasan, utilisasi, risiko, harga, dan 5 aksi prioritas'}
              </p>
            </div>
            <div className="flex items-center gap-2 no-print">
              {report?.text && !reportStreaming && (
                <>
                  <button onClick={copyReport} title="Salin" className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50"><Copy className="w-3.5 h-3.5" /></button>
                  <button onClick={() => printElement(reportRef.current)} title="Cetak" className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50"><Printer className="w-3.5 h-3.5" /></button>
                </>
              )}
              {reportStreaming ? (
                <button onClick={() => reportAbort.current?.abort()} className="px-3 py-2 rounded-xl bg-slate-100 text-xs font-bold flex items-center gap-1.5">
                  <Square className="w-3.5 h-3.5" /> Hentikan
                </button>
              ) : (
                <button onClick={runReport} className="px-4 py-2 rounded-xl bg-cobalt hover:bg-cobalt-hover text-white text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-cobalt/30">
                  {report?.text ? <RotateCcw className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
                  {report?.text ? 'Analisis Ulang' : 'Jalankan Analisis'}
                </button>
              )}
            </div>
          </header>

          <div className="p-6 min-h-[360px]">
            {!report?.text && !reportStreaming && (
              <div className="h-full py-12 flex flex-col items-center justify-center text-center gap-4">
                <div className="w-16 h-16 rounded-3xl ai-aurora flex items-center justify-center shadow-lifted">
                  <Sparkles className="w-7 h-7 text-ticket-gold" />
                </div>
                <div className="space-y-1">
                  <div className="font-display font-extrabold text-xl text-obsidian">Belum ada laporan</div>
                  <p className="text-xs text-caption max-w-sm">
                    Klik "Jalankan Analisis" untuk menghasilkan laporan eksekutif dari {snapshot.total} reservasi di database.
                  </p>
                </div>
              </div>
            )}
            {reportStreaming && !report?.text && <ThinkingSkeleton />}
            {report?.text && (
              <div className={reportStreaming ? 'ai-caret-wrap' : ''}>
                <Markdown text={report.text} />
                {reportStreaming && <span className="ai-caret" />}
              </div>
            )}
          </div>
        </section>

        {/* Chat */}
        <section className="xl:col-span-5 bg-surface rounded-3xl border border-slate-200/90 shadow-tactile flex flex-col h-[680px] xl:sticky xl:top-24 overflow-hidden no-print">
          <header className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl ai-aurora flex items-center justify-center"><Bot className="w-4 h-4 text-ticket-gold" /></div>
            <div className="flex-1">
              <h2 className="font-display font-extrabold text-base text-obsidian leading-tight">Tanya AI</h2>
              <p className="text-[10px] text-caption">Pertanyaan bebas seputar bisnis & operasional</p>
            </div>
            {messages.length > 0 && !chatStreaming && (
              <button onClick={() => setMessages([])} className="text-[11px] font-bold text-caption hover:text-obsidian">Bersihkan</button>
            )}
          </header>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
            {messages.length === 0 && (
              <div className="space-y-2">
                <div className="text-[10px] uppercase font-bold tracking-wider text-caption px-1">Coba tanyakan</div>
                {SUGGESTIONS.map(({ icon: Icon, text }) => (
                  <button
                    key={text}
                    onClick={() => ask(text)}
                    className="w-full text-left p-3 rounded-2xl bg-white border border-slate-200 hover:border-cobalt hover:shadow-sm transition-all flex gap-3 text-xs font-medium text-slate-700"
                  >
                    <Icon className="w-4 h-4 text-cobalt shrink-0 mt-0.5" />
                    {text}
                  </button>
                ))}
              </div>
            )}
            <AnimatePresence initial={false}>
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-2.5 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center ${m.role === 'user' ? 'bg-obsidian text-white' : 'ai-aurora text-ticket-gold'}`}>
                    {m.role === 'user' ? <User className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
                  </div>
                  <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 ${
                    m.role === 'user' ? 'bg-cobalt text-white text-xs font-medium' : 'bg-white border border-slate-200'
                  }`}>
                    {m.role === 'user' ? m.content : m.content ? (
                      <>
                        <Markdown text={m.content} className="!text-xs" />
                        {chatStreaming && i === messages.length - 1 && <span className="ai-caret" />}
                      </>
                    ) : (
                      <div className="flex gap-1 py-1.5">
                        {[0, 1, 2].map((d) => (
                          <span key={d} className="w-1.5 h-1.5 rounded-full bg-cobalt animate-bounce" style={{ animationDelay: `${d * 120}ms` }} />
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={chatEndRef} />
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); ask(input); }}
            className="p-3 border-t border-slate-100 flex items-end gap-2"
          >
            <textarea
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); ask(input); } }}
              placeholder="Tanyakan apa saja tentang data Trevel..."
              className="flex-1 resize-none max-h-32 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-cobalt"
            />
            {chatStreaming ? (
              <button type="button" onClick={() => chatAbort.current?.abort()} className="w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center">
                <Square className="w-4 h-4" />
              </button>
            ) : (
              <button type="submit" disabled={!input.trim()} className="w-10 h-10 rounded-xl bg-cobalt hover:bg-cobalt-hover text-white flex items-center justify-center disabled:opacity-40">
                <Send className="w-4 h-4" />
              </button>
            )}
          </form>
        </section>
      </div>
    </div>
  );
}

function ThinkingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-xs font-semibold text-cobalt">
        <Brain className="w-4 h-4 animate-pulse" /> AI sedang membaca data reservasi & armada...
      </div>
      {[90, 75, 82, 60, 70].map((w, i) => (
        <div key={i} className="h-3 rounded-full bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100 animate-pulse" style={{ width: `${w}%` }} />
      ))}
    </div>
  );
}
