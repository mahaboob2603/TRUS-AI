import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "../styles/globals.css";
import Shell from "../components/Shell";
import ReactQueryProvider from "../providers/ReactQueryProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TRUS.AI Studio",
  description: "Transparent Responsible Unified System for AI in Banking",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
  },
};

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps): JSX.Element {
  return (
    <html lang="en" className={inter.className}>
      <body>
        <ReactQueryProvider>
          <Shell>{children}</Shell>
        </ReactQueryProvider>
      </body>
    </html>
  );
}

