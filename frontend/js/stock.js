/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */

class Ticker {
  constructor(symbol, info, close, change, percent_change, marketCap, domain) {
    this.symbol = symbol;
    this.info = info;
    this.close = close;
    this.change = change;
    this.percent_change = percent_change;
    this.marketCap = marketCap;
    this.domain = domain;
  }
}

function loadTickerFromCache(symbol) {}

function loadTicker(symbol) {}

function loadTickerFromMockData(symbol) {}

$(document).ready(function () {
  const urlParams = new URLSearchParams(window.location.search);
  const currentSymbol = urlParams.get("symbol") || "AAPL";
  var candlestickChart = echarts.init(
    document.getElementById("candlestickChart"),
    "dark",
  );
  window.addEventListener("resize", function () {
    candlestickChart.resize();
  });
  //   if (!loadTickerFromCache(currentSymbol) && !loadTicker(currentSymbol)) {
  //     loadTickerFromMockData(currentSymbol);
  //   }
  //   initChartSeting();
  //   initTabSwitching();
  //   initTimeframeButtons();
  //   initFollowButton();
  //   initSearchFunctionality();
  //   initializeChart();
  //   initThemeObserver();
  //   setupResizeHandler();
});
