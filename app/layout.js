import './globals.css';

export const metadata = {
  title: 'R&D REPORT ANALYSIS | Book My Venue (BMW) — Data Analyzed by A2C Team',
  description: 'Production-ready R&D Report Analysis System for Book My Venue (BMW). Geographic exploration, district completion analytics, individual venue insights, and automated PDF reporting.',
  icons: {
    icon: [
      { url: '/a2c-logo.png', type: 'image/png' },
      { url: '/a2c-logo.svg', type: 'image/svg+xml' }
    ],
    shortcut: '/a2c-logo.png',
    apple: '/a2c-logo.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 antialiased selection:bg-blue-100 selection:text-blue-900 min-h-screen">
        {children}
      </body>
    </html>
  );
}
