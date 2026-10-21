import type { Metadata } from 'next';
import './globals.css';
import AppShell from '@/components/layout/AppShell';

export const metadata: Metadata = {
  title: 'Dot Advert ERP — Manufacturing & Order Profitability System',
  description:
    'Comprehensive ERP system for advertising, large format printing, and signage manufacturing: Procurement, Stores, Production, Dual Invoicing (15% VAT / Non-VAT), Collections, and Order-Level Profitability.',
  icons: {
    icon: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
