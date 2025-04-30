document.addEventListener("DOMContentLoaded", function () {
  console.log("Script loaded and running");

  // Theme toggle functionality
  const themeToggle = document.getElementById("themeToggle");
  const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");
  const currentTheme =
    localStorage.getItem("theme") ||
    (prefersDarkScheme.matches ? "dark" : "light");

  // Set initial theme
  document.documentElement.setAttribute("data-theme", currentTheme);
  updateThemeIcon(currentTheme);

  // Toggle theme on button click
  themeToggle.addEventListener("click", function () {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
    updateThemeIcon(newTheme);

    // Update chart theme if it exists
    if (window.priceChart) {
      window.priceChart.updateOptions({
        tooltip: {
          theme: newTheme,
        },
        grid: {
          borderColor: newTheme === "dark" ? "#30363d" : "#e1e4e8",
        },
        xaxis: {
          labels: {
            style: {
              colors: newTheme === "dark" ? "#8b949e" : "#666666",
            },
          },
        },
        yaxis: {
          labels: {
            style: {
              colors: newTheme === "dark" ? "#8b949e" : "#666666",
            },
          },
        },
      });
    }
  });

  function updateThemeIcon(theme) {
    const icon = themeToggle.querySelector("i");
    if (theme === "dark") {
      icon.classList.remove("fa-moon");
      icon.classList.add("fa-sun");
    } else {
      icon.classList.remove("fa-sun");
      icon.classList.add("fa-moon");
    }
  }

  // Tab switching functionality
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

  // Menu item selection
  const menuItems = document.querySelectorAll(".menu-item");
  menuItems.forEach((item) => {
    item.addEventListener("click", function () {
      menuItems.forEach((i) => i.classList.remove("active"));
      this.classList.add("active");
    });
  });

  // Timeframe button selection
  const timeframeBtns = document.querySelectorAll(".timeframe-btn");
  timeframeBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      timeframeBtns.forEach((b) => b.classList.remove("active"));
      this.classList.add("active");

      // Update chart with new timeframe data
      updateChartWithDummyData(this.getAttribute("data-timeframe"));
    });
  });

  // Follow button functionality
  const followBtn = document.getElementById("followBtn");
  followBtn.addEventListener("click", function () {
    if (followBtn.classList.contains("followed")) {
      followBtn.innerHTML = '<i class="fas fa-plus"></i> Follow';
      followBtn.classList.remove("followed");
    } else {
      followBtn.innerHTML = '<i class="fas fa-check"></i> Followed';
      followBtn.classList.add("followed");
    }
  });

  // Search functionality
  const searchInput = document.getElementById("stockSearch");
  const searchResults = document.getElementById("searchResults");

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

  // Initialize chart with proper options
  initializeChart();

  // Initialize chart
  function initializeChart() {
    const theme = document.documentElement.getAttribute("data-theme");
    const isPositive = true; // Default to positive trend

    const chartOptions = {
      series: [
        {
          name: "Price",
          data: generateDummyData("1D"), // Start with 1D timeframe
        },
      ],
      chart: {
        type: "area",
        height: 300,
        width: "100%",
        toolbar: {
          show: false,
        },
        zoom: {
          enabled: false,
        },
        animations: {
          enabled: true,
          dynamicAnimation: {
            speed: 350,
          },
        },
        background: "transparent",
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: "smooth",
        width: 2,
        colors: [
          isPositive ? "var(--positive-color)" : "var(--negative-color)",
        ],
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
          style: {
            colors: theme === "dark" ? "#8b949e" : "#666666",
          },
          datetimeFormatter: {
            year: "yyyy",
            month: "MMM 'yy",
            day: "dd MMM",
            hour: "HH:mm",
          },
        },
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
      },
      yaxis: {
        labels: {
          style: {
            colors: theme === "dark" ? "#8b949e" : "#666666",
          },
          formatter: function (value) {
            return "$" + value.toFixed(2);
          },
        },
      },
      grid: {
        borderColor: theme === "dark" ? "#30363d" : "#e1e4e8",
        strokeDashArray: 4,
        padding: {
          top: 0,
          right: 20,
          bottom: 0,
          left: 20,
        },
      },
      tooltip: {
        theme: theme,
        x: {
          format: "dd MMM yyyy",
        },
        y: {
          formatter: function (value) {
            return "$" + value.toFixed(2);
          },
        },
      },
    };

    const chartElement = document.querySelector("#priceChart");
    if (chartElement) {
      // Check if ApexCharts is available
      if (typeof ApexCharts !== "undefined") {
        window.priceChart = new ApexCharts(chartElement, chartOptions);
        window.priceChart.render();
      } else {
        console.error("ApexCharts library not loaded");
        chartElement.innerHTML =
          '<div style="padding: 20px; text-align: center;">Chart library not loaded</div>';
      }
    } else {
      console.error("Chart container not found");
    }
  }

  // Generate different dummy data based on timeframe
  function generateDummyData(timeframe) {
    const data = [];
    const now = new Date();
    let points = 30;
    let intervalHours = 24;

    switch (timeframe) {
      case "1D":
        points = 24;
        intervalHours = 1; // 1 hour intervals
        break;
      case "1W":
        points = 7;
        intervalHours = 24; // 1 day intervals
        break;
      case "1M":
        points = 30;
        intervalHours = 24; // 1 day intervals
        break;
      case "1Y":
        points = 12;
        intervalHours = 24 * 30; // 1 month intervals
        break;
      case "ALL":
        points = 10;
        intervalHours = 24 * 365; // 1 year intervals
        break;
    }

    // Starting price and trend
    let price = 145;
    let trend = Math.random() > 0.5 ? 1 : -1;
    let volatility = 0.01;

    // Adjust volatility based on timeframe
    if (timeframe === "1Y" || timeframe === "ALL") volatility = 0.05;

    // Generate data points
    for (let i = 0; i < points; i++) {
      const date = new Date(now);
      date.setHours(now.getHours() - (points - i) * intervalHours);

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

  // Update chart with new data based on timeframe selection
  function updateChartWithDummyData(timeframe) {
    if (!window.priceChart) return;

    const newData = generateDummyData(timeframe);
    const isPositive = newData[0][1] < newData[newData.length - 1][1];

    window.priceChart.updateOptions({
      series: [
        {
          data: newData,
        },
      ],
      stroke: {
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
          format: getTooltipDateFormat(timeframe),
        },
      },
    });
  }

  // Get appropriate date format for chart tooltip based on timeframe
  function getTooltipDateFormat(timeframe) {
    switch (timeframe) {
      case "1D":
        return "HH:mm";
      case "1W":
        return "'yy-MM-dd";
      case "1M":
      case "1Y":
        return "'yy-MM";
      case "ALL":
        return "'yy";
      default:
        return "'yy-MM";
    }
  }

  // Update chart theme when theme changes
  const observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      if (mutation.attributeName === "data-theme" && window.priceChart) {
        const theme = document.documentElement.getAttribute("data-theme");
        window.priceChart.updateOptions({
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
          },
          yaxis: {
            labels: {
              style: {
                colors: theme === "dark" ? "#8b949e" : "#666666",
              },
            },
          },
        });
      }
    });
  });

  observer.observe(document.documentElement, {
    attributes: true,
  });
});
