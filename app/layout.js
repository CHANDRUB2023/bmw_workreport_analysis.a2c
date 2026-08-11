import './globals.css';

export const metadata = {
  title: 'A2C ANALYTICAL DASHBOARD | India & Tamil Nadu District Pincode Analytics',
  description: 'Production-ready All-India postal data classification, geographical exploration, interactive GeoJSON mapping, and ReportLab PDF document export system.',
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
