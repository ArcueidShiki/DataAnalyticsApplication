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
      }
    });
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

function initTimeframeButtons() {
  const timeframeBtns = document.querySelectorAll(".timeframe-btn");
  timeframeBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      console.log(
        "Timeframe button clicked:",
        this.getAttribute("data-timeframe"),
      );
      timeframeBtns.forEach((b) => b.classList.remove("active"));
      this.classList.add("active");
      const timeframe = this.getAttribute("data-timeframe");
      updateChartWithDummyData(timeframe);
    });
  });
}

function getColorFromName(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

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
  initThemeObserver();
});
