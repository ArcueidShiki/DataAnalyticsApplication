/**
 * Get watchlist stocks data
 * In real applications, this data should be fetched from an API
 * @returns {Array} Array of stock data
 */
function getWatchlistStocks() {
    return [
        { symbol: 'AAPL', name: 'AAPL', price: 147.04, change: 1.47, changeDirection: 'up' },
        { symbol: 'MSFT', name: 'MSFT', price: 290.12, change: 0.89, changeDirection: 'up' },
        { symbol: 'GOOGL', name: 'GOOGL', price: 2300.45, change: -1.23, changeDirection: 'down' },
        { symbol: 'AMZN', name: 'AMZN', price: 3380.50, change: 2.15, changeDirection: 'up' },
        { symbol: 'TSLA', name: 'TSLA', price: 687.20, change: -0.75, changeDirection: 'down' }
    ];
}

/**
 * Populate the stock watchlist
 * @param {string} containerId - Container element ID
 * @param {string} currentPage - Current page name
 * @returns {void}
 */
function populateWatchlist(containerId = 'watchlistContainer', currentPage = null) {
    console.log('Populating watchlist...');
    
    // Get current page name (if not provided)
    if (!currentPage) {
        const path = window.location.pathname;
        currentPage = path.split('/').pop().split('.')[0] || 'watchlist';
    }
    
    // Get current stock symbol
    const urlParams = new URLSearchParams(window.location.search);
    const currentSymbol = urlParams.get('symbol') || 'AAPL';
    
    // Get stock data
    const watchlistStocks = getWatchlistStocks();
    
    const watchlistContainer = document.getElementById(containerId);
    if (!watchlistContainer) {
        console.error(`Container with ID "${containerId}" not found`);
        return;
    }
    
    console.log(`Found container: ${containerId}, current page: ${currentPage}`);
    watchlistContainer.innerHTML = '';
    
    watchlistStocks.forEach(stock => {
        const stockItem = document.createElement('div');
        stockItem.className = 'watchlist-item';
        
        // Highlight the current stock if on individual stock page
        if (currentPage === 'watchlist-individual' && stock.symbol === currentSymbol) {
            stockItem.classList.add('active');
        }
        
        const changeClass = stock.changeDirection === 'up' ? 'positive' : 'negative';
        const changeIcon = stock.changeDirection === 'up' ? 'fa-caret-up' : 'fa-caret-down';
        
        stockItem.innerHTML = `
            <div class="watchlist-icon">
                ${stock.symbol.charAt(0)}
            </div>
            <div class="watchlist-info">
                <div class="stock-name">${stock.name}</div>
                <div class="stock-symbol">${stock.price}</div>
            </div>
            <div class="price-change ${changeClass}">
                <i class="fas ${changeIcon}"></i>
                ${Math.abs(stock.change)}%
            </div>
        `;
        
        // Add click event
        stockItem.addEventListener('click', () => {
            window.location.href = `../html/watchlist-individual.html?symbol=${stock.symbol}`;
        });
        
        watchlistContainer.appendChild(stockItem);
    });
    
    console.log('Watchlist populated successfully');
}

/**
 * Initialize sidebar functionality
 */
function initWatchlist() {
    console.log('Initializing sidebar...');
    
}

/**
 * Page initialization
 * Execute all necessary initializations after DOM is loaded
 */
function initPage() {
    console.log('Page initialization started');
    
    // 1. Initialize sidebar
    initWatchlist();
    
    // 2. Populate watchlist
    populateWatchlist();
    
    // 3. Other initialization operations...
    
    console.log('Page initialization completed');
}

// Execute initialization after DOM is loaded
document.addEventListener('DOMContentLoaded', initPage);

// If needed, some functions can be exported for use in other scripts
// export { populateWatchlist, getWatchlistStocks };