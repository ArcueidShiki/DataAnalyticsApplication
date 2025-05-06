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
    console.log("Current Theme from attribute:", currentTheme);
    const newTheme = currentTheme === "light" ? "dark" : "light";

    // update theme
    document.body.setAttribute("data-theme", newTheme);

    // update UI
    updateThemeUI(newTheme, icon, text);

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
