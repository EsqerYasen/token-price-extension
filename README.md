# Crypto Price Tracker

Edge 浏览器扩展，用于跟踪主流加密货币实时价格和 24 小时涨跌幅。

## 功能

- 展示 8 种主流加密货币：BTC、ETH、BNB、SOL、XRP、DOGE、ADA、AVAX
- 当前 USD 价格与 24 小时涨跌幅
- 每 5 秒自动刷新
- 手动刷新按钮
- 弹窗关闭后停止请求，不占用后台资源

## 安装

1. 打开 Edge，访问 `edge://extensions/`
2. 开启「开发人员模式」
3. 点击「加载解压缩的扩展」
4. 选择本扩展所在目录

## 技术

- Manifest V3
- CoinGecko 免费 API（无需 API Key）
- 纯 HTML/CSS/JS，无外部依赖
