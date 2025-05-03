/* eslint-disable no-undef */

function LoadWatchlist() {
  return false;
}

$(document).ready(function () {
  if (!LoadWatchlist()) {
    // from server
    popluateWatchlistTable();
  }
});
