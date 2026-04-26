import './globals.css';
import { Nav } from '@/components/nav';
import { Toaster } from 'sonner';

export const metadata = {
  title: 'LeadLocal | Local services bidding platform',
  description: 'Post anything you need. Get bids from local contractors.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Nav />
        <main className="container-app py-8">{children}</main>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
