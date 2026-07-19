'use client';

import PaintCanvas from '../components/PaintCanvas';
import Link from 'next/link';
import { Home, Image as ImageIcon } from 'lucide-react';

export default function PaintPage() {
  return (
    <main className="h-screen flex flex-col bg-[#090909] px-4 py-4 text-[#F7F2E8] sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Gritty Noise Overlay */}
      <div 
        className="pointer-events-none fixed inset-0 opacity-20 z-0" 
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
      ></div>

      <div className="mx-auto max-w-7xl w-full flex flex-col flex-1 min-h-0 relative z-10">
        <div className="mb-4 shrink-0 flex flex-col gap-4 rounded-sm border-2 border-[#8B0000] bg-[#050505] p-4 shadow-[4px_4px_0_#8B0000] lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="font-['var(--font-bebas)'] text-xl uppercase tracking-[0.3em] text-[#FF2A2A]">Private Studio</p>
            <h1 className="mt-2 font-['var(--font-anton)'] text-3xl uppercase tracking-[0.2em] text-white sm:text-4xl">
              Create your own mark
            </h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/gallery" className="flex items-center gap-2 rounded-sm border-2 border-[#333] bg-[#111] px-5 py-3 text-sm font-bold uppercase tracking-widest text-white transition hover:bg-[#222]">
              <ImageIcon size={16} /> View gallery
            </Link>
            <Link href="/" className="flex items-center gap-2 rounded-sm border-2 border-black bg-[#FF2A2A] px-5 py-3 text-sm font-black uppercase tracking-widest text-black shadow-[4px_4px_0_#8B0000] transition hover:translate-x-1 hover:translate-y-1 hover:shadow-none">
              <Home size={16} /> Go home
            </Link>
          </div>
        </div>

        <PaintCanvas isCommunityMode={false} />
      </div>
    </main>
  );
}
