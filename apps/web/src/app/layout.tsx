import './globals.css';
import type { Metadata } from 'next';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import Navbar from '../components/Navbar';
import BottomNav from '../components/BottomNav';

export const metadata: Metadata = {
  title: 'BrewLite Coffee & Tea - Đặt Đồ Uống Tự Phục Vụ',
  description: 'Hệ thống đặt đồ uống di động PWA thông minh Mobile-first',
  manifest: '/manifest.json',
  themeColor: '#0d9488',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0d9488" />
      </head>
      <body className="bg-slate-100 flex justify-center min-h-screen">
        <AuthProvider>
          <CartProvider>
            {/* Mobile Viewport Container */}
            <div className="w-full max-w-md bg-white min-h-screen flex flex-col shadow-xl relative pb-16">
              <Navbar />
              <main className="flex-1 overflow-x-hidden">{children}</main>
              <BottomNav />
            </div>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
