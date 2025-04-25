
// update themeUI
function updateThemeUI(theme, icon, text) {
    if (theme === 'light') {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
        text.textContent = 'Light Mode';
    } else {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
        text.textContent = 'Dark Mode';
    }
}


// theme toggle function
function setupThemeToggle() {
    console.log('theme setting...');
    
    const themeToggle = document.getElementById('themeToggle');
    
    if (!themeToggle) {
        console.warn('button ID "themeToggle" not found');
        return;
    }
    
    const icon = themeToggle.querySelector('i');
    const text = themeToggle.querySelector('span');
    
    if (!icon || !text) {
        console.warn('lack of icon or text in themeToggle');
        return;
    }
    
    // 获取保存的主题或使用默认值
    const currentTheme = localStorage.getItem('theme') || 'dark';
    document.body.setAttribute('data-theme', currentTheme);
    
    // 更新图标和文本
    updateThemeUI(currentTheme, icon, text);
    
    // 点击切换主题
    themeToggle.addEventListener('click', function() {
        const currentTheme = document.body.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        // 更新主题
        document.body.setAttribute('data-theme', newTheme);
        
        // 更新UI
        updateThemeUI(newTheme, icon, text);

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
        
        // 保存偏好
        localStorage.setItem('theme', newTheme);
    });
    
    // 设置全局图表主题
    setupGlobalChartTheme(currentTheme);
}

function initTheme() {
    console.log('theme.js initTheme');
    
    setupThemeToggle();

    console.log('theme.js initTheme completed');
}

// 在DOM加载完成后执行初始化
document.addEventListener('DOMContentLoaded', initTheme);

