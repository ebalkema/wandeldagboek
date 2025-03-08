import './globals.css';
import type { Metadata } from 'next';
import Header from '../components/Header';

export const metadata: Metadata = {
  title: 'Wandeldagboek',
  description: 'Jouw persoonlijke wandellogboek',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nl">
      <body className="bg-gray-100">
        <Header />
        <main className="container mx-auto py-8">
          {children}
        </main>
        <footer className="bg-gray-800 text-white p-4 mt-8">
          <div className="container mx-auto text-center">
            <p>© {new Date().getFullYear()} Wandeldagboek</p>
          </div>
        </footer>
      </body>
    </html>
  );
} 