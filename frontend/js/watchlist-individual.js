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
      timeframeBtns.forEach((b) => b.classList.remove("active"));
      this.classList.add("active");
      const timeframe = this.getAttribute("data-timeframe");
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

  const breadcrumbSpan = document.querySelector(".breadcrumb span");
  if (breadcrumbSpan) {
    breadcrumbSpan.textContent = name;
  }
}

document.addEventListener("DOMContentLoaded", function () {
  initTabSwitching();
  initTimeframeButtons();
  initThemeObserver();
});
