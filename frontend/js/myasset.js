// Initialize view control buttons and sorting functionality
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

// Initialize the page
document.addEventListener("DOMContentLoaded", function () {
    console.log("MyAsset page loaded");
  
    // Initialize view control buttons
    initViewControls();
    // Initialize the portfolio chart
    initPortfolioChart();
  });
  