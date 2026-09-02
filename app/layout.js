import './globals.css';
import Nav from '../components/Nav';
import Footer from '../components/Footer';

export const metadata = { title: 'MAD WORLD — The Personal Entertainment Archive', description: 'A cinematic personal archive of games, anime, shows, characters and unforgettable quotes.' };

export default function RootLayout({ children }) {
  return <html lang="en"><body><Nav />{children}<Footer /></body></html>;
}