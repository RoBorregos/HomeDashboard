export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Allow rendering admin pages without redirecting by default
  return children;
}
