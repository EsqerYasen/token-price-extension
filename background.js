/**
 * Background: badge + load coin list on browser start
 */

const COINGECKO_LIST_URL = 'https://api.coingecko.com/api/v3/coins/list?include_platform=false';
const COINGECKO_PRICE_URL = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd';
const BADGE_INTERVAL_MS = 60000;
const COIN_LIST_CACHE_KEY = 'crypto_tracker_coin_list';
const COIN_LIST_CACHE_HOURS = 24;

async function fetchCoinList() {
  try {
    const res = await fetch(COINGECKO_LIST_URL);
    if (!res.ok) return;
    const data = await res.json();
    const list = (data || []).filter((c) => c?.id && c?.symbol && c?.name).slice(0, 5000);
    await chrome.storage.local.set({
      [COIN_LIST_CACHE_KEY]: { list, ts: Date.now() },
    });
  } catch {
    // ignore
  }
}

async function maybeRefreshCoinList() {
  const r = await chrome.storage.local.get(COIN_LIST_CACHE_KEY);
  const cached = r[COIN_LIST_CACHE_KEY];
  const maxAge = COIN_LIST_CACHE_HOURS * 60 * 60 * 1000;
  if (!cached?.list || !cached?.ts || Date.now() - cached.ts > maxAge) {
    await fetchCoinList();
  }
}

function formatBadge(price) {
  if (price == null || isNaN(price)) return '';
  if (price >= 1000) return `${(price / 1000).toFixed(1)}k`;
  if (price >= 1) return price.toFixed(1);
  if (price >= 0.01) return price.toFixed(2);
  return price.toFixed(3);
}

async function updateBadge() {
  try {
    const res = await fetch(COINGECKO_PRICE_URL);
    if (!res.ok) return;
    const data = await res.json();
    const price = data?.bitcoin?.usd;
    const text = formatBadge(price);
    if (text) {
      chrome.action.setBadgeText({ text });
      chrome.action.setBadgeBackgroundColor({ color: '#1a1a2e' });
    }
  } catch {
    // ignore
  }
}

function startBadgeUpdates() {
  updateBadge();
  setInterval(updateBadge, BADGE_INTERVAL_MS);
}

chrome.runtime.onStartup.addListener(() => {
  maybeRefreshCoinList();
  startBadgeUpdates();
});

chrome.runtime.onInstalled.addListener(() => {
  maybeRefreshCoinList();
  startBadgeUpdates();
});
