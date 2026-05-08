import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Script from "next/script";
import {
  Fraunces,
  Geist,
  Geist_Mono,
  Instrument_Serif,
} from "next/font/google";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  weight: "variable",
  style: ["normal", "italic"],
  axes: ["opsz", "SOFT"],
});

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500", "600"],
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["400"],
  style: ["italic", "normal"],
});

const themeBootstrap = `
(function(){
  try {
    var saved = localStorage.getItem('forge-theme');
    if (saved === 'dark' || saved === 'light') {
      document.documentElement.dataset.theme = saved;
    } else {
      document.documentElement.dataset.theme = 'light';
    }
  } catch(e){
    document.documentElement.dataset.theme = 'light';
  }
})();
`;

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Script
        id="theme-bootstrap"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: themeBootstrap }}
      />
      <main
        className={`${fraunces.variable} ${geist.variable} ${geistMono.variable} ${instrumentSerif.variable} font-sans antialiased`}
      >
        <div className="grain" aria-hidden />
        <Component {...pageProps} />
      </main>
    </>
  );
}
