/**
 * Background: badge + load coin list on browser start
 * 容错 / 稳定性 / 资源优化
 */

const runtime = typeof chrome !== 'undefined' ? chrome : typeof browser !== 'undefined' ? browser : null;
if (!runtime) return;

const COINGECKO_LIST_URL = 'https://api.coingecko.com/api/v3/coins/list?include_platform=false';
const COINGECKO_PRICE_URL = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true';
const BADGE_INTERVAL_MS = 60000;
const COIN_LIST_CACHE_KEY = 'crypto_tracker_coin_list';
const COIN_LIST_CACHE_HOURS = 24;

let badgeTimerId = null;

async function fetchCoinList() {
  try {
    const res = await fetch(COINGECKO_LIST_URL);
    if (!res.ok) return;
    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return;
    }
    const list = (Array.isArray(data) ? data : []).filter((c) => c?.id && c?.symbol && c?.name).slice(0, 5000);
    if (list.length > 0) {
      await runtime.storage.local.set({ [COIN_LIST_CACHE_KEY]: { list, ts: Date.now() } });
    }
  } catch {
    // ignore
  }
}

async function maybeRefreshCoinList() {
  try {
    const r = await runtime.storage.local.get(COIN_LIST_CACHE_KEY);
    const cached = r?.[COIN_LIST_CACHE_KEY];
    const maxAge = COIN_LIST_CACHE_HOURS * 60 * 60 * 1000;
    if (!cached?.list?.length || !cached?.ts || Date.now() - cached.ts > maxAge) {
      await fetchCoinList();
    }
  } catch {
    await fetchCoinList();
  }
}

function formatBadge(price) {
  if (price == null || isNaN(price)) return '';
  const n = Number(price);
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  if (n >= 1) return n.toFixed(1);
  if (n >= 0.01) return n.toFixed(2);
  return n.toFixed(3);
}

async function updateBadge() {
  try {
    const res = await fetch(COINGECKO_PRICE_URL);
    if (!res.ok) return;
    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return;
    }
    const price = data?.bitcoin?.usd;
    const change24h = data?.bitcoin?.usd_24hr_change;
    const textVal = formatBadge(price);
    if (textVal) {
      try {
        const color = change24h != null && !isNaN(change24h)
          ? (Number(change24h) >= 0 ? '#0d9488' : '#dc2626')
          : '#1a1a2e';
        await runtime.action.setBadgeText({ text: textVal });
        await runtime.action.setBadgeBackgroundColor({ color });
      } catch {
        // action API may be unavailable in some contexts
      }
    }
  } catch {
    // ignore
  }
}

function startBadgeUpdates() {
  updateBadge();
  if (badgeTimerId) clearInterval(badgeTimerId);
  badgeTimerId = setInterval(updateBadge, BADGE_INTERVAL_MS);
}

runtime.runtime.onStartup.addListener(() => {
  maybeRefreshCoinList();
  startBadgeUpdates();
});

runtime.runtime.onInstalled.addListener(() => {
  maybeRefreshCoinList();
  startBadgeUpdates();
});

// 每次 SW 启动时都更新 badge（包括从休眠唤醒后）
startBadgeUpdates();
