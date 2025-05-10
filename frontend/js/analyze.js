document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("csvFile").addEventListener("change", handleFile);
});

function handleFile(e) {
  const file = e.target.files[0];
  if (!file) return;
  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    complete: (results) => analyzePortfolio(results.data),
  });
}

function analyzePortfolio(assets) {
  assets = assets.map((a) => ({
    ...a,
    quantity: parseFloat(a.quantity),
    avg_cost: parseFloat(a.avg_cost),
    close: parseFloat(a.close),
  }));

  renderTotals(assets);
  renderSectorChart(assets);
  renderCompanyChart(assets);
  renderGainersLosers(assets);
}

function renderTotals(assets) {
  let totalInvestment = 0;
  let totalPnL = 0;
  let returnSum = 0;
  let maxRisk = { symbol: "", risk: 0 };

  assets.forEach((a) => {
    const invested = a.avg_cost * a.quantity;
    const current = a.close * a.quantity;
    const change = (a.close - a.avg_cost) / a.avg_cost;

    totalInvestment += invested;
    totalPnL += current - invested;
    returnSum += change * 100;

    if (Math.abs(change * 100) > Math.abs(maxRisk.risk)) {
      maxRisk = { symbol: a.symbol, risk: change * 100 };
    }
  });

  document.getElementById("totalInvestment").textContent =
    `$${totalInvestment.toFixed(2)}`;
  document.getElementById("totalPnL").textContent =
    `${totalPnL >= 0 ? "+" : "-"}$${Math.abs(totalPnL).toFixed(2)}`;
  document.getElementById("avgReturn").textContent =
    `${(returnSum / assets.length).toFixed(2)}%`;
  document.getElementById("mostRisky").textContent =
    `${maxRisk.symbol} (${maxRisk.risk.toFixed(2)}%)`;
}

function renderSectorChart(assets) {
  const data = {};
  assets.forEach((a) => {
    if (!data[a.sector]) data[a.sector] = 0;
    data[a.sector] += a.close * a.quantity;
  });

  new Chart(document.getElementById("sectorChart"), {
    type: "pie",
    data: {
      labels: Object.keys(data),
      datasets: [
        { data: Object.values(data), backgroundColor: genColors(data) },
      ],
    },
    options: { plugins: { legend: { position: "bottom" } } },
  });
}

function renderCompanyChart(assets) {
  const data = {};
  assets.forEach((a) => {
    if (!data[a.symbol]) data[a.symbol] = 0;
    data[a.symbol] += a.close * a.quantity;
  });

  new Chart(document.getElementById("companyChart"), {
    type: "doughnut",
    data: {
      labels: Object.keys(data),
      datasets: [
        { data: Object.values(data), backgroundColor: genColors(data) },
      ],
    },
    options: { plugins: { legend: { position: "bottom" } } },
  });
}

function renderGainersLosers(assets) {
  const sorted = [...assets].sort((a, b) => {
    const changeA = (a.close - a.avg_cost) / a.avg_cost;
    const changeB = (b.close - b.avg_cost) / b.avg_cost;
    return changeB - changeA;
  });

  const gainers = sorted.slice(0, 3);
  const losers = sorted.slice(-3).reverse();

  document.getElementById("gainersList").innerHTML = gainers
    .map(
      (a) =>
        `<li>${a.symbol} +${(((a.close - a.avg_cost) / a.avg_cost) * 100).toFixed(2)}%</li>`,
    )
    .join("");

  document.getElementById("losersList").innerHTML = losers
    .map(
      (a) =>
        `<li>${a.symbol} ${(((a.close - a.avg_cost) / a.avg_cost) * 100).toFixed(2)}%</li>`,
    )
    .join("");
}

function genColors(data) {
  const base = [
    "#42A5F5",
    "#66BB6A",
    "#FFA726",
    "#AB47BC",
    "#FF7043",
    "#FF6384",
    "#36A2EB",
  ];
  return Object.keys(data).map((_, i) => base[i % base.length]);
}
