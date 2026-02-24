# Crypto Price Tracker

A browser extension for Edge and Chrome to track mainstream cryptocurrency prices and 24-hour changes. Supports multiple API sources and customizable watchlists.

## Preview

### Main popup – price list and watchlist

![Main popup](images/main.png)

### Data source selector

![Data source](images/source.png)

### Add token – search and add coins

![Add token](images/add-token.png)

## Features

### Badge (when popup is closed)

- Displays Bitcoin price on the extension icon (e.g. `63.2k`)
- Color-coded by 24h change: **green** for gains, **red** for losses
- Updates every 60 seconds

### Popup Window

- **Price list**: Name, symbol, USD price, and 24h change with color indicators
- **Watchlist**: Star tokens to pin them to the top; toggle via ★/☆ or header tags
- **Multi-API sources**: CoinGecko, CoinCap, Binance, Gate.io, OKX — switch when one fails (e.g. 429)
- **Search & add**: Type a symbol or name (e.g. `uni`) to search and add tokens from 5000+ coins
- **Presets**: Mainstream, DeFi, Layer2 — quick load common token sets
- **Add/remove**: Add tokens via search; remove with the trash icon on each row
- **External link**: Open CoinGecko page for each token

### i18n

- Follows browser language (default English)
- Supports English and Simplified Chinese

## Installation

1. Open **Edge** (`edge://extensions/`) or **Chrome** (`chrome://extensions/`)
2. Turn on **Developer mode**
3. Click **Load unpacked**
4. Select this extension directory

## Tech Stack

- Manifest V3
- Free public APIs: CoinGecko, CoinCap, Binance, Gate.io, OKX (no API keys)
- Plain HTML/CSS/JS, no build tools

## Usage Tips

- If you see "API 429" or load errors, try switching to another data source
- Badge color reflects BTC’s 24h change when the popup is closed
- Search works best by symbol (e.g. `uni`, `pepe`) or name (e.g. `Uniswap`)
