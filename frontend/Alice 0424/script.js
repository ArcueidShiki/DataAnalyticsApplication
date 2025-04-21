document.addEventListener('DOMContentLoaded', function() {
    console.log('Script loaded and running');

    // Theme toggle functionality
    const themeToggle = document.getElementById('themeToggle');
    const icon = themeToggle.querySelector('i');
    const text = themeToggle.querySelector('span');
    
    // Check for saved theme preference or use default
    const currentTheme = localStorage.getItem('theme') || 'dark'; // Default to dark
    document.body.setAttribute('data-theme', currentTheme);
    
    // Update icon and text based on current theme
    if (currentTheme === 'light') {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
        text.textContent = 'Light Mode';
    } else {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
        text.textContent = 'Dark Mode';
    }

    
    // Toggle theme when button is clicked
    themeToggle.addEventListener('click', function() {
        const currentTheme = document.body.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        // Update data-theme attribute
        document.body.setAttribute('data-theme', newTheme);
            // Update chart theme if it exists
        const chartUpdateOptions = {
            tooltip: {
                theme: newTheme
            },
            grid: {
                borderColor: newTheme === 'dark' ? '#30363d' : '#e1e4e8'
            },
            xaxis: {
                labels: {
                    style: {
                        colors: newTheme === 'dark' ? '#8b949e' : '#666666'
                    }
                },
                axisBorder: {
                    color: newTheme === 'dark' ? '#30363d' : '#e1e4e8'
                }
            },
            yaxis: {
                labels: {
                    style: {
                        colors: newTheme === 'dark' ? '#8b949e' : '#666666'
                    }
                }
            }
        };

            // 更新所有图表
        if (window.priceChart) {
            window.priceChart.updateOptions(chartUpdateOptions);
        }
        
        if (window.candlestickChart) {
            window.candlestickChart.updateOptions(chartUpdateOptions);
        }
        
        if (window.volumeChart) {
            window.volumeChart.updateOptions(chartUpdateOptions);
        }

        // Update icon and text
        if (newTheme === 'light') {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
            text.textContent = 'Light Mode';
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
            text.textContent = 'Dark Mode';
        }
        
        // Save preference
        localStorage.setItem('theme', newTheme);

    });

    // Global variable to store the chart theme
    if (typeof ApexCharts !== 'undefined') {
        Apex = {
            chart: {
                fontFamily: 'Arial, sans-serif',
            },
            xaxis: {
                labels: {
                    style: {
                        fontSize: '14px'  // 全局 X 轴字体大小
                    }
                },
                axisBorder: {
                    show: true,
                    color: currentTheme === 'dark' ? '#30363d' : '#e1e4e8',
                    offsetX: 0,
                    offsetY: 0,
                    strokeDashArray: 4
                }
            },
            yaxis: {
                labels: {
                    style: {
                        fontSize: '14px'  // 全局 Y 轴字体大小
                    },
                    formatter: function(value) {
                        if (value >= 100000) return (value / 1000000).toFixed(2) + 'M';
                        return value.toFixed(2);
                    }
                },
                decimalsInFloat: 2
            }
        };
    }

    
    // Account section toggle functionality
    const accountToggleButton = document.getElementById('account-toggle-button');
    const accountSection = document.getElementById('account-section');
    const accountArrow = document.querySelector('.account-arrow');
    const profileToggle = document.getElementById('profile-toggle');
    
    // Function to toggle account section
    function toggleAccountSection() {
        if (accountSection.style.display === 'none') {
            accountSection.style.display = 'block';
            accountArrow.classList.remove('expanded');
        } else {
            accountSection.style.display = 'none';
            accountArrow.classList.add('expanded');
        }
    }
    
    // Toggle account section when clicking the toggle button
    if (accountToggleButton) {
        accountToggleButton.addEventListener('click', toggleAccountSection);
    }
    
    // Toggle account section when clicking the profile
    if (profileToggle) {
        profileToggle.addEventListener('click', toggleAccountSection);
    }


    // Tab switching functionality
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            const tabId = this.textContent.toLowerCase().trim() + '-tab';
            
            document.querySelectorAll('.tab-pane').forEach(pane => {
                pane.classList.remove('active');
            });
            
            const tabPane = document.getElementById(tabId);
            if (tabPane) {
                tabPane.classList.add('active');
            }
        });
    });

    // Menu item selection
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            menuItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Timeframe button selection
    const timeframeBtns = document.querySelectorAll('.timeframe-btn');
    timeframeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            console.log('Timeframe button clicked:', this.getAttribute('data-timeframe'));
            
            // 移除所有活动状态
            timeframeBtns.forEach(b => b.classList.remove('active'));
            // 为当前按钮添加活动状态
            this.classList.add('active');
            
            // 获取时间周期并更新图表
            const timeframe = this.getAttribute('data-timeframe');
            updateChartWithDummyData(timeframe);
        });
    });
    
    // Store followed stock data
    let followedStocks = JSON.parse(localStorage.getItem('followedStocks')) || {};
    
    // Follow button functionality - MODIFIED
    const followBtn = document.getElementById('followBtn');
    if (followBtn) {
        // Check if the current stock is already followed and update button state
        const currentSymbol = document.querySelector('.stock-details')?.textContent.split(': ')[1] || 'AAPL';
        const isFollowed = followedStocks[currentSymbol];
        
        if (isFollowed) {
            followBtn.innerHTML = '<i class="fas fa-check"></i> Followed';
            followBtn.classList.add('followed');
        }
        
        // Initialize stock logo on page load
        const stockCompany = document.querySelector('.stock-company')?.textContent || 'Apple Inc.';
        updateStockLogo(stockCompany, currentSymbol);
        
        followBtn.addEventListener('click', function() {
            const stockCompany = document.querySelector('.stock-company')?.textContent || 'Apple Inc.';
            const stockSymbol = document.querySelector('.stock-details')?.textContent.split(': ')[1] || 'AAPL';
            
            if (followBtn.classList.contains('followed')) {
                // Unfollow the stock
                followBtn.innerHTML = '<i class="fas fa-plus"></i> Follow';
                followBtn.classList.remove('followed');
                
                // Remove from localStorage
                delete followedStocks[stockSymbol];
                localStorage.setItem('followedStocks', JSON.stringify(followedStocks));
                
                // Remove from watchlist if exists
                const watchlistItem = document.querySelector(`.watchlist-item[data-symbol="${stockSymbol}"]`);
                if (watchlistItem) {
                    watchlistItem.remove();
                }
            } else {
                // Follow the stock
                followBtn.innerHTML = '<i class="fas fa-check"></i> Followed';
                followBtn.classList.add('followed');
                
                // Generate a random trend for the mini chart
                const trendIsPositive = Math.random() > 0.5;
                const trendPath = trendIsPositive ? 
                    'M1,15 L10,13 L20,10 L30,8 L40,5 L50,3 L59,1' : 
                    'M1,5 L10,8 L20,12 L30,10 L40,13 L50,15 L59,18';
                const trendColor = trendIsPositive ? 'var(--positive-color)' : 'var(--negative-color)';
                
                // Get the logo URL if we already fetched it for the stock logo
                const stockLogoImg = document.querySelector('.stock-logo img');
                const logoUrl = stockLogoImg?.src || null;
                
                // Save to localStorage with timestamp
                followedStocks[stockSymbol] = {
                    name: stockCompany,
                    symbol: stockSymbol,
                    dateAdded: new Date().toISOString(),
                    logo: logoUrl // Use the already fetched logo if available
                };
                localStorage.setItem('followedStocks', JSON.stringify(followedStocks));
                
                // Add to watchlist
                addToWatchlist(stockCompany, stockSymbol, trendPath, trendColor);
                
                // Try to fetch logo for watchlist if we don't have it yet
                if (!logoUrl) {
                    fetchCompanyLogo(stockCompany, stockSymbol);
                } else {
                    // Use the existing logo for the watchlist
                    updateWatchlistLogo(stockSymbol, logoUrl);
                }
            }
        });
    }
    
    // Function to add a stock to the watchlist
    function addToWatchlist(name, symbol, trendPath, trendColor) {
        const watchlistContainer = document.getElementById('watchlistContainer');
        if (!watchlistContainer) {
            console.error('Watchlist container not found');
            return;
        }
        
        // Generate a random background color based on the company name
        const backgroundColor = getColorFromName(name);
        
        // Create a new watchlist item
        const watchlistItem = document.createElement('div');
        watchlistItem.className = 'watchlist-item';
        watchlistItem.setAttribute('data-symbol', symbol);
        
        watchlistItem.innerHTML = `
            <div class="watchlist-icon" style="background-color: ${backgroundColor};">${name.charAt(0)}</div>
            <div class="watchlist-info">
                <div class="stock-name">${name}</div>
                <div class="stock-symbol">${symbol}</div>
            </div>
            <div class="stock-chart">
                <svg width="60" height="24" viewBox="0 0 60 24">
                    <path d="${trendPath}" stroke="${trendColor}" fill="none" stroke-width="1.5" />
                </svg>
            </div>
        `;
        
        // Add click event to the watchlist item
        watchlistItem.addEventListener('click', function() {
            // Update the main content with this stock's information
            updateMainContentWithStock(name, symbol);
        });
        
        // Add to the watchlist container
        watchlistContainer.appendChild(watchlistItem);
    }
    
    // Function to fetch company logo using Clearbit API or Google custom search
    function fetchCompanyLogo(companyName, symbol) {
        // First try with Clearbit API (which is free and doesn't require API key)
        const domain = guessDomainFromCompany(companyName);
        const clearbitUrl = `https://logo.clearbit.com/${domain}`;
        
        // Create an image element to test if the logo exists
        const logoImg = new Image();
        logoImg.onload = function() {
            // Logo loaded successfully, update the watchlist item
            updateWatchlistLogo(symbol, clearbitUrl);
            
            // Also update localStorage
            if (followedStocks[symbol]) {
                followedStocks[symbol].logo = clearbitUrl;
                localStorage.setItem('followedStocks', JSON.stringify(followedStocks));
            }
        };
        
        logoImg.onerror = function() {
            // Fallback to a placeholder or leave as is
            console.log(`Could not load logo for ${companyName}`);
            
            // You could implement a fallback to Google Custom Search API here
            // but it requires an API key - so we'll use the first letter as fallback
        };
        
        logoImg.src = clearbitUrl;
    }
    
    // Function to update watchlist item with logo
    function updateWatchlistLogo(symbol, logoUrl) {
        const watchlistItem = document.querySelector(`.watchlist-item[data-symbol="${symbol}"]`);
        if (!watchlistItem) return;
        
        const iconElement = watchlistItem.querySelector('.watchlist-icon');
        if (iconElement) {
            // Replace the letter with an image
            iconElement.innerHTML = `<img src="${logoUrl}" alt="${symbol}" style="width: 100%; height: 100%; object-fit: contain;">`;
            iconElement.style.backgroundColor = 'transparent';
        }
    }
    
    // Function to guess a company's domain name
    function guessDomainFromCompany(companyName) {
        // Remove common corporate suffixes and spaces
        let domain = companyName.toLowerCase()
            .replace(/\s+inc\.?$|\s+incorporated$|\s+corp\.?$|\s+corporation$|\s+llc$|\s+ltd\.?$|\s+limited$|\s+sa$|\s+s\.a\.$/i, '')
            .replace(/[\s\'\"\,\.\&]+/g, '')
            .trim();
        
        // Special cases for common companies
        const specialCases = {
            'apple': 'apple.com',
            'amazon': 'amazon.com',
            'microsoft': 'microsoft.com',
            'google': 'google.com',
            'alphabet': 'abc.xyz',
            'tesla': 'tesla.com',
            'facebook': 'fb.com',
            'meta': 'meta.com',
            'netflix': 'netflix.com',
            'spotify': 'spotify.com'
        };
        
        if (specialCases[domain]) {
            return specialCases[domain];
        }
        
        // Default fallback
        return domain + '.com';
    }
    
    // Function to generate a consistent color from a string
    function getColorFromName(name) {
        // Simple hash function
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        
        // Convert to hex color
        let color = '#';
        for (let i = 0; i < 3; i++) {
            const value = (hash >> (i * 8)) & 0xFF;
            color += ('00' + value.toString(16)).substr(-2);
        }
        
        return color;
    }
    
    // Function to update main content with selected stock
    function updateMainContentWithStock(name, symbol) {
        // Update stock title and details
        const stockCompanyEl = document.querySelector('.stock-company');
        const stockDetailsEl = document.querySelector('.stock-details');
        
        if (stockCompanyEl) stockCompanyEl.textContent = name;
        if (stockDetailsEl) stockDetailsEl.textContent = `NASDAQ: ${symbol}`;
        
        // Update follow button state
        if (followBtn) {
            if (followedStocks[symbol]) {
                followBtn.innerHTML = '<i class="fas fa-check"></i> Followed';
                followBtn.classList.add('followed');
            } else {
                followBtn.innerHTML = '<i class="fas fa-plus"></i> Follow';
                followBtn.classList.remove('followed');
            }
        }
        
        // Update chart with new data
        updateChartWithDummyData('1D');
        
        // Update breadcrumb
        const breadcrumbSpan = document.querySelector('.breadcrumb span');
        if (breadcrumbSpan) {
            breadcrumbSpan.textContent = name;
        }
        
        // Update stock logo
        updateStockLogo(name, symbol);
    }
    
    // Function to update the main stock logo
    function updateStockLogo(name, symbol) {
        const stockLogo = document.querySelector('.stock-logo');
        if (!stockLogo) return;
        
        // Check if we already have the logo in localStorage
        if (followedStocks[symbol] && followedStocks[symbol].logo) {
            stockLogo.innerHTML = `<img src="${followedStocks[symbol].logo}" alt="${name}" >`;
        } else {
            // If not followed or no logo, try to fetch it
            const domain = guessDomainFromCompany(name);
            const logoUrl = `https://logo.clearbit.com/${domain}`;
            
            // Create an image element to test if the logo exists
            const logoImg = new Image();
            logoImg.onload = function() {
                // Logo loaded successfully
                stockLogo.innerHTML = `<img src="${logoUrl}" alt="${name}">`;
                
                // Save to followedStocks if this stock is followed
                if (followedStocks[symbol]) {
                    followedStocks[symbol].logo = logoUrl;
                    localStorage.setItem('followedStocks', JSON.stringify(followedStocks));
                }
            };
            
            logoImg.onerror = function() {
                // Use default Apple logo or placeholder
                stockLogo.innerHTML = `<img src="/api/placeholder/40/40" alt="${name}">`;
            };
            
            logoImg.src = logoUrl;
        }
    }
    
    // Search functionality
    const searchInput = document.getElementById('stockSearch');
    const searchResults = document.getElementById('searchResults');
    
    if (searchInput && searchResults) {
        searchInput.addEventListener('input', function() {
            const query = this.value.trim();
            
            if (query.length >= 2) {
                // Show dummy search results
                searchResults.innerHTML = `
                    <div class="search-item">
                        <div class="search-stock-icon" style="background-color: #ff9900;">
                            A
                        </div>
                        <div class="search-stock-info">
                            <div class="search-stock-name">Apple Inc.</div>
                            <div class="search-stock-symbol">AAPL · NASDAQ</div>
                        </div>
                    </div>
                    <div class="search-item">
                        <div class="search-stock-icon" style="background-color: #3b82f6;">
                            A
                        </div>
                        <div class="search-stock-info">
                            <div class="search-stock-name">Amazon.com Inc.</div>
                            <div class="search-stock-symbol">AMZN · NASDAQ</div>
                        </div>
                    </div>
                `;
                searchResults.classList.add('active');
                
                // Add click event to search items
                setupSearchItemEvents();
            } else {
                searchResults.innerHTML = '';
                searchResults.classList.remove('active');
            }
        });
        
        // Close search results when clicking outside
        document.addEventListener('click', function(event) {
            if (!searchInput.contains(event.target) && !searchResults.contains(event.target)) {
                searchResults.classList.remove('active');
            }
        });
    }
    
    // Function to add click events to search items
    function setupSearchItemEvents() {
        document.querySelectorAll('.search-item').forEach(item => {
            item.addEventListener('click', function() {
                const symbol = this.querySelector('.search-stock-symbol').textContent.split(' · ')[0];
                const name = this.querySelector('.search-stock-name').textContent;
                
                // Update UI with the selected stock info
                updateMainContentWithStock(name, symbol);
                
                // Update company information
                fetchAndDisplayCompanyInfo(symbol);
                
                // Hide search results
                searchResults.classList.remove('active');
            });
        });
    }
    
    // Initialize chart with proper options
    initializeChart();
    
    // Function to generate the company profile HTML based on API data
    function generateCompanyProfileSection(symbol, companyInfo) {
        // If we have earnings data
        if (companyInfo.success && companyInfo.events.length > 0) {
            const latestEvent = companyInfo.events[0]; // Most recent earnings event
            
            return `
                <div class="company-about-section">
                    <h3>About</h3>
                    <div class="company-description">
                        <p>${companyInfo.description}</p>
                    </div>
                    
                    <h3>Latest Earnings</h3>
                    <div class="earnings-data">
                        <div class="earnings-item">
                            <span class="earnings-label">Event:</span>
                            <span class="earnings-value">${latestEvent.eventname}</span>
                        </div>
                        <div class="earnings-item">
                            <span class="earnings-label">Date:</span>
                            <span class="earnings-value">${new Date(latestEvent.startdatetime).toLocaleDateString()}</span>
                        </div>
                        <div class="earnings-item">
                            <span class="earnings-label">EPS Estimate:</span>
                            <span class="earnings-value">$${latestEvent.epsestimate.toFixed(2)}</span>
                        </div>
                        <div class="earnings-item">
                            <span class="earnings-label">EPS Actual:</span>
                            <span class="earnings-value">$${latestEvent.epsactual.toFixed(2)}</span>
                        </div>
                        <div class="earnings-item">
                            <span class="earnings-label">Surprise:</span>
                            <span class="earnings-value ${latestEvent.epssurprisepct >= 0 ? 'positive' : 'negative'}">
                                ${latestEvent.epssurprisepct >= 0 ? '+' : ''}${latestEvent.epssurprisepct.toFixed(2)}%
                            </span>
                        </div>
                    </div>
                </div>
            `;
        } else {
            // Fallback if no earnings data is available
            return `
                <div class="company-about-section">
                    <h3>About</h3>
                    <div class="company-description">
                        <p>${companyInfo.description || `${symbol} is a publicly traded company.`}</p>
                    </div>
                    <p class="no-data-message">No recent earnings data available for ${symbol}.</p>
                </div>
            `;
        }
    }
    
    // Function to fetch and display company information
    async function fetchAndDisplayCompanyInfo(symbol) {
        const companyTab = document.getElementById('company-tab');
        
        if (!companyTab) {
            console.error('Company tab element not found');
            return;
        }
        
      // Show loading indicator
      companyTab.innerHTML = '<div class="loading-indicator"><i class="fas fa-spinner fa-spin"></i> Loading company information...</div>';
        
      try {
          // Fetch company profile using the Yahoo Finance Profile API
        const corsProxy = 'https://cors-anywhere.herokuapp.com/';
        const apiUrl = `https://yahoo-finance-real-time1.p.rapidapi.com/stock/get-profile?region=US&lang=en-US&symbol=${symbol}`;
        const proxiedUrl = corsProxy + apiUrl;

        const options = {
            method: 'GET',
            headers: {
                'x-rapidapi-key': 'cb267e4695mshec871a33d8235dbp105c8djsn1d50d3d89384',
                'x-rapidapi-host': 'yahoo-finance-real-time1.p.rapidapi.com'
            }
        };
          
        const response = await fetch(proxiedUrl, options);
        const result = await response.json();
        
        if (result.status === "success" && result.data) {
            // Generate and display the HTML
            companyTab.innerHTML = generateCompanyProfileHTML(result.data);
        } else {
            throw new Error('API returned unsuccessful response');
        }

        } catch (error) {
            console.error('Error:', error);
            companyTab.innerHTML = '<div class="error-message">Unable to load company information. Please try again later.</div>';
        }
    }

    // Setup the company profile tab
    function setupCompanyTab() {
        // Get the current stock symbol (this should be available in your app)
        const currentSymbol = document.getElementById('stockSymbol')?.textContent || 'AAPL';
        
        // Fetch and display company information for the current symbol
        fetchAndDisplayCompanyInfo(currentSymbol);
    }

    // Initialize chart
    function initializeChart() {
        const theme = document.body.getAttribute('data-theme');
        const isPositive = true; // Default to positive trend

        window.originalChartData = generateDummyData('1D');
        window.candlestickData = generateCandlestickData('1D');
        // 确保candlestickData是一个数组
        console.log('Candlestick data type:', typeof window.candlestickData);
        console.log('Is candlestick data array?', Array.isArray(window.candlestickData));

        try {
            window.volumeData = generateVolumeData(window.candlestickData);
        } catch (error) {
            console.error('Error generating volume data:', error);
            window.volumeData = [];
        }

        const chartOptions = {
            series: [{
                name: 'Price',
                data: window.originalChartData // Start with 1D timeframe
            }],
            chart: {
                type: 'area',
                height: 150,
                width: '100%',
                id: 'priceChart',
                group: 'stock-charts',
                toolbar: {
                    show: false
                },
                zoom: {
                    enabled: true,
                    type: 'x',
                    autoScaleYaxis: true
                },
                pan: {
                    enabled: true,
                    type: 'x'      
                },
                animations: {
                    enabled: true,
                    dynamicAnimation: {
                        speed: 350
                    }
                },
                background: 'transparent'
            },
            dataLabels: {
                enabled: false
            },
            stroke: {
                curve: 'smooth',
                width: 2,
                colors: [isPositive ? 'var(--positive-color)' : 'var(--negative-color)']
            },
            fill: {
                type: 'gradient',
                gradient: {
                    shadeIntensity: 1,
                    opacityFrom: 0.7,
                    opacityTo: 0.2,
                    stops: [0, 100],
                    colorStops: [
                        {
                            offset: 0,
                            color: isPositive ? 'var(--positive-color)' : 'var(--negative-color)',
                            opacity: 0.2
                        },
                        {
                            offset: 100,
                            color: isPositive ? 'var(--positive-color)' : 'var(--negative-color)',
                            opacity: 0
                        }
                    ]
                }
            },
            xaxis: {
                type: 'datetime',
                labels: {
                    show: false
                },
                axisTicks: {
                    show: false
                }
            },
            yaxis: {
                labels: {
                    style: {
                        colors: theme === 'dark' ? '#8b949e' : '#666666'
                    }
                }
            },
            grid: {
                borderColor: theme === 'dark' ? '#30363d' : '#e1e4e8',
                strokeDashArray: 4,
                padding: {
                    top: 0,
                    right: 20,
                    bottom: 0,
                    left: 20
                }
            },
            tooltip: {
                theme: theme,
                x: {
                    format: 'yyyy-MM-dd'
                },
                y: {
                    formatter: function(value) {
                        return '$' + value.toFixed(2);
                    }
                }
            }
        };

        // Create candlestick chart options
        const candlestickOptions = {
            series: [{
                name: 'Candlestick',
                data: window.candlestickData
            }],
            chart: {
                type: 'candlestick',
                height: 250,
                width: '100%',
                id: 'candlestickChart',
                group: 'stock-charts',
                toolbar: {
                    show: false
                },
                zoom: {
                    enabled: false  // Disable zoom for candlestick chart
                },
                animations: {
                    enabled: false
                },
                background: 'transparent'
            },
            plotOptions: {
                candlestick: {
                    colors: {
                        upward: 'var(--positive-color)',
                        downward: 'var(--negative-color)'
                    }
                }
            },
            xaxis: {
                type: 'datetime',
                labels: {
                    style: {
                        colors: theme === 'dark' ? '#8b949e' : '#666666'
                    },
                    datetimeFormatter: {
                        year: 'yyyy',
                        month: "yy/MM",
                        day: 'MM/dd',
                        hour: 'HH:mm'
                    },
                }
            },
            yaxis: {
                tooltip: {
                    enabled: true
                },
                labels: {
                    style: {
                        colors: theme === 'dark' ? '#8b949e' : '#666666'
                    }
                }
            },
            grid: {
                borderColor: theme === 'dark' ? '#30363d' : '#e1e4e8',
                strokeDashArray: 4,
            },
            tooltip: {
                theme: theme,
                x: {
                    format: 'yyyy-MM-dd'
                },
                y: {
                    formatter: function(value) {
                        return '$' + value.toFixed(2);
                    }
                }
            }
        };

        // Create volume chart options
        const volumeOptions = {
            series: [{
                name: 'Volume',
                data: window.volumeData
            }],
            chart: {
                type: 'bar',
                height: 150,
                width: '100%',
                id: 'volumeChart',
                group: 'stock-charts',
                toolbar: {
                    show: false
                },
                zoom: {
                    enabled: false
                },
                animations: {
                    enabled: false
                }
            },
            plotOptions: {
                bar: {
                    columnWidth: '80%',
                }
            },
            dataLabels: {
                enabled: false
            },
            xaxis: {
                type: 'datetime',
                labels: {
                    show: false
                },
                axisTicks: {
                    show: false
                }
            },
            yaxis: {
                labels: {
                    show: true,
                    style: {
                        colors: theme === 'dark' ? '#8b949e' : '#666666',
                        fontSize: '14px'
                    }
                }
            },
            grid: {
                borderColor: theme === 'dark' ? '#30363d' : '#e1e4e8',
                strokeDashArray: 4
            },
            tooltip: {
                theme: theme,
                shared: true,
                intersect: false,
                x: {
                    format: 'yyyy-MM-dd'
                },
                y: {
                    formatter: function(value) {
                        return value.toLocaleString();
                    }
                }
            },
            states: {
                hover: {
                    filter: 'none'
                }
            }
        };

        // 创建包含两个图表的DOM结构
        const chartElement = document.querySelector("#priceChart");
        const candlestickElement = document.querySelector("#candlestickChart");
        const volumeElement = document.querySelector("#volumeChart");

        if (chartElement && candlestickElement && volumeElement) {
            // Check if ApexCharts is available
            if (typeof ApexCharts !== 'undefined') {
                // Create the area chart
                window.priceChart = new ApexCharts(chartElement, chartOptions);
                window.candlestickChart = new ApexCharts(candlestickElement, candlestickOptions);
                window.volumeChart = new ApexCharts(volumeElement, volumeOptions);

                // Render the charts
                window.priceChart.render();
                window.volumeChart.render();
                window.candlestickChart.render();

                // Ensure chart controls are set up
                setupChartControls();
            } else {
                console.error('ApexCharts library not loaded');
                chartElement.innerHTML = '<div style="padding: 20px; text-align: center;">Chart library not loaded</div>';
            }
        } else {
            console.error('Chart container not found');
        }
    }

    function zoomCharts(newMin, newMax) {
        if (window.priceChart) {
            window.priceChart.zoomX(newMin, newMax);
        }
        if (window.candlestickChart) {
            window.candlestickChart.zoomX(newMin, newMax);
        }
        if (window.volumeChart) {
            window.volumeChart.zoomX(newMin, newMax);
        }
    }

    // Setup chart controls (buttons)
    function setupChartControls() {

        // Get chart control buttons
        const moveLeftBtn = document.getElementById('chartMoveLeft');
        const moveRightBtn = document.getElementById('chartMoveRight');
        const zoomInBtn = document.getElementById('chartZoomIn');
        const zoomOutBtn = document.getElementById('chartZoomOut');
        const resetBtn = document.getElementById('chartReset');

            // 重置缩放和平移状态变量
        window.chartZoomLevel = window.chartZoomLevel || 0;
        window.chartPanPosition = window.chartPanPosition || 0;
        
        // 设置缩放和平移限制
        const MAX_ZOOM = 5;
        const MIN_ZOOM = -2;
        const MAX_PAN = 300;

        // 向左移动
        if (moveLeftBtn) {
            moveLeftBtn.addEventListener('click', function() {
                console.log('Chart move left clicked');
                if (window.priceChart && window.chartPanPosition > -MAX_PAN) {
                    window.chartPanPosition -= 50;
                    try {
                        // move line chart
                        window.priceChart.zoomX(
                            window.priceChart.w.globals.minX - 50000000, // 使用更大的数值确保移动明显
                            window.priceChart.w.globals.maxX - 50000000
                        );
                        // move candlestick chart
                        window.candlestickChart.zoomX(
                            window.candlestickChart.w.globals.minX - 50000000,
                            window.candlestickChart.w.globals.maxX - 50000000
                        );
                    } catch (e) {
                        console.error('Error moving chart left:', e);
                    }
                }
            });
        }

        // 向右移动
        if (moveRightBtn) {
            moveRightBtn.addEventListener('click', function() {
                console.log('Chart move right clicked');
                if (window.priceChart && window.chartPanPosition < MAX_PAN) {
                    window.chartPanPosition += 50;
                    try {
                        // move line chart
                        window.priceChart.zoomX(
                            window.priceChart.w.globals.minX + 50000000,
                            window.priceChart.w.globals.maxX + 50000000
                        );
                        // move candlestick chart
                        window.candlestickChart.zoomX(
                            window.candlestickChart.w.globals.minX + 50000000,
                            window.candlestickChart.w.globals.maxX + 50000000
                        );
                    } catch (e) {
                        console.error('Error moving chart right:', e);
                    }
                }
            });
        }
        
        // 放大
        if (zoomInBtn) {
            zoomInBtn.addEventListener('click', function() {
                console.log('Chart zoom in clicked');
                if (window.priceChart && window.chartZoomLevel < MAX_ZOOM) {
                    window.chartZoomLevel++;
                    
                    try {
                        const currentMin = window.priceChart.w.globals.minX;
                        const currentMax = window.priceChart.w.globals.maxX;
                        const range = currentMax - currentMin;
                        const zoomFactor = 0.2; // 每次缩放20%
                        
                        const newMin = currentMin + (range * zoomFactor / 2);
                        const newMax = currentMax - (range * zoomFactor / 2);
                        
                        zoomCharts(newMin, newMax);
                    } catch (e) {
                        console.error('Error zooming in chart:', e);
                    }
                }
            });
        }
        
        // 缩小
        if (zoomOutBtn) {
            zoomOutBtn.addEventListener('click', function() {
                console.log('Chart zoom out clicked');
                if (window.priceChart && window.chartZoomLevel > MIN_ZOOM) {
                    window.chartZoomLevel--;
                    
                    try {
                        const currentMin = window.priceChart.w.globals.minX;
                        const currentMax = window.priceChart.w.globals.maxX;
                        const range = currentMax - currentMin;
                        const zoomFactor = 0.25; // 每次放大25%
                        
                        const newMin = currentMin - (range * zoomFactor / 2);
                        const newMax = currentMax + (range * zoomFactor / 2);
                        
                        zoomCharts(newMin, newMax);
                    } catch (e) {
                        console.error('Error zooming out chart:', e);
                    }
                }
            });
        }
        
        // 重置
        if (resetBtn) {
            resetBtn.addEventListener('click', function() {
                console.log('Chart reset clicked');
                // 重置缩放和平移状态
                window.chartZoomLevel = 0;
                window.chartPanPosition = 0;
                
                // 使用 timeframe 更新图表，回到初始状态
                try {
                    const activeTimeframe = document.querySelector('.timeframe-btn.active');
                    const timeframe = activeTimeframe ? activeTimeframe.getAttribute('data-timeframe') : '1D';
                    
                    updateChartWithDummyData(timeframe);
                } catch (e) {
                    console.error('Error resetting chart:', e);
                    
                    // 备用重置方法
                    if (window.priceChart) {
                        window.priceChart.updateSeries([{
                            data: window.originalChartData
                        }]);
                    }
                    if (window.candlestickChart) {
                        window.candlestickChart.updateSeries([{
                            data: window.candlestickData
                        }]);
                    }
                }
            });
        }
        
        console.log('Chart controls have been set up');
    }

    // Generate different dummy data based on timeframe for candlestick chart
    function generateCandlestickData(timeframe) {
        const data = [];
        const now = new Date();
        let points = 30;
        let intervalHours = 24;
        // Determine number of points and interval based on timeframe
        switch(timeframe) {
            case '1D':
                points = 24;
                intervalHours = 1; // 1 hour intervals
                break;
            case '1W':
                points = 7;
                intervalHours = 24; // 1 day intervals
                break;
            case '1M':
                points = 30;
                intervalHours = 24; // 1 day intervals
                break;
            case '1Y':
                points = 12;
                intervalHours = 24 * 30; // 1 month intervals
                break;
            case 'ALL':
                points = 10;
                intervalHours = 24 * 365; // 1 year intervals
                break;
        }
        // Starting price and volatility parameters
        let price = 145;
        let volatility = 0.02;

        // Adjust volatility based on timeframe
        if (timeframe === '1Y' || timeframe === 'ALL') volatility = 0.05;
        
        // Generate data points
        for (let i = 0; i < points; i++) {
            const date = new Date(now);
            date.setHours(now.getHours() - (points - i) * intervalHours);
            
            // Generate OHLC data with some randomness
            const priceChange = (Math.random() - 0.5) * volatility * price;
            const open = price;
            // 确保蜡烛图有一定的随机性，同时保持合理的价格范围
            const high = open + Math.abs(priceChange) * Math.random() * 2;
            const low = open - Math.abs(priceChange) * Math.random() * 2;
            const close = open + priceChange;
            
            // Update price for next iteration
            price = close;
            
            // Keep price within reasonable bounds
            price = Math.max(price, 100);
            price = Math.min(price, 200);
            
            data.push({
                x: date.getTime(),
                y: [open, high, low, close].map(p => parseFloat(p.toFixed(2)))
            });
        }
        
        return data;
    }

    // Generate different dummy data based on timeframe
    function generateDummyData(timeframe) {
        const data = [];
        const now = new Date();
        let points = 30;
        let intervalHours = 24;
        
        switch(timeframe) {
            case '1D':
                points = 24;
                intervalHours = 1; // 1 hour intervals
                break;
            case '1W':
                points = 7;
                intervalHours = 24; // 1 day intervals
                break;
            case '1M':
                points = 30;
                intervalHours = 24; // 1 day intervals
                break;
            case '1Y':
                points = 12;
                intervalHours = 24 * 30; // 1 month intervals
                break;
            case 'ALL':
                points = 10;
                intervalHours = 24 * 365; // 1 year intervals
                break;
        }
        
        // Starting price and trend
        let price = 145;
        let trend = Math.random() > 0.5 ? 1 : -1;
        let volatility = 0.01;
        
        // Adjust volatility based on timeframe
        if (timeframe === '1Y' || timeframe === 'ALL') volatility = 0.05;
        
        // Generate data points
        for (let i = 0; i < points; i++) {
            const date = new Date(now);
            date.setHours(now.getHours() - (points - i) * intervalHours);
            
            // Add some randomness to the price
            const change = (Math.random() - 0.5) * volatility * price;
            price += trend * Math.abs(change);
            
            // Occasionally change trend direction
            if (Math.random() < 0.1) trend *= -1;
            
            // Keep price within reasonable bounds
            price = Math.max(price, 100);
            price = Math.min(price, 200);
            
            data.push([date.getTime(), price]);
        }
        
        return data;
    }

    // Update chart with new data based on timeframe selection
    function updateChartWithDummyData(timeframe) {
        if (!window.priceChart || !window.candlestickChart || !window.volumeChart) {
            console.error('One or more charts not initialized');
            return;
        }

        // Generate new data based on selected timeframe
        const newData = generateDummyData(timeframe);
        const newCandlestickData = generateCandlestickData(timeframe);
        const newVolumeData = generateVolumeData(newCandlestickData);

        // 保存原始数据以供重置使用
        window.originalChartData = newData;
        window.candlestickData = newCandlestickData;
        window.volumeData = newVolumeData;

        // 确定价格趋势（用于颜色显示）
        const isPositive = newData[0][1] < newData[newData.length-1][1];
        const tooltipFormat = getTooltipDateFormat(timeframe);

        // 重置缩放和平移状态
        window.chartZoomLevel = 0;
        window.chartPanPosition = 0;

        // 使用新数据更新价格图表
        try {
            // 更新价格图表
            window.priceChart.updateSeries([{
                data: newData
            }]);
    
            window.priceChart.updateOptions({
                stroke: {
                    colors: [isPositive ? 'var(--positive-color)' : 'var(--negative-color)']
                },
                fill: {
                    gradient: {
                        colorStops: [
                            {
                                offset: 0,
                                color: isPositive ? 'var(--positive-color)' : 'var(--negative-color)',
                                opacity: 0.2
                            },
                            {
                                offset: 100,
                                color: isPositive ? 'var(--positive-color)' : 'var(--negative-color)',
                                opacity: 0
                            }
                        ]
                    }
                },
                tooltip: {
                    x: {
                        format: tooltipFormat
                    }
                }
            });

            // 更新蜡烛图
            window.candlestickChart.updateSeries([{
                data: newCandlestickData
            }]);

            // 更新交易量图表
            window.volumeChart.updateSeries([{
                data: newVolumeData
            }]);

            console.log('Charts updated successfully for timeframe:', timeframe);
        } catch (error) {
            console.error('Error updating charts:', error);
        }
    }

    // 添加生成交易量数据的函数
    function generateVolumeData(candlestickData) {
        // 使用蜡烛图数据生成对应的交易量数据
        const data = [];

        if (!candlestickData || !Array.isArray(candlestickData)) {
            console.error('Invalid candlestick data format:', candlestickData);
            return [];
        }

        // 为每个蜡烛图数据点生成对应的交易量
        for (let i = 0; i < candlestickData.length; i++) {
            const candle = candlestickData[i];

            try {
                const timestamp = candle.x;
                const [open, high, low, close] = candle.y;

                // 根据价格波动生成交易量
                const priceChange = Math.abs(close - open);
                const baseVolume = Math.random() * 1000000 + 500000;
                const volume = baseVolume * (1 + priceChange / 5);

                // 按照涨跌判断交易量柱状图颜色
                const isPositive = close >= open;

                data.push({
                    x: timestamp,
                    y: Math.round(volume),
                    fillColor: isPositive ? 'var(--positive-color)' : 'var(--negative-color)'
                });
            } catch (error) {
                console.error('Error processing candle data:', error, candle);
            }
        }

        return data;
    }

    // Get appropriate date format for chart tooltip based on timeframe
    function getTooltipDateFormat(timeframe) {
        switch(timeframe) {
            case '1D':
                return 'HH:mm';
            case '1W':
                return "'yy-MM-dd";
            case '1M':
            case '1Y':
                return "'yy/MM";
            case 'ALL':
                return "'yyyy";
            default:
                return "'yy-MM";
        }
    }
    
    // Update chart theme when theme changes
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.attributeName === 'data-theme' && window.priceChart) {
                const theme = document.body.getAttribute('data-theme');
                window.priceChart.updateOptions({
                    tooltip: {
                        theme: theme
                    },
                    grid: {
                        borderColor: theme === 'dark' ? '#444b55' : '#e1e4e8'
                    },
                    xaxis: {
                        labels: {
                            style: {
                                colors: theme === 'dark' ? '#8b949e' : '#666666'
                            }
                        }
                    },
                    yaxis: {
                        labels: {
                            style: {
                                colors: theme === 'dark' ? '#8b949e' : '#666666'
                            }
                        }
                    }
                });
            }
        });
    });
    
    observer.observe(document.documentElement, {
        attributes: true
    });
    
    // Load saved watchlist from localStorage
    function loadSavedWatchlist() {
        const watchlistContainer = document.getElementById('watchlistContainer');
        if (!watchlistContainer) return;
        
        // Clear existing watchlist except for the "Add" button
        watchlistContainer.innerHTML = '';
        
        // Loop through saved stocks and add them to the watchlist
        for (const symbol in followedStocks) {
            const stock = followedStocks[symbol];
            
            // Generate a random trend for the mini chart
            const trendIsPositive = Math.random() > 0.5;
            const trendPath = trendIsPositive ? 
                'M1,15 L10,13 L20,10 L30,8 L40,5 L50,3 L59,1' : 
                'M1,5 L10,8 L20,12 L30,10 L40,13 L50,15 L59,18';
            const trendColor = trendIsPositive ? 'var(--positive-color)' : 'var(--negative-color)';
            
            // Add to watchlist
            addToWatchlist(stock.name, symbol, trendPath, trendColor);
            
            // If we have a saved logo, update it
            if (stock.logo) {
                updateWatchlistLogo(symbol, stock.logo);
            } else {
                // Try to fetch logo if we don't have one saved
                fetchCompanyLogo(stock.name, symbol);
            }
        }
    }
    
    // Initialize tab setup
    const defaultTab = document.querySelector('.tab');
    if (defaultTab) {
        defaultTab.click(); // Activate the first tab by default
    }

    // Load saved watchlist
    loadSavedWatchlist();
    // Initialize company tab
    setupCompanyTab();
    

    
});