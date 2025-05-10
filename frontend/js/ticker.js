import Http from "./http.js";
import Sidebar from "./sidebar.js";
import SearchBar from "./search.js";
import TradeCard from "./trade.js";
import { formatMarketCap } from "./utils.js";
const apiKey = "O0f43W3ucKbFkB32_1JpehLCLIznObMz"; // Replace with your actual API key
var gStockMap = JSON.parse(localStorage.getItem("stockDataCache")) || {};

function drawCandleStickChart(symbol, data) {
  var dom = document.getElementById("candlestickChart");
  dom.style.width = "100%";

  var chart = echarts.init(dom, "dark", {
    renderer: "canvas", // "svg" or "canvas"
    useDirtyRect: false,
    width: "auto",
  });
  // "https://echarts.apache.org/examples/data/asset/data/stock-DJI.json"; exmaple data.
  var app = {};
  var option;

  const upColor = "#13d249";
  const downColor = "#d91c1c";

  chart.setOption(
    (option = {
      animation: true,
      legend: {
        bottom: 10,
        left: "center",
        data: [
          symbol,
          "MA5",
          "MA10",
          "MA20",
          "MA60",
          "MA180",
          "MA250",
          "Volume",
        ],
      },
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "cross",
        },
        borderWidth: 1,
        borderColor: "#ccc",
        padding: 10,
        textStyle: {
          color: "#000",
        },
        position: function (pos, params, el, elRect, size) {
          const obj = {
            top: 10,
          };
          obj[["left", "right"][+(pos[0] < size.viewSize[0] / 2)]] = 30;
          return obj;
        },
        // extraCssText: 'width: 170px'
      },
      darkMode: "auto",
      backgroundColor: "transparent",
      axisPointer: {
        link: [
          {
            xAxisIndex: "all",
          },
        ],
        label: {
          backgroundColor: "#bab5b5",
        },
      },
      toolbox: {
        feature: {
          dataZoom: {
            yAxisIndex: false,
          },
          brush: {
            type: ["lineX", "clear"],
          },
        },
      },
      brush: {
        xAxisIndex: "all",
        brushLink: "all",
        outOfBrush: {
          colorAlpha: 0.9,
        },
      },
      visualMap: {
        show: false,
        seriesIndex: 5,
        dimension: 2,
        pieces: [
          {
            value: 1,
            color: downColor,
          },
          {
            value: -1,
            color: upColor,
          },
        ],
      },
      grid: [
        {
          left: "10%",
          right: "8%",
          height: "50%",
          top: "10%"
        },
        {
          left: "10%",
          right: "8%",
          top: "68%",
          height: "16%",
        },
      ],
      xAxis: [
        {
          type: "category",
          data: data.categoryData,
          boundaryGap: false,
          axisLine: { onZero: false },
          splitLine: { show: false },
          min: "dataMin",
          max: "dataMax",
          axisPointer: {
            z: 100,
          },
        },
        {
          type: "category",
          gridIndex: 1,
          data: data.categoryData,
          boundaryGap: false,
          axisLine: { onZero: false },
          axisTick: { show: false },
          splitLine: { show: false },
          axisLabel: { show: false },
          min: "dataMin",
          max: "dataMax",
        },
      ],
      yAxis: [
        {
          scale: true,
          splitArea: {
            show: false,
          },
          splitLine: {
            show: true,
            lineStyle: {
              type: 'dashed',
              color: 'rgba(180, 180, 180, 0.2)' // Light gray dashed lines
            }
          }
        },
        {
          scale: true,
          gridIndex: 1,
          splitNumber: 2,
          axisLabel: { show: false },
          axisLine: { show: false },
          axisTick: { show: false },
          splitLine: { show: false },
        },
      ],
      dataZoom: [
        {
          type: "inside",
          xAxisIndex: [0, 1],
          start: 0,
          end: 100,
        },
        {
          show: true,
          xAxisIndex: [0, 1],
          type: "slider",
          top: "85%",
          start: 0,
          end: 100,
        },
      ],
      series: [
        {
          name: symbol,
          type: "candlestick",
          data: data.values,
          itemStyle: {
            color: upColor,
            color0: downColor,
            borderColor: undefined,
            borderColor0: undefined,
          },
        },
        {
          name: "MA5",
          type: "line",
          data: calculateMA(5, data),
          smooth: true,
          lineStyle: {
            opacity: 0.5,
          },
        },
        {
          name: "MA10",
          type: "line",
          data: calculateMA(10, data),
          smooth: true,
          lineStyle: {
            opacity: 0.5,
          },
        },
        {
          name: "MA20",
          type: "line",
          data: calculateMA(20, data),
          smooth: true,
          lineStyle: {
            opacity: 0.5,
          },
        },
        {
          name: "MA60",
          type: "line",
          data: calculateMA(60, data),
          smooth: true,
          lineStyle: {
            opacity: 0.5,
          },
        },
        {
          name: "MA180",
          type: "line",
          data: calculateMA(180, data),
          smooth: true,
          lineStyle: {
            opacity: 0.5,
          },
        },
        {
          name: "MA250",
          type: "line",
          data: calculateMA(250, data),
          smooth: true,
          lineStyle: {
            opacity: 0.5,
          },
        },
        {
          name: "Volume",
          type: "bar",
          xAxisIndex: 1,
          yAxisIndex: 1,
          data: data.volumes,
          itemStyle: {
            color: function (params) {
              // Determine the color based on open-close difference
              const ohlc = data.values[params.dataIndex];
              const open = ohlc[0];
              const close = ohlc[1];
              return close >= open ? upColor : downColor;
            },
          },
        },
      ],
    }),
    true,
  );
  chart.dispatchAction({
    type: "brush",
    areas: [
      {
        brushType: "lineX",
        coordRange: [
          data.categoryData[0],
          data.categoryData[data.categoryData.length - 1],
        ],
        xAxisIndex: 0,
      },
    ],
  });
  if (option && typeof option === "object") {
    chart.setOption(option);
  }

  window.addEventListener("resize", chart.resize);
}

function calculateMA(dayCount, data) {
  var result = [];
  for (var i = 0, len = data.values.length; i < len; i++) {
    if (i < dayCount) {
      result.push("-");
      continue;
    }
    var sum = 0;
    for (var j = 0; j < dayCount; j++) {
      sum += data.values[i - j][1];
    }
    result.push(+(sum / dayCount).toFixed(3));
  }
  return result;
}

function saveDataToLocalStorage(symbol, key, data) {
  if (!symbol || !data) {
    console.error("Symbol or data is missing. Cannot save to localStorage.");
    return;
  }
  try {
    const stockMap = JSON.parse(localStorage.getItem("stockDataCache")) || {};
    if (!stockMap[symbol]) {
      stockMap[symbol] = {};
    }
    stockMap[symbol][key] = data;
    localStorage.setItem("stockDataCache", JSON.stringify(stockMap));
  } catch (error) {
    console.error("Error saving data to localStorage:", error);
  }
}

function fillTickerData(symbol, data) {
  drawCandleStickChart(symbol, data);
  drawLineChart(symbol, data);
  fillDayPrice(data);
}

function formatTimestamp(input) {
  let dateObj;
  if (!isNaN(input)) {
    const timestamp = Number(input);
    if (timestamp > 1e10) {
      dateObj = new Date(timestamp); // Milliseconds
    } else {
      dateObj = new Date(timestamp * 1000); // Seconds
    }
  } else {
    dateObj = new Date(input);
  }
  if (isNaN(dateObj.getTime())) {
    throw new Error("Invalid timestamp or date format");
  }
  const yyyyMMdd = dateObj.toISOString().split("T")[0];
  return yyyyMMdd;
  // const yyyyMMddHHmmss = dateObj.toISOString().replace("T", " ").split(".")[0];
  // return {
  //   date: yyyyMMdd,
  //   dateTime: yyyyMMddHHmmss,
  // };
}

function drawCharts(symbol, data, timespan) {
  const categories = []; // X-axis data (dates)
  const ohlcValues = []; // OHLC data for candlestick chart
  const volumes = []; // Volume data for bar chart
  data.forEach((item) => {
    const formattedDate = formatTimestamp(item.timestamp);
    categories.push(formattedDate);
    ohlcValues.push([item.open, item.close, item.low, item.high]);
    volumes.push(item.volume);
  });
  const stockData = {
    categoryData: categories,
    values: ohlcValues,
    volumes: volumes,
  };
  saveDataToLocalStorage(symbol, timespan, stockData);
  fillTickerData(symbol, stockData);
}

function getStockData(symbol, timespan = "daily") {
  if (gStockMap && gStockMap[symbol] && gStockMap[symbol][timespan]) {
    const data = gStockMap[symbol][timespan];
    fillTickerData(symbol, data);
    return true;
  }
  Http.get(`/stock/${symbol}/${timespan}`)
    .then((response) => {
      drawCharts(symbol, response, timespan);
      return true;
    })
    .catch((error) => {
      console.error("Error fetching daily data:", error);
      return false;
    });
}

function fillDayPrice(data) {
  if (!data || !data.values || data.values.length === 0) {
    console.error("No data available to fill day price.");
    return;
  }
  const length = data.values.length;
  const latestData = data.values[length - 1];
  const open = latestData[0];
  const close = latestData[1];
  const low = latestData[2];
  const high = latestData[3];
  const volume = data.volumes[length - 1];
  $("#daysOpen").text(open.toFixed(2));
  $("#closingPrice").text(close.toFixed(2));
  $("#intradayLow").text(low.toFixed(2));
  $("#intradayHigh").text(high.toFixed(2));
  $("#currentPrice").text(close.toFixed(2));
  $("#priceChange").text((close - open).toFixed(2));
  const formatNumber = (num) => {
    if (num >= 1e9) {
      return (num / 1e9).toFixed(2) + "B";
    } else if (num >= 1e6) {
      return (num / 1e6).toFixed(2) + "M";
    } else {
      return num.toFixed(2);
    }
  };

  $("#volume").text(formatNumber(volume));
  $("#turnover").text(formatNumber(volume * close));
  symbolItem.close = close;
  symbolItem.change = close - open;
  symbolItem.percent_change = ((close - open) / open) * 100;
}

function drawLineChart(symbol, data) {
  var dom = document.getElementById("priceChart");
  var chart = echarts.init(dom, null, {
    renderer: "canvas",
    useDirtyRect: false,
  });
  var app = {};
  var option;
  let days = data.values.length;
  let displayData = [];
  for (let i = 1; i < days; i++) {
    displayData.push([data.categoryData[i], data.values[i][1]]); // Close price
  }
  option = {
    tooltip: {
      trigger: "axis",
      position: function (pt) {
        return [pt[0], "10%"];
      },
    },
    title: {
      left: "center",
      text: "Price Chart",
    },
    toolbox: {
      feature: {
        dataZoom: {
          yAxisIndex: "none",
        },
        restore: {},
        saveAsImage: {},
      },
    },
    xAxis: {
      type: "time",
      boundaryGap: false,
    },
    yAxis: {
      type: "value",
      boundaryGap: [0, "100%"],
      startValue: 0,
      splitLine: {
        show: false,
      },
    },
    dataZoom: [
      {
        type: "inside",
        start: 0,
        end: 20,
      },
      {
        start: 0,
        end: 20,
      },
    ],
    series: [
      {
        name: symbol,
        type: "line",
        smooth: true,
        symbol: "none",
        areaStyle: {
          color: "rgba(55, 247, 68, 0.204)",
        },
        lineStyle: {
          color: "#08c53d",
          width: 2,
        },
        data: displayData,
      },
    ],
  };

  if (option && typeof option === "object") {
    chart.setOption(option);
  }

  window.addEventListener("resize", chart.resize);
}

function getNews() {}

class WatchlistItem {
  constructor(symbol, name, close, change, percent_change, market_cap, domain) {
    this.symbol = symbol;
    this.company = name;
    this.close = close;
    this.change = change;
    this.percent_change = percent_change;
    this.market_cap = market_cap;
    this.domain = domain;
  }
}

let symbolItem = new WatchlistItem();

function getTickerOverview(symbol) {
  if (gStockMap && gStockMap[symbol] && gStockMap[symbol]["overview"]) {
    fillOverviewInfo(symbol, gStockMap[symbol]["overview"]);
    return true;
  }
  Http.get(`/stock/${symbol}/overview`)
    .then((response) => {
      saveDataToLocalStorage(symbol, "overview", response);
      fillOverviewInfo(symbol, response);
    })
    .catch((error) => {
      console.error("Error fetching ticker overview data:", error);
    });
}

function website_to_logo(url, symbol) {
  try {
    var domain = url
      .split(/:\/\/|www\./)
      .pop()
      .split("/")[0];
  } catch (error) {
    console.error("Error extracting domain:", error);
    return null;
  }
  const logo = $(
    `<img src="https://www.google.com/s2/favicons?sz=64&domain=${domain}" alt="${symbol} icon" width="15px"/>`,
  );
  return logo;
}

function fillOverviewInfo(symbol, data) {
  const logo_url = `https://www.google.com/s2/favicons?sz=64&domain=${data.company.domain}`;
  $(".stock-company").text(symbol);
  $(".stock-details").text(data.company.name);
  $("#companyLogo").attr("src", logo_url);
  $("#company-name").text(data.company.name);
  $("#company-description").text(data.company.description);
  $("#company-market-cap").text(formatMarketCap(data.market_cap));
  $("#company-employees").text(data.company.total_employees);
  $("#company-phone").text(data.company.phone_number);
  $("#company-homepage")
    .attr("href", `https://${data.company.domain}`)
    .text(data.company.domain);
  $("#company-address").text(data.company.address.address);
  $("#company-city").text(data.company.address.city);
  $("#company-state").text(data.company.address.state);
  $("#company-postal-code").text(data.company.address.post_code);
  // $("#company-logo").attr("src", logo_url);
  // $("#company-icon").attr("src", logo_url);
  symbolItem.symbol = symbol;
  symbolItem.company = data.company.name;
  symbolItem.domain = data.company.domain;
  symbolItem.market_cap = data.market_cap;
}

function setupToggleCandlestickChart(symbol) {
  const daily = $('button[data-timeframe="1D"]');
  const weekly = $('button[data-timeframe="1W"]');
  const monthly = $('button[data-timeframe="1M"]');
  daily.on("click", () => {
    getStockData(symbol, "daily");
  });
  weekly.on("click", () => {
    getStockData(symbol, "weekly");
  });
  monthly.on("click", () => {
    getStockData(symbol, "monthly");
  });
}

function updateWatchlist(isAdd) {
  let watchlist = JSON.parse(localStorage.getItem("watchlist"));
  if (isAdd) {
    watchlist.push(symbolItem);
  } else {
    watchlist = watchlist.filter((item) => item.symbol !== symbolItem.symbol);
  }
  localStorage.setItem("watchlist", JSON.stringify(watchlist));
  Sidebar.getInstance().loadWatchlistFromCache();
}

function addToWatchlist(symbol) {
  $("#followBtn").html('<i class="fas fa-spinner fa-spin"></i> Adding...');
  const requestData = {
    symbol: symbol,
    is_favorite: false,
  };

  Http.post("/stock/watchlist/add", requestData)
    .then(() => {
      $("#followBtn").html('<i class="fas fa-check"></i> Added to Watchlist');
      $("#followBtn").addClass("following");
      updateWatchlist(true);
    })
    .catch((error) => {
      console.error("Error adding to watchlist:", error);

      if (
        error.status === 400 &&
        error.responseJSON &&
        error.responseJSON.msg === "Already in watchlist"
      ) {
        $("#followBtn").html(
          '<i class="fas fa-check"></i> Already in Watchlist',
        );
        $("#followBtn").addClass("following");
      } else if (error.status === 401) {
        $("#followBtn").html('<i class="fas fa-plus"></i> Add to Watchlist');
        alert("Authentication required. Please log in again.");
      } else {
        $("#followBtn").html('<i class="fas fa-plus"></i> Add to Watchlist');
        alert("Failed to add to watchlist. Please try again.");
      }
    });
}

function checkInWatchlist(symbol) {
  Http.get(`/stock/watchlist/exists/${symbol}`)
    .then((response) => {
      if (response.exists) {
        $("#followBtn").html('<i class="fas fa-check"></i> Following');
        $("#followBtn").addClass("following");
      } else {
        $("#followBtn").html('<i class="fas fa-plus"></i> Add to Watchlist');
        $("#followBtn").removeClass("following");
      }
    })
    .catch((error) => {
      console.error("Error checking watchlist:", error);
    });
}

function removeFromWatchlist(symbol) {
  $("#followBtn").html('<i class="fas fa-spinner fa-spin"></i> Removing...');
  Http.post("/stock/watchlist/remove", { symbol })
    .then(() => {
      $("#followBtn").html('<i class="fas fa-plus"></i> Add to Watchlist');
      $("#followBtn").removeClass("following");
      updateWatchlist(false);
    })
    .catch((error) => {
      console.error("Error removing from watchlist:", error);
    });
}

function setupToggleWathclist(symbol) {
  checkInWatchlist(symbol);
  $("#followBtn").on("click", function (event) {
    event.preventDefault();
    const isFollowing = $("#followBtn").hasClass("following");
    isFollowing ? removeFromWatchlist(symbol) : addToWatchlist(symbol);
  });
}

$(document).ready(function () {
  const urlParams = new URLSearchParams(window.location.search);
  const symbol = urlParams.get("symbol") || "META";
  getTickerOverview(symbol);
  getStockData(symbol, "daily");
  setupToggleCandlestickChart(symbol);
  setupToggleWathclist(symbol);
  Sidebar.getInstance();
  SearchBar.getInstance();
  TradeCard.getInstance(symbol);
});
