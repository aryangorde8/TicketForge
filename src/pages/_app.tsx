import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Inter, JetBrains_Mono } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <main className={`${inter.variable} ${jetbrains.variable} font-sans antialiased`}>
      <Component {...pageProps} />
    </main>
  );
}
