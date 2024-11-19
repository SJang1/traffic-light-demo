// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

// Initialize Inter font
const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Traffic Light Monitor',
  description: 'Real-time traffic light monitoring system using Cloudflare Pages and D1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
          {/* Header */}
          <header className="bg-white shadow-sm">
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-xl font-semibold text-gray-900">
                  Traffic Monitor
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <a
                  href="https://github.com/yourusername/your-repo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  GitHub
                </a>
              </div>
            </nav>
          </header>

          {/* Main Content */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>

          {/* Footer */}
          <footer className="bg-white border-t border-gray-200 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-center">
              <p className="text-sm text-gray-500">
                © {new Date().getFullYear()} Traffic Monitor. Built with Next.js and Cloudflare.
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}