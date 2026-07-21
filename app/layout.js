import './globals.css';
import { Anton, Bebas_Neue, Libre_Baskerville, Inter } from 'next/font/google';

const anton = Anton({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-anton',
});

const bebas = Bebas_Neue({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-bebas',
});

const libre = Libre_Baskerville({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-libre',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata = {
  title: 'Wake Up India',
  description: 'A collaborative newspaper-inspired digital canvas platform.',
  icons: {
    icon: '/logo.png',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${anton.variable} ${bebas.variable} ${libre.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}
