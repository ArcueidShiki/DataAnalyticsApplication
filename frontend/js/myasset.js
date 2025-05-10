import Sidebar from "./sidebar.js";
import Http from "./http.js";
import TradeCard from "./trade.js";
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

function getTotalAssets() {
  Http.get("/asset/")
    .then((response) => {
      console.log(response);
      localStorage.setItem("assets", JSON.stringify(response));
      calculateTotalValue(response);
      return true;
    })
    .catch((error) => {
      console.error("error:", error);
      return false;
    });
}

document.addEventListener("DOMContentLoaded", function () {
  getTotalAssets();
  initViewControls();
  initPortfolioChart();
  Sidebar.getInstance();
  const symbol = "TSLA";
  TradeCard.getInstance(symbol);
});
