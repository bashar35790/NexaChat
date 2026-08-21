import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { Providers } from "./providers";
import { ToastProvider } from "@/components/ui/Toast";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "NexaChat — Conversations at the speed of thought",
    template: "%s · NexaChat",
  },
  description:
    "A modern real-time chat application for seamless one-to-one and group conversations, with instant messaging, user search, and a clean responsive interface.",
  applicationName: "NexaChat",
  openGraph: {
    title: "NexaChat",
    description:
      "Real-time one-to-one and group messaging with instant delivery, user search, and groups.",
    siteName: "NexaChat",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0b0d12",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-base text-fg font-sans">
        <Providers>
          <ToastProvider>{children}</ToastProvider>
        </Providers>
      </body>
    </html>
  );
}
