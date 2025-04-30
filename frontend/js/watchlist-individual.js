/**
 * Update charts theme when theme changes
 * @param {string}

/**
 * Setup chart controls (buttons)
 */
function setupChartControls() {
  // Get chart control buttons
  const moveLeftBtn = document.getElementById("chartMoveLeft");
  const moveRightBtn = document.getElementById("chartMoveRight");
  const zoomInBtn = document.getElementById("chartZoomIn");
  const zoomOutBtn = document.getElementById("chartZoomOut");
  const resetBtn = document.getElementById("chartReset");

  // Reset zoom and pan state variables
  window.chartZoomLevel = window.chartZoomLevel || 0;
  window.chartPanPosition = window.chartPanPosition || 0;

  // Set zoom and pan limits
  const MAX_ZOOM = 5;
  const MIN_ZOOM = -2;
  const MAX_PAN = 300;

  // Move left
  if (moveLeftBtn) {
    moveLeftBtn.addEventListener("click", function () {
      console.log("Chart move left clicked");
      if (window.priceChart && window.chartPanPosition > -MAX_PAN) {
        window.chartPanPosition -= 50;
        try {
          // move line chart
          window.priceChart.zoomX(
            window.priceChart.w.globals.minX - 50000000, // Use larger value for noticeable movement
            window.priceChart.w.globals.maxX - 50000000,
          );
          // move candlestick chart
          window.candlestickChart.zoomX(
            window.candlestickChart.w.globals.minX - 50000000,
            window.candlestickChart.w.globals.maxX - 50000000,
          );
        } catch (e) {
          console.error("Error moving chart left:", e);
        }
      }
    });
  }

  // Move right
  if (moveRightBtn) {
    moveRightBtn.addEventListener("click", function () {
      console.log("Chart move right clicked");
      if (window.priceChart && window.chartPanPosition < MAX_PAN) {
        window.chartPanPosition += 50;
        try {
          // move line chart
          window.priceChart.zoomX(
            window.priceChart.w.globals.minX + 50000000,
            window.priceChart.w.globals.maxX + 50000000,
          );
          // move candlestick chart
          window.candlestickChart.zoomX(
            window.candlestickChart.w.globals.minX + 50000000,
            window.candlestickChart.w.globals.maxX + 50000000,
          );
        } catch (e) {
          console.error("Error moving chart right:", e);
        }
      }
    });
  }

  // Zoom in
  if (zoomInBtn) {
    zoomInBtn.addEventListener("click", function () {
      console.log("Chart zoom in clicked");
      if (window.priceChart && window.chartZoomLevel < MAX_ZOOM) {
        window.chartZoomLevel++;

        try {
          const currentMin = window.priceChart.w.globals.minX;
          const currentMax = window.priceChart.w.globals.maxX;
          const range = currentMax - currentMin;
          const zoomFactor = 0.2; // Zoom 20% each time

          const newMin = currentMin + (range * zoomFactor) / 2;
          const newMax = currentMax - (range * zoomFactor) / 2;

          zoomCharts(newMin, newMax);
        } catch (e) {
          console.error("Error zooming in chart:", e);
        }
      }
    });
  }

  // Zoom out
  if (zoomOutBtn) {
    zoomOutBtn.addEventListener("click", function () {
      console.log("Chart zoom out clicked");
      if (window.priceChart && window.chartZoomLevel > MIN_ZOOM) {
        window.chartZoomLevel--;

        try {
          const currentMin = window.priceChart.w.globals.minX;
          const currentMax = window.priceChart.w.globals.maxX;
          const range = currentMax - currentMin;
          const zoomFactor = 0.25; // Zoom out 25% each time

          const newMin = currentMin - (range * zoomFactor) / 2;
          const newMax = currentMax + (range * zoomFactor) / 2;

          zoomCharts(newMin, newMax);
        } catch (e) {
          console.error("Error zooming out chart:", e);
        }
      }
    });
  }

  // Reset
  if (resetBtn) {
    resetBtn.addEventListener("click", function () {
      console.log("Chart reset clicked");
      // Reset zoom and pan state
      window.chartZoomLevel = 0;
      window.chartPanPosition = 0;

      // Use timeframe to update charts, return to initial state
      try {
        const activeTimeframe = document.querySelector(".timeframe-btn.active");
        const timeframe = activeTimeframe
          ? activeTimeframe.getAttribute("data-timeframe")
          : "1D";

        updateChartWithDummyData(timeframe);
      } catch (e) {
        console.error("Error resetting chart:", e);

        // Backup reset method
        if (window.priceChart) {
          window.priceChart.updateSeries([
            {
              data: window.originalChartData,
            },
          ]);
        }
        if (window.candlestickChart) {
          window.candlestickChart.updateSeries([
            {
              data: window.candlestickData,
            },
          ]);
        }
      }
    });
  }

  // Setup mouse wheel scrolling for chart zooming
  setupChartScrolling();
  console.log("Chart controls have been set up");
}

/**
 * Initialize the charts
 */
function initializeChart() {
  // Get the current theme
  const theme = document.body.getAttribute("data-theme");
  const isPositive = true; // Default to positive trend

  // Adjust chart heights based on screen resolution
  const chartHeights = calculateChartHeight();
  // Get the heights for each chart
  const lineChartHeight = chartHeights.lineChartHeight;
  const candleChartHeight = chartHeights.candleChartHeight;
  const volumeChartHeight = chartHeights.volumeChartHeight;

  window.originalChartData = generateDummyData("1D");
  window.candlestickData = generateCandlestickData("1D");

  try {
    window.volumeData = generateVolumeData(window.candlestickData);
  } catch (error) {
    console.error("Error generating volume data:", error);
    window.volumeData = [];
  }

  const chartOptions = {
    series: [
      {
        name: "Price",
        data: window.originalChartData, // Start with 1D timeframe
      },
    ],
    chart: {
      type: "area",
      width: "100%",
      height: lineChartHeight,
      id: "priceChart",
      group: "stock-charts",
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: true,
        type: "x",
        autoScaleYaxis: true,
      },
      pan: {
        enabled: true,
        type: "x",
      },
      animations: {
        enabled: true,
        dynamicAnimation: {
          speed: 350,
        },
      },
      background: "transparent",
    },
    title: {
      text: "Price Chart",
      align: "left",
      style: {
        fontSize: "14px",
        fontWeight: "bold",
        color: theme === "dark" ? "#8b949e" : "#666666",
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth",
      width: 2,
      colors: [isPositive ? "var(--positive-color)" : "var(--negative-color)"],
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.2,
        stops: [0, 100],
        colorStops: [
          {
            offset: 0,
            color: isPositive
              ? "var(--positive-color)"
              : "var(--negative-color)",
            opacity: 0.2,
          },
          {
            offset: 100,
            color: isPositive
              ? "var(--positive-color)"
              : "var(--negative-color)",
            opacity: 0,
          },
        ],
      },
    },
    xaxis: {
      type: "datetime",
      labels: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: getYAxisConfig("price"),
    tooltip: {
      theme: theme,
      x: {
        format: "yyyy-MM-dd",
      },
      y: {
        formatter: function (value) {
          return "$" + value.toFixed(2);
        },
      },
    },
  };

  // Create candlestick chart options
  const candlestickOptions = {
    series: [
      {
        name: "Candlestick",
        data: window.candlestickData,
      },
    ],
    chart: {
      type: "candlestick",
      height: candleChartHeight,
      width: "100%",
      id: "candlestickChart",
      group: "stock-charts",
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false, // Disable zoom for candlestick chart
      },
      animations: {
        enabled: false,
      },
      background: "transparent",
    },
    plotOptions: {
      candlestick: {
        colors: {
          upward: "var(--positive-color)",
          downward: "var(--negative-color)",
        },
      },
    },
    xaxis: {
      type: "datetime",
      labels: {
        style: {
          colors: theme === "dark" ? "#8b949e" : "#666666",
        },
        datetimeFormatter: {
          year: "yyyy",
          month: "yy/MM",
          day: "MM/dd",
          hour: "HH:mm",
        },
      },
    },
    yaxis: getYAxisConfig("candlestick"),
    tooltip: {
      theme: theme,
      x: {
        format: "yyyy-MM-dd",
      },
      y: {
        formatter: function (value) {
          return "$" + value.toFixed(2);
        },
      },
    },
  };

  // Create volume chart options
  const volumeOptions = {
    series: [
      {
        name: "Volume",
        data: window.volumeData,
      },
    ],
    chart: {
      type: "bar",
      height: volumeChartHeight,
      width: "100%",
      id: "volumeChart",
      group: "stock-charts",
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
      animations: {
        enabled: false,
      },
    },
    title: {
      text: "Trading Volume",
      align: "left",
      style: {
        fontSize: "14px",
        fontWeight: "bold",
        color: theme === "dark" ? "#8b949e" : "#666666",
      },
    },
    plotOptions: {
      bar: {
        columnWidth: "80%",
      },
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      type: "datetime",
      labels: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      labels: {
        show: true,
        style: {
          colors: theme === "dark" ? "#8b949e" : "#666666",
          fontSize: "14px",
        },
      },
    },
    tooltip: {
      theme: theme,
      shared: true,
      intersect: false,
      x: {
        format: "yyyy-MM-dd",
      },
      y: {
        formatter: function (value) {
          return value.toLocaleString();
        },
      },
    },
    states: {
      hover: {
        filter: "none",
      },
    },
  };

  const chartElement = document.querySelector("#priceChart");
  const candlestickElement = document.querySelector("#candlestickChart");
  const volumeElement = document.querySelector("#volumeChart");

  if (chartElement && candlestickElement && volumeElement) {
    // Check if ApexCharts is available
    if (typeof ApexCharts !== "undefined") {
      // Create the area chart
      window.priceChart = new ApexCharts(chartElement, chartOptions);
      window.candlestickChart = new ApexCharts(
        candlestickElement,
        candlestickOptions,
      );
      window.volumeChart = new ApexCharts(volumeElement, volumeOptions);

      // Render the charts
      window.priceChart.render();
      window.volumeChart.render();
      window.candlestickChart.render();

      // Ensure chart controls are set up
      setupChartControls();
    } else {
      console.error("ApexCharts library not loaded");
      chartElement.innerHTML =
        '<div style="padding: 20px; text-align: center;">Chart library not loaded</div>';
    }
  } else {
    console.error("Chart container not found");
  }
}

/**
 * Initialize theme observer
 */
function initThemeObserver() {
  // Update chart theme when theme changes
  const observer = new MutationObserver(function (mutations) {
    // Skip the first observer update to avoid unnecessary processing
    if (window.skipNextObserverUpdate) {
      window.skipNextObserverUpdate = false;
      return;
    }

    for (const mutation of mutations) {
      if (mutation.attributeName === "data-theme") {
        const theme = document.body.getAttribute("data-theme");
        console.log(`MutationObserver detected theme change to: ${theme}`);

        // Check if theme change is already being processed
        if (!window.isThemeChanging) {
          updateChartsTheme(theme);
        } else {
          console.log(
            "Theme update already in progress, skipping duplicate update",
          );
        }
        break;
      }
    }
  });

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
}

/**
 * Handle window resize events for chart rescaling
 */
function setupResizeHandler() {
  window.addEventListener("resize", function () {
    // Debounce the resize event to avoid excessive updates
    if (window.resizeTimeout) {
      clearTimeout(window.resizeTimeout);
    }

    this.resizeTimer = setTimeout(function () {
      // Get new dynamic heights
      const chartHeights = calculateChartHeight();

      if (window.priceChart) {
        window.priceChart.updateOptions(
          {
            chart: {
              height: chartHeights.lineChartHeight,
            },
            // Update Y-axis config directly here
            yaxis: getYAxisConfig("price"),
          },
          true,
          true,
        ); // Force redraw
      }

      if (window.candlestickChart) {
        window.candlestickChart.updateOptions(
          {
            chart: {
              height: chartHeights.candleChartHeight,
            },
            yaxis: getYAxisConfig("candlestick"),
          },
          true,
          true,
        ); // Force redraw
      }

      if (window.volumeChart) {
        window.volumeChart.updateOptions(
          {
            chart: {
              height: chartHeights.volumeChartHeight,
            },
            yaxis: getYAxisConfig("volume"),
          },
          true,
          true,
        ); // Force redraw
      }

      // Finally force re-render all charts
      setTimeout(() => {
        if (window.priceChart) window.priceChart.render();
        if (window.candlestickChart) window.candlestickChart.render();
        if (window.volumeChart) window.volumeChart.render();
      }, 100);
    }, 300);
  });
}

/**
 * Initialize event handlers for document ready
 */
document.addEventListener("DOMContentLoaded", function () {
  console.log("Script loaded and running");

  // Initialize theme system
  initThemeToggle();

  // Set global ApexCharts options
  if (typeof ApexCharts !== "undefined") {
    const currentTheme = document.body.getAttribute("data-theme") || "dark";

    Apex = {
      grid: {
        borderColor: currentTheme === "dark" ? "#30363d" : "#e1e4e8",
        strokeDashArray: 4,
        padding: {
          top: 0,
          right: 20,
          bottom: 0,
          left: 20,
        },
      },
      chart: {
        fontFamily: "Arial, sans-serif",
      },
      xaxis: {
        labels: {
          style: {
            fontSize: "14px",
          },
        },
        axisBorder: {
          show: true,
          color: currentTheme === "dark" ? "#30363d" : "#e1e4e8",
          offsetX: 0,
          offsetY: 0,
          strokeDashArray: 4,
        },
      },
      yaxis: {
        labels: {
          style: {
            fontSize: "14px",
          },
          formatter: function (value) {
            if (value >= 100000) return (value / 1000000).toFixed(2) + "M";
            return value.toFixed(2);
          },
        },
        decimalsInFloat: 2,
      },
    };
  }

  // Initialize UI components
  initTabSwitching();
  initTimeframeButtons();
  initFollowButton();
  initSearchFunctionality();

  // Initialize charts
  initializeChart();

  // Setup theme observer
  initThemeObserver();

  // Setup window resize handler
  setupResizeHandler();
});

/**
 * Initialize follow button functionality
 */
function initFollowButton() {
  // Store followed stock data
  let followedStocks = JSON.parse(localStorage.getItem("followedStocks")) || {};

  // Follow button functionality
  const followBtn = document.getElementById("followBtn");
  if (followBtn) {
    // Check if the current stock is already followed and update button state
    const currentSymbol =
      document.querySelector(".stock-details")?.textContent.split(": ")[1] ||
      "AAPL";
    const isFollowed = followedStocks[currentSymbol];

    if (isFollowed) {
      followBtn.innerHTML = '<i class="fas fa-check"></i> Followed';
      followBtn.classList.add("followed");
    }

    // Initialize stock logo on page load
    const stockCompany =
      document.querySelector(".stock-company")?.textContent || "Apple Inc.";
    updateStockLogo(stockCompany, currentSymbol);

    followBtn.addEventListener("click", function () {
      const stockCompany =
        document.querySelector(".stock-company")?.textContent || "Apple Inc.";
      const stockSymbol =
        document.querySelector(".stock-details")?.textContent.split(": ")[1] ||
        "AAPL";

      if (followBtn.classList.contains("followed")) {
        // Unfollow the stock
        followBtn.innerHTML = '<i class="fas fa-plus"></i> Follow';
        followBtn.classList.remove("followed");

        // Remove from localStorage
        delete followedStocks[stockSymbol];
        localStorage.setItem("followedStocks", JSON.stringify(followedStocks));

        // Remove from watchlist if exists
        const watchlistItem = document.querySelector(
          `.watchlist-item[data-symbol="${stockSymbol}"]`,
        );
        if (watchlistItem) {
          watchlistItem.remove();
        }
      } else {
        // Follow the stock
        followBtn.innerHTML = '<i class="fas fa-check"></i> Followed';
        followBtn.classList.add("followed");

        // Generate a random trend for the mini chart
        const trendIsPositive = Math.random() > 0.5;
        const trendPath = trendIsPositive
          ? "M1,15 L10,13 L20,10 L30,8 L40,5 L50,3 L59,1"
          : "M1,5 L10,8 L20,12 L30,10 L40,13 L50,15 L59,18";
        const trendColor = trendIsPositive
          ? "var(--positive-color)"
          : "var(--negative-color)";

        // Get the logo URL if we already fetched it for the stock logo
        const stockLogoImg = document.querySelector(".stock-logo img");
        const logoUrl = stockLogoImg?.src || null;

        // Save to localStorage with timestamp
        followedStocks[stockSymbol] = {
          name: stockCompany,
          symbol: stockSymbol,
          dateAdded: new Date().toISOString(),
          logo: logoUrl, // Use the already fetched logo if available
        };
        localStorage.setItem("followedStocks", JSON.stringify(followedStocks));

        // Add to watchlist
        addToWatchlist(stockCompany, stockSymbol, trendPath, trendColor);

        // Try to fetch logo for watchlist if we don't have it yet
        if (!logoUrl) {
          fetchCompanyLogo(stockCompany, stockSymbol);
        } else {
          // Use the existing logo for the watchlist
          updateWatchlistLogo(stockSymbol, logoUrl);
        }
      }
    });
  }
}

/**
 * Initialize search functionality
 */
function initSearchFunctionality() {
  const searchInput = document.getElementById("stockSearch");
  const searchResults = document.getElementById("searchResults");

  if (searchInput && searchResults) {
    searchInput.addEventListener("input", function () {
      const query = this.value.trim();

      if (query.length >= 2) {
        // Show dummy search results
        searchResults.innerHTML = `
                <div class="search-item">
                    <div class="search-stock-icon" style="background-color: #ff9900;">
                        A
                    </div>
                    <div class="search-stock-info">
                        <div class="search-stock-name">Apple Inc.</div>
                        <div class="search-stock-symbol">AAPL · NASDAQ</div>
                    </div>
                </div>
                <div class="search-item">
                    <div class="search-stock-icon" style="background-color: #3b82f6;">
                        A
                    </div>
                    <div class="search-stock-info">
                        <div class="search-stock-name">Amazon.com Inc.</div>
                        <div class="search-stock-symbol">AMZN · NASDAQ</div>
                    </div>
                </div>
            `;
        searchResults.classList.add("active");

        // Add click event to search items
        setupSearchItemEvents();
      } else {
        searchResults.innerHTML = "";
        searchResults.classList.remove("active");
      }
    });

    // Close search results when clicking outside
    document.addEventListener("click", function (event) {
      if (
        !searchInput.contains(event.target) &&
        !searchResults.contains(event.target)
      ) {
        searchResults.classList.remove("active");
      }
    });
  }
}

/**
 * Add click events to search items
 */
function setupSearchItemEvents() {
  document.querySelectorAll(".search-item").forEach((item) => {
    item.addEventListener("click", function () {
      const symbol = this.querySelector(
        ".search-stock-symbol",
      ).textContent.split(" · ")[0];
      const name = this.querySelector(".search-stock-name").textContent;

      // Update UI with the selected stock info
      updateMainContentWithStock(name, symbol);

      // Hide search results
      document.getElementById("searchResults").classList.remove("active");
    });
  });
}

/**
 * Zoom all charts to the same X range
 * @param {number} newMin - New minimum X value
 * @param {number} newMax - New maximum X value
 */
function zoomCharts(newMin, newMax) {
  if (window.priceChart) {
    window.priceChart.zoomX(newMin, newMax);
  }
  if (window.candlestickChart) {
    window.candlestickChart.zoomX(newMin, newMax);
  }
  if (window.volumeChart) {
    window.volumeChart.zoomX(newMin, newMax);
  }
}

/**
 * Setup chart scrolling with mouse wheel
 */
function setupChartScrolling() {
  const chartContainer = document.querySelector(".chart-container");

  if (chartContainer) {
    // Prevent wheel event propagation
    chartContainer.addEventListener(
      "wheel",
      function (e) {
        // Prevent event bubbling to document
        e.stopPropagation();

        // Get current zoom level
        const currentMin = window.priceChart.w.globals.minX;
        const currentMax = window.priceChart.w.globals.maxX;
        const range = currentMax - currentMin;

        // Zoom based on wheel direction
        if (e.deltaY < 0) {
          // Scroll up - zoom in
          const newMin = currentMin + range * 0.1;
          const newMax = currentMax - range * 0.1;
          zoomCharts(newMin, newMax);
          window.chartZoomLevel++;
        } else {
          // Scroll down - zoom out
          const newMin = currentMin - range * 0.1;
          const newMax = currentMax + range * 0.1;
          zoomCharts(newMin, newMax);
          window.chartZoomLevel--;
        }

        // Prevent default behavior (page scrolling)
        e.preventDefault();
      },
      { passive: false },
    );
  }
}
/* theme - The theme to apply ('light' or 'dark')
 */
function updateChartsTheme(theme) {
  console.log(`Updating charts theme to: ${theme}`);

  // Set flag to prevent duplicated processing
  window.isThemeChanging = true;

  // Store current chart ranges and tick settings before updating
  const chartState = {
    price: window.priceChart
      ? {
          min: window.priceChart.w.globals.minY,
          max: window.priceChart.w.globals.maxY,
          tickAmount: window.priceChart.w.config.yaxis.tickAmount,
        }
      : null,
    candlestick: window.candlestickChart
      ? {
          min: window.candlestickChart.w.globals.minY,
          max: window.candlestickChart.w.globals.maxY,
          tickAmount: window.candlestickChart.w.config.yaxis.tickAmount,
        }
      : null,
    volume: window.volumeChart
      ? {
          min: window.volumeChart.w.globals.minY,
          max: window.volumeChart.w.globals.maxY,
          tickAmount: window.volumeChart.w.config.yaxis.tickAmount,
        }
      : null,
  };

  console.log("Saved chart state:", chartState);

  // Create common chart update options
  setTimeout(() => {
    try {
      // Get current active timeframe
      const activeTimeframe = document.querySelector(".timeframe-btn.active");
      const timeframe = activeTimeframe
        ? activeTimeframe.getAttribute("data-timeframe")
        : "1D";
      // Generate new data
      const newPriceData = generateDummyData(timeframe);
      const newCandlestickData = generateCandlestickData(timeframe);
      const newVolumeData = generateVolumeData(newCandlestickData);

      // Update global data variables
      window.originalChartData = newPriceData;
      window.candlestickData = newCandlestickData;
      window.volumeData = newVolumeData;

      // Update chart theme if it exists
      const chartUpdateOptions = {
        tooltip: {
          theme: theme,
        },
        grid: {
          borderColor: theme === "dark" ? "#30363d" : "#e1e4e8",
        },
        xaxis: {
          labels: {
            style: {
              colors: theme === "dark" ? "#8b949e" : "#666666",
            },
          },
          axisBorder: {
            color: theme === "dark" ? "#30363d" : "#e1e4e8",
          },
        },
      };

      if (window.priceChart) {
        window.priceChart.updateOptions(
          {
            ...chartUpdateOptions,
            yaxis: getYAxisConfig("price"), // y-axis configuration
          },
          true,
        );
      }

      if (window.candlestickChart) {
        window.candlestickChart.updateOptions(
          {
            ...chartUpdateOptions,
            yaxis: getYAxisConfig("candlestick"),
          },
          true,
        );
      }

      if (window.volumeChart) {
        window.volumeChart.updateOptions({
          ...chartUpdateOptions,
          yaxis: getYAxisConfig("volume"), // y-axis configuration
        });
      }
    } catch (error) {
      console.error("updateChartsTheme error:", error);
    } finally {
      // Reset flag
      setTimeout(() => {
        window.isThemeChanging = false;
      }, 200); // Use a longer delay to ensure all operations are completed
    }
  }, 50);
}

/**
 * Initialize theme toggle and set initial theme
 */
function initThemeToggle() {
  const themeToggle = document.getElementById("themeToggle");

  if (!themeToggle) return;

  const icon = themeToggle.querySelector("i");
  const text = themeToggle.querySelector("span");

  // Check for saved theme preference or use default
  const currentTheme = localStorage.getItem("theme") || "dark"; // Default to dark
  document.body.setAttribute("data-theme", currentTheme);

  // Add event listener for theme toggle button
  themeToggle.addEventListener("click", function () {
    const currentTheme = document.body.getAttribute("data-theme");
    const newTheme = currentTheme === "light" ? "dark" : "light";

    // Update data-theme attribute
    document.body.setAttribute("data-theme", newTheme);

    updateChartsTheme(newTheme);

    // Update icon and text
    if (newTheme === "light") {
      icon.classList.remove("fa-moon");
      icon.classList.add("fa-sun");
      text.textContent = "Light Mode";
    } else {
      icon.classList.remove("fa-sun");
      icon.classList.add("fa-moon");
      text.textContent = "Dark Mode";
    }

    // Save preference
    setTimeout(() => {
      localStorage.setItem("theme", newTheme);
    }, 0);
  });
}

/**
 * Initialize tab switching functionality
 */
function initTabSwitching() {
  const tabs = document.querySelectorAll(".tab");
  tabs.forEach((tab) => {
    tab.addEventListener("click", function () {
      tabs.forEach((t) => t.classList.remove("active"));
      this.classList.add("active");

      const tabId = this.textContent.toLowerCase().trim() + "-tab";

      document.querySelectorAll(".tab-pane").forEach((pane) => {
        pane.classList.remove("active");
      });

      const tabPane = document.getElementById(tabId);
      if (tabPane) {
        tabPane.classList.add("active");
      }
    });
  });

  // Initialize tab setup
  const defaultTab = document.querySelector(".tab");
  if (defaultTab) {
    defaultTab.click(); // Activate the first tab by default
  }
}

/**
 * Generate different dummy data based on timeframe
 * @param {string} timeframe - Timeframe to generate data for (1D, 1W, 1M, 1Y, ALL)
 * @returns {Array} Array of [timestamp, price] data points
 */
function generateDummyData(timeframe) {
  const data = [];
  const now = new Date();
  let points, intervalHours;

  switch (timeframe) {
    case "1D":
      points = 90;
      intervalHours = 1 / 4; // 15 mins intervals
      break;
    case "1W":
      points = 90;
      intervalHours = 24 * 7; // 1 day intervals
      break;
    case "1M":
      points = 90;
      intervalHours = 24 * 30; // 1 day intervals
      break;
    case "1Y":
      points = 90;
      intervalHours = 24 * 30; // 1 month intervals
      break;
    case "ALL":
      points = 12;
      intervalHours = 24 * 365; // 1 year intervals
      break;
    default:
      points = 30;
      intervalHours = 24; // Default to 1 day intervals
  }

  // Check for high-resolution screens and adjust accordingly
  const isHighResScreen =
    window.screen.width >= 1920 || window.screen.height >= 1080;
  if (isHighResScreen) {
    // high-res screen, double the number of points
    points = points * 2;
    // reduce interval to half to maintain the same time span
    intervalHours = intervalHours / 2;
  }

  // Starting price and trend
  let price = 145;
  let trend = Math.random() > 0.5 ? 1 : -1;
  let volatility = 0.01;

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

    // Correctly adjust date based on time period
    if (timeframe === "1D") {
      date.setMinutes(now.getMinutes() - (points - i) * 15); // Every 15 minutes
    } else if (timeframe === "1W") {
      date.setDate(now.getDate() - (points - i)); // Every 1 day
    } else if (timeframe === "1M") {
      date.setDate(now.getDate() - (points - i)); // Every 1 day
    } else if (timeframe === "1Y") {
      date.setDate(now.getDate() - (points - i)); // Every 4 days
    } else if (timeframe === "ALL") {
      date.setMonth(now.getMonth() - (points - i)); // Every 1 month
    } else {
      date.setHours(now.getHours() - (points - i) * intervalHours);
    }

    // Add some randomness to the price
    const change = (Math.random() - 0.5) * volatility * price;
    price += trend * Math.abs(change);

    // Occasionally change trend direction
    if (Math.random() < 0.1) trend *= -1;

    // Keep price within reasonable bounds
    price = Math.max(price, 100);
    price = Math.min(price, 200);

    data.push([date.getTime(), price]);
  }

  return data;
}

/**
 * Generate different dummy data based on timeframe for candlestick chart
 * @param {string} timeframe - Timeframe to generate data for (1D, 1W, 1M, 1Y, ALL)
 * @returns {Array} Array of candlestick data points
 */
function generateCandlestickData(timeframe) {
  const data = [];
  const now = new Date();
  let points, intervalHours;

  // Determine number of points and interval based on timeframe
  switch (timeframe) {
    case "1D":
      points = 90;
      intervalHours = 1 / 4; // 15 mins intervals
      break;
    case "1W":
      points = 90;
      intervalHours = 24 * 7; // 1 day intervals
      break;
    case "1M":
      points = 90;
      intervalHours = 24 * 30; // 1 day intervals
      break;
    case "1Y":
      points = 90;
      intervalHours = 24 * 30; // 1 month intervals
      break;
    case "ALL":
      points = 12;
      intervalHours = 24 * 365; // 1 year intervals
      break;
    default:
      points = 30;
      intervalHours = 24; // Default to 1 day intervals
  }

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

    // Adjust date based on timeframe
    if (timeframe === "1D") {
      date.setMinutes(now.getMinutes() - (points - i) * 15); // Every 15 minutes
    } else if (timeframe === "1W") {
      date.setDate(now.getDate() - (points - i)); // Every 1 day
    } else if (timeframe === "1M") {
      date.setDate(now.getDate() - (points - i)); // Every 1 day
    } else if (timeframe === "1Y") {
      date.setDate(now.getDate() - (points - i)); // Every 4 days
    } else if (timeframe === "ALL") {
      date.setMonth(now.getMonth() - (points - i)); // Every 1 month
    } else {
      date.setHours(now.getHours() - (points - i) * intervalHours);
    }

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

/**
 * Generate volume data based on candlestick data
 * @param {Array} candlestickData - Candlestick data to base volume on
 * @returns {Array} Array of volume data points
 */
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
      const [open, high, low, close] = candle.y;

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

/**
 * Get appropriate date format for chart tooltip based on timeframe
 * @param {string} timeframe - The timeframe (1D, 1W, 1M, 1Y, ALL)
 * @returns {string} Date format string
 */
function getTooltipDateFormat(timeframe) {
  switch (timeframe) {
    case "1D":
      return "HH:mm";
    case "1W":
      return "yy-MM-dd";
    case "1M":
      return "yy-MM-dd";
    case "1Y":
      return "yyyy-MM";
    case "ALL":
      return "yy/MM";
    default:
      return "yyyy-MM-dd";
  }
}

/**
 * Get Y-axis configuration for charts
 * @param {string} chartType - Type of chart (price, candlestick, volume)
 * @returns {Object} Y-axis configuration
 */
function getYAxisConfig(chartType = "price") {
  const theme = document.body.getAttribute("data-theme");
  const isHighResScreen =
    window.screen.width >= 1920 || window.screen.height >= 1080;

  // Dynamically calculate chart heights based on chartType and screen size
  let chartHeight;
  const chartHeights = calculateChartHeight();

  if (chartType === "candlestick") {
    chartHeight = chartHeights.candleChartHeight;
  } else if (chartType === "volume") {
    chartHeight = chartHeights.volumeChartHeight;
  } else {
    chartHeight = chartHeights.lineChartHeight;
  }

  // Calculate optimal tick amount based on chart height
  // More space = more ticks, but with diminishing returns
  let tickAmount;
  if (chartType === "price" || chartType === "candlestick") {
    // Higher density for price-related charts (more ticks)
    tickAmount = Math.max(5, Math.min(12, Math.floor(chartHeight / 40)));
  } else {
    // Lower density for volume chart
    tickAmount = Math.max(3, Math.min(6, Math.floor(chartHeight / 60)));
  }

  // Base configuration for all chart types
  const config = {
    labels: {
      style: {
        colors: theme === "dark" ? "#8b949e" : "#666666",
        fontSize: isHighResScreen ? "13px" : "12px",
      },
      formatter: function (value) {
        // Format based on chart type
        if (chartType === "volume") {
          // Volume chart formatting
          if (value >= 1000000) {
            return (value / 1000000).toFixed(1) + "M";
          } else if (value >= 1000) {
            return (value / 1000).toFixed(0) + "K";
          }
          return value.toFixed(0);
        } else {
          // Price charts formatting
          if (value >= 10000) {
            return "$" + (value / 1000).toFixed(1) + "K";
          } else if (value >= 100) {
            return "$" + value.toFixed(0);
          } else if (value >= 10) {
            return "$" + value.toFixed(1);
          }
          return "$" + value.toFixed(2);
        }
      },
    },
    tickAmount: tickAmount,
    forceNiceScale: true,
    tooltip: {
      enabled: true,
    },
    crosshairs: {
      show: true,
      position: "back",
      stroke: {
        color: theme === "dark" ? "#8b949e" : "#b6b6b6",
        width: 1,
        dashArray: 0,
      },
    },
  };

  // Sync Y-axis ranges for price and candlestick charts
  if (chartType === "price" || chartType === "candlestick") {
    try {
      // Ensure data is available to calculate range
      let minPrice = null;
      let maxPrice = null;

      // Try to get range from existing chart data
      if (
        window.candlestickChart &&
        window.candlestickChart.w &&
        window.candlestickChart.w.globals
      ) {
        // Prioritize getting range from candlestick data
        const candleData =
          window.candlestickData || window.candlestickChart.w.globals.series[0];

        if (candleData && candleData.length > 0) {
          // Calculate min and max values from candlestick data
          minPrice = Infinity;
          maxPrice = -Infinity;

          for (let i = 0; i < candleData.length; i++) {
            const candle = candleData[i];
            if (candle && candle.y) {
              const [open, high, low, close] = candle.y;
              minPrice = Math.min(minPrice, low);
              maxPrice = Math.max(maxPrice, high);
            }
          }

          // Add margin
          if (minPrice !== Infinity && maxPrice !== -Infinity) {
            const padding = (maxPrice - minPrice) * 0.1;
            config.min = Math.max(0, minPrice - padding); // Ensure not less than 0, unless data is less than 0
            config.max = maxPrice + padding;

            console.log(
              `Y-axis range(${chartType}): ${config.min.toFixed(
                2,
              )} - ${config.max.toFixed(2)}`,
            );
          }
        }
      }

      // If range wasn't set above, use fallback
      if (
        minPrice === null ||
        maxPrice === null ||
        minPrice === Infinity ||
        maxPrice === -Infinity
      ) {
        // Use price chart data as backup
        if (
          window.priceChart &&
          window.priceChart.w &&
          window.priceChart.w.globals
        ) {
          // Use current displayed min/max values
          config.min = window.priceChart.w.globals.minY * 0.95;
          config.max = window.priceChart.w.globals.maxY * 1.05;
        } else {
          // If neither is available, use a proportional method
          config.min = function (min) {
            return min * 0.95;
          };
          config.max = function (max) {
            return max * 1.05;
          };
        }
      }
    } catch (e) {
      console.log("Error calculating Y-axis range:", e);
      // Use default range
      config.min = function (min) {
        return min * 0.95;
      };
      config.max = function (max) {
        return max * 1.05;
      };
    }
  } else if (chartType === "volume") {
    // Volume should start from 0
    config.min = 0;
    config.max = function (max) {
      return max * 1.1;
    };
  }

  // Additional settings for different chart types
  if (chartType === "volume") {
    config.decimalsInFloat = 0;
  } else {
    config.decimalsInFloat = 2;
  }

  return config;
}

/**
 * Calculate chart heights based on screen size
 * @returns {Object} Object with heights for different chart types
 */
function calculateChartHeight() {
  // Get viewport height and calculate chart heights
  const viewportHeight = window.innerHeight;
  // Calculate chart percentages based on viewport, considering screen resolution
  const isHighResScreen =
    window.screen.width >= 1920 || window.screen.height >= 1080;

  // Base height percentages - can be adjusted as needed
  const lineChartHeightPercent = 0.18; // 18% of viewport
  const candleChartHeightPercent = 0.3; // 30% of viewport
  const volumeChartHeightPercent = 0.15; // 15% of viewport

  // Increase chart size for high-resolution screens
  const scaleFactor = isHighResScreen ? 1.1 : 1;

  // Calculate pixel heights, with minimum heights to ensure proper display on small screens
  const lineHeight = Math.max(
    120,
    Math.round(viewportHeight * lineChartHeightPercent * scaleFactor),
  );
  const candleHeight = Math.max(
    200,
    Math.round(viewportHeight * candleChartHeightPercent * scaleFactor),
  );
  const volumeHeight = Math.max(
    100,
    Math.round(viewportHeight * volumeChartHeightPercent * scaleFactor),
  );

  // Ensure the total height doesn't exceed viewport
  const totalHeight = lineHeight + candleHeight + volumeHeight;
  const maxAllowedHeight = viewportHeight * 0.8; // Max 80% of viewport

  // If charts would exceed max allowed height, proportionally reduce them
  if (totalHeight > maxAllowedHeight) {
    const reductionFactor = maxAllowedHeight / totalHeight;
    return {
      lineChartHeight: Math.round(lineHeight * reductionFactor),
      candleChartHeight: Math.round(candleHeight * reductionFactor),
      volumeChartHeight: Math.round(volumeHeight * reductionFactor),
    };
  }

  return {
    lineChartHeight: lineHeight,
    candleChartHeight: candleHeight,
    volumeChartHeight: volumeHeight,
  };
}

/**
 * Update chart with new data based on timeframe selection
 * @param {string} timeframe - The timeframe to update chart with
 */
function updateChartWithDummyData(timeframe) {
  if (!window.priceChart || !window.candlestickChart || !window.volumeChart) {
    console.error("One or more charts not initialized");
    return;
  }

  // Generate new data based on selected timeframe
  const newData = generateDummyData(timeframe);
  const newCandlestickData = generateCandlestickData(timeframe);
  const newVolumeData = generateVolumeData(newCandlestickData);

  // save new data to global variables
  window.originalChartData = newData;
  window.candlestickData = newCandlestickData;
  window.volumeData = newVolumeData;

  // price trend
  // Determine if the trend is positive or negative
  const isPositive = newData[0][1] < newData[newData.length - 1][1];
  const tooltipFormat = getTooltipDateFormat(timeframe);

  // reset zoom and pan
  // Reset zoom and pan state variables
  window.chartZoomLevel = 0;
  window.chartPanPosition = 0;

  // use new data to update chart
  try {
    // update line chart
    window.priceChart.updateSeries([{ data: newData }], false);
    window.candlestickChart.updateSeries([{ data: newCandlestickData }], false);
    window.volumeChart.updateSeries([{ data: newVolumeData }], false);
    setTimeout(() => {
      const priceYAxis = getYAxisConfig("price");
      const candlestickYAxis = getYAxisConfig("candlestick");
      const volumeYAxis = getYAxisConfig("volume");

      console.log("New Y-axis configuration calculated:");
      console.log("Price chart Y-axis config:", priceYAxis);
      console.log("Candlestick chart Y-axis config:", candlestickYAxis);
      console.log("Volume chart Y-axis config:", volumeYAxis);

      window.priceChart.updateOptions(
        {
          stroke: {
            curve: "smooth",
            colors: [
              isPositive ? "var(--positive-color)" : "var(--negative-color)",
            ],
          },
          fill: {
            gradient: {
              colorStops: [
                {
                  offset: 0,
                  color: isPositive
                    ? "var(--positive-color)"
                    : "var(--negative-color)",
                  opacity: 0.2,
                },
                {
                  offset: 100,
                  color: isPositive
                    ? "var(--positive-color)"
                    : "var(--negative-color)",
                  opacity: 0,
                },
              ],
            },
          },
          tooltip: {
            x: {
              format: tooltipFormat,
            },
          },
          yaxis: priceYAxis, // price chart
        },
        true,
        true,
      );

      // Delay updating other charts to avoid concurrent rendering issues
      setTimeout(() => {
        window.candlestickChart.updateOptions(
          {
            tooltip: {
              x: { format: tooltipFormat },
            },
            yaxis: candlestickYAxis, // Use cloned configuration
          },
          true,
          true,
        ); // Force redraw and maintain type

        setTimeout(() => {
          window.volumeChart.updateOptions(
            {
              tooltip: {
                x: { format: tooltipFormat },
              },
              yaxis: volumeYAxis, // Use cloned configuration
            },
            true,
            true,
          ); // Force redraw and maintain type

          // Finally force re-render all charts
          setTimeout(() => {
            window.priceChart.render();
            window.candlestickChart.render();
            window.volumeChart.render();
            console.log(
              "Charts updated successfully for timeframe:",
              timeframe,
            );
          }, 100);
        }, 50);
      }, 50);
    }, 50);
  } catch (error) {
    console.error("Error updating charts:", error);
  }
}

/**
 * Initialize timeframe buttons
 */
function initTimeframeButtons() {
  const timeframeBtns = document.querySelectorAll(".timeframe-btn");
  timeframeBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      console.log(
        "Timeframe button clicked:",
        this.getAttribute("data-timeframe"),
      );

      // Remove all active states
      timeframeBtns.forEach((b) => b.classList.remove("active"));
      // Add active state to current button
      this.classList.add("active");

      // Get timeframe and update chart
      const timeframe = this.getAttribute("data-timeframe");
      updateChartWithDummyData(timeframe);
    });
  });
}

/**
 * Function to guess a company's domain name
 * @param {string} companyName - Name of the company
 * @returns {string} Guessed domain name
 */
function guessDomainFromCompany(companyName) {
  // Remove common corporate suffixes and spaces
  let domain = companyName
    .toLowerCase()
    .replace(
      /\s+inc\.?$|\s+incorporated$|\s+corp\.?$|\s+corporation$|\s+llc$|\s+ltd\.?$|\s+limited$|\s+sa$|\s+s\.a\.$/i,
      "",
    )
    .replace(/[\s\'\"\,\.\&]+/g, "")
    .trim();

  // Special cases for common companies
  const specialCases = {
    apple: "apple.com",
    amazon: "amazon.com",
    microsoft: "microsoft.com",
    google: "google.com",
    alphabet: "abc.xyz",
    tesla: "tesla.com",
    facebook: "fb.com",
    meta: "meta.com",
    netflix: "netflix.com",
    spotify: "spotify.com",
  };

  if (specialCases[domain]) {
    return specialCases[domain];
  }

  // Default fallback
  return domain + ".com";
}

/**
 * Generate a consistent color from a string
 * @param {string} name - String to generate color from
 * @returns {string} Hex color code
 */
function getColorFromName(name) {
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Convert to hex color
  let color = "#";
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff;
    color += ("00" + value.toString(16)).substr(-2);
  }

  return color;
}

/**
 * Update the main stock logo
 * @param {string} name - Company name
 * @param {string} symbol - Stock symbol
 */
function updateStockLogo(name, symbol) {
  const stockLogo = document.querySelector(".stock-logo");
  if (!stockLogo) return;

  // Check if we already have the logo in localStorage
  const followedStocks =
    JSON.parse(localStorage.getItem("followedStocks")) || {};

  if (followedStocks[symbol] && followedStocks[symbol].logo) {
    stockLogo.innerHTML = `<img src="${followedStocks[symbol].logo}" alt="${name}" >`;
  } else {
    // If not followed or no logo, try to fetch it
    const domain = guessDomainFromCompany(name);
    const logoUrl = `https://logo.clearbit.com/${domain}`;

    // Create an image element to test if the logo exists
    const logoImg = new Image();
    logoImg.onload = function () {
      // Logo loaded successfully
      stockLogo.innerHTML = `<img src="${logoUrl}" alt="${name}">`;

      // Save to followedStocks if this stock is followed
      if (followedStocks[symbol]) {
        followedStocks[symbol].logo = logoUrl;
        localStorage.setItem("followedStocks", JSON.stringify(followedStocks));
      }
    };

    logoImg.onerror = function () {
      // Use default or placeholder
      stockLogo.innerHTML = `<img src="/api/placeholder/40/40" alt="${name}">`;
    };

    logoImg.src = logoUrl;
  }
}

/**
 * Update watchlist item with logo
 * @param {string} symbol - Stock symbol
 * @param {string} logoUrl - URL of the logo image
 */
function updateWatchlistLogo(symbol, logoUrl) {
  const watchlistItem = document.querySelector(
    `.watchlist-item[data-symbol="${symbol}"]`,
  );
  if (!watchlistItem) return;

  const iconElement = watchlistItem.querySelector(".watchlist-icon");
  if (iconElement) {
    // Replace the letter with an image
    iconElement.innerHTML = `<img src="${logoUrl}" alt="${symbol}" style="width: 100%; height: 100%; object-fit: contain;">`;
    iconElement.style.backgroundColor = "transparent";
  }
}

/**
 * Fetch company logo using Clearbit API
 * @param {string} companyName - Name of the company
 * @param {string} symbol - Stock symbol
 */
function fetchCompanyLogo(companyName, symbol) {
  // First try with Clearbit API (which is free and doesn't require API key)
  const domain = guessDomainFromCompany(companyName);
  const clearbitUrl = `https://logo.clearbit.com/${domain}`;

  // Create an image element to test if the logo exists
  const logoImg = new Image();
  logoImg.onload = function () {
    // Logo loaded successfully, update the watchlist item
    updateWatchlistLogo(symbol, clearbitUrl);

    // Also update localStorage
    const followedStocks =
      JSON.parse(localStorage.getItem("followedStocks")) || {};
    if (followedStocks[symbol]) {
      followedStocks[symbol].logo = clearbitUrl;
      localStorage.setItem("followedStocks", JSON.stringify(followedStocks));
    }
  };

  logoImg.onerror = function () {
    // Fallback to a placeholder or leave as is
    console.log(`Could not load logo for ${companyName}`);
  };

  logoImg.src = clearbitUrl;
}

/**
 * Add a stock to the watchlist
 * @param {string} name - Company name
 * @param {string} symbol - Stock symbol
 * @param {string} trendPath - SVG path for trend line
 * @param {string} trendColor - Color for trend line
 */
function addToWatchlist(name, symbol, trendPath, trendColor) {
  const watchlistContainer = document.getElementById("watchlistContainer");
  if (!watchlistContainer) {
    console.error("Watchlist container not found");
    return;
  }

  // Generate a random background color based on the company name
  const backgroundColor = getColorFromName(name);

  // Create a new watchlist item
  const watchlistItem = document.createElement("div");
  watchlistItem.className = "watchlist-item";
  watchlistItem.setAttribute("data-symbol", symbol);

  watchlistItem.innerHTML = `
        <div class="watchlist-icon" style="background-color: ${backgroundColor};">${name.charAt(
          0,
        )}</div>
        <div class="watchlist-info">
            <div class="stock-name">${name}</div>
            <div class="stock-symbol">${symbol}</div>
        </div>
        <div class="stock-chart">
            <svg width="60" height="24" viewBox="0 0 60 24">
                <path d="${trendPath}" stroke="${trendColor}" fill="none" stroke-width="1.5" />
            </svg>
        </div>
    `;

  // Add click event to the watchlist item
  watchlistItem.addEventListener("click", function () {
    // Update the main content with this stock's information
    updateMainContentWithStock(name, symbol);
  });

  // Add to the watchlist container
  watchlistContainer.appendChild(watchlistItem);
}

/**
 * Update main content with selected stock
 * @param {string} name - Company name
 * @param {string} symbol - Stock symbol
 */
function updateMainContentWithStock(name, symbol) {
  // Update stock title and details
  const stockCompanyEl = document.querySelector(".stock-company");
  const stockDetailsEl = document.querySelector(".stock-details");

  if (stockCompanyEl) stockCompanyEl.textContent = name;
  if (stockDetailsEl) stockDetailsEl.textContent = `NASDAQ: ${symbol}`;

  // Update follow button state
  const followBtn = document.getElementById("followBtn");
  const followedStocks =
    JSON.parse(localStorage.getItem("followedStocks")) || {};

  if (followBtn) {
    if (followedStocks[symbol]) {
      followBtn.innerHTML = '<i class="fas fa-check"></i> Followed';
      followBtn.classList.add("followed");
    } else {
      followBtn.innerHTML = '<i class="fas fa-plus"></i> Follow';
      followBtn.classList.remove("followed");
    }
  }

  // Update chart with new data
  updateChartWithDummyData("1D");

  // Update breadcrumb
  const breadcrumbSpan = document.querySelector(".breadcrumb span");
  if (breadcrumbSpan) {
    breadcrumbSpan.textContent = name;
  }

  // Update stock logo
  updateStockLogo(name, symbol);
}
