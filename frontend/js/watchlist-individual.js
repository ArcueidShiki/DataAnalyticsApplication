/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */

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
    // updateStockLogo(stockCompany, currentSymbol);

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
    .replace(/[\s'",.&]+/g, "")
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
}

document.addEventListener("DOMContentLoaded", function () {
  initTabSwitching();
  initTimeframeButtons();
  initFollowButton();
  initSearchFunctionality();
  initThemeObserver();
});
