/* eslint-disable no-undef */

function getCurrentPage() {
  const path = window.location.pathname;
  // pop out the last element in the path
  const pageName = path.split("/").pop().split(".")[0];
  return pageName || "watchlist";
}

function setupMenuItems() {

  const currentPage = getCurrentPage();
  const menuItems = $(".menu-item");

  const meuActions = {
    "watchlist": () => (window.location.href = "watchlist.html"),
    "my asset": () => (window.location.href = "myasset.html"),
    "top chart": () => (window.location.href = "analysis.html"),
    "contact": () => (window.location.href = "chat.html"),
    "account setting": () => (window.location.href = "accountsetting.html"),
    "setting": () => (window.location.href = "settings.html"),
    "help center": () => (window.location.href = "help.html"),
    "logout": handleLogout,
  }
  menuItems.each(function (){
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

// setup the account toggle functionality
function setupAccountToggle() {
  const accountToggleButton = $("#account-toggle-button");
  const accountSection = $("#account-section");
  const accountArrow = $(".account-arrow");
  const profileToggle = $("#profile-toggle");

  // Function to toggle account section
  function toggleAccountSection() {
    if (accountSection.style.display === "none") {
      accountSection.style.display = "block";
      accountArrow.classList.remove("expanded");
    } else {
      accountSection.style.display = "none";
      accountArrow.classList.add("expanded");
    }
  }

  if (accountToggleButton) {
    accountToggleButton.on("click", toggleAccountSection);
  }

  if (profileToggle) {
    profileToggle.on("click", toggleAccountSection);
  }
}

function handleLogout() {
  if (confirm("Are you sure to logout?")) {
    // TODO Http.post("api/logout")
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    window.location.href = "../login.html";
    console.log("User logged out");
  }
}

/**
 * Load Hot Stocks
 * @param {string} containerId - Container element ID
 * @param {string} currentPage - Current page name
 * @returns {void}
 */
function LoadHotTopStocks(
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
      const watchlistContainer = document.getElementById(containerId);
      if (!watchlistContainer) {
        console.error(`Container with ID "${containerId}" not found`);
        return;
      }
      watchlistContainer.innerHTML = "";
      console.log("Hot stocks:", stocks);
      stocks.forEach((stock) => {
        const stockItem = document.createElement("div");
        stockItem.className = "watchlist-item";
        if (
          currentPage === "watchlist-individual" &&
          stock.symbol === currentSymbol
        ) {
          stockItem.classList.add("active");
        }
        const changeClass = stock.percent_change >= 0 ? "positive" : "negative";
        const changeIcon = stock.percent_change >= 0 ? "fa-caret-up" : "fa-caret-down";
        stockItem.innerHTML = `
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
            `;
        stockItem.addEventListener("click", () => {
          window.location.href = `../watchlist-individual.html?symbol=${stock.symbol}`;
        });
        watchlistContainer.appendChild(stockItem);
      });
      return true;
    })
    .catch((error) => {
      console.error("Error loading hot stocks:", error);
      return false;
    });
    ;
}

function getWatchlistStocks() {
  return [
    {
      symbol: "AAPL",
      name: "AAPL",
      price: 147.04,
      change: 1.47,
      changeDirection: "up",
    },
    {
      symbol: "MSFT",
      name: "MSFT",
      price: 290.12,
      change: 0.89,
      changeDirection: "up",
    },
    {
      symbol: "GOOGL",
      name: "GOOGL",
      price: 2300.45,
      change: -1.23,
      changeDirection: "down",
    },
    {
      symbol: "AMZN",
      name: "AMZN",
      price: 3380.5,
      change: 2.15,
      changeDirection: "up",
    },
    {
      symbol: "TSLA",
      name: "TSLA",
      price: 687.2,
      change: -0.75,
      changeDirection: "down",
    },
  ];
}

/**
 * Populate the stock watchlist
 * @param {string} containerId - Container element ID
 * @param {string} currentPage - Current page name
 * @returns {void}
 */
function populateWatchlist(
  containerId = "watchlistContainer",
  currentPage = null,
) {

  if (!currentPage) {
    currentPage = getCurrentPage();
  }
  const urlParams = new URLSearchParams(window.location.search);
  const currentSymbol = urlParams.get("symbol") || "AAPL";
  const watchlistStocks = getWatchlistStocks();
  const watchlistContainer = document.getElementById(containerId);
  if (!watchlistContainer) {
    console.error(`Container with ID "${containerId}" not found`);
    return;
  }

  watchlistContainer.innerHTML = "";
  watchlistStocks.forEach((stock) => {
    const stockItem = document.createElement("div");
    stockItem.className = "watchlist-item";

    if (
      currentPage === "watchlist-individual" &&
      stock.symbol === currentSymbol
    ) {
      stockItem.classList.add("active");
    }

    const changeClass =
      stock.changeDirection === "up" ? "positive" : "negative";
    const changeIcon =
      stock.changeDirection === "up" ? "fa-caret-up" : "fa-caret-down";

    stockItem.innerHTML = `
            <div class="watchlist-icon">
                ${stock.symbol.charAt(0)}
            </div>
            <div class="watchlist-info">
                <div class="stock-name">${stock.name}</div>
                <div class="stock-symbol">${stock.price}</div>
            </div>
            <div class="price-change ${changeClass}">
                <i class="fas ${changeIcon}"></i>
                ${Math.abs(stock.change)}%
            </div>
        `;

    stockItem.addEventListener("click", () => {
      window.location.href = `../watchlist-individual.html?symbol=${stock.symbol}`;
    });

    watchlistContainer.appendChild(stockItem);
  });
}

$(document).ready(function () {
  if (!LoadHotTopStocks()) // from server
  {
    populateWatchlist(); // with dummy data
  }
  getWatchlist();
  setupMenuItems();
  setupAccountToggle();
});