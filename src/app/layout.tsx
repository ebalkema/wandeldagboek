import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import StorageInitializer from "../components/StorageInitializer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Wandeldagboek | Menno & Erwin",
  description: "Leg je natuurwaarnemingen vast tijdens het wandelen",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nl">
      <body className={inter.className}>
        {/* Initialiseer localStorage */}
        <StorageInitializer />
        
        <header className="bg-green-800 text-white p-4">
          <div className="container mx-auto">
            <div className="flex justify-between items-center">
              <Link href="/" className="text-2xl font-bold hover:text-green-200">
                Wandeldagboek
              </Link>
              <nav className="hidden md:flex space-x-6">
                <Link href="/natuurfeitjes" className="hover:text-green-200">
                  Natuurfeitjes
                </Link>
                <Link href="/waarneming" className="hover:text-green-200">
                  Nieuwe waarneming
                </Link>
                <Link href="/dashboard" className="hover:text-green-200">
                  Mijn waarnemingen
                </Link>
                <Link href="/podcast" className="hover:text-green-200">
                  Podcast
                </Link>
              </nav>
            </div>
          </div>
        </header>
        
        <main className="container mx-auto p-4 min-h-[calc(100vh-160px)]">
          {children}
        </main>
        
        <footer className="bg-green-800 text-white p-4">
          <div className="container mx-auto">
            <div className="flex flex-col md:flex-row justify-between">
              <div>
                <p>&copy; {new Date().getFullYear()} Menno & Erwin</p>
              </div>
              <div className="mt-4 md:mt-0">
                <p>Ontwikkeld voor het Wandeldagboek Project</p>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
} 