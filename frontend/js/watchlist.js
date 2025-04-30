document.addEventListener("DOMContentLoaded", function () {
  const watchlistStocks = [
    {
      symbol: "AAPL",
      name: "Apple Inc.",
      price: 147.04,
      change: 1.47,
      changePercent: 1.47,
      marketCap: "2.45T",
      changeDirection: "up",
    },
    {
      symbol: "MSFT",
      name: "Microsoft Corp.",
      price: 290.12,
      change: 0.89,
      changePercent: 0.31,
      marketCap: "2.17T",
      changeDirection: "up",
    },
    {
      symbol: "GOOGL",
      name: "Alphabet Inc.",
      price: 2300.45,
      change: -23.56,
      changePercent: -1.01,
      marketCap: "1.54T",
      changeDirection: "down",
    },
    {
      symbol: "AMZN",
      name: "Amazon.com Inc.",
      price: 3380.5,
      change: 72.68,
      changePercent: 2.15,
      marketCap: "1.72T",
      changeDirection: "up",
    },
    {
      symbol: "TSLA",
      name: "Tesla Inc.",
      price: 687.2,
      change: -5.15,
      changePercent: -0.75,
      marketCap: "692.4B",
      changeDirection: "down",
    },
  ];

  populateWatchlistTable();

  function populateWatchlistTable() {
    const tableBody = document.getElementById("watchlistTableBody");
    if (!tableBody) return;

    tableBody.innerHTML = "";

    watchlistStocks.forEach((stock) => {
      const row = document.createElement("div");
      row.className = "watchlist-row watchlist-stock-row";

      const changeClass =
        stock.changeDirection === "up" ? "positive" : "negative";
      const changeIcon =
        stock.changeDirection === "up" ? "fa-caret-up" : "fa-caret-down";
      const changePrefix = stock.changeDirection === "up" ? "+" : "";

      row.innerHTML = `
                <div>${stock.symbol}</div>
                <div>${stock.name}</div>
                <div>$${stock.price.toFixed(2)}</div>
                <div class="price-change ${changeClass}">
                    <i class="fas ${changeIcon}"></i>
                    ${changePrefix}$${Math.abs(stock.change).toFixed(2)}
                </div>
                <div class="price-change ${changeClass}">
                    <i class="fas ${changeIcon}"></i>
                    ${changePrefix}${Math.abs(stock.changePercent).toFixed(2)}%
                </div>
                <div>${stock.marketCap}</div>
            `;

      row.addEventListener("click", function () {
        window.location.href = `watchlist-individual.html?symbol=${stock.symbol}`;
      });

      tableBody.appendChild(row);
    });
  }
});
