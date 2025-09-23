import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'TypeScript Template',
  description: 'A clean TypeScript monorepo template',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}