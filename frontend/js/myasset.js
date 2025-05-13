import Sidebar from "./sidebar.js";
import Http from "./http.js";
import TradeCard from "./trade.js";
import User from "./user.js";
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
  console.log("total value:", totalValue);
  $(".balance-amount").text(totalValue.toFixed(2));
}

function getTotalAssets() {}

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
        <div class="column chart-col ${changeClass}">${profit_percent}</div>
        <div class="column action-col">
          <button class="action-btn" data-symbol="${symbol}" data-price="${price}">Trade</button>
        </div>
      </div>
    `);
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
  getTotalAssets();
  initViewControls();
  initPortfolioChart();
  Sidebar.getInstance();
  const user = User.getInstance();
  popluatePortfolioTable(user.portfolio);
  drawDoughnutChart(user.portfolio, user.balance);
});
