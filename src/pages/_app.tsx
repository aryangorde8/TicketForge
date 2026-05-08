import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Script from "next/script";
import { Inter, Instrument_Serif, JetBrains_Mono } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["400"],
  style: ["italic", "normal"],
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
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
        className={`${inter.variable} ${instrumentSerif.variable} ${jetbrains.variable} font-sans antialiased`}
      >
        <div className="grain" aria-hidden />
        <Component {...pageProps} />
      </main>
    </>
  );
}
