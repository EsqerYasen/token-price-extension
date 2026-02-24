/**
 * Crypto Price Tracker - 多 API 源 + 关注 + 展示列表增删改查
 */

const COIN_POOL = [
  { id: 'bitcoin', coinCapId: 'bitcoin', binanceSymbol: 'BTCUSDT', gatePair: 'btc_usdt', okxInstId: 'BTC-USDT', name: 'Bitcoin', symbol: 'BTC' },
  { id: 'ethereum', coinCapId: 'ethereum', binanceSymbol: 'ETHUSDT', gatePair: 'eth_usdt', okxInstId: 'ETH-USDT', name: 'Ethereum', symbol: 'ETH' },
  { id: 'binancecoin', coinCapId: 'binance-coin', binanceSymbol: 'BNBUSDT', gatePair: 'bnb_usdt', okxInstId: 'BNB-USDT', name: 'BNB', symbol: 'BNB' },
  { id: 'solana', coinCapId: 'solana', binanceSymbol: 'SOLUSDT', gatePair: 'sol_usdt', okxInstId: 'SOL-USDT', name: 'Solana', symbol: 'SOL' },
  { id: 'ripple', coinCapId: 'xrp', binanceSymbol: 'XRPUSDT', gatePair: 'xrp_usdt', okxInstId: 'XRP-USDT', name: 'XRP', symbol: 'XRP' },
  { id: 'dogecoin', coinCapId: 'dogecoin', binanceSymbol: 'DOGEUSDT', gatePair: 'doge_usdt', okxInstId: 'DOGE-USDT', name: 'Dogecoin', symbol: 'DOGE' },
  { id: 'cardano', coinCapId: 'cardano', binanceSymbol: 'ADAUSDT', gatePair: 'ada_usdt', okxInstId: 'ADA-USDT', name: 'Cardano', symbol: 'ADA' },
  { id: 'avalanche-2', coinCapId: 'avalanche', binanceSymbol: 'AVAXUSDT', gatePair: 'avax_usdt', okxInstId: 'AVAX-USDT', name: 'Avalanche', symbol: 'AVAX' },
  { id: 'aave', coinCapId: 'aave', binanceSymbol: 'AAVEUSDT', gatePair: 'aave_usdt', okxInstId: 'AAVE-USDT', name: 'Aave', symbol: 'AAVE' },
  { id: 'polkadot', coinCapId: 'polkadot', binanceSymbol: 'DOTUSDT', gatePair: 'dot_usdt', okxInstId: 'DOT-USDT', name: 'Polkadot', symbol: 'DOT' },
  { id: 'chainlink', coinCapId: 'chainlink', binanceSymbol: 'LINKUSDT', gatePair: 'link_usdt', okxInstId: 'LINK-USDT', name: 'Chainlink', symbol: 'LINK' },
  { id: 'uniswap', coinCapId: 'uniswap', binanceSymbol: 'UNIUSDT', gatePair: 'uni_usdt', okxInstId: 'UNI-USDT', name: 'Uniswap', symbol: 'UNI' },
  { id: 'matic-network', coinCapId: 'matic-network', binanceSymbol: 'MATICUSDT', gatePair: 'matic_usdt', okxInstId: 'MATIC-USDT', name: 'Polygon', symbol: 'MATIC' },
  { id: 'litecoin', coinCapId: 'litecoin', binanceSymbol: 'LTCUSDT', gatePair: 'ltc_usdt', okxInstId: 'LTC-USDT', name: 'Litecoin', symbol: 'LTC' },
  { id: 'cosmos', coinCapId: 'cosmos', binanceSymbol: 'ATOMUSDT', gatePair: 'atom_usdt', okxInstId: 'ATOM-USDT', name: 'Cosmos', symbol: 'ATOM' },
  { id: 'near', coinCapId: 'near', binanceSymbol: 'NEARUSDT', gatePair: 'near_usdt', okxInstId: 'NEAR-USDT', name: 'NEAR Protocol', symbol: 'NEAR' },
  { id: 'sui', coinCapId: 'sui', binanceSymbol: 'SUIUSDT', gatePair: 'sui_usdt', okxInstId: 'SUI-USDT', name: 'Sui', symbol: 'SUI' },
  { id: 'aptos', coinCapId: 'aptos', binanceSymbol: 'APTUSDT', gatePair: 'apt_usdt', okxInstId: 'APT-USDT', name: 'Aptos', symbol: 'APT' },
  { id: 'arbitrum', coinCapId: 'arbitrum', binanceSymbol: 'ARBUSDT', gatePair: 'arb_usdt', okxInstId: 'ARB-USDT', name: 'Arbitrum', symbol: 'ARB' },
  { id: 'optimism', coinCapId: 'optimism', binanceSymbol: 'OPUSDT', gatePair: 'op_usdt', okxInstId: 'OP-USDT', name: 'Optimism', symbol: 'OP' },
];

const API_SOURCES = [
  { id: 'coingecko', name: 'CoinGecko', desc: '聚合' },
  { id: 'coincap', name: 'CoinCap', desc: '聚合' },
  { id: 'binance', name: 'Binance', desc: '交易所' },
  { id: 'gate', name: 'Gate.io', desc: '交易所' },
  { id: 'okx', name: 'OKX', desc: '交易所' },
];

const PRESETS = {
  default: { name: '主流', symbols: ['BTC', 'ETH', 'BNB', 'SOL', 'XRP', 'DOGE', 'ADA', 'AVAX'] },
  defi: { name: 'DeFi', symbols: ['ETH', 'UNI', 'AAVE', 'LINK', 'SOL', 'AVAX'] },
  layer2: { name: 'Layer2', symbols: ['ETH', 'MATIC', 'AVAX', 'SOL', 'ARB', 'OP'] },
};

const REFRESH_INTERVAL_MS = 15000;
const COINGECKO_URL = 'https://api.coingecko.com/api/v3/simple/price';
const COINCAP_URL = 'https://api.coincap.io/v2/assets';

let refreshTimerId = null;
let currentApi = 'coingecko';
let displayList = ['BTC', 'ETH', 'BNB', 'SOL', 'XRP', 'DOGE', 'ADA', 'AVAX'];
let watchlist = ['BTC', 'ETH'];

const STORAGE_KEYS = {
  api: 'crypto_tracker_api',
  displayList: 'crypto_tracker_display',
  watchlist: 'crypto_tracker_watchlist',
};

const COINS_BY_SYMBOL = {};
COIN_POOL.forEach((c) => { COINS_BY_SYMBOL[c.symbol] = c; });

function getCoinsToFetch() {
  return displayList.map((s) => COINS_BY_SYMBOL[s]).filter(Boolean);
}

async function loadStorage() {
  const r = await chrome.storage.sync.get([STORAGE_KEYS.api, STORAGE_KEYS.displayList, STORAGE_KEYS.watchlist]);
  if (r[STORAGE_KEYS.api]) currentApi = r[STORAGE_KEYS.api];
  if (r[STORAGE_KEYS.displayList] && Array.isArray(r[STORAGE_KEYS.displayList]) && r[STORAGE_KEYS.displayList].length > 0) {
    displayList = r[STORAGE_KEYS.displayList];
  }
  if (r[STORAGE_KEYS.watchlist] && Array.isArray(r[STORAGE_KEYS.watchlist])) watchlist = r[STORAGE_KEYS.watchlist];
}

async function saveApi(id) {
  currentApi = id;
  await chrome.storage.sync.set({ [STORAGE_KEYS.api]: id });
}

async function saveDisplayList(list) {
  displayList = list;
  await chrome.storage.sync.set({ [STORAGE_KEYS.displayList]: list });
}

async function saveWatchlist(list) {
  watchlist = list;
  await chrome.storage.sync.set({ [STORAGE_KEYS.watchlist]: list });
}

function addToDisplay(symbol) {
  if (displayList.includes(symbol)) return;
  const next = [...displayList, symbol];
  saveDisplayList(next);
  closeAddModal();
  load();
  renderApiAndWatchlist();
}

function removeFromDisplay(symbol) {
  const next = displayList.filter((s) => s !== symbol);
  if (next.length === 0) return;
  saveDisplayList(next);
  const wl = watchlist.filter((s) => s !== symbol);
  if (wl.length !== watchlist.length) saveWatchlist(wl);
  load();
  renderApiAndWatchlist();
}

function toggleWatch(symbol) {
  const idx = watchlist.indexOf(symbol);
  const next = idx >= 0 ? watchlist.filter((s) => s !== symbol) : [...watchlist, symbol];
  saveWatchlist(next);
  renderApiAndWatchlist();
  const list = document.getElementById('list');
  if (list?.children.length && _lastItems) renderList(_lastItems);
}

let _lastItems = [];

function applyPreset(presetId) {
  const p = PRESETS[presetId];
  if (!p) return;
  saveDisplayList([...p.symbols.filter((s) => COINS_BY_SYMBOL[s])]);
  closeAddModal();
  load();
  renderApiAndWatchlist();
}

function getCoinGeckoUrl(coins) {
  const ids = coins.map((c) => c.id).join(',');
  return `${COINGECKO_URL}?ids=${ids}&vs_currencies=usd&include_24hr_change=true`;
}

async function fetchFromCoinGecko(coins) {
  const url = getCoinGeckoUrl(coins);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API 错误: ${res.status}`);
  const data = await res.json();
  return coins.map((coin) => {
    const raw = data[coin.id];
    return { ...coin, price: raw?.usd ?? null, change24h: raw?.usd_24hr_change ?? null };
  });
}

async function fetchFromCoinCap(coins) {
  const res = await fetch(`${COINCAP_URL}?limit=100`);
  if (!res.ok) throw new Error(`API 错误: ${res.status}`);
  const json = await res.json();
  const byId = {};
  (json?.data ?? []).forEach((a) => { byId[a.id] = a; });
  return coins.map((coin) => {
    const raw = byId[coin.coinCapId];
    const ch = raw?.changePercent24Hr;
    return {
      ...coin,
      price: raw?.priceUsd != null ? parseFloat(raw.priceUsd) : null,
      change24h: ch != null && ch !== '' ? parseFloat(ch) : null,
    };
  });
}

async function fetchFromBinance(coins) {
  const symbols = coins.map((c) => `"${c.binanceSymbol}"`).join(',');
  const url = `https://api.binance.com/api/v3/ticker/24hr?symbols=[${symbols}]`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API 错误: ${res.status}`);
  const arr = await res.json();
  const bySymbol = {};
  arr.forEach((t) => { bySymbol[t.symbol] = t; });
  return coins.map((coin) => {
    const raw = bySymbol[coin.binanceSymbol];
    const last = raw?.lastPrice ? parseFloat(raw.lastPrice) : null;
    const ch = raw?.priceChangePercent ? parseFloat(raw.priceChangePercent) : null;
    return { ...coin, price: last, change24h: ch };
  });
}

async function fetchFromGate(coins) {
  const query = coins.map((c) => `currency_pair=${encodeURIComponent(c.gatePair)}`).join('&');
  const res = await fetch(`https://api.gateio.ws/api/v4/spot/tickers?${query}`);
  if (!res.ok) throw new Error(`API 错误: ${res.status}`);
  const arr = await res.json();
  const byPair = {};
  arr.forEach((t) => { byPair[t.currency_pair] = t; });
  return coins.map((coin) => {
    const raw = byPair[coin.gatePair];
    const last = raw?.last ? parseFloat(raw.last) : null;
    const ch = raw?.change_percentage ? parseFloat(raw.change_percentage) : null;
    return { ...coin, price: last, change24h: ch };
  });
}

async function fetchFromOKX(coins) {
  const res = await fetch('https://www.okx.com/api/v5/market/tickers?instType=SPOT');
  if (!res.ok) throw new Error(`API 错误: ${res.status}`);
  const json = await res.json();
  const data = json?.data ?? [];
  const byInst = {};
  data.forEach((t) => { byInst[t.instId] = t; });
  return coins.map((coin) => {
    const raw = byInst[coin.okxInstId];
    const last = raw?.last ? parseFloat(raw.last) : null;
    let ch = null;
    if (raw?.sodUtc0 && raw?.last) {
      const open = parseFloat(raw.sodUtc0);
      if (open && open !== 0) ch = ((parseFloat(raw.last) - open) / open) * 100;
    }
    return { ...coin, price: last, change24h: ch };
  });
}

async function fetchCryptoPrices() {
  const coins = getCoinsToFetch();
  if (coins.length === 0) return [];

  const fns = {
    coingecko: fetchFromCoinGecko,
    coincap: fetchFromCoinCap,
    binance: fetchFromBinance,
    gate: fetchFromGate,
    okx: fetchFromOKX,
  };
  const fn = fns[currentApi] || fetchFromCoinGecko;
  try {
    return await fn(coins);
  } catch (e) {
    if (currentApi === 'coingecko' && e.message.includes('429')) {
      return await fetchFromCoinCap(coins);
    }
    throw e;
  }
}

function formatPrice(price) {
  if (price == null || isNaN(price)) return '—';
  if (price >= 1000) return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (price >= 1) return `$${price.toFixed(2)}`;
  if (price >= 0.01) return `$${price.toFixed(4)}`;
  return `$${price.toFixed(6)}`;
}

function formatChange(change) {
  if (change == null || isNaN(change)) return { text: '—', cls: 'neutral' };
  const text = `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`;
  const cls = change > 0 ? 'positive' : change < 0 ? 'negative' : 'neutral';
  return { text, cls };
}

function setLoading(show) {
  document.getElementById('loading').style.display = show ? 'block' : 'none';
}

function setError(msg) {
  const el = document.getElementById('error');
  el.textContent = msg || '';
  el.style.display = msg ? 'block' : 'none';
}

function setUpdated(time) {
  const el = document.getElementById('updated');
  el.textContent = time ? `更新于 ${new Date(time).toLocaleTimeString('zh-CN')}` : '';
}

function getExternalUrl(coin) {
  return `https://www.coingecko.com/zh/%E5%8A%A0%E5%AF%86%E8%B4%A7%E5%B8%81/${coin.id}`;
}

function renderApiSelector() {
  const sel = document.getElementById('apiSource');
  sel.innerHTML = API_SOURCES.map((s) => `<option value="${s.id}" ${s.id === currentApi ? 'selected' : ''}>${s.name}</option>`).join('');
  sel.onchange = async () => {
    await saveApi(sel.value);
    load();
  };
}

function renderHeaderActions() {
  const presetsSel = document.getElementById('presetList');
  presetsSel.innerHTML = Object.entries(PRESETS).map(([id, p]) => `<option value="${id}">${p.name}</option>`).join('');
  presetsSel.onchange = () => applyPreset(presetsSel.value);
}

function openAddModal() {
  document.getElementById('addModal').classList.add('open');
  renderAddPicker();
}

function closeAddModal() {
  document.getElementById('addModal').classList.remove('open');
}

function renderAddPicker() {
  const available = COIN_POOL.filter((c) => !displayList.includes(c.symbol));
  const container = document.getElementById('addPickerList');
  if (available.length === 0) {
    container.innerHTML = '<p class="add-empty">已在列表中</p>';
    return;
  }
  container.innerHTML = available.map((c) =>
    `<button type="button" class="add-picker-item" data-symbol="${c.symbol}"><span class="add-symbol">${c.symbol}</span> ${c.name}</button>`
  ).join('');
  container.querySelectorAll('.add-picker-item').forEach((el) => {
    el.onclick = () => addToDisplay(el.dataset.symbol);
  });
}

function renderApiAndWatchlist() {
  renderApiSelector();
  renderHeaderActions();
  const wl = document.getElementById('watchlistTags');
  wl.innerHTML = COIN_POOL.filter((c) => displayList.includes(c.symbol)).map((c) => {
    const active = watchlist.includes(c.symbol);
    return `<span class="tag ${active ? 'active' : ''}" data-symbol="${c.symbol}" title="${active ? '取消关注' : '加关注'}">${c.symbol}</span>`;
  }).join('');
  wl.querySelectorAll('.tag').forEach((el) => {
    el.onclick = () => toggleWatch(el.dataset.symbol);
  });
}

function sortByWatchlist(items) {
  const set = new Set(watchlist);
  return [...items].sort((a, b) => {
    const aW = set.has(a.symbol) ? 1 : 0;
    const bW = set.has(b.symbol) ? 1 : 0;
    if (aW !== bW) return bW - aW;
    return watchlist.indexOf(a.symbol) - watchlist.indexOf(b.symbol);
  });
}

function renderList(items) {
  const sorted = sortByWatchlist(items);
  const list = document.getElementById('list');
  list.innerHTML = sorted
    .map((item) => {
      const isWatched = watchlist.includes(item.symbol);
      const { text: changeText, cls } = formatChange(item.change24h);
      const url = getExternalUrl(item);
      return `
        <li class="list-item ${isWatched ? 'watched' : ''}" data-symbol="${item.symbol}">
          <div class="coin-left">
            <button type="button" class="btn-watch ${isWatched ? 'on' : ''}" data-symbol="${item.symbol}" title="${isWatched ? '取消关注' : '加关注'}">${isWatched ? '★' : '☆'}</button>
            <button type="button" class="btn-delete" data-symbol="${item.symbol}" title="从列表移除">🗑</button>
            <a href="${url}" target="_blank" rel="noopener" class="btn-link" title="查看详情">↗</a>
            <div class="coin-info">
              <span class="coin-name">${item.name}</span>
              <span class="coin-symbol">${item.symbol}</span>
            </div>
          </div>
          <div class="coin-data">
            <div class="coin-price">${formatPrice(item.price)}</div>
            <div class="coin-change ${cls}">${changeText} (24h)</div>
          </div>
        </li>
      `;
    })
    .join('');
  list.querySelectorAll('.btn-watch').forEach((el) => {
    el.onclick = (e) => { e.preventDefault(); toggleWatch(el.dataset.symbol); };
  });
  list.querySelectorAll('.btn-delete').forEach((el) => {
    el.onclick = (e) => { e.preventDefault(); removeFromDisplay(el.dataset.symbol); };
  });
}

async function load() {
  setError('');
  setLoading(true);
  try {
    const items = await fetchCryptoPrices();
    _lastItems = items;
    setLoading(false);
    renderList(items);
    setUpdated(Date.now());
  } catch (e) {
    setLoading(false);
    setError(`加载失败: ${e.message}。请切换 API 源或点击刷新。`);
    document.getElementById('list').innerHTML = '';
  }
}

function startAutoRefresh() {
  stopAutoRefresh();
  refreshTimerId = setInterval(load, REFRESH_INTERVAL_MS);
}

function stopAutoRefresh() {
  if (refreshTimerId) {
    clearInterval(refreshTimerId);
    refreshTimerId = null;
  }
}

async function init() {
  await loadStorage();
  renderApiAndWatchlist();
  document.getElementById('refresh').onclick = () => load();
  document.getElementById('btnAdd').onclick = openAddModal;
  document.getElementById('addModalOverlay').onclick = closeAddModal;
  document.getElementById('addModalClose').onclick = closeAddModal;
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopAutoRefresh();
    else startAutoRefresh();
  });
  load();
  startAutoRefresh();
}

document.addEventListener('DOMContentLoaded', init);
