/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* All the dummy data generated in this file */

function getMockStocks() {
  return [
    {
      symbol: "AAPL",
      name: "Apple Inc.",
      price: 147.04,
      change: 1.47,
      changePercent: 1.47,
      marketCap: "2.45T",
      domain: "apple.com",
      changeDirection: "up",
    },
    {
      symbol: "MSFT",
      name: "MSFT",
      price: 290.12,
      change: 0.89,
      changePercent: 0.31,
      marketCap: "2.17T",
      domain: "microsoft.com",
      changeDirection: "up",
    },
    {
      symbol: "GOOGL",
      name: "GOOGL",
      price: 2300.45,
      change: -1.23,
      changePercent: -1.01,
      marketCap: "1.54T",
      domain: "google.com",
      changeDirection: "down",
    },
    {
      symbol: "AMZN",
      name: "AMZN",
      price: 3380.5,
      change: 2.15,
      changePercent: 2.15,
      marketCap: "1.72T",
      domain: "amazon.com",
      changeDirection: "up",
    },
    {
      symbol: "TSLA",
      name: "TSLA",
      price: 687.2,
      change: -0.75,
      domain: "tesla.com",
      changePercent: -0.75,
      marketCap: "692.4B",
      changeDirection: "down",
    },
  ];
}

/**
 * Populate the stock watchlist
 * @param {string} containerId - Container element ID
 * @param {string} currentPage - Current page name
 * @returns {void}
 */
function populateHotStocks(
  containerId = "watchlistContainer",
  currentPage = null,
) {
  if (!currentPage) {
    currentPage = getCurrentPage();
  }
  const urlParams = new URLSearchParams(window.location.search);
  const currentSymbol = urlParams.get("symbol") || "AAPL";
  const watchlistStocks = getMockStocks();
  const watchlistContainer = document.getElementById(containerId);
  if (!watchlistContainer) {
    console.error(`Container with ID "${containerId}" not found`);
    return;
  }

  watchlistContainer.innerHTML = "";
  watchlistStocks.forEach((stock) => {
    const stockItem = document.createElement("div");
    stockItem.className = "watchlist-item";

    if (
      currentPage === "watchlist-individual" &&
      stock.symbol === currentSymbol
    ) {
      stockItem.classList.add("active");
    }

    const changeClass =
      stock.changeDirection === "up" ? "positive" : "negative";
    const changeIcon =
      stock.changeDirection === "up" ? "fa-caret-up" : "fa-caret-down";

    stockItem.innerHTML = `
              <div class="watchlist-icon">
                  ${stock.symbol.charAt(0)}
              </div>
              <div class="watchlist-info">
                  <div class="stock-name">${stock.name}</div>
                  <div class="stock-symbol">${stock.price}</div>
              </div>
              <div class="price-change ${changeClass}">
                  <i class="fas ${changeIcon}"></i>
                  ${Math.abs(stock.change)}%
              </div>
          `;

    stockItem.addEventListener("click", () => {
      window.location.href = `../watchlist-individual.html?symbol=${stock.symbol}`;
    });

    watchlistContainer.appendChild(stockItem);
  });
}