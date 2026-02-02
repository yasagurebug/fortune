import { Suspense } from "react";
import FortuneClient from "./fortune-client";
import {
  generateFortune,
  makeSeed,
  parseVariant,
  sanitizeDate,
  sanitizeUid,
} from "../lib/fortune";

function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
}

function firstParam(value) {
  if (Array.isArray(value)) return value[0];
  return value;
}

export function generateMetadata({ searchParams }) {
  const dateStr = sanitizeDate(firstParam(searchParams?.d));
  const uid = sanitizeUid(firstParam(searchParams?.u));
  const variant = parseVariant(firstParam(searchParams?.v));
  const baseUrl = getBaseUrl();
  const title = "今日のトンチキ占い";
  let description =
    "今日のトンチキ占い。信じたり信じなかったりして今日も生きましょう。";
  const ogUrl = new URL("/og", baseUrl);

  if (dateStr && uid) {
    const seed = makeSeed(uid, dateStr);
    const fortune = generateFortune(seed, variant);
    description = fortune;
    ogUrl.searchParams.set("d", dateStr);
    ogUrl.searchParams.set("u", uid);
    ogUrl.searchParams.set("v", String(variant));
    ogUrl.searchParams.set("t", fortune);
  }

  return {
    metadataBase: new URL(baseUrl),
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: [ogUrl.toString()],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogUrl.toString()],
    },
  };
}

export default function Page() {
  return (
    <main>
      <header className="hero">
        <span className="eyebrow">DAILY STRANGE ORACLE</span>
        <h1>今日の占い</h1>
        <p className="lead">信じたり信じなかったりして今日も生きましょう</p>
      </header>
      <Suspense fallback={<div className="card">読み込み中...</div>}>
        <FortuneClient />
      </Suspense>
      <footer className="footer"></footer>
    </main>
  );
}
