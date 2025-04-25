/**
 * Watchlist Container JS
 * 处理 watchlist 页面的所有功能，包括:
 * - 侧边栏菜单交互
 * - 股票列表显示
 * - 主题切换
 * - 账户部分展开/收起
 */

// 获取当前页面名称
function getCurrentPage() {
    const path = window.location.pathname;
    const pageName = path.split('/').pop().split('.')[0];
    return pageName || 'watchlist';
}

// 获取当前股票代码
function getCurrentSymbol() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('symbol') || 'AAPL';
}

// 设置菜单项点击事件和高亮
function setupMenuItems() {
    console.log('设置菜单项...');
    
    const currentPage = getCurrentPage();
    const menuItems = document.querySelectorAll('.menu-item');
    
    menuItems.forEach(item => {
        const spanElement = item.querySelector('span');
        
        // 安全检查：确保有span元素
        if (!spanElement) {
            console.warn('Menu item missing span element:', item);
            return;
        }
        
        const menuText = spanElement.textContent.trim().toLowerCase();
        
        // 高亮当前页面对应的菜单项
        if (currentPage.includes(menuText)) {
            item.classList.add('active');
            console.log('菜单项已激活:', menuText);
        }
        
        // 添加点击事件
        item.addEventListener('click', () => {
            const menuName = spanElement.textContent.trim();
            console.log('菜单项点击:', menuName);
            
            // 处理菜单导航
            switch(menuName.toLowerCase()) {
                case 'watchlist':
                    window.location.href = '../html/watchlist.html';
                    break;
                case 'my asset':
                    window.location.href = '../html/portfolio.html';
                    break;
                case 'top chart':
                    window.location.href = '../html/analysis.html';
                    break;
                case 'crypto':
                    window.location.href = '../html/crypto.html';
                    break;
                case 'account setting':
                    window.location.href = '../html/accountsetting.html';
                    break;
                case 'setting':
                    window.location.href = '../html/settings.html';
                    break;
                case 'help center':
                    window.location.href = '../html/help.html';
                    break;
                case 'logout':
                    handleLogout();
                    break;
                default:
                    console.warn(`未定义的菜单项导航: ${menuName}`);
                    break;
            }
        });
    });
}

// 设置账户部分切换
function setupAccountToggle() {
    
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

// 处理登出
function handleLogout() {
    if (confirm('确定要退出登录吗？')) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        window.location.href = '../html/login.html';
        console.log('用户已成功登出');
    } else {
        console.log('取消登出');
    }
}

// 获取用户关注的股票
function getWatchlistStocks() {
    // 这里可以使用实际的API调用来获取数据
    // 示例数据
    return [
        { symbol: 'AAPL', name: 'Apple Inc.', price: '$187.45', change: 1.25, changePercent: 0.67, changeDirection: 'up' },
        { symbol: 'MSFT', name: 'Microsoft Corporation', price: '$403.78', change: 0.83, changePercent: 0.21, changeDirection: 'up' },
        { symbol: 'GOOGL', name: 'Alphabet Inc.', price: '$176.32', change: -1.45, changePercent: 0.82, changeDirection: 'down' },
        { symbol: 'AMZN', name: 'Amazon.com Inc.', price: '$185.67', change: 3.21, changePercent: 1.76, changeDirection: 'up' },
        { symbol: 'TSLA', name: 'Tesla, Inc.', price: '$209.14', change: -4.53, changePercent: 2.12, changeDirection: 'down' }
    ];
}

/**
 * 初始化侧边栏功能
 */
function initSidebar() {
    console.log('初始化侧边栏...');
    setupMenuItems();
    setupAccountToggle();
    // setupThemeToggle();
}

/**
 * 页面初始化
 * 在DOM加载完成后执行所有必要的初始化
 */
function initSidepage() {
    console.log('页面初始化开始');
    
    // 1. 初始化侧边栏
    initSidebar();

    console.log('页面初始化完成');
}

// 在DOM加载完成后执行初始化
document.addEventListener('DOMContentLoaded', initSidepage);

// 如果需要，可以导出一些函数供其他脚本使用
// export { populateWatchlist, getWatchlistStocks };