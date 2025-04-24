/**
 * Sidebar component handling
 * - Menu item activation
 * - Watchlist population and interaction
 * - Account section toggle
 * - Theme toggle
 */
class Sidebar {
    constructor() {
        this.currentPage = this.getCurrentPage();
        this.init();
    }

    // initialize the sidebar
    init() {
        this.loadSidebarContent().then(() => {
            this.setupMenuItems();
            this.populateWatchlist();
            this.setupAccountToggle();
            this.setupThemeToggle();
        });
    }

    // 获取当前页面名称
    getCurrentPage() {
        const path = window.location.pathname;
        const pageName = path.split('/').pop().split('.')[0];
        return pageName || 'watchlist';
    }

    // 获取当前选中的股票代码（如果在股票详情页）
    getCurrentSymbol() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('symbol') || 'AAPL';
    }

    // 加载侧边栏 HTML 内容
    async loadSidebarContent() {
        try {
            const response = await fetch('../html/sidebar.html');
            const htmlContent = await response.text();
            
            // 找到页面中的侧边栏容器并插入内容
            const sidebarContainer = document.querySelector('.sidebar');
            if (sidebarContainer) {
                sidebarContainer.innerHTML = htmlContent;
            }
            
            return true;
        } catch (error) {
            console.error('Failed to load sidebar content:', error);
            return false;
        }
    }

    // 设置菜单项高亮和点击事件
    setupMenuItems() {
        // 激活当前页面对应的菜单项
        const menuItems = document.querySelectorAll('.menu-item');
        menuItems.forEach(item => {
            const menuText = item.querySelector('span').textContent.trim().toLowerCase();
            
            if (this.currentPage.includes(menuText)) {
                item.classList.add('active');
            }
            
            // 添加点击事件
            item.addEventListener('click', () => {
                const menuName = item.querySelector('span').textContent.trim();
                
                switch(menuName.toLowerCase()) {
                    case 'watchlist':
                        window.location.href = '../html/watchlist.html';
                        break;
                    case 'my asset':
                        // 处理 My asset 页面跳转
                        break;
                    case 'top chart':
                        // 处理 Top chart 页面跳转
                        break;
                    case 'crypto':
                        // 处理 Crypto 页面跳转
                        break;
                    // 其他菜单项...
                }
            });
        });
    }

    // 填充 watchlist 数据并设置点击事件
    populateWatchlist() {
        // 示例数据 - 实际应用中应从 API 获取
        const watchlistStocks = [
            { symbol: 'AAPL', name: 'Apple Inc.', price: 147.04, change: 1.47, changeDirection: 'up' },
            { symbol: 'MSFT', name: 'Microsoft Corp.', price: 290.12, change: 0.89, changeDirection: 'up' },
            { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 2300.45, change: -1.23, changeDirection: 'down' },
            { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 3380.50, change: 2.15, changeDirection: 'up' },
            { symbol: 'TSLA', name: 'Tesla Inc.', price: 687.20, change: -0.75, changeDirection: 'down' }
        ];
        
        const watchlistContainer = document.getElementById('watchlistContainer');
        if (!watchlistContainer) return;
        
        const currentSymbol = this.getCurrentSymbol();
        
        watchlistContainer.innerHTML = '';
        
        watchlistStocks.forEach(stock => {
            const stockItem = document.createElement('div');
            stockItem.className = 'watchlist-item';
            
            // 如果当前页面是股票详情页，并且是当前股票，则高亮显示
            if (this.currentPage === 'watchlist-individual' && stock.symbol === currentSymbol) {
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
                    <div class="stock-symbol">${stock.symbol}</div>
                </div>
                <div class="price-change ${changeClass}">
                    <i class="fas ${changeIcon}"></i>
                    ${Math.abs(stock.change)}%
                </div>
            `;
            
            // 添加点击事件
            stockItem.addEventListener('click', () => {
                window.location.href = `../html/watchlist-individual.html?symbol=${stock.symbol}`;
            });
            
            watchlistContainer.appendChild(stockItem);
        });
    }

    // 设置账户设置的展开/收起
    setupAccountToggle() {
        const accountToggleBtn = document.getElementById('account-toggle-button');
        const accountSection = document.getElementById('account-section');
        
        if (accountToggleBtn && accountSection) {
            accountToggleBtn.addEventListener('click', () => {
                const isVisible = accountSection.style.display !== 'none';
                accountSection.style.display = isVisible ? 'none' : 'block';
                
                const arrow = accountToggleBtn.querySelector('.account-arrow');
                if (arrow) {
                    arrow.classList.toggle('fa-chevron-down');
                    arrow.classList.toggle('fa-chevron-up');
                }
            });
        }
    }

    // thene toggle
    setupThemeToggle() {
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
                }
            };

                // Update charts with new theme
            if (window.priceChart) {
                window.priceChart.updateOptions({
                    ...chartUpdateOptions,
                    yaxis: getYAxisConfig('price') // y-axis configuration
                },true);
            }
            
            if (window.candlestickChart) {
                window.candlestickChart.updateOptions({
                    yaxis: getYAxisConfig('candlestick')
                }, true);
            }
            
            if (window.volumeChart) {
                window.volumeChart.updateOptions({
                    yaxis: getYAxisConfig('volume') // y-axis configuration
                });
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
            
            updateAllChartsYAxis();
            
            // Save preference
            localStorage.setItem('theme', newTheme);


        });

        // Global variable to store the chart theme
        if (typeof ApexCharts !== 'undefined') {
            Apex = {
                grid: {
                    borderColor: currentTheme === 'dark' ? '#30363d' : '#e1e4e8',
                    strokeDashArray: 4,
                    padding: {
                        top: 0,
                        right: 20,
                        bottom: 0, 
                        left: 20
                    }
                },
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

    }
}

// 初始化侧边栏
document.addEventListener('DOMContentLoaded', () => {
    new Sidebar();
});