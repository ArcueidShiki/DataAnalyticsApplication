export function filterTable(value) {
  value = value.toLowerCase();
  const rows = document.querySelectorAll(".table-row");
  rows.forEach((row) => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(value) ? "" : "none";
  });
}

// Load sidebar on this page
import("./sidebar.js").then((module) => {
  if (module.default && module.default.getInstance) {
    module.default.getInstance("global");
  }
});