'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const STORAGE_KEY = 'wake-up-india-gallery';

export default function GalleryPage() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]');
    setItems(saved);
  }, []);

  return (
    <main className="min-h-screen bg-[#0E0E0E] px-4 py-6 text-[#F7F2E8] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="rounded-[2rem] border border-[#2C2C2C] bg-[#171717] p-6 shadow-[8px_8px_0_#111111]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="font-['var(--font-bebas)'] text-xl uppercase tracking-[0.3em] text-[#8C6A2E]">Public gallery</p>
              <h1 className="mt-2 font-['var(--font-anton)'] text-3xl uppercase tracking-[0.2em] text-[#F7F2E8] sm:text-4xl">
                Admire the work of others
              </h1>
            </div>
            <Link href="/" className="rounded-full border border-[#111111] bg-[#8B0000] px-5 py-3 text-sm font-semibold text-[#F7F2E8] shadow-[4px_4px_0_#111111] transition hover:-translate-y-1 hover:bg-[#A50000]">
              Back to home
            </Link>
          </div>
        </header>

        {items.length === 0 ? (
          <div className="mt-6 rounded-[2rem] border border-[#2C2C2C] bg-[#171717] p-10 text-center text-[#C9BCA6]">
            No artworks yet. Create the first one from the home studio.
          </div>
        ) : (
          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => (
              <article key={item.id} className="rounded-[1.5rem] border border-[#2C2C2C] bg-[#171717] p-4">
                <div className="overflow-hidden rounded-[1rem] border border-[#2C2C2C] bg-[#FCF8EE] p-2">
                  <img src={item.dataUrl} alt={item.title} className="h-72 w-full rounded-[0.8rem] object-cover" />
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <h2 className="font-['var(--font-anton)'] text-xl uppercase tracking-[0.18em] text-[#F7F2E8]">{item.title}</h2>
                    <p className="mt-1 text-sm text-[#C9BCA6]">by {item.author}</p>
                  </div>
                  <span className="text-sm text-[#8C6A2E]">{item.createdAt}</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
