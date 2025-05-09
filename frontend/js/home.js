/* eslint-disable no-undef */
document.addEventListener("DOMContentLoaded", function () {
  // Tab switching functionality
  const tabs = document.querySelectorAll(".tab");
  const menuItems = document.querySelectorAll(".menu-item");

  tabs.forEach((tab) => {
    tab.addEventListener("click", function () {
      // Remove active class from all tabs
      tabs.forEach((t) => t.classList.remove("active"));

      // Add active class to clicked tab
      this.classList.add("active");
    });
  });

  // Menu item selection
  menuItems.forEach((item) => {
    item.addEventListener("click", function () {
      // Remove active class from all menu items
      menuItems.forEach((i) => i.classList.remove("active"));

      // Add active class to clicked item
      this.classList.add("active");
    });
  });

  // Sidebar collapse functionality
  const collapseBtn = document.querySelector(".collapse-btn");
  const sidebar = document.querySelector(".sidebar");

  collapseBtn.addEventListener("click", function () {
    sidebar.classList.toggle("collapsed");
  });

  // Save button functionality
  const saveBtn = document.querySelector(".save-btn");
  saveBtn.addEventListener("click", function () {
    this.classList.toggle("saved");
  });

  // Theme toggle functionality
  const themeToggleBtn = document.querySelector(".theme-toggle-btn");
  themeToggleBtn.addEventListener("click", function () {
    document.body.classList.toggle("light-theme");

    const isDark = !document.body.classList.contains("light-theme");
    this.innerHTML = isDark
      ? '<i class="fas fa-moon"></i><span>Dark Mode</span>'
      : '<i class="fas fa-sun"></i><span>Light Mode</span>';

    // Update chart theme
    updateChartTheme(isDark);
  });

  // Search functionality
  const searchInput = document.getElementById("searchInput");
  const searchResults = document.getElementById("searchResults");
  const searchResultItems = document.querySelectorAll(".search-result-item");

  // Show/hide search results on focus
  searchInput.addEventListener("focus", function () {
    searchResults.style.display = "block";
  });

  // Hide search results when clicking outside
  document.addEventListener("click", function (event) {
    if (
      !searchInput.contains(event.target) &&
      !searchResults.contains(event.target)
    ) {
      searchResults.style.display = "none";
    }
  });

  // Filter search results as user types
  searchInput.addEventListener("input", function () {
    const query = this.value.toLowerCase();

    searchResultItems.forEach((item) => {
      const symbol = item
        .querySelector(".result-symbol")
        .textContent.toLowerCase();
      const name = item.querySelector(".result-name").textContent.toLowerCase();

      if (symbol.includes(query) || name.includes(query)) {
        item.style.display = "block";
      } else {
        item.style.display = "none";
      }
    });

    // Show the dropdown if there are matches and input has content
    if (query.length > 0) {
      searchResults.style.display = "block";
    } else {
      searchResults.style.display = "none";
    }
  });

  // Handle selection of a search result
  searchResultItems.forEach((item) => {
    item.addEventListener("click", function () {
      const symbol = this.getAttribute("data-symbol");
      const name = this.querySelector(".result-name").textContent;

      // Update displayed stock info (in a real app, you'd fetch data from API)
      document.querySelector(".card-header h1").textContent =
        `Invest / ${name}`;
      document.querySelector(".company-info h2").textContent = name;
      document.querySelector(".ticker").textContent = `${symbol} - Technology`;

      // Random price for demo purposes
      const price = (Math.random() * 1000 + 100).toFixed(2);
      const priceChange = (Math.random() * 20 - 10).toFixed(2);
      const priceChangePercent = ((priceChange / price) * 100).toFixed(2);
      const isPositive = parseFloat(priceChange) >= 0;

      document.querySelector(".price-value").textContent =
        `$${Number(price).toLocaleString()}`;

      const priceChangeEl = document.querySelector(".price-change");
      priceChangeEl.textContent = `${isPositive ? "+" : ""}$${Math.abs(priceChange)} (${Math.abs(priceChangePercent)}%)`;

      if (isPositive) {
        priceChangeEl.classList.remove("negative");
        priceChangeEl.classList.add("positive");
      } else {
        priceChangeEl.classList.remove("positive");
        priceChangeEl.classList.add("negative");
      }

      // Close search results
      searchResults.style.display = "none";
      searchInput.value = symbol;

      // Update chart with new random data
      updateChartData(symbol);
    });
  });

  // Function to generate random chart data
  function generateRandomChartData(min, max, points) {
    let data = [];
    let current = Math.random() * (max - min) + min;

    for (let i = 0; i < points; i++) {
      // Add some variation to create a realistic chart
      let change = Math.random() * 100 - 50; // Random change between -50 and +50
      current += change;

      // Keep it within the desired range
      current = Math.max(min, Math.min(max, current));

      data.push(parseFloat(current.toFixed(2)));
    }

    return data;
  }

  // Function to generate date categories for the chart
  function generateDateCategories(days) {
    const dates = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      dates.push(date.toISOString().split("T")[0]);
    }

    return dates;
  }

  // Initialize price chart
  let priceChart;

  function initPriceChart(isDarkTheme) {
    const initialData = generateRandomChartData(14200, 14500, 15);
    const dateCategories = generateDateCategories(15);

    const options = {
      series: [
        {
          name: "Price",
          data: initialData,
        },
      ],
      chart: {
        type: "line",
        height: "100%",
        animations: {
          enabled: true,
          easing: "easeinout",
          speed: 800,
          animateGradually: {
            enabled: true,
            delay: 150,
          },
          dynamicAnimation: {
            enabled: true,
            speed: 350,
          },
        },
        toolbar: {
          show: true,
          tools: {
            download: true,
            selection: true,
            zoom: true,
            zoomin: true,
            zoomout: true,
            pan: true,
            reset: true,
          },
        },
        zoom: {
          enabled: true,
        },
        background: "transparent",
        foreColor: isDarkTheme ? "#ffffff" : "#333333",
      },
      colors: ["#4cc9f0"],
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: "smooth",
        width: 3,
        lineCap: "round",
      },
      markers: {
        size: 0, // Hide markers by default
        hover: {
          size: 6,
          strokeWidth: 0,
        },
      },
      tooltip: {
        enabled: true,
        intersect: false,
        shared: true,
        followCursor: true,
        x: {
          format: "dd MMM yyyy",
        },
        y: {
          formatter: function (value) {
            return "$" + value.toLocaleString();
          },
        },
        marker: {
          show: true,
        },
        theme: isDarkTheme ? "dark" : "light",
      },
      grid: {
        borderColor: isDarkTheme ? "#333333" : "#e0e0e0",
        strokeDashArray: 3,
        position: "back",
        xaxis: {
          lines: {
            show: true,
          },
        },
        yaxis: {
          lines: {
            show: true,
          },
        },
      },
      xaxis: {
        categories: dateCategories,
        labels: {
          formatter: function (value) {
            return new Date(value).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            });
          },
          style: {
            colors: isDarkTheme ? "#b3b3b3" : "#666666",
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
          formatter: function (value) {
            return "$" + value.toLocaleString();
          },
          style: {
            colors: isDarkTheme ? "#b3b3b3" : "#666666",
          },
        },
        min: function (min) {
          return min - 100;
        },
        max: function (max) {
          return max + 100;
        },
      },
      fill: {
        type: "gradient",
        gradient: {
          shade: "dark",
          type: "vertical",
          shadeIntensity: 0.2,
          gradientToColors: undefined,
          inverseColors: true,
          opacityFrom: 0.6,
          opacityTo: 0.1,
          stops: [0, 100],
        },
      },
    };

    // Initialize the chart
    priceChart = new ApexCharts(document.querySelector("#priceChart"), options);
    priceChart.render();

    return priceChart;
  }

  // Update chart data when selecting different stocks
  function updateChartData(symbol) {
    // Generate different data ranges based on the stock symbol
    let min, max;

    switch (symbol) {
      case "AAPL":
        min = 170;
        max = 190;
        break;
      case "MSFT":
        min = 330;
        max = 360;
        break;
      case "GOOGL":
        min = 135;
        max = 150;
        break;
      case "AMZN":
        min = 140;
        max = 160;
        break;
      case "META":
        min = 425;
        max = 450;
        break;
      default:
        min = 100;
        max = 200;
    }

    const newData = generateRandomChartData(min, max, 15);

    priceChart.updateSeries([
      {
        name: "Price",
        data: newData,
      },
    ]);
  }

  // Update chart theme when toggling light/dark mode
  function updateChartTheme(isDarkTheme) {
    if (priceChart) {
      priceChart.updateOptions({
        chart: {
          foreColor: isDarkTheme ? "#ffffff" : "#333333",
        },
        grid: {
          borderColor: isDarkTheme ? "#333333" : "#e0e0e0",
        },
        xaxis: {
          labels: {
            style: {
              colors: isDarkTheme ? "#b3b3b3" : "#666666",
            },
          },
        },
        yaxis: {
          labels: {
            style: {
              colors: isDarkTheme ? "#b3b3b3" : "#666666",
            },
          },
        },
        tooltip: {
          theme: isDarkTheme ? "dark" : "light",
        },
      });
    }
  }

  // Initialize the chart
  priceChart = initPriceChart(true); // Start with dark theme
// Interval switch buttons
const btnWeekly = document.getElementById("btnWeekly");
const btnMonthly = document.getElementById("btnMonthly");
const btnYearly = document.getElementById("btnYearly");

btnWeekly?.addEventListener("click", () => switchInterval("weekly"));
btnMonthly?.addEventListener("click", () => switchInterval("monthly"));
btnYearly?.addEventListener("click", () => switchInterval("yearly"));

function switchInterval(interval) {
  let points;
  const min = 14200;
  const max = 14500;

  switch (interval) {
    case "weekly":
      points = 7;
      break;
    case "monthly":
      points = 30;
      break;
    case "yearly":
      points = 365;
      break;
    default:
      points = 15;
  }

  const newData = generateRandomChartData(min, max, points);
  const newCategories = generateDateCategories(points);

  priceChart.updateOptions({
    series: [{ name: "Price", data: newData }],
    xaxis: { categories: newCategories }
  });

  // Highlight active button
  document.querySelectorAll(".interval-buttons button").forEach((btn) =>
    btn.classList.remove("active")
  );
  document.getElementById(`btn${interval.charAt(0).toUpperCase() + interval.slice(1)}`)?.classList.add("active");
}
});
