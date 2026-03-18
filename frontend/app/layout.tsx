import type { Metadata, Viewport } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import MobileNav from '@/components/layout/MobileNav';
import Sidebar from '@/components/layout/Sidebar';
import FingerprintCollector from '@/components/FingerprintCollector';

const poppins = Poppins({ subsets: ['latin'], weight: ['100', '200', '300', '400', '500'] });

export const metadata: Metadata = {
  title: 'DR.SLOT - 최고의 온라인 슬롯',
  description: '최고의 온라인 슬롯 게임을 즐겨보세요.',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: '#0A0A0A',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css" />
      </head>
      <body className={`${poppins.className} antialiased flex flex-col min-h-screen`}>
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
