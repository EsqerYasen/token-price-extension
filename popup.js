/**
 * Crypto Price Tracker - i18n, multi-API, watchlist, search add
 * 容错 / 兼容 / 稳定 / 性能优化
 */

const runtime = (typeof chrome !== 'undefined' && chrome?.runtime?.id) ? chrome : (typeof browser !== 'undefined' && browser?.runtime?.id) ? browser : null;

function t(key, ...subs) {
  try {
    return runtime?.i18n?.getMessage?.(key, subs) || key;
  } catch {
    return key;
  }
}

function applyI18n() {
  try {
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      if (el?.dataset?.i18n) el.textContent = t(el.dataset.i18n);
    });
    document.querySelectorAll('[data-i18n-title]').forEach((el) => {
      if (el?.dataset?.i18nTitle) el.title = t(el.dataset.i18nTitle);
    });
    const list = document.getElementById('list');
    if (list) list.setAttribute('aria-label', t('listAriaLabel'));
    const title = document.querySelector('title');
    if (title) title.textContent = t('extName');
    const searchInput = document.getElementById('addSearchInput');
    if (searchInput) searchInput.placeholder = t('searchPlaceholder');
  } catch (err) {
    console.warn('applyI18n:', err);
  }
}

function safeParseNum(v, def = null) {
  if (v == null || v === '') return def;
  const n = parseFloat(v);
  return isNaN(n) ? def : n;
}

function escapeHtml(s) {
  if (s == null) return '';
  const str = String(s);
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
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
const SEARCH_DEBOUNCE_MS = 150;
const COINGECKO_URL = 'https://api.coingecko.com/api/v3/simple/price';
const COINCAP_URL = 'https://api.coincap.io/v2/assets';
const COIN_LIST_CACHE_KEY = 'crypto_tracker_coin_list';
const SEARCH_RESULT_LIMIT = 20;

let refreshTimerId = null;
let loadAbort = false;
let searchDebounceId = null;
let searchableCoinsCache = null;
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
  if (!raw || !raw.id || !raw.symbol) return null;
  const sym = String(raw.symbol).toUpperCase();
  const low = String(raw.symbol).toLowerCase();
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
  COIN_POOL.forEach((c) => { if (c?.symbol) map[c.symbol] = c; });
  Object.values(customCoins).forEach((c) => { if (c?.symbol) map[c.symbol] = c; });
  return map;
}

function getCoinsToFetch() {
  const bySym = getCOINS_BY_SYMBOL();
  return displayList.map((s) => bySym[s]).filter(Boolean);
}

function getSearchableCoins() {
  if (searchableCoinsCache) return searchableCoinsCache;
  const bySym = {};
  COIN_POOL.forEach((c) => { if (c?.symbol) bySym[c.symbol] = c; });
  Object.values(customCoins).forEach((c) => { if (c?.symbol) bySym[c.symbol] = c; });
  coinListCache.forEach((c) => {
    const sym = (c?.symbol || '').toUpperCase();
    if (sym && !bySym[sym] && c?.id) {
      const derived = toDerivedCoin(c);
      if (derived) bySym[sym] = derived;
    }
  });
  searchableCoinsCache = Object.values(bySym);
  return searchableCoinsCache;
}

function invalidateSearchCache() {
  searchableCoinsCache = null;
}

async function safeStorageGet(keys) {
  if (!runtime?.storage?.sync?.get) return {};
  try {
    return await runtime.storage.sync.get(keys) || {};
  } catch {
    return {};
  }
}

async function safeStorageSet(obj) {
  if (!runtime?.storage?.sync?.set) return;
  try {
    await runtime.storage.sync.set(obj);
  } catch (err) {
    console.warn('storage.set:', err);
  }
}

async function safeStorageLocalGet(key) {
  if (!runtime?.storage?.local?.get) return undefined;
  try {
    const r = await runtime.storage.local.get(key);
    return r?.[key];
  } catch {
    return undefined;
  }
}

async function safeStorageLocalSet(obj) {
  if (!runtime?.storage?.local?.set) return;
  try {
    await runtime.storage.local.set(obj);
  } catch (err) {
    console.warn('storage.local.set:', err);
  }
}

async function loadStorage() {
  const r = await safeStorageGet([STORAGE_KEYS.api, STORAGE_KEYS.displayList, STORAGE_KEYS.watchlist, STORAGE_KEYS.customCoins]);
  if (r[STORAGE_KEYS.api]) currentApi = r[STORAGE_KEYS.api];
  if (Array.isArray(r[STORAGE_KEYS.displayList]) && r[STORAGE_KEYS.displayList].length > 0) {
    displayList = r[STORAGE_KEYS.displayList].filter((s) => typeof s === 'string');
  }
  if (Array.isArray(r[STORAGE_KEYS.watchlist])) watchlist = r[STORAGE_KEYS.watchlist].filter((s) => typeof s === 'string');
  if (r[STORAGE_KEYS.customCoins] && typeof r[STORAGE_KEYS.customCoins] === 'object') {
    customCoins = r[STORAGE_KEYS.customCoins];
  }
  invalidateSearchCache();
  const cached = await safeStorageLocalGet(COIN_LIST_CACHE_KEY);
  const list = cached?.list;
  coinListCache = Array.isArray(list) ? list.filter((c) => c?.id && c?.symbol && c?.name).slice(0, 5000) : [];
  if (coinListCache.length === 0) {
    try {
      const res = await fetch('https://api.coingecko.com/api/v3/coins/list?include_platform=false');
      if (res.ok) {
        const data = await res.json();
        const arr = Array.isArray(data) ? data : [];
        coinListCache = arr.filter((c) => c?.id && c?.symbol && c?.name).slice(0, 5000);
        await safeStorageLocalSet({ [COIN_LIST_CACHE_KEY]: { list: coinListCache, ts: Date.now() } });
      }
    } catch {
      // fallback: use COIN_POOL only
    }
  }
}

async function saveApi(id) {
  currentApi = id;
  await safeStorageSet({ [STORAGE_KEYS.api]: id });
}

async function saveDisplayList(list) {
  displayList = list;
  await safeStorageSet({ [STORAGE_KEYS.displayList]: list });
  invalidateSearchCache();
}

async function saveWatchlist(list) {
  watchlist = list;
  await safeStorageSet({ [STORAGE_KEYS.watchlist]: list });
}

async function saveCustomCoin(coin) {
  if (!coin?.symbol) return;
  customCoins[coin.symbol] = coin;
  await safeStorageSet({ [STORAGE_KEYS.customCoins]: customCoins });
  invalidateSearchCache();
}

async function addToDisplay(coin) {
  if (!coin?.symbol) return;
  const sym = coin.symbol;
  if (displayList.includes(sym)) return;
  const inPool = COIN_POOL.some((c) => c.symbol === sym);
  if (!inPool) await saveCustomCoin(coin);
  const next = [...displayList, sym];
  await saveDisplayList(next);
  closeAddModal();
  load();
  renderApiAndWatchlist();
}

async function removeFromDisplay(symbol) {
  const next = displayList.filter((s) => s !== symbol);
  if (next.length === 0) return;
  await saveDisplayList(next);
  const wl = watchlist.filter((s) => s !== symbol);
  if (wl.length !== watchlist.length) await saveWatchlist(wl);
  invalidateSearchCache();
  load();
  renderApiAndWatchlist();
}

function toggleWatch(symbol) {
  const idx = watchlist.indexOf(symbol);
  const next = idx >= 0 ? watchlist.filter((s) => s !== symbol) : [...watchlist, symbol];
  watchlist = next;
  saveWatchlist(next);
  renderApiAndWatchlist();
  const list = document.getElementById('list');
  if (list?.children.length && _lastItems?.length) renderList(_lastItems);
}

let _lastItems = [];

async function applyPreset(presetId) {
  const p = PRESETS[presetId];
  if (!p) return;
  const bySym = getCOINS_BY_SYMBOL();
  const next = p.symbols.filter((s) => bySym[s]);
  await saveDisplayList(next);
  closeAddModal();
  load();
  renderApiAndWatchlist();
}

function getCoinGeckoUrl(coins) {
  const ids = coins.map((c) => c?.id).filter(Boolean).join(',');
  return `${COINGECKO_URL}?ids=${ids}&vs_currencies=usd&include_24hr_change=true`;
}

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API ${res.status}`);
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error('Invalid JSON');
  }
}

async function fetchFromCoinGecko(coins) {
  if (!coins.length) return [];
  const data = await fetchJson(getCoinGeckoUrl(coins));
  return coins.map((coin) => {
    const raw = data?.[coin?.id];
    return { ...coin, price: safeParseNum(raw?.usd), change24h: safeParseNum(raw?.usd_24hr_change) };
  });
}

async function fetchFromCoinCap(coins) {
  const json = await fetchJson(`${COINCAP_URL}?limit=200`);
  const data = json?.data ?? [];
  const byId = {};
  const bySym = {};
  data.forEach((a) => {
    if (a?.id) byId[a.id] = a;
    if (a?.symbol) bySym[String(a.symbol).toUpperCase()] = a;
  });
  return coins.map((coin) => {
    const raw = byId[coin?.coinCapId] || bySym[coin?.symbol];
    const ch = raw?.changePercent24Hr;
    return { ...coin, price: safeParseNum(raw?.priceUsd), change24h: safeParseNum(ch) };
  });
}

async function fetchFromBinance(coins) {
  const symbols = coins.map((c) => `"${c?.binanceSymbol || ''}"`).filter((s) => s !== '""').join(',');
  if (!symbols) return coins.map((c) => ({ ...c, price: null, change24h: null }));
  const arr = await fetchJson(`https://api.binance.com/api/v3/ticker/24hr?symbols=[${symbols}]`);
  const bySymbol = {};
  (Array.isArray(arr) ? arr : []).forEach((t) => { if (t?.symbol) bySymbol[t.symbol] = t; });
  return coins.map((coin) => {
    const raw = bySymbol[coin?.binanceSymbol];
    return { ...coin, price: safeParseNum(raw?.lastPrice), change24h: safeParseNum(raw?.priceChangePercent) };
  });
}

async function fetchFromGate(coins) {
  const query = coins.map((c) => `currency_pair=${encodeURIComponent(c?.gatePair || '')}`).filter((q) => !q.includes('undefined')).join('&');
  if (!query) return coins.map((c) => ({ ...c, price: null, change24h: null }));
  const arr = await fetchJson(`https://api.gateio.ws/api/v4/spot/tickers?${query}`);
  const byPair = {};
  (Array.isArray(arr) ? arr : []).forEach((t) => { if (t?.currency_pair) byPair[t.currency_pair] = t; });
  return coins.map((coin) => {
    const raw = byPair[coin?.gatePair];
    const last = raw?.last;
    const ch = raw?.change_percentage;
    return { ...coin, price: safeParseNum(last), change24h: safeParseNum(ch) };
  });
}

async function fetchFromOKX(coins) {
  const json = await fetchJson('https://www.okx.com/api/v5/market/tickers?instType=SPOT');
  const data = json?.data ?? [];
  const byInst = {};
  data.forEach((t) => { if (t?.instId) byInst[t.instId] = t; });
  return coins.map((coin) => {
    const raw = byInst[coin?.okxInstId];
    const last = raw?.last;
    let ch = null;
    if (raw?.sodUtc0 && raw?.last) {
      const open = safeParseNum(raw.sodUtc0);
      if (open !== null && open !== 0) ch = ((safeParseNum(raw.last) - open) / open) * 100;
    }
    return { ...coin, price: safeParseNum(last), change24h: ch };
  });
}

async function fetchCryptoPrices() {
  const coins = getCoinsToFetch();
  if (coins.length === 0) return [];

  const fns = { coingecko: fetchFromCoinGecko, coincap: fetchFromCoinCap, binance: fetchFromBinance, gate: fetchFromGate, okx: fetchFromOKX };
  const fn = fns[currentApi] || fetchFromCoinGecko;
  try {
    return await fn(coins);
  } catch (e) {
    if (currentApi === 'coingecko' && String(e?.message || '').includes('429')) {
      return await fetchFromCoinCap(coins);
    }
    throw e;
  }
}

function formatPrice(price) {
  if (price == null || isNaN(price)) return '—';
  if (price >= 1000) return `$${Number(price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (price >= 1) return `$${Number(price).toFixed(2)}`;
  if (price >= 0.01) return `$${Number(price).toFixed(4)}`;
  return `$${Number(price).toFixed(6)}`;
}

function formatChange(change) {
  if (change == null || isNaN(change)) return { text: '—', cls: 'neutral' };
  const text = `${change >= 0 ? '+' : ''}${Number(change).toFixed(2)}%`;
  const cls = change > 0 ? 'positive' : change < 0 ? 'negative' : 'neutral';
  return { text, cls };
}

function setLoading(show) {
  const el = document.getElementById('loading');
  if (el) el.style.display = show ? 'block' : 'none';
}

function setError(msg) {
  const el = document.getElementById('error');
  if (!el) return;
  el.textContent = msg || '';
  el.style.display = msg ? 'block' : 'none';
}

function setUpdated(time) {
  const el = document.getElementById('updated');
  if (!el) return;
  try {
    const locale = runtime?.i18n?.getUILanguage?.() || 'en';
    el.textContent = time ? t('updatedAt', new Date(time).toLocaleTimeString(locale)) : '';
  } catch {
    el.textContent = '';
  }
}

function getExternalUrl(coin) {
  const locale = runtime?.i18n?.getUILanguage?.()?.startsWith?.('zh') ? 'zh' : 'en';
  const id = coin?.id || 'bitcoin';
  return `https://www.coingecko.com/${locale}/coins/${id}`;
}

function renderApiSelector() {
  const sel = document.getElementById('apiSource');
  if (!sel) return;
  sel.innerHTML = API_SOURCES.map((s) => `<option value="${s.id}" ${s.id === currentApi ? 'selected' : ''}>${escapeHtml(s.name)} (${t(s.descKey)})</option>`).join('');
  sel.onchange = async () => { await saveApi(sel.value); load(); };
}

function renderHeaderActions() {
  const presetsSel = document.getElementById('presetList');
  if (!presetsSel) return;
  presetsSel.innerHTML = `<option value="">${t('preset')}</option>` + Object.entries(PRESETS).map(([id, p]) => `<option value="${escapeHtml(id)}">${t(p.nameKey)}</option>`).join('');
  presetsSel.onchange = () => { const v = presetsSel.value; if (v) applyPreset(v); };
}

function openAddModal() {
  const inp = document.getElementById('addSearchInput');
  const modal = document.getElementById('addModal');
  if (inp) inp.value = '';
  if (modal) modal.classList.add('open');
  renderAddPicker('');
  if (inp) inp.focus();
}

function closeAddModal() {
  const modal = document.getElementById('addModal');
  if (modal) modal.classList.remove('open');
}

function filterCoins(query) {
  const q = String(query || '').trim().toLowerCase();
  const all = getSearchableCoins();
  const excluded = new Set(displayList);
  const available = all.filter((c) => c?.symbol && !excluded.has(c.symbol));
  if (!q) return available.slice(0, SEARCH_RESULT_LIMIT);
  return available.filter((c) =>
    (c.symbol || '').toLowerCase().includes(q) || (c.name || '').toLowerCase().includes(q) || (c.id || '').toLowerCase().includes(q)
  ).slice(0, SEARCH_RESULT_LIMIT);
}

function renderAddPicker(query) {
  const container = document.getElementById('addPickerList');
  if (!container) return;
  const matches = filterCoins(query);
  if (matches.length === 0) {
    container.innerHTML = `<p class="add-empty">${t('noResults')}</p>`;
    return;
  }
  container.innerHTML = '';
  matches.forEach((c) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'add-picker-item';
    btn.innerHTML = `<span class="add-symbol">${escapeHtml(c.symbol)}</span> ${escapeHtml(c.name || '')}`;
    btn.onclick = () => addToDisplay(c);
    container.appendChild(btn);
  });
}

function onSearchInput() {
  if (searchDebounceId) clearTimeout(searchDebounceId);
  const inp = document.getElementById('addSearchInput');
  const val = inp?.value ?? '';
  searchDebounceId = setTimeout(() => { searchDebounceId = null; renderAddPicker(val); }, SEARCH_DEBOUNCE_MS);
}

function renderApiAndWatchlist() {
  renderApiSelector();
  renderHeaderActions();
  const bySym = getCOINS_BY_SYMBOL();
  const wl = document.getElementById('watchlistTags');
  if (!wl) return;
  wl.innerHTML = displayList.map((sym) => {
    const c = bySym[sym];
    if (!c) return '';
    const active = watchlist.includes(sym);
    return `<span class="tag ${active ? 'active' : ''}" data-symbol="${escapeHtml(sym)}" title="${active ? t('removeFromWatch') : t('addToWatch')}">${escapeHtml(sym)}</span>`;
  }).filter(Boolean).join('');
  wl.querySelectorAll('.tag').forEach((el) => {
    const sym = el.dataset?.symbol;
    if (sym) el.onclick = () => toggleWatch(sym);
  });
}

function sortByWatchlist(items) {
  const set = new Set(watchlist);
  return [...items].sort((a, b) => {
    const aW = set.has(a?.symbol) ? 1 : 0;
    const bW = set.has(b?.symbol) ? 1 : 0;
    if (aW !== bW) return bW - aW;
    return watchlist.indexOf(a?.symbol) - watchlist.indexOf(b?.symbol);
  });
}

function renderList(items) {
  const list = document.getElementById('list');
  if (!list) return;
  const sorted = sortByWatchlist(items);
  list.innerHTML = sorted.map((item) => {
    const isWatched = watchlist.includes(item?.symbol);
    const { text: changeText, cls } = formatChange(item?.change24h);
    const url = getExternalUrl(item);
    const name = escapeHtml(item?.name);
    const symbol = escapeHtml(item?.symbol);
    return `
      <li class="list-item ${isWatched ? 'watched' : ''}" data-symbol="${symbol}">
        <div class="coin-left">
          <button type="button" class="btn-watch ${isWatched ? 'on' : ''}" data-symbol="${symbol}" title="${isWatched ? t('removeFromWatch') : t('addToWatch')}">${isWatched ? '★' : '☆'}</button>
          <button type="button" class="btn-delete" data-symbol="${symbol}" title="${t('removeFromList')}">🗑</button>
          <a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" class="btn-link" title="${t('viewDetails')}">↗</a>
          <div class="coin-info">
            <span class="coin-name">${name}</span>
            <span class="coin-symbol">${symbol}</span>
          </div>
        </div>
        <div class="coin-data">
          <div class="coin-price">${formatPrice(item?.price)}</div>
          <div class="coin-change ${cls}">${changeText} ${t('change24h')}</div>
        </div>
      </li>
    `;
  }).join('');
  list.querySelectorAll('.btn-watch').forEach((el) => { el.onclick = (e) => { e.preventDefault(); toggleWatch(el.dataset?.symbol); }; });
  list.querySelectorAll('.btn-delete').forEach((el) => { el.onclick = (e) => { e.preventDefault(); removeFromDisplay(el.dataset?.symbol); }; });
}

async function load() {
  loadAbort = false;
  setError('');
  setLoading(true);
  try {
    const items = await fetchCryptoPrices();
    if (loadAbort) return;
    _lastItems = items || [];
    setLoading(false);
    renderList(_lastItems);
    setUpdated(Date.now());
  } catch (e) {
    if (loadAbort) return;
    setLoading(false);
    setError(t('loadError', e?.message || 'Unknown'));
    const list = document.getElementById('list');
    if (list) list.innerHTML = '';
  }
}

function startAutoRefresh() {
  stopAutoRefresh();
  refreshTimerId = setInterval(load, REFRESH_INTERVAL_MS);
}

function stopAutoRefresh() {
  if (searchDebounceId) { clearTimeout(searchDebounceId); searchDebounceId = null; }
  if (refreshTimerId) { clearInterval(refreshTimerId); refreshTimerId = null; }
}

async function init() {
  applyI18n();
  try {
    await loadStorage();
  } catch (err) {
    console.warn('loadStorage:', err);
  }
  renderApiAndWatchlist();
  const refreshBtn = document.getElementById('refresh');
  if (refreshBtn) refreshBtn.onclick = () => load();
  const btnAdd = document.getElementById('btnAdd');
  if (btnAdd) btnAdd.onclick = openAddModal;
  const overlay = document.getElementById('addModalOverlay');
  if (overlay) overlay.onclick = closeAddModal;
  const modalClose = document.getElementById('addModalClose');
  if (modalClose) modalClose.onclick = closeAddModal;
  const searchInput = document.getElementById('addSearchInput');
  if (searchInput) {
    searchInput.oninput = onSearchInput;
    searchInput.onkeydown = (e) => { if (e?.key === 'Escape') closeAddModal(); };
  }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { loadAbort = true; stopAutoRefresh(); }
    else { startAutoRefresh(); }
  });
  load();
  startAutoRefresh();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
