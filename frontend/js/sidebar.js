/* eslint-disable no-undef */
function setupMenuItems() {
  const currentPage = getCurrentPage();
  const menuItems = $(".menu-item");

  const meuActions = {
    watchlist: () => (window.location.href = "watchlist.html"),
    "my asset": () => (window.location.href = "myasset.html"),
    "top chart": () => (window.location.href = "analysis.html"),
    contact: () => (window.location.href = "chat.html"),
    "account setting": () => (window.location.href = "accountsetting.html"),
    "help center": () => (window.location.href = "help.html"),
    logout: handleLogout,
  };
  menuItems.each(function () {
    const spanElement = $(this).find("span");

    const menuText = spanElement.text().trim().toLowerCase();
    const menuTextNoSpace = menuText.replace(/\s+/g, "");

    if (
      currentPage.includes(menuTextNoSpace) ||
      menuTextNoSpace.includes(currentPage)
    ) {
      $(this).addClass("active");
    }

    $(this).on("click", function () {
      const action = meuActions[menuText];
      if (action) {
        action();
      } else {
        console.warn(`undefined menu item: ${menuText}`);
      }
    });
  });
}

function setupSettingToggle() {
  const settingsButton = $(".menu-item.settings");
  const accountSection = $(".setting-section");
  const accountArrow = $(".account-arrow");
  const profileToggle = $("#profile-toggle");

  function toggleSettingSection() {
    if (accountSection.hasClass("hidden")) {
      accountSection.removeClass("hidden");
      accountSection.addClass("expanded");
      accountArrow.removeClass("expanded");
    } else {
      accountSection.addClass("hidden");
      accountSection.removeClass("expanded");
      accountArrow.addClass("expanded");
    }
  }

  if (settingsButton) {
    settingsButton.on("click", toggleSettingSection);
  }

  if (profileToggle) {
    profileToggle.on("click", toggleSettingSection);
  }
}

function handleLogout() {
  if (confirm("Are you sure to logout?")) {
    // TODO Http.post("api/logout")
    window.location.href = "../login.html";
  }
}

/**
 * Load Hot Stocks
 * @param {string} containerId - Container element ID
 * @param {string} currentPage - Current page name
 * @returns {void}
 */
function loadHotTopStocks(
  containerId = "watchlistContainer",
  currentPage = null,
) {
  if (!currentPage) {
    currentPage = getCurrentPage();
  }
  const urlParams = new URLSearchParams(window.location.search);
  const currentSymbol = urlParams.get("symbol") || "AAPL";

  Http.get("/stock/hot")
    .then((stocks) => {
      const watchlistContainer = $(`#${containerId}`);
      if (!watchlistContainer.length) {
        console.error(`Container with ID "${containerId}" not found`);
        return;
      }
      watchlistContainer.empty();
      stocks.forEach((stock) => {
        const changeClass = stock.percent_change >= 0 ? "positive" : "negative";
        const changeIcon =
          stock.percent_change >= 0 ? "fa-caret-up" : "fa-caret-down";
        const stockItem = $(`
              <div class="watchlist-item">
                <div class="watchlist-icon">
                    <img src="https://www.google.com/s2/favicons?sz=64&domain=${stock.domain}" alt="${stock.symbol} icon" width="15px"/>
                </div>
                <div class="watchlist-info">
                    <div class="stock-name">${stock.symbol}</div>
                    <div class="stock-symbol">${stock.price}</div>
                </div>
                <div class="price-change ${changeClass}">
                    <i class="fas ${changeIcon}"></i>
                    ${Math.abs(stock.percent_change)}%
                </div>
              </div>
            `);
        if (
          currentPage === "watchlist-individual" &&
          stock.symbol === currentSymbol
        ) {
          stockItem.classList.add("active");
        }
        stockItem.on("click", () => {
          window.location.href = `../watchlist-individual.html?symbol=${stock.symbol}`;
        });
        watchlistContainer.append(stockItem);
      });
      localStorage.setItem("hotStocks", JSON.stringify(stocks));
      return true;
    })
    .catch((error) => {
      console.error("Error loading hot stocks:", error);
      return false;
    });
}

function loadHotTopStocksFromCache(
  containerId = "watchlistContainer",
  currentPage = null,
) {
  const cachedStocks = localStorage.getItem("hotStocks");
  if (cachedStocks) {
    try {
      const stocks = JSON.parse(cachedStocks);
      const watchlistContainer = $(`#${containerId}`);
      if (!watchlistContainer.length) {
        console.error(`Container with ID "${containerId}" not found`);
        return false;
      }
      watchlistContainer.empty();
      stocks.forEach((stock) => {
        const changeClass = stock.percent_change >= 0 ? "positive" : "negative";
        const changeIcon =
          stock.percent_change >= 0 ? "fa-caret-up" : "fa-caret-down";
        const stockItem = $(`
              <div class="watchlist-item">
                <div class="watchlist-icon">
                    <img src="https://www.google.com/s2/favicons?sz=64&domain=${stock.domain}" alt="${stock.symbol} icon" width="15px"/>
                </div>
                <div class="watchlist-info">
                    <div class="stock-name">${stock.symbol}</div>
                    <div class="stock-symbol">${stock.price}</div>
                </div>
                <div class="price-change ${changeClass}">
                    <i class="fas ${changeIcon}"></i>
                    ${Math.abs(stock.percent_change)}%
                </div>
              </div>
            `);
        if (
          currentPage === "watchlist-individual" &&
          stock.symbol === currentSymbol
        ) {
          stockItem.addClass("active");
        }
        stockItem.on("click", () => {
          window.location.href = `../watchlist-individual.html?symbol=${stock.symbol}`;
        });
        watchlistContainer.append(stockItem);
      });
      return true;
    } catch (error) {
      console.error("Error parsing cached stocks:", error);
      return false;
    }
  }
  return false;
}

// TODO some optimization:
// download the image resources if it the first time to load
// check image resource existence, otherwise download it.

$(document).ready(function () {
  // Attempt to load from cache first
  if (!loadHotTopStocksFromCache() && !loadHotTopStocks()) {
    populateHotStocks(); // with dummy data
  }
  setupMenuItems();
  setupSettingToggle();
});
