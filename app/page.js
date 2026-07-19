'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Flame } from 'lucide-react';

const features = [
  {
    title: 'Expose',
    copy: 'Bring the truth to light. Every stroke is a visible public record of dissent against corruption.RIOT',
    image: '/images/Modi.png',
    side: 'left',
  },
  {
    title: 'Resist',
    copy: 'A shared civic memory of defiance. Public participation fuels the power of collective expression.',
    image: '/images/Nirmala.png',
    side: 'right',
  },
  {
    title: 'Reclaim',
    copy: 'This is not just art; it is a public archive of urgency, anger, and active participation.',
    image: '/images/Nitin.png',
    side: 'left',
  },
];

const quotes = [
  "Power tends to corrupt, and absolute power corrupts absolutely.",
  "The duty of youth is to challenge corruption.",
  "There is no compromise when it comes to corruption.",
  "A lack of transparency results in distrust and a deep sense of insecurity.",
  "Corruption is a cancer that steals from the poor, eats away at governance and moral fiber.",
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#090909] text-[#F7F2E8] relative overflow-hidden">
      {/* Gritty Noise Overlay */}
      <div 
        className="pointer-events-none fixed inset-0 opacity-20 z-50" 
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
      ></div>

      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-4 sm:px-6 lg:px-8 relative z-10">
        <header className="sticky top-4 z-40 rounded-sm border-2 border-[#8B0000] bg-[#050505] px-4 py-3 shadow-[4px_4px_0_#8B0000] md:px-6">
          <div className="flex items-center justify-between gap-4">
            <Link href="/" className="text-xl font-black uppercase tracking-[0.3em] text-[#FF2A2A] flex items-center gap-2">
              <img src="/logo.png" alt="Wake Up India Logo" className="h-8 w-auto" />
              WAKE UP INDIA
            </Link>
            <nav className="flex items-center gap-4 text-sm font-bold uppercase tracking-wider text-[#A0A0A0] sm:gap-5">
              <Link href="/paint" className="transition hover:text-[#FF2A2A]">
                Start
              </Link>
              <a href="#community" className="transition hover:text-[#FF2A2A]">
                Community
              </a>
              <Link href="/gallery" className="transition hover:text-[#FF2A2A]">
                Gallery
              </Link>
            </nav>
          </div>
        </header>

        {/* Quotes Marquee */}
        <div className="mt-8 overflow-hidden whitespace-nowrap bg-[#8B0000] py-2 border-y-2 border-[#FF2A2A] transform -rotate-1">
          <motion.div
            className="inline-block whitespace-nowrap font-['var(--font-anton)'] text-xl uppercase tracking-widest text-black"
            animate={{ x: [0, -1035] }}
            transition={{ ease: "linear", duration: 15, repeat: Infinity }}
          >
            {quotes.concat(quotes).map((quote, idx) => (
              <span key={idx} className="mx-8 inline-block">
                • {quote}
              </span>
            ))}
          </motion.div>
        </div>

        <section id="home" className="relative mt-8 overflow-hidden rounded-sm border-4 border-[#1A1A1A] bg-[#111111] px-6 py-12 shadow-[12px_12px_0_#FF2A2A] sm:px-8 lg:px-12 lg:py-16 transform rotate-1">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,42,42,0.15),transparent_40%)]" />
          <div className="absolute -bottom-10 -right-10 h-64 w-64 bg-[#8B0000] opacity-30 blur-[100px]" />
          
          <div className="relative grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="flex items-center gap-6 mb-6">
                <img src="/logo.png" alt="Logo" className="w-20 h-20 object-contain drop-shadow-[0_0_10px_rgba(255,42,42,0.5)] transform -rotate-6" />
                <div className="inline-block bg-[#FF2A2A] text-black px-3 py-1 font-bold uppercase tracking-widest text-sm transform -rotate-2">
                  Join The Movement
                </div>
              </div>
              <h1 className="font-['var(--font-anton)'] text-6xl uppercase leading-[0.9] tracking-[0.1em] text-white sm:text-7xl lg:text-8xl drop-shadow-[0_0_15px_rgba(255,42,42,0.5)]">
                Wake Up <span className="text-[#FF2A2A]">India</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg font-medium leading-8 text-[#D0D0D0] sm:text-xl border-l-4 border-[#FF2A2A] pl-4">
               Enough is enough. Add your stroke to the picture. Leave your mark against the corrupt.
              </p>
              <div className="mt-10 flex flex-wrap gap-4">
                <Link href="/community" className="inline-flex items-center gap-2 rounded-sm border-2 border-black bg-[#FF2A2A] px-8 py-4 font-black uppercase text-black shadow-[6px_6px_0_#8B0000] transition hover:translate-x-1 hover:translate-y-1 hover:shadow-none">
                  Community Paint
                  <ArrowRight size={20} strokeWidth={3} />
                </Link>
                <Link href="/paint" className="inline-flex items-center gap-2 rounded-sm border-2 border-[#FF2A2A] bg-black px-8 py-4 font-black uppercase text-[#FF2A2A] shadow-[6px_6px_0_#FF2A2A] transition hover:translate-x-1 hover:translate-y-1 hover:shadow-none">
                  Private Studio
                </Link>
                <Link href="/gallery" className="rounded-sm border-2 border-[#444] bg-transparent px-8 py-4 font-black uppercase text-white transition hover:bg-[#222]">
                  See Gallery
                </Link>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7 }} className="flex items-center justify-center relative">
              <div className="absolute inset-0 bg-[#FF2A2A] blur-3xl opacity-20 rounded-full"></div>
              <img
                src="/images/Dharmendra.png"
                alt="Wake Up India artwork"
                className="relative z-10 max-h-[460px] w-full max-w-[400px] grayscale contrast-125 sepia-[.2] hover:grayscale-0 transition-all duration-500"
              />
              <div className="absolute -right-4 -bottom-4 bg-black border border-[#FF2A2A] p-2 rotate-6 z-20 shadow-lg">
                <p className="font-mono text-xs text-[#FF2A2A]">Target Identified</p>
              </div>
            </motion.div>
          </div>
        </section>

        <section id="community" className="mt-12 rounded-sm border-2 border-[#2C2C2C] bg-[#0A0A0A] p-8 shadow-[8px_8px_0_#111] sm:p-10 lg:p-12">
          <div className="max-w-2xl">
            <p className="font-['var(--font-bebas)'] text-2xl uppercase tracking-[0.2em] text-[#FF2A2A]">Community Action</p>
            <h2 className="mt-2 font-['var(--font-anton)'] text-4xl uppercase tracking-[0.1em] text-white sm:text-5xl">
              We strike back together
            </h2>
          </div>

          <div className="mt-10 grid gap-8 lg:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="group relative overflow-hidden rounded-sm border-2 border-[#333] bg-[#111] p-6 hover:border-[#FF2A2A] transition-colors"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-[#FF2A2A] transform scale-y-0 origin-top transition-transform group-hover:scale-y-100" />
                <div className="flex min-h-[220px] items-center justify-center bg-black border border-[#222] p-4 mb-6">
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className="transparent-image h-auto w-full max-w-[180px] grayscale group-hover:grayscale-0 transition-all"
                  />
                </div>
                <div>
                  <h3 className="font-['var(--font-anton)'] text-3xl uppercase tracking-[0.1em] text-white">
                    {feature.title}
                  </h3>
                  <p className="mt-3 text-sm font-medium leading-relaxed text-[#999]">{feature.copy}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        <footer className="mt-12 mb-8 border-t-4 border-[#FF2A2A] bg-black py-8 text-center text-sm font-bold uppercase tracking-widest text-[#666]">
          <p className="mb-4 text-[#FF2A2A]">Wake Up India © 2026</p>
          <div className="flex justify-center gap-6">
            <Link href="/paint" className="hover:text-white transition">Start</Link>
            <Link href="/gallery" className="hover:text-white transition">Gallery</Link>
          </div>
        </footer>
      </div>
    </main>
  );
}

