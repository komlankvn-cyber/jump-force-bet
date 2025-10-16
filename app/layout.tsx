export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body style={{ maxWidth: 800, margin: '0 auto', padding: 16 }}>
        {children}
      </body>
    </html>
  );
}
