import * as Utils from "./utils.js";
import Http from "./http.js";
import AccountSettingCard from "./accountsetting.js";
import User from "./user.js";
export default class Sidebar {
  accountSetting = null;
  user = null;
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
      if (!this.loadWatchlistFromCache() && !this.loadWatchlist()) {
        this.loadWatchlistFromMockData();
      }
      this.loadUserInfo();
      this.setupMenuItems();
      this.setupSettingToggle();
    });
  }

  createUserProfile() {
    return $(`
        <div class="sidebar-header">
          <div class="user-profile" id="profile-toggle">
            <div class="profile-avatar">
            </div>
            <div class="profile-info">
              <div class="profile-name"></div>
              <div class="profile-balance"></div>
            </div>
          </div>
        </div>
    `);
  }

  loadUserInfo() {
    this.user = User.getInstance();
    if (this.user) {
      const profileName = $(".profile-name");
      const profileBalance = $(".profile-balance");
      if (profileName && profileBalance) {
        profileName.text(this.user.username);

        // Format the amount with thousands separators
        const formattedAmount = this.user.balance["USD"].amount.toLocaleString(
          "en-US",
          {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          },
        );

        profileBalance.text(`${formattedAmount} USD`);

        const profileAvatar = $(".profile-avatar");
        profileAvatar.append(
          $(
            `<img src="${Http.baseUrl}/${this.user.profile_img}" alt="${this.user.username} id="sidebar-profile"/>`,
          ),
        );
      }
    } else {
      console.warn("User info not found in local storage.");
    }
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

  createWatchlist() {
    return $(`
        <div class="watchlist-header">
          <div class="watchlist-title">Watchlist</div>
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
    sidebarContainer.append(this.createWatchlist());
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
      "account setting": () => {
        this.accountSetting = AccountSettingCard.getInstance();
        this.accountSetting.showDialog();
      },
      "help center": () => (window.location.href = "help.html"),
      logout: this.handleLogout,
    };
    menuItems.each(function () {
      const spanElement = $(this).find("span");

      const menuText = spanElement.text().trim().toLowerCase();
      const menuTextNoSpace = menuText.replace(/\s+/g, "");

      if (
        currentPage === menuTextNoSpace ||
        // Special case for multi-word menu items
        (menuText.includes(" ") && currentPage === menuText.replace(/\s+/g, ""))
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
      document.cookie = "";
      localStorage.removeItem("userInfo");
      localStorage.removeItem("watchlist");
      window.location.href = "login.html";
    });
  }

  loadWatchlist() {
    Http.get("/stock/watchlist")
      .then((stocks) => {
        this.populateWatchlist(stocks);
        localStorage.setItem("watchlist", JSON.stringify(stocks));
        return true;
      })
      .catch((error) => {
        console.error("Error loading wathclist stocks:", error);
        return false;
      });
    return true;
  }

  loadWatchlistFromCache() {
    const cachedStocks = localStorage.getItem("watchlist");
    if (cachedStocks) {
      try {
        const stocks = JSON.parse(cachedStocks);
        this.populateWatchlist(stocks);
        return true;
      } catch (error) {
        console.error("Error parsing cached stocks:", error);
        return false;
      }
    }
    return false;
  }

  populateWatchlist(stocks) {
    const currentPage = Utils.getCurrentPage();
    const urlParams = new URLSearchParams(window.location.search);
    const currentSymbol = urlParams.get("symbol") || "AAPL";
    const watchlistContainer = $("#watchlistContainer");
    watchlistContainer.empty();
    stocks.sort((a, b) => b.percent_change - a.percent_change);
    stocks.forEach((stock) => {
      const stockItem = this.getGenerateStockItem(stock);
      if (currentPage === "ticker" && stock.symbol === currentSymbol) {
        stockItem.addClass("active");
      }
      stockItem.on("click", () => {
        window.location.href = `ticker.html?symbol=${stock.symbol}`;
      });
      watchlistContainer.append(stockItem);
    });
  }

  getGenerateStockItem(stock) {
    const changeClass = stock.change >= 0 ? "positive" : "negative";
    const changeIcon = stock.change >= 0 ? "fa-caret-up" : "fa-caret-down";
    const stockItem = $(`
      <div class="watchlist-item">
        <div class="watchlist-icon">
            <img src="https://www.google.com/s2/favicons?sz=64&domain=${
              stock.domain
            }" alt="${stock.symbol} icon" width="15px"/>
        </div>
        <div class="watchlist-info">
            <div class="stock-name">${stock.symbol}</div>
            <div class="stock-symbol">${stock.close.toFixed(2)}</div>
        </div>
        <div class="price-change ${changeClass}">
            <i class="fas ${changeIcon}"></i>
            ${Math.abs(stock.percent_change).toFixed(2)}%
        </div>
      </div>
    `);
    return stockItem;
  }

  loadWatchlistFromMockData() {
    const stocks = getMockStocks();
    this.populateWatchlist(stocks);
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
