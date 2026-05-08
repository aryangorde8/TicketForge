import Head from "next/head";

interface MetaProps {
  title?: string;
  description?: string;
  path?: string;
}

const SITE_URL = "https://ticketforge.aryangorde.com";
const DEFAULT_TITLE = "TicketForge — Turn meetings into tickets in seconds";
const DEFAULT_DESC =
  "Voice → AI extraction → Linear, GitHub, Slack. Confidence-scored action items with source quotes and human review built in.";

export function Meta({ title, description, path = "" }: MetaProps) {
  const fullTitle = title ? `${title} — TicketForge` : DEFAULT_TITLE;
  const desc = description ?? DEFAULT_DESC;
  const url = `${SITE_URL}${path}`;
  const image = `${SITE_URL}/og.png`;

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <meta name="theme-color" content="#5e6ad2" />
      <link rel="canonical" href={url} />

      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="TicketForge" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image" content={image} />
    </Head>
  );
}
