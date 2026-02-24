/**
 * Crypto Price Tracker - i18n, multi-API, watchlist, search add
 */

function t(key, ...subs) {
  return chrome.i18n.getMessage(key, subs) || key;
}

function applyI18n() {
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll('[data-i18n-title]').forEach((el) => {
    el.title = t(el.dataset.i18nTitle);
  });
  const list = document.getElementById('list');
  if (list) list.setAttribute('aria-label', t('listAriaLabel'));
  const title = document.querySelector('title');
  if (title) title.textContent = t('extName');
  const searchInput = document.getElementById('addSearchInput');
  if (searchInput) searchInput.placeholder = t('searchPlaceholder');
}

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
  { id: 'coingecko', name: 'CoinGecko', descKey: 'apiAggregator' },
  { id: 'coincap', name: 'CoinCap', descKey: 'apiAggregator' },
  { id: 'binance', name: 'Binance', descKey: 'apiExchange' },
  { id: 'gate', name: 'Gate.io', descKey: 'apiExchange' },
  { id: 'okx', name: 'OKX', descKey: 'apiExchange' },
];

const PRESETS = {
  default: { nameKey: 'presetMainstream', symbols: ['BTC', 'ETH', 'BNB', 'SOL', 'XRP', 'DOGE', 'ADA', 'AVAX'] },
  defi: { nameKey: 'presetDefi', symbols: ['ETH', 'UNI', 'AAVE', 'LINK', 'SOL', 'AVAX'] },
  layer2: { nameKey: 'presetLayer2', symbols: ['ETH', 'MATIC', 'AVAX', 'SOL', 'ARB', 'OP'] },
};

const REFRESH_INTERVAL_MS = 15000;
const COINGECKO_URL = 'https://api.coingecko.com/api/v3/simple/price';
const COINCAP_URL = 'https://api.coincap.io/v2/assets';
const COIN_LIST_CACHE_KEY = 'crypto_tracker_coin_list';
const SEARCH_RESULT_LIMIT = 20;

let refreshTimerId = null;
let currentApi = 'coingecko';
let displayList = ['BTC', 'ETH', 'BNB', 'SOL', 'XRP', 'DOGE', 'ADA', 'AVAX'];
let watchlist = ['BTC', 'ETH'];
let customCoins = {};
let coinListCache = [];

const STORAGE_KEYS = {
  api: 'crypto_tracker_api',
  displayList: 'crypto_tracker_display',
  watchlist: 'crypto_tracker_watchlist',
  customCoins: 'crypto_tracker_custom_coins',
};

function toDerivedCoin(raw) {
  const sym = (raw.symbol || '').toUpperCase();
  const low = (raw.symbol || '').toLowerCase();
  return {
    id: raw.id,
    coinCapId: raw.id,
    binanceSymbol: sym + 'USDT',
    gatePair: low + '_usdt',
    okxInstId: sym + '-USDT',
    name: raw.name || sym,
    symbol: sym,
  };
}

function getCOINS_BY_SYMBOL() {
  const map = {};
  COIN_POOL.forEach((c) => { map[c.symbol] = c; });
  Object.values(customCoins).forEach((c) => { map[c.symbol] = c; });
  return map;
}

function getCoinsToFetch() {
  const bySym = getCOINS_BY_SYMBOL();
  return displayList.map((s) => bySym[s]).filter(Boolean);
}

function getSearchableCoins() {
  const bySym = {};
  COIN_POOL.forEach((c) => { bySym[c.symbol] = c; });
  Object.values(customCoins).forEach((c) => { bySym[c.symbol] = c; });
  coinListCache.forEach((c) => {
    const sym = (c.symbol || '').toUpperCase();
    if (!bySym[sym] && c.id && c.symbol) {
      bySym[sym] = toDerivedCoin(c);
    }
  });
  return Object.values(bySym);
}

async function loadStorage() {
  const r = await chrome.storage.sync.get([STORAGE_KEYS.api, STORAGE_KEYS.displayList, STORAGE_KEYS.watchlist, STORAGE_KEYS.customCoins]);
  if (r[STORAGE_KEYS.api]) currentApi = r[STORAGE_KEYS.api];
  if (r[STORAGE_KEYS.displayList] && Array.isArray(r[STORAGE_KEYS.displayList]) && r[STORAGE_KEYS.displayList].length > 0) {
    displayList = r[STORAGE_KEYS.displayList];
  }
  if (r[STORAGE_KEYS.watchlist] && Array.isArray(r[STORAGE_KEYS.watchlist])) watchlist = r[STORAGE_KEYS.watchlist];
  if (r[STORAGE_KEYS.customCoins] && typeof r[STORAGE_KEYS.customCoins] === 'object') customCoins = r[STORAGE_KEYS.customCoins];
  const local = await chrome.storage.local.get(COIN_LIST_CACHE_KEY);
  const cached = local[COIN_LIST_CACHE_KEY];
  coinListCache = (cached?.list || []).filter((c) => c?.id && c?.symbol && c?.name);
  if (coinListCache.length === 0) {
    try {
      const res = await fetch('https://api.coingecko.com/api/v3/coins/list?include_platform=false');
      if (res.ok) {
        const data = await res.json();
        const list = (data || []).filter((c) => c?.id && c?.symbol && c?.name).slice(0, 5000);
        coinListCache = list;
        await chrome.storage.local.set({ [COIN_LIST_CACHE_KEY]: { list, ts: Date.now() } });
      }
    } catch {
      // ignore
    }
  }
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

async function saveCustomCoin(coin) {
  customCoins[coin.symbol] = coin;
  await chrome.storage.sync.set({ [STORAGE_KEYS.customCoins]: customCoins });
}

function addToDisplay(coin) {
  const sym = coin.symbol;
  if (displayList.includes(sym)) return;
  const inPool = COIN_POOL.some((c) => c.symbol === sym);
  if (!inPool) saveCustomCoin(coin);
  const next = [...displayList, sym];
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
  const bySym = getCOINS_BY_SYMBOL();
  saveDisplayList([...p.symbols.filter((s) => bySym[s])]);
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
  const res = await fetch(`${COINCAP_URL}?limit=200`);
  if (!res.ok) throw new Error(`API 错误: ${res.status}`);
  const json = await res.json();
  const byId = {};
  (json?.data ?? []).forEach((a) => { byId[a.id] = a; });
  const bySym = {};
  (json?.data ?? []).forEach((a) => { bySym[a.symbol?.toUpperCase()] = a; });
  return coins.map((coin) => {
    const raw = byId[coin.coinCapId] || bySym[coin.symbol];
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
  (arr || []).forEach((t) => { bySymbol[t.symbol] = t; });
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
  (arr || []).forEach((t) => { byPair[t.currency_pair] = t; });
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
  const locale = chrome.i18n.getUILanguage();
  const timeStr = new Date(time).toLocaleTimeString(locale);
  el.textContent = time ? t('updatedAt', timeStr) : '';
}

function getExternalUrl(coin) {
  const locale = chrome.i18n.getUILanguage().startsWith('zh') ? 'zh' : 'en';
  return `https://www.coingecko.com/${locale}/coins/${coin.id}`;
}

function renderApiSelector() {
  const sel = document.getElementById('apiSource');
  sel.innerHTML = API_SOURCES.map((s) => `<option value="${s.id}" ${s.id === currentApi ? 'selected' : ''}>${s.name} (${t(s.descKey)})</option>`).join('');
  sel.onchange = async () => {
    await saveApi(sel.value);
    load();
  };
}

function renderHeaderActions() {
  const presetsSel = document.getElementById('presetList');
  presetsSel.innerHTML = `<option value="">${t('preset')}</option>` + Object.entries(PRESETS).map(([id, p]) => `<option value="${id}">${t(p.nameKey)}</option>`).join('');
  presetsSel.onchange = () => {
    const v = presetsSel.value;
    if (v) applyPreset(v);
  };
}

function openAddModal() {
  document.getElementById('addSearchInput').value = '';
  document.getElementById('addModal').classList.add('open');
  renderAddPicker('');
  document.getElementById('addSearchInput').focus();
}

function closeAddModal() {
  document.getElementById('addModal').classList.remove('open');
}

function filterCoins(query) {
  const q = (query || '').trim().toLowerCase();
  const all = getSearchableCoins();
  const excluded = new Set(displayList);
  const available = all.filter((c) => !excluded.has(c.symbol));
  if (!q) return available.slice(0, SEARCH_RESULT_LIMIT);
  return available.filter((c) =>
    (c.symbol || '').toLowerCase().includes(q) || (c.name || '').toLowerCase().includes(q) || (c.id || '').toLowerCase().includes(q)
  ).slice(0, SEARCH_RESULT_LIMIT);
}

function renderAddPicker(query) {
  const matches = filterCoins(query);
  const container = document.getElementById('addPickerList');
  if (matches.length === 0) {
    container.innerHTML = `<p class="add-empty">${t('noResults')}</p>`;
    return;
  }
  container.innerHTML = '';
  matches.forEach((c) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'add-picker-item';
    btn.innerHTML = `<span class="add-symbol">${c.symbol}</span> ${c.name}`;
    btn.onclick = () => addToDisplay(c);
    container.appendChild(btn);
  });
}

function renderApiAndWatchlist() {
  renderApiSelector();
  renderHeaderActions();
  const bySym = getCOINS_BY_SYMBOL();
  const wl = document.getElementById('watchlistTags');
  wl.innerHTML = displayList.map((sym) => {
    const c = bySym[sym];
    if (!c) return '';
    const active = watchlist.includes(sym);
    return `<span class="tag ${active ? 'active' : ''}" data-symbol="${sym}" title="${active ? t('removeFromWatch') : t('addToWatch')}">${sym}</span>`;
  }).filter(Boolean).join('');
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
            <button type="button" class="btn-watch ${isWatched ? 'on' : ''}" data-symbol="${item.symbol}" title="${isWatched ? t('removeFromWatch') : t('addToWatch')}">${isWatched ? '★' : '☆'}</button>
            <button type="button" class="btn-delete" data-symbol="${item.symbol}" title="${t('removeFromList')}">🗑</button>
            <a href="${url}" target="_blank" rel="noopener" class="btn-link" title="${t('viewDetails')}">↗</a>
            <div class="coin-info">
              <span class="coin-name">${item.name}</span>
              <span class="coin-symbol">${item.symbol}</span>
            </div>
          </div>
          <div class="coin-data">
            <div class="coin-price">${formatPrice(item.price)}</div>
            <div class="coin-change ${cls}">${changeText} ${t('change24h')}</div>
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
    setError(t('loadError', e.message));
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
  applyI18n();
  await loadStorage();
  renderApiAndWatchlist();
  document.getElementById('refresh').onclick = () => load();
  document.getElementById('btnAdd').onclick = openAddModal;
  document.getElementById('addModalOverlay').onclick = closeAddModal;
  document.getElementById('addModalClose').onclick = closeAddModal;
  const searchInput = document.getElementById('addSearchInput');
  if (searchInput) {
    searchInput.oninput = () => renderAddPicker(searchInput.value);
    searchInput.onkeydown = (e) => { if (e.key === 'Escape') closeAddModal(); };
  }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopAutoRefresh();
    else startAutoRefresh();
  });
  load();
  startAutoRefresh();
}

document.addEventListener('DOMContentLoaded', init);
