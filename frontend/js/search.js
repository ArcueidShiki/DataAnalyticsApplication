import Http from "./http.js";

export default class SearchBar {
  static instance = null;
  constructor() {
    if (SearchBar.instance) {
      console.log(
        "SearchBar instance already exists. Returning the existing instance.",
      );
      return SearchBar.instance;
    }
    SearchBar.instance = this;
    this.init();
  }

  static getInstance() {
    if (!SearchBar.instance) {
      SearchBar.instance = new SearchBar();
    }
    return SearchBar.instance;
  }

  init() {
    this.createSearchBar();
    this.InitSearchSymbols();
  }
  createSearchBar() {
    const searchBar = $(".search-container");
    searchBar.append(`
      <i class="fas fa-search search-icon"></i>
      <input
        type="text"
        class="search-input"
        placeholder="Search stocks..."
        id="stockSearch"
      />
      <div class="search-dropdown" id="searchResults"></div>
    `);
  }

  InitSearchSymbols() {
    const symbols = localStorage.getItem("symbolList");

    if (!symbols) {
      try {
        Http.get("/stock/all/symbols")
          .then((response) => {
            console.log("Stock symbols response:", response);
            localStorage.setItem("symbolList", JSON.stringify(response));
            this.initializeSearchPanel(response);
          })
          .catch((error) => {
            console.error("Error fetching stock symbols:", error);
          });
      } catch (error) {
        console.error("Error fetching stock symbols:", error);
      }
    } else {
      const symbolList = JSON.parse(symbols);
      this.initializeSearchPanel(symbolList);
    }
  }

  initializeSearchPanel(symbols) {
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
    document.addEventListener("click", (event) => {
      if (
        !searchInput.contains(event.target) &&
        !searchResults.contains(event.target)
      ) {
        searchResults.classList.remove("active");
      }
    });
  }
}
