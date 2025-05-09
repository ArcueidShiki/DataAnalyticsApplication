// Fetch all stock symbols and cache them in localStorage
function InitSearchSymbols() {
  const symbols = localStorage.getItem("symbolList");

  if (!symbols) {
    try {
      Http.get("/stock/all/symbols")
        .then((response) => {
          console.log("Stock symbols response:", response);
          localStorage.setItem("symbolList", JSON.stringify(response));
          initializeSearchPanel(response);
        })
        .catch((error) => {
          console.error("Error fetching stock symbols:", error);
        });
    } catch (error) {
      console.error("Error fetching stock symbols:", error);
    }
  } else {
    const symbolList = JSON.parse(symbols);
    initializeSearchPanel(symbolList);
  }
}

function initializeSearchPanel(symbols) {
  const searchInput = document.getElementById("stockSearch");
  const searchResults = document.getElementById("searchResults");

  searchInput.addEventListener("input", () => {
    const query = searchInput.value.toLowerCase().trim();
    searchResults.innerHTML = "";

    if (query) {
      const filteredSymbols = symbols.filter((symbol) =>
        symbol.toLowerCase().includes(query),
      );
      if (filteredSymbols.length > 0) {
        filteredSymbols.forEach((symbol) => {
          const resultItem = document.createElement("div");
          resultItem.className = "search-item";
          resultItem.textContent = symbol;
          resultItem.addEventListener("click", () => {
            window.location.href = `ticker.html?symbol=${symbol}`;
          });
          searchResults.appendChild(resultItem);
        });
        searchResults.classList.add("active");
      } else {
        searchResults.innerHTML = "";
        searchResults.classList.remove("active");
      }
    }
  });
  // Close search results when clicking outside
  document.addEventListener("click", function (event) {
    if (
      !searchInput.contains(event.target) &&
      !searchResults.contains(event.target)
    ) {
      searchResults.classList.remove("active");
    }
  });
}

document.addEventListener("DOMContentLoaded", InitSearchSymbols);
