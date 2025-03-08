import './globals.css';
import type { Metadata } from 'next';

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
        <header className="bg-green-600 text-white p-4 shadow-md">
          <div className="container mx-auto">
            <h1 className="text-2xl font-bold">Wandeldagboek</h1>
          </div>
        </header>
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