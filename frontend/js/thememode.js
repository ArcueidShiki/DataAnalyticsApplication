/* eslint-disable no-undef */
// update themeUI
function updateThemeUI(theme, icon, text) {
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

// theme toggle function
function setupThemeToggle() {
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

  // retrieve current theme from localStorage or default to dark
  const currentTheme = localStorage.getItem("theme") || "dark";
  document.body.setAttribute("data-theme", currentTheme);

  // refresh UI
  updateThemeUI(currentTheme, icon, text);

  // click event to toggle theme
  themeToggle.addEventListener("click", function () {
    const currentTheme = document.body.getAttribute("data-theme");
    const newTheme = currentTheme === "light" ? "dark" : "light";

    // update theme
    document.body.setAttribute("data-theme", newTheme);

    // update UI
    updateThemeUI(newTheme, icon, text);

    const chartUpdateOptions = {
      tooltip: {
        theme: newTheme,
      },
      grid: {
        borderColor: newTheme === "dark" ? "#30363d" : "#e1e4e8",
      },
      xaxis: {
        labels: {
          style: {
            colors: newTheme === "dark" ? "#8b949e" : "#666666",
          },
        },
        axisBorder: {
          color: newTheme === "dark" ? "#30363d" : "#e1e4e8",
        },
      },
    };

    // Update charts with new theme
    if (window.priceChart) {
      window.priceChart.updateOptions(
        {
          ...chartUpdateOptions,
          yaxis: getYAxisConfig("price"), // y-axis configuration
        },
        true,
      );
    }

    if (window.candlestickChart) {
      window.candlestickChart.updateOptions(
        {
          yaxis: getYAxisConfig("candlestick"),
        },
        true,
      );
    }

    if (window.volumeChart) {
      window.volumeChart.updateOptions({
        yaxis: getYAxisConfig("volume"), // y-axis configuration
      });
    }

    // save new theme to localStorage
    localStorage.setItem("theme", newTheme);
  });

  // set up global chart theme
  // setupGlobalChartTheme(currentTheme);
}

function initTheme() {
  setupThemeToggle();
}

// Initialize theme on DOMContentLoaded
// This ensures that the theme is set up as soon as the DOM is fully loaded
document.addEventListener("DOMContentLoaded", initTheme);
