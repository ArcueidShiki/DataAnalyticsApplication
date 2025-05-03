/* eslint-disable no-undef */

function loadWatchlist() {
  const table = $('#watchlistTableBody')
  table.empty();
  Http.get('/watchlist/show')
    .then((stocks) => {
      stocks.forEach((stock) => {
        const changeClass = stock.change >= 0 ? "positive" : "negative";
        const changeIcon = stock.change >= 0 ? "fa-caret-up" : "fa-caret-down";
        const changePrefix = stock.change >= 0 ? "+" : "-";
        const row = $(`
          <div class="watchlist-row watchlist-stock-row">
              <div>${stock.symbol}</div>
              <div>${stock.info}</div>
              <div>$${stock.close.toFixed(2)}</div>
              <div class="price-change ${changeClass}">
                  <i class="fas ${changeIcon}"></i>
                  ${changePrefix}$${Math.abs(stock.percent_change).toFixed(2)}
              </div>
              <div class="price-change ${changeClass}">
                  <i class="fas ${changeIcon}"></i>
                  ${changePrefix}${Math.abs(stock.percent_change).toFixed(2)}%
              </div>
              <div>${stock.marketCap}</div>
          <div>
        `)
        row.on('click', () => {
          window.location.href = `../watchlist-individual.html?symbol=${stock.symbol}`;
        });
        table.append(row);
      });
      return true;
    })
    .catch((error) => {
      console.error('Error loading watchlist:', error);
    });
  return false;
}

$(document).ready(function () {
  if (!loadWatchlist()) {
    // from server
    popluateWatchlistTable();
  }
});
