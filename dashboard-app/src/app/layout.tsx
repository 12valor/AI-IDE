import type { Metadata } from "next";
import './globals.css';

export const metadata: Metadata = {
  title: "Antigravity Sales Dashboard",
  description: "Sales Data Analysis",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-white text-gray-900 font-sans">
        {children}
      </body>
    </html>
  );
}
