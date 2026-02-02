import data from "../data/fortune_pack_refined.json";

const { DICT, FACTORY_TEMPLATES } = data;

function mulberry32(a) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hash32(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pick(rng, arr) {
  return arr[Math.floor(rng() * arr.length)];
}

function fillTemplate(rng, tpl) {
  return tpl
    .replaceAll("{ADV}", pick(rng, DICT.ADV))
    .replaceAll("{N}", pick(rng, DICT.N))
    .replaceAll("{V_MASU}", pick(rng, DICT.V_MASU))
    .replaceAll("{V_TE}", pick(rng, DICT.V_TE))
    .replaceAll("{M}", pick(rng, DICT.M))
    .replaceAll("{TIME}", pick(rng, DICT.TIME));
}

function formatLuckyItem(item, how) {
  if (!how) return `今日のラッキーアイテムは、${item}。`;
  const trimmed = how.trim();
  if (!trimmed) return `今日のラッキーアイテムは、${item}。`;
  if (trimmed.startsWith("__NO_PAREN__")) {
    return `今日のラッキーアイテムは、${item}。`;
  }
  return `今日のラッキーアイテムは、${item}（${trimmed}）。`;
}

export function generateFortune(seed, variant = 0) {
  const rng = mulberry32((seed ^ (variant * 0x9e3779b9)) >>> 0);
  const zodiac = pick(rng, DICT.ZODIACS);
  const count = 2 + Math.floor(rng() * 4); // 2..5
  let body = "";
  for (let i = 0; i < count; i++) {
    body += fillTemplate(rng, pick(rng, FACTORY_TEMPLATES));
  }
  const item = pick(rng, DICT.ITEM);
  const how = pick(rng, DICT.ITEM_HOW);
  return `${zodiac}のあなたは、${body}${formatLuckyItem(item, how)}`;
}

export function makeSeed(uid, dateStr) {
  return hash32(`${uid}|${dateStr}`);
}

export function getJstDateString(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function sanitizeDate(input) {
  if (!input) return "";
  const trimmed = input.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return "";
  return trimmed;
}

export function sanitizeUid(input) {
  if (!input) return "";
  const trimmed = input.trim().slice(0, 64);
  if (!/^[a-zA-Z0-9-]+$/.test(trimmed)) return "";
  return trimmed;
}

export function parseVariant(input) {
  const n = Number.parseInt(input ?? "0", 10);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.min(n, 999);
}
