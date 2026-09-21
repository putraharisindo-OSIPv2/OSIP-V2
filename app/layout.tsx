import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "OSIP V2", description: "Revenue-first Industrial Intelligence & Procurement Platform" };
export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="en"><body>{children}</body></html>;
}