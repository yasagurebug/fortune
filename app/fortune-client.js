"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  generateFortune,
  getJstDateString,
  makeSeed,
  parseVariant,
  sanitizeDate,
  sanitizeUid,
} from "../lib/fortune";

const UID_KEY = "tonchiki_uid";
const VARIANT_KEY = "tonchiki_variant";
const VARIANT_DATE_KEY = "tonchiki_variant_date";
const SHARE_HASHTAG = "#トンチキ占い";
const SHARE_SITE_URL = "https://fortune-roan-two.vercel.app";

function getOrCreateUid() {
  if (typeof window === "undefined") return "";
  const stored = localStorage.getItem(UID_KEY);
  const safeStored = sanitizeUid(stored);
  if (safeStored) return safeStored;

  const fallback = `${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;
  const generated =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : fallback;
  localStorage.setItem(UID_KEY, generated);
  return generated;
}

function buildSharedQuery(dateStr, uid, variant) {
  const params = new URLSearchParams();
  params.set("d", dateStr);
  params.set("u", uid);
  params.set("v", String(variant));
  return `/?${params.toString()}`;
}

function getStoredVariant(dateStr) {
  if (typeof window === "undefined") return 0;
  const storedDate = localStorage.getItem(VARIANT_DATE_KEY);
  if (storedDate !== dateStr) return 0;
  return parseVariant(localStorage.getItem(VARIANT_KEY));
}

function storeVariant(dateStr, variant) {
  if (typeof window === "undefined") return;
  localStorage.setItem(VARIANT_DATE_KEY, dateStr);
  localStorage.setItem(VARIANT_KEY, String(variant));
}

export default function FortuneClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [uid, setUid] = useState("");
  const [dateStr, setDateStr] = useState("");
  const [variant, setVariant] = useState(0);
  const [shared, setShared] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const d = sanitizeDate(searchParams?.get("d"));
    const u = sanitizeUid(searchParams?.get("u"));
    const v = parseVariant(searchParams?.get("v"));

    if (d && u) {
      setUid(u);
      setDateStr(d);
      setVariant(v);
      setShared(true);
      return;
    }

    const localUid = getOrCreateUid();
    const currentDate = getJstDateString();
    const storedVariant = getStoredVariant(currentDate);
    setUid(localUid);
    setDateStr(currentDate);
    setVariant(storedVariant);
    storeVariant(currentDate, storedVariant);
    setShared(false);
  }, [searchParams]);

  useEffect(() => {
    if (!status) return undefined;
    const timer = window.setTimeout(() => setStatus(""), 2200);
    return () => window.clearTimeout(timer);
  }, [status]);

  const seed = useMemo(() => {
    if (!uid || !dateStr) return null;
    return makeSeed(uid, dateStr);
  }, [uid, dateStr]);

  const fortune = useMemo(() => {
    if (!seed) return "";
    return generateFortune(seed, variant);
  }, [seed, variant]);

  const shareUrl = useMemo(() => {
    if (!uid || !dateStr) return "";
    return `${SHARE_SITE_URL}${buildSharedQuery(dateStr, uid, variant)}`;
  }, [uid, dateStr, variant]);

  const shareText = fortune
    ? `今日の占い ${SHARE_HASHTAG}\n${SHARE_SITE_URL}\n${shareUrl}`
    : "";

  const handleRegen = () => {
    setVariant((current) => {
      const next = current + 1;
      if (shared && uid && dateStr) {
        router.replace(buildSharedQuery(dateStr, uid, next), {
          scroll: false,
        });
      } else if (dateStr) {
        storeVariant(dateStr, next);
      }
      return next;
    });
  };

  const handleCopy = async () => {
    if (!fortune) return;
    try {
      await navigator.clipboard.writeText(fortune);
      setStatus("コピーしました");
    } catch {
      setStatus("コピーに失敗しました");
    }
  };

  const handleShare = () => {
    if (!shareUrl || !shareText) return;
    const intent =
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        shareText
      )}&url=${encodeURIComponent(shareUrl)}`;
    window.open(intent, "_blank", "noopener,noreferrer");
  };

  return (
    <section className="card">
      <div className="fortune">
        {fortune || "占いの結果を呼び出しています..."}
      </div>
      <div className="actions">
        <button className="primary" onClick={handleShare} disabled={!fortune}>
          Xでシェア
        </button>
        <button onClick={handleRegen}>別のがいい</button>
      </div>
    </section>
  );
}
