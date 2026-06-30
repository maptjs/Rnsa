import type { Metadata } from 'next';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: 'RNSA Maroc — Réseau National de Sauvetage Animalier',
  description:
    'Le premier réseau national marocain de sauvetage animalier. Intelligence artificielle, bénévoles en temps réel, cartographie nationale.',
  keywords: ['animaux', 'sauvetage', 'Maroc', 'bénévoles', 'chiens', 'chats', 'RNSA'],
  authors: [{ name: 'RNSA Maroc' }],
  openGraph: {
    title: 'RNSA Maroc',
    description: 'Réseau National de Sauvetage Animalier — Maroc',
    type: 'website',
    locale: 'fr_MA',
  },
  icons: {
    icon: '/icons/favicon.svg',
    apple: '/icons/apple-touch-icon.png',
  },
  themeColor: '#C1121F',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" dir="ltr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Noto+Sans+Arabic:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
