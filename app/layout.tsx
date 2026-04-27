import './globals.css';
import { Nav } from '@/components/nav';
import { Toaster } from 'sonner';

export const metadata = {
  title: 'LocalTaskHub | Find trusted local help for any job',
  description: 'Post a task, compare offers, and choose the right local professional.'
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
