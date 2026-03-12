import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'חמל כביסות',
  description: 'תיאום כביסות קבוצתי',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <body className="bg-gray-50 text-gray-900 min-h-screen">
        <header className="bg-blue-700 text-white px-4 py-3 text-lg font-bold shadow">
          חמל כביסות
        </header>
        <main className="max-w-lg mx-auto px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
