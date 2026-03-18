import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import MobileNav from '@/components/layout/MobileNav';
import Sidebar from '@/components/layout/Sidebar';
import FingerprintCollector from '@/components/FingerprintCollector';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SlotSite - 최고의 온라인 슬롯',
  description: '최고의 온라인 슬롯 게임을 즐겨보세요.',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: '#00E701',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${inter.className} antialiased flex flex-col min-h-screen`}>
        <Header />
        <div className="flex flex-1">
          <Sidebar />
          <main className="flex-1 pb-16 md:pb-0 animate-fade-in">{children}</main>
        </div>
        <Footer />
        <MobileNav />
        <FingerprintCollector />
      </body>
    </html>
  );
}
