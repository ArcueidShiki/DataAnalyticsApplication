export function getCurrentPage() {
  const path = window.location.pathname;
  // pop out the last element in the path
  const pageName = path.split("/").pop().split(".")[0];
  return pageName || "watchlist";
}
