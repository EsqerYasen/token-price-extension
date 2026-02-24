/**
 * 后台 Service Worker：扩展图标未打开时显示比特币价格
 */

const COINGECKO_URL = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd';
const BADGE_INTERVAL_MS = 60000; // 60 秒，避免 429

let badgeTimerId = null;

function formatBadge(price) {
  if (price == null || isNaN(price)) return '';
  if (price >= 1000) return `${(price / 1000).toFixed(1)}k`;
  if (price >= 1) return price.toFixed(1);
  if (price >= 0.01) return price.toFixed(2);
  return price.toFixed(3);
}

async function updateBadge() {
  try {
    const res = await fetch(COINGECKO_URL);
    if (!res.ok) return;
    const data = await res.json();
    const price = data?.bitcoin?.usd;
    const text = formatBadge(price);
    if (text) {
      chrome.action.setBadgeText({ text });
      chrome.action.setBadgeBackgroundColor({ color: '#1a1a2e' });
    }
  } catch {
    // 静默失败，不干扰用户
  }
}

function startBadgeUpdates() {
  updateBadge();
  badgeTimerId = setInterval(updateBadge, BADGE_INTERVAL_MS);
}

function stopBadgeUpdates() {
  if (badgeTimerId) {
    clearInterval(badgeTimerId);
    badgeTimerId = null;
  }
}

chrome.runtime.onStartup.addListener(() => {
  startBadgeUpdates();
});

chrome.runtime.onInstalled.addListener(() => {
  startBadgeUpdates();
});
