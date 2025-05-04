/* eslint-disable no-unused-vars */
/* All the dummy data generated in this file */

class Stock {
  constructor(
    symbol,
    name,
    price,
    change,
    percent_change,
    marketCap,
    domain,
    changeDirection,
  ) {
    this.symbol = symbol;
    this.name = name;
    this.price = price;
    this.change = change;
    this.percent_change = percent_change;
    this.marketCap = marketCap;
    this.domain = domain;
    this.changeDirection = changeDirection;
  }
}

function getStockObjects() {
  const mockStocks = getMockStocks();
  return mockStocks.map(
    (stock) =>
      new Stock(
        stock.symbol,
        stock.name,
        stock.price,
        stock.change,
        stock.percent_change,
        stock.marketCap,
        stock.domain,
        stock.changeDirection,
      ),
  );
}

function getMockStocks() {
  return [
    new Stock(
      "AAPL",
      "Apple Inc.",
      147.04,
      1.47,
      1.47,
      "2.45T",
      "apple.com",
      "up",
    ),
    new Stock(
      "MSFT",
      "MSFT",
      290.12,
      0.89,
      0.31,
      "2.17T",
      "microsoft.com",
      "up",
    ),
    new Stock(
      "GOOGL",
      "GOOGL",
      2300.45,
      -1.23,
      -1.01,
      "1.54T",
      "google.com",
      "down",
    ),
    new Stock("AMZN", "AMZN", 3380.5, 2.15, 2.15, "1.72T", "amazon.com", "up"),
    new Stock(
      "TSLA",
      "TSLA",
      687.2,
      -0.75,
      -0.75,
      "692.4B",
      "tesla.com",
      "down",
    ),
  ];
}
