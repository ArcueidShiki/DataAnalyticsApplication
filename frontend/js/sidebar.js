import * as Utils from "./utils.js";
import Http from "./http.js";
export default class Sidebar {
  static instance = null; // sidebar singleton
  constructor() {
    if (Sidebar.instance) {
      console.log(
        "Sidebar instance already exists. Returning the existing instance.",
      );
      return Sidebar.instance;
    }
    Sidebar.instance = this;
    this.init();
  }
  static getInstance() {
    if (!Sidebar.instance) {
      Sidebar.instance = new Sidebar();
    }
    return Sidebar.instance;
  }
  init() {
    $(document).ready(() => {
      this.createSidebarElments();
      if (!this.loadHotTopStocksFromCache() && !this.loadHotTopStocks()) {
        this.loadHotTopStocksFromMockData();
      }
      this.setupMenuItems();
      this.setupSettingToggle();
    });
  }

  createUserProfile() {
    return $(`
        <div class="sidebar-header">
          <div class="user-profile" id="profile-toggle">
            <div class="profile-avatar">
              <img src="assets/user.jpeg" alt="User Avatar" />
            </div>
            <div class="profile-info">
              <div class="profile-name">Rojo Arab Oktov</div>
              <div class="profile-balance">$56,320.00</div>
            </div>
          </div>
        </div>
    `);
  }

  createMenu() {
    return $(`
        <div class="menu-label">MENU</div>
        <div class="sidebar-menu">
          <div class="menu-item" id="watchlist-menu-item">
            <i class="fa-solid fa-th"></i>
            <span>Watchlist</span>
          </div>
          <div class="menu-item">
            <i class="far fa-user"></i>
            <span>My asset</span>
          </div>
          <div class="menu-item">
            <i class="fas fa-chart-line"></i>
            <span>Top chart</span>
          </div>
          <div class="menu-item">
            <i class="fab fa-bitcoin"></i>
            <span>Crypto</span>
            <span class="new-badge">new</span>
          </div>
          <div class="menu-item">
            <i class="fa-brands fa-rocketchat"></i>
            <span>Contact</span>
          </div>
        </div>
    `);
  }

  createHotTop() {
    return $(`
        <div class="watchlist-header">
          <div class="watchlist-title">TOP HOT</div>
          <div class="watchlist-dropdown">24h</div>
        </div>

        <div id="watchlistContainer">
        </div>
    `);
  }

  createSettings() {
    return $(`
        <div class="settings">
          <div class="menu-item settings">
            <i class="fas fa-user-circle"></i>
            <span>SETTINGS</span>
            <i class="fas fa-chevron-down account-arrow"></i>
          </div>
          <div class="setting-section hidden">
            <div class="sidebar-menu">
              <div class="menu-item" id="themeToggle">
                <i class="fas fa-moon"></i>
                <span>Dark Mode</span>
              </div>
              <div class="menu-item">
                <i class="fas fa-cog"></i>
                <span>Account setting</span>
              </div>
              <div class="menu-item">
                <i class="fas fa-sliders-h"></i>
                <span>Setting</span>
              </div>
              <div class="menu-item">
                <i class="far fa-question-circle"></i>
                <span>Help center</span>
              </div>
              <div class="menu-item">
                <i class="fas fa-sign-out-alt"></i>
                <span>Logout</span>
              </div>
            </div>
          </div>
        </div>
    `);
  }

  createSidebarElments() {
    const sidebarContainer = $(`<div class="sidebar"></div>`);
    sidebarContainer.append(this.createUserProfile());
    sidebarContainer.append(this.createMenu());
    sidebarContainer.append(this.createHotTop());
    sidebarContainer.append(this.createSettings());
    $(".app-container").prepend(sidebarContainer);
    this.setupThemeToggle();
  }

  setupMenuItems() {
    const currentPage = Utils.getCurrentPage();
    const menuItems = $(".menu-item");

    const meuActions = {
      watchlist: () => (window.location.href = "watchlist.html"),
      "my asset": () => (window.location.href = "myasset.html"),
      "top chart": () => (window.location.href = "analysis.html"),
      contact: () => (window.location.href = "chat.html"),
      "account setting": () => (window.location.href = "accountsetting.html"),
      "help center": () => (window.location.href = "help.html"),
      logout: this.handleLogout,
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
        }
      });
    });
  }

  setupSettingToggle() {
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

  handleLogout() {
    Http.get("/auth/logout").then((response) => {
      console.log(response);
      document.cookie = "";
      localStorage.clear();
      window.location.href = "login.html";
    });
  }

  loadHotTopStocks() {
    Http.get("/stock/hot")
      .then((stocks) => {
        this.populateHotStocks(stocks);
        localStorage.setItem("hotStocks", JSON.stringify(stocks));
        return true;
      })
      .catch((error) => {
        console.error("Error loading hot stocks:", error);
        return false;
      });
  }

  loadHotTopStocksFromCache() {
    const cachedStocks = localStorage.getItem("hotStocks");
    if (cachedStocks) {
      try {
        const stocks = JSON.parse(cachedStocks);
        this.populateHotStocks(stocks);
        return true;
      } catch (error) {
        console.error("Error parsing cached stocks:", error);
        return false;
      }
    }
    return false;
  }

  populateHotStocks(stocks) {
    const currentPage = Utils.getCurrentPage();
    const urlParams = new URLSearchParams(window.location.search);
    const currentSymbol = urlParams.get("symbol") || "AAPL";
    const watchlistContainer = $("#watchlistContainer");
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
      if (currentPage === "ticker" && stock.symbol === currentSymbol) {
        stockItem.addClass("active");
      }
      stockItem.on("click", () => {
        window.location.href = `ticker.html?symbol=${stock.symbol}`;
      });
      watchlistContainer.append(stockItem);
    });
  }

  loadHotTopStocksFromMockData() {
    const stocks = getMockStocks();
    this.populateHotStocks(stocks);
  }

  updateThemeUI(theme, icon, text) {
    if (theme === "light") {
      icon.classList.remove("fa-moon");
      icon.classList.add("fa-sun");
      text.textContent = "Light Mode";
    } else {
      icon.classList.remove("fa-sun");
      icon.classList.add("fa-moon");
      text.textContent = "Dark Mode";
    }
  }

  setupThemeToggle() {
    const themeToggle = document.getElementById("themeToggle");
    if (!themeToggle) {
      console.warn('button ID "themeToggle" not found');
      return;
    }

    const icon = themeToggle.querySelector("i");
    const text = themeToggle.querySelector("span");

    if (!icon || !text) {
      console.warn("lack of icon or text in themeToggle");
      return;
    }

    const currentTheme = localStorage.getItem("theme") || "dark";
    document.body.setAttribute("data-theme", currentTheme);

    this.updateThemeUI(currentTheme, icon, text);
    themeToggle.addEventListener("click", () => {
      const currentTheme = document.body.getAttribute("data-theme");
      const newTheme = currentTheme === "light" ? "dark" : "light";

      document.body.setAttribute("data-theme", newTheme);
      this.updateThemeUI(newTheme, icon, text);
      localStorage.setItem("theme", newTheme);
    });
  }
}
