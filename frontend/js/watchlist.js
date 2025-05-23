import Http from "./http.js";
import Sidebar from "./sidebar.js";
import SearchBar from "./search.js";
import { getMockStocks } from "./mockdata.js";
import { formatMarketCap } from "./utils.js";
function popluateWatchlistTable(stocks) {
  const table = $("#watchlistTableBody");
  table.empty();
  stocks.sort((a, b) => b.percent_change - a.percent_change);
  stocks.forEach((stock) => {
    const changeClass = stock.change >= 0 ? "positive" : "negative";
    const changeIcon = stock.change >= 0 ? "fa-caret-up" : "fa-caret-down";
    const changePrefix = stock.change >= 0 ? "+" : "-";
    const row = $(`
      <div class="watchlist-row watchlist-stock-row">
          <img src="https://www.google.com/s2/favicons?sz=64&domain=${stock.domain}" alt="${stock.symbol} icon" width="30px"/>
          <div>${stock.symbol}</div>
          <div>${stock.company}</div>
          <div>$${stock.close.toFixed(2)}</div>
          <div class="price-change ${changeClass}">
              <i class="fas ${changeIcon}"></i>
              ${changePrefix}$${Math.abs(stock.change).toFixed(2)}
          </div>
          <div class="price-change ${changeClass}">
              <i class="fas ${changeIcon}"></i>
              ${changePrefix}${Math.abs(stock.percent_change).toFixed(2)}%
          </div>
          <div>${formatMarketCap(stock.market_cap)}</div>
      <div>
    `);
    row.on("click", () => {
      window.location.href = `ticker.html?symbol=${stock.symbol}`;
    });
    table.append(row);
  });
}

function loadWatchlist() {
  Http.get("/stock/watchlist")
    .then((stocks) => {
      popluateWatchlistTable(stocks);
      localStorage.setItem("watchlist", JSON.stringify(stocks));
      return true;
    })
    .catch((error) => {
      console.error("Error loading watchlist:", error);
      return false;
    });
}

function loadWatchlistFromCache() {
  const cachedStocks = localStorage.getItem("watchlist");
  if (cachedStocks) {
    try {
      const stocks = JSON.parse(cachedStocks);
      popluateWatchlistTable(stocks);
      return true;
    } catch (error) {
      console.error("Error parsing cached watchlist:", error);
      return false;
    }
  }
  return false;
}

function loadWatchlistFromMockData() {
  const stocks = getMockStocks();
  popluateWatchlistTable(stocks);
}

$(document).ready(function () {
  Sidebar.getInstance();
  SearchBar.getInstance();
  if (!loadWatchlistFromCache() && !loadWatchlist()) {
    loadWatchlistFromMockData();
  }
});
