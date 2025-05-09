// https://polygon.io/docs/rest/stocks/tickers/ticker-overview this for company logo and description and financials
import Sidebar from "./sidebar.js";
const apiKey = "O0f43W3ucKbFkB32_1JpehLCLIznObMz"; // Replace with your actual API key
var gStockMap = JSON.parse(localStorage.getItem("stockDataCache")) || {};

function drawCandleStickChart(symbol, data) {
  var dom = document.getElementById("candlestickChart");
  var chart = echarts.init(dom, "dark", {
    renderer: "canvas", // "svg" or "canvas"
    useDirtyRect: false,
  });
  // "https://echarts.apache.org/examples/data/asset/data/stock-DJI.json"; exmaple data.
  var app = {};
  var option;

  const upColor = "#08c53d";
  const downColor = "#ec0000";

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
        },
        {
          left: "10%",
          right: "8%",
          top: "63%",
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

function loadFromLocalStorage(symbol) {
  if (!symbol) {
    console.error("Symbol is missing. Cannot retrieve data from localStorage.");
    return false;
  }
  try {
    fillData(symbol, gStockMap[symbol]);
    return true;
  } catch (error) {
    console.error("Error retrieving data from localStorage:", error);
    return false;
  }
}

function fillTickerData(symbol, data) {
  drawCandleStickChart(symbol, data);
  fillDayPrice(symbol, data);
  drawLineChart(symbol, data);
}

function fillData(symbol, data) {
  fillTickerData(symbol, data["history"]);
  fillOverviewInfo(symbol, data["overview"]);
}

async function fetchStockData(
  symbol,
  multiplier = 1,
  timespan = "day",
  fromDate = "2025-01-01",
  toDate = "2025-03-31",
  limit = 120,
) {
  if (gStockMap && gStockMap[symbol] && gStockMap[symbol]["hisotry"]) {
    fillTickerData(symbol, gStockMap[symbol]["history"]);
    return true;
  }
  const url = `https://api.polygon.io/v2/aggs/ticker/${symbol}/range/${multiplier}/${timespan}/${fromDate}/${toDate}?adjusted=true&sort=asc&limit=${limit}&apiKey=${apiKey}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Error fetching data: ${response.statusText}`);
    }
    const data = await response.json();
    const categories = []; // X-axis data (dates)
    const ohlcValues = []; // OHLC data for candlestick chart
    const volumes = []; // Volume data for bar chart
    data.results.forEach((item) => {
      const date = new Date(item.t);
      const formattedDate = date.toISOString().split("T")[0]; // Format as YYYY-MM-DD
      categories.push(formattedDate);
      ohlcValues.push([item.o, item.c, item.l, item.h]); // Open, Close, Low, High
      volumes.push(item.v); // Volume
    });
    const stockData = {
      categoryData: categories,
      values: ohlcValues,
      volumes: volumes,
    };
    saveDataToLocalStorage(symbol, "history", stockData); // Save data to localStorage
    drawCandleStickChart(symbol, stockData);
    drawLineChart(symbol, stockData);
    fillDayPrice(symbol, stockData);
    return true;
  } catch (error) {
    console.error("Error fetching candlestick data:", error);
    return false;
  }
}

function fillDayPrice(symbol, data) {
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

async function getTickerOverview(symbol) {
  if (gStockMap && gStockMap[symbol] && gStockMap[symbol]["overview"]) {
    fillOverviewInfo(symbol, gStockMap[symbol]["overview"]);
    return true;
  }
  const url = `https://api.polygon.io/v3/reference/tickers/${symbol}?apiKey=${apiKey}`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Error fetching data: ${response.statusText}`);
    }
    const data = await response.json();
    console.log("overview:", data.results);
    saveDataToLocalStorage(symbol, "overview", data.results); // Save data to localStorage
    fillOverviewInfo(symbol, data.results);
    return true;
  } catch (error) {
    console.error("Error fetching candlestick data:", error);
    return false;
  }
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
  $(".stock-company").text(symbol);
  $(".stock-details").text(data.name);
  $("#companyLogo").attr("src", `${data.branding.icon_url}?apiKey=${apiKey}`);
  // const logo = $(".stock-logo");
  // logo.append(website_to_logo(symbol, data.homepage_url));
  // $("#companyDescription").text(data.description);

  // Fill company information
  $("#company-name").text(data.name);
  $("#company-description").text(data.description);
  $("#company-market-cap").text(
    `$${(data.market_cap / 1e12).toFixed(2)} Trillion`,
  );
  $("#company-employees").text(data.total_employees);
  $("#company-phone").text(data.phone_number);
  $("#company-homepage")
    .attr("href", data.homepage_url)
    .text(data.homepage_url);

  // Fill address
  $("#company-address").text(data.address.address1);
  $("#company-city").text(data.address.city);
  $("#company-state").text(data.address.state);
  $("#company-postal-code").text(data.address.postal_code);

  // Fill branding
  $("#company-logo").attr("src", `${data.branding.logo_url}?apiKey=${apiKey}`);
  $("#company-icon").attr("src", `${data.branding.icon_url}?apiKey=${apiKey}`);
}

// Function to handle the "Add to Watchlist" button click
function addToWatchlist(symbol) {
  // Get the current symbol from the URL parameters or use default
  const urlParams = new URLSearchParams(window.location.search);
  const currentSymbol = symbol || urlParams.get("symbol") || "AAPL";

  // Change button state immediately for better user feedback
  $("#followBtn").html('<i class="fas fa-spinner fa-spin"></i> Adding...');

  // Send the request to the server
  const requestData = {
    symbol: currentSymbol,
    is_favorite: false
  };

  // Use the fetch API to send the request
  Http.post("/stock/watchlist/add", requestData)
    .then(data => {
      console.log("Added to watchlist:", data);
      $("#followBtn").html('<i class="fas fa-check"></i> Added to Watchlist');
      $("#followBtn").addClass("following");
    })
    .catch(error => {
      console.error("Error adding to watchlist:", error);
      
      if (error.status === 400 && error.responseJSON && error.responseJSON.msg === "Already in watchlist") {
        $("#followBtn").html('<i class="fas fa-check"></i> Already in Watchlist');
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

$(document).ready(function () {
  const urlParams = new URLSearchParams(window.location.search);
  const symbol = urlParams.get("symbol") || "META";
  fetchStockData(symbol);
  getTickerOverview(symbol);
  
  // Add event listener for the follow button
  $("#followBtn").on("click", function() {
    addToWatchlist();
  });

  Sidebar.getInstance();

});
