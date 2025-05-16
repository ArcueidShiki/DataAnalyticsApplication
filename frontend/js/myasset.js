import Sidebar from "./sidebar.js";
import Http from "./http.js";
import TradeCard from "./trade.js";
import User from "./user.js";

function getAllUsers() {
  let userList = JSON.parse(localStorage.getItem("userList")) || [];
  if (!userList || userList.length === 0) {
    Http.get("/chat/all/users")
      .then((response) => {
        localStorage.setItem("userList", JSON.stringify(response));
        userList = response;
      })
      .catch((error) => {
        console.error("Error fetching user list:", error);
      });
  }
}

function openUserListModal(symbol, price, avg_cost) {
  const modal = document.getElementById("userListModal");
  modal.style.display = "block";

  // Fetch and render user list
  const userListContainer = modal.querySelector(".user-list");
  userListContainer.innerHTML = ""; // Clear previous content
  Http.get("/chat/all/users")
    .then((response) => {
      response.forEach((user) => {
        const userItem = document.createElement("div");
        userItem.className = "user-item";
        userItem.innerHTML = `
          <img src="${Http.baseUrl}/${user.profile_img}" alt="${user.username}" />
          <span>${user.username}</span>
        `;
        userItem.addEventListener("click", () => {
          const socket = io("http://127.0.0.1:9000/chat", {
            reconnection: false,
            transports: ["websocket"],
            auth: {
              access_token: Http.getCookie("access_token_cookie"),
              crsf_token: Http.getCookie("csrf_access_token"),
            },
          });
          socket.emit("send_summary_img", {
            sender_id: User.getInstance().id,
            receiver_id: user.user_id,
            message: "summary",
            message_type: "image",
            symbol: symbol,
            avg_cost: avg_cost,
            price: price,
          });
          closeUserListModal();
        });
        userListContainer.appendChild(userItem);
      });
    })
    .catch((error) => {
      console.error("Error fetching user list:", error);
    });
}

document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("userListModal");
  const closeBtn = modal.querySelector(".close-btn");
  closeBtn.addEventListener("click", closeUserListModal);
  window.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeUserListModal();
    }
  });
  const shareButtons = document.querySelectorAll(".share-btn");
  shareButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
    });
  });
});

function closeUserListModal() {
  const modal = document.getElementById("userListModal");
  modal.style.display = "none";
}

function initViewControls() {
  const viewButtons = document.querySelectorAll(".view-btn");

  viewButtons.forEach((btn) => {
    btn.addEventListener("click", function () {
      // Remove active class from all buttons
      viewButtons.forEach((button) => button.classList.remove("active"));

      // Add active class to clicked button
      this.classList.add("active");

      // Change table view style (implementation would depend on design requirements)
      const viewType = this.querySelector("i").className;
      console.log("Changing view to:", viewType);

      // Future implementation for changing the table display style
    });
  });

  // Initialize sorting functionality for table headers
  const sortableHeaders = document.querySelectorAll(".column i.fas.fa-sort");
  sortableHeaders.forEach((header) => {
    header.addEventListener("click", function () {
      const column = this.parentElement.className.replace("column ", "");
      console.log("Sorting by:", column);

      // Toggle sort direction
      const isAscending = !this.classList.contains("fa-sort-up");

      // Reset all sort icons
      sortableHeaders.forEach((icon) => {
        icon.className = "fas fa-sort";
      });

      // Update this sort icon
      this.className = isAscending ? "fas fa-sort-up" : "fas fa-sort-down";

      // Future implementation for actual sorting
    });
  });
}

// Initialize the portfolio chart
function initPortfolioChart() {
  const ctx = document.getElementById("portfolioChart");
  if (!ctx) return;

  new Chart(ctx, {
    type: "line",
    data: {
      labels: ["23", "24", "25", "26"],
      datasets: [
        {
          data: [30000, 28000, 29500, 30976],
          borderColor: "#00C853",
          backgroundColor: "rgba(0, 200, 83, 0.1)",
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 3,
        },
      ],
    },
    options: {
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false } },
        y: {
          grid: { color: "rgba(255,255,255,0.1)" },
          ticks: { display: false },
        },
      },
    },
  });
}

/**
 *
 * @param {*} assets:{asset_id, symbol, type, quantity, close, avg_cost, today_profit, proft, percentage}
 */
function calculateTotalValue(assets) {
  let totalValue = 0;
  assets.forEach((asset) => {
    if (asset.type == "stock") {
      totalValue += asset.close * asset.quantity;
    } else if (asset.type == "currency") {
      totalValue += asset.quantity;
    }
  });
  $(".portfolio-value").text(totalValue.toFixed(2));
}

function getTotalAssets() {
  const user = User.getInstance();
  const assets = user.portfolio;
  const balance = user.balance;
  const totalAssets = [];
  for (const symbol in assets) {
    if (assets[symbol].quantity <= 0) {
      continue;
    }
    totalAssets.push({
      asset_id: assets[symbol].asset_id,
      symbol: symbol,
      type: "stock",
      quantity: assets[symbol].quantity,
      close: assets[symbol].price,
      avg_cost: assets[symbol].avg_cost,
      today_profit: assets[symbol].profit_loss,
      profit: assets[symbol].profit_loss,
      percentage: assets[symbol].profit_loss_percent,
    });
  }
  for (const symbol in balance) {
    if (balance[symbol].amount <= 0) {
      continue;
    }
    totalAssets.push({
      asset_id: balance[symbol].asset_id,
      symbol: symbol,
      type: "currency",
      quantity: balance[symbol].amount,
      close: balance[symbol].amount,
      avg_cost: balance[symbol].amount,
      today_profit: 0,
      profit: 0,
      percentage: 0,
    });
  }
  $(".balance-amount").text(
    balance["USD"].amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }),
  );
  calculateTotalValue(totalAssets);
}

function drawDoughnutChart(portfolio, balance) {
  var dom = document.getElementById("doughnutChart");
  var data = [];
  for (const symbol in portfolio) {
    if (portfolio[symbol].quantity <= 0) {
      continue;
    }
    data.push({
      value: portfolio[symbol].quantity * portfolio[symbol].price,
      name: symbol,
    });
  }
  for (const symbol in balance) {
    if (balance[symbol].amount <= 0) {
      continue;
    }
    data.push({
      value: balance[symbol].amount,
      name: symbol,
    });
  }
  var myChart = echarts.init(dom, null, {
    renderer: "canvas",
    useDirtyRect: false,
  });
  var app = {};

  var option;

  option = {
    tooltip: {
      trigger: "item",
      formatter: "{b} : {c} ({d}%)",
    },
    legend: {
      top: "5%",
      left: "center",
    },
    series: [
      {
        name: "Access From",
        type: "pie",
        radius: ["40%", "70%"],
        avoidLabelOverlap: false,
        label: {
          show: false,
          position: "center",
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 40,
            fontWeight: "bold",
          },
        },
        labelLine: {
          show: false,
        },
        data: data,
      },
    ],
  };
  if (option && typeof option === "object") {
    myChart.setOption(option);
  }
  window.addEventListener("resize", myChart.resize);
}

function popluatePortfolioTable(portfolio) {
  const table = $(".table-body");
  table.empty();
  for (const symbol in portfolio) {
    const quantity = portfolio[symbol].quantity;
    if (quantity <= 0) {
      continue;
    }
    const changeClass =
      portfolio[symbol].profit_loss >= 0 ? "positive" : "negative";
    const avg_cost = portfolio[symbol].avg_cost.toFixed(2);
    const price = portfolio[symbol].price.toFixed(2);
    const profit_loss = portfolio[symbol].profit_loss.toFixed(2);
    const profit_percent = portfolio[symbol].profit_loss_percent.toFixed(2);
    const total_value = portfolio[symbol].total_value.toFixed(2);
    const changeIcon =
      portfolio[symbol].profit_loss >= 0 ? "fa-caret-up" : "fa-caret-down";
    const changePrefix = portfolio[symbol].profit_loss >= 0 ? "+" : "-";
    const changeValue = Math.abs(portfolio[symbol].profit_loss).toFixed(2);
    const changePercent = Math.abs(
      portfolio[symbol].profit_loss_percent,
    ).toFixed(2);
    const row = $(`
      <div class="table-row">
        <div class="column coin-col">
          <div class="coin-info">
            <div class="coin-details">
              <span class="coin-symbol">${symbol}</span>
            </div>
          </div>
        </div>
        <div class="column coin-col">${quantity}</div>
        <div class="column coin-col">${avg_cost}</div>
        <div class="column price-col">${price}</div>
        <div class="column dynamic-col">${total_value}</div>
        <div class="column volume-col ${changeClass}">${profit_loss}</div>
        <div class="column chart-col ${changeClass}">
        <button id="sharePortfolio" class="share-btn column action-col">
            <i class="fas fa-share-alt"></i> Share
          </button></div>
        <div class="column action-col">
          <button class="action-btn" data-symbol="${symbol}" data-price="${price}">Trade</button>
        </div>
      </div>
    `);
    row.find(".share-btn").on("click", function (e) {
      e.stopPropagation();
      console.log(
        "Share button clicked for symbol:",
        symbol,
        "at price:",
        price,
        "with profit/loss:",
        profit_loss,
        "cost:",
        avg_cost,
      );
      openUserListModal(symbol, price, avg_cost);
    });
    row.find(".action-btn").on("click", function (e) {
      e.stopPropagation();
      const symbol = $(this).data("symbol");
      const price = $(this).data("price");
      console.log(
        "Trade button clicked for symbol:",
        symbol,
        "at price:",
        price,
      );
      TradeCard.getInstance(symbol, parseFloat(price));
      TradeCard.getInstance().toggleTradingExpand();
    });
    row.on("click", () => {
      window.location.href = `ticker.html?symbol=${symbol}`;
    });
    table.append(row);
  }
}

document.addEventListener("DOMContentLoaded", function () {
  getAllUsers();
  getTotalAssets();
  initViewControls();
  initPortfolioChart();
  Sidebar.getInstance();
  const user = User.getInstance();
  popluatePortfolioTable(user.portfolio);
  drawDoughnutChart(user.portfolio, user.balance);
});
