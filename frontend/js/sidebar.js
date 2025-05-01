/* eslint-disable no-undef */
function getCurrentPage() {
  const path = window.location.pathname;
  // pop out the last element in the path
  const pageName = path.split("/").pop().split(".")[0];
  return pageName || "watchlist";
}

// retrieve the current stock symbol from URL parameters
function getCurrentSymbol() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("symbol") || "AAPL";
}

// set to highlight the current menu item
function setupMenuItems() {

  const currentPage = getCurrentPage();
  const menuItems = document.querySelectorAll(".menu-item");

  menuItems.forEach((item) => {
    const spanElement = item.querySelector("span");

    const menuText = spanElement.textContent.trim().toLowerCase();
    const menuTextNoSpace = menuText.replace(/\s+/g, "");

    // highlight the current menu item
    if (
      currentPage.includes(menuTextNoSpace) ||
      menuTextNoSpace.includes(currentPage)
    ) {
      item.classList.add("active");
    }

    item.addEventListener("click", () => {
      const menuName = spanElement.textContent.trim();
      console.log("clicking menu:", menuName);

      switch (menuName.toLowerCase()) {
        case "watchlist":
          window.location.href = "watchlist.html";
          break;
        case "my asset":
          window.location.href = "myasset.html";
          break;
        case "top chart":
          window.location.href = "analysis.html";
          break;
        case "contact":
          window.location.href = "chat.html";
          break;
        case "account setting":
          window.location.href = "accountsetting.html";
          break;
        case "setting":
          window.location.href = "settings.html";
          break;
        case "help center":
          window.location.href = "help.html";
          break;
        case "logout":
          handleLogout();
          break;
        default:
          console.warn(`undefined menu item: ${menuName}`);
          break;
      }
    });
  });
}

// setup the account toggle functionality
function setupAccountToggle() {
  const accountToggleButton = document.getElementById("account-toggle-button");
  const accountSection = document.getElementById("account-section");
  const accountArrow = document.querySelector(".account-arrow");
  const profileToggle = document.getElementById("profile-toggle");

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

  // Toggle account section when clicking the toggle button
  if (accountToggleButton) {
    accountToggleButton.addEventListener("click", toggleAccountSection);
  }

  // Toggle account section when clicking the profile
  if (profileToggle) {
    profileToggle.addEventListener("click", toggleAccountSection);
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
 * Get watchlist stocks data
 * In real applications, this data should be fetched from an API
 * @returns {Array} Array of stock data
 */
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

function LoadTopFiveStocks() {
  Http.get("api/stock/top5")
    .then((response) => {
      const stocks = response.data;
      const stockList = document.getElementById("top5-stocks");
      stockList.innerHTML = ""; // Clear existing content

      stocks.forEach((stock) => {
        const stockItem = document.createElement("li");
        stockItem.textContent = `${stock.symbol} - ${stock.price}`;
        stockList.appendChild(stockItem);
      });
    })
    .catch((error) => {
      console.error("Error loading top 5 stocks:", error);
    });
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

  // Get current page name (if not provided)
  if (!currentPage) {
    const path = window.location.pathname;
    currentPage = path.split("/").pop().split(".")[0] || "watchlist";
  }

  // Get current stock symbol
  const urlParams = new URLSearchParams(window.location.search);
  const currentSymbol = urlParams.get("symbol") || "AAPL";

  // Get stock data
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

    // Highlight the current stock if on individual stock page
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

    // Add click event
    stockItem.addEventListener("click", () => {
      window.location.href = `../watchlist-individual.html?symbol=${stock.symbol}`;
    });

    watchlistContainer.appendChild(stockItem);
  });
}

$(document).ready(function () {
  populateWatchlist();
  setupMenuItems();
  setupAccountToggle();
});