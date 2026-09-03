import './globals.css';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import FunFact from '../components/FunFact';

export const metadata = {
  title: 'MAD WORLD — The Personal Entertainment Archive',
  description: 'A cinematic personal archive of games, anime, shows, characters and unforgettable quotes — with live trending data, news and award history.',
  metadataBase: process.env.NEXT_PUBLIC_BASE_URL ? new URL(process.env.NEXT_PUBLIC_BASE_URL) : undefined,
  openGraph: { title: 'MAD WORLD', description: 'Private archive. Public obsession.', type: 'website' },
};
export const viewport = { themeColor: '#0a0713', width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Nav />
        {children}
        <Footer />
        <FunFact />
      </body>
    </html>
  );
}
