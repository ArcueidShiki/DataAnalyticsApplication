export function getCurrentPage() {
  const path = window.location.pathname;
  // pop out the last element in the path
  const pageName = path.split("/").pop().split(".")[0];
  return pageName || "watchlist";
}

export function formatMarketCap(value) {
  if (value >= 1e12) {
    return (value / 1e12).toFixed(2) + "T";
  } else if (value >= 1e9) {
    return (value / 1e9).toFixed(2) + "B";
  } else if (value >= 1e6) {
    return (value / 1e6).toFixed(2) + "M";
  } else {
    return value.toString();
  }
}