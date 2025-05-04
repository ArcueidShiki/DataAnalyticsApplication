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
    changeDirection
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
        stock.changeDirection
      )
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
      "up"
    ),
    new Stock(
      "MSFT",
      "MSFT",
      290.12,
      0.89,
      0.31,
      "2.17T",
      "microsoft.com",
      "up"
    ),
    new Stock(
      "GOOGL",
      "GOOGL",
      2300.45,
      -1.23,
      -1.01,
      "1.54T",
      "google.com",
      "down"
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
      "down"
    ),
  ];
}

function generateDummyData(timeframe) {
  const data = [];
  const now = new Date();
  let points, intervalHours;

  const timeframeConfig = {
    "1D": { points: 90, intervalHours: 1 / 4 }, // 15 mins intervals
    "1W": { points: 90, intervalHours: 24 * 7 }, // 1 day intervals
    "1M": { points: 90, intervalHours: 24 * 30 }, // 1 day intervals
    "1Y": { points: 90, intervalHours: 24 * 30 }, // 1 month intervals
    "ALL": { points: 12, intervalHours: 24 * 365 }, // 1 year intervals
    default: { points: 30, intervalHours: 24 }, // Default to 1 day intervals
  };

  const config = timeframeConfig[timeframe] || timeframeConfig.default;
  points = config.points;
  intervalHours = config.intervalHours;
  const isHighResScreen =
    window.screen.width >= 1920 || window.screen.height >= 1080;
  if (isHighResScreen) {
    points = points * 2;
    intervalHours = intervalHours / 2;
  }

  let price = 145;
  let trend = Math.random() > 0.5 ? 1 : -1;
  let volatility = 0.01;

  if (
    timeframe === "1Y" ||
    timeframe === "ALL" ||
    timeframe === "1M" ||
    timeframe === "1W"
  )
  volatility = 0.05;

  for (let i = 0; i < points; i++) {
    const date = new Date(now);

    const timeframeAdjustments = {
      "1D": () => date.setMinutes(now.getMinutes() - (points - i) * 15),
      "1W": () => date.setDate(now.getDate() - (points - i)),
      "1M": () => date.setDate(now.getDate() - (points - i)),
      "1Y": () => date.setDate(now.getDate() - (points - i)),
      "ALL": () => date.setMonth(now.getMonth() - (points - i)),
      default: () => date.setHours(now.getHours() - (points - i) * intervalHours),
    };

    (timeframeAdjustments[timeframe] || timeframeAdjustments.default)();

    const change = (Math.random() - 0.5) * volatility * price;
    price += trend * Math.abs(change);

    if (Math.random() < 0.1) trend *= -1;

    price = Math.max(price, 100);
    price = Math.min(price, 200);

    data.push([date.getTime(), price]);
  }

  return data;
}

function generateCandlestickData(timeframe) {
  const data = [];
  const now = new Date();
  let points, intervalHours;

  const timeframeConfig = {
    "1D": { points: 90, intervalHours: 1 / 4 }, // 15 mins intervals
    "1W": { points: 90, intervalHours: 24 * 7 }, // 1 day intervals
    "1M": { points: 90, intervalHours: 24 * 30 }, // 1 day intervals
    "1Y": { points: 90, intervalHours: 24 * 30 }, // 1 month intervals
    "ALL": { points: 12, intervalHours: 24 * 365 }, // 1 year intervals
    default: { points: 30, intervalHours: 24 }, // Default to 1 day intervals
  };

  const config = timeframeConfig[timeframe] || timeframeConfig.default;
  points = config.points;
  intervalHours = config.intervalHours;
  // Check for high-resolution screens and adjust accordingly
  const isHighResScreen =
    window.screen.width >= 1920 || window.screen.height >= 1080;
  if (isHighResScreen) {
    // high-res screen, double the number of points
    points = points * 2;
    // reduce interval to half to maintain the same time span
    intervalHours = intervalHours / 2;
  }

  // Starting price and volatility parameters
  let price = 145;
  let volatility = 0.02;

  // Adjust volatility based on timeframe
  if (
    timeframe === "1Y" ||
    timeframe === "ALL" ||
    timeframe === "1M" ||
    timeframe === "1W"
  )
    volatility = 0.05;

  // Generate data points
  for (let i = 0; i < points; i++) {
    const date = new Date(now);

    const timeframeAdjustments = {
      "1D": () => date.setMinutes(now.getMinutes() - (points - i) * 15),
      "1W": () => date.setDate(now.getDate() - (points - i)),
      "1M": () => date.setDate(now.getDate() - (points - i)),
      "1Y": () => date.setDate(now.getDate() - (points - i)),
      "ALL": () => date.setMonth(now.getMonth() - (points - i)),
      default: () => date.setHours(now.getHours() - (points - i) * intervalHours),
    };

    (timeframeAdjustments[timeframe] || timeframeAdjustments.default)();
    // Generate OHLC data with some randomness
    const priceChange = (Math.random() - 0.5) * volatility * price;
    const open = price;
    // Add some randomness to high and low prices
    const high = open + Math.abs(priceChange) * Math.random() * 2;
    const low = open - Math.abs(priceChange) * Math.random() * 2;
    const close = open + priceChange;

    // Update price for next iteration
    price = close;

    // Keep price within reasonable bounds
    price = Math.max(price, 100);
    price = Math.min(price, 200);

    data.push({
      x: date.getTime(),
      y: [open, high, low, close].map((p) => parseFloat(p.toFixed(2))),
    });
  }

  return data;
}

function generateVolumeData(candlestickData) {
  // Generate volume data based on candlestick data
  const data = [];

  if (!candlestickData || !Array.isArray(candlestickData)) {
    console.error("Invalid candlestick data format:", candlestickData);
    return [];
  }

  // Generate corresponding volume for each candlestick data point
  for (let i = 0; i < candlestickData.length; i++) {
    const candle = candlestickData[i];

    try {
      const timestamp = candle.x;
      const [open, , , close] = candle.y;

      // Generate volume based on price movement
      const priceChange = Math.abs(close - open);
      const baseVolume = Math.random() * 1000000 + 500000;
      const volume = baseVolume * (1 + priceChange / 5);

      // Set color based on price movement
      const isPositive = close >= open;

      data.push({
        x: timestamp,
        y: Math.round(volume),
        fillColor: isPositive
          ? "var(--positive-color)"
          : "var(--negative-color)",
      });
    } catch (error) {
      console.error("Error processing candle data:", error, candle);
    }
  }
  return data;
}
