import SessionWrapper from "./session-wrapper";

export const dynamic = "force-dynamic";

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <SessionWrapper>{children}</SessionWrapper>;
}
