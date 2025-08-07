
// Using a standard system monospace font stack
import type { Metadata } from "next";

import SessionProvider from "./SessionProvider";
import "./globals.css";




export const metadata: Metadata = {
  title: "Job Search Dashboard",
  description: "Manage your job search configurations and view results from n8n automation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className="antialiased"
        style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' }}
      >
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
