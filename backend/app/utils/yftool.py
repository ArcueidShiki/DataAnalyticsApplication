from venv import logger
import yfinance as yf

class StockUtils:
    def stockquoteDaily(symbol, start_date, end_date):
        """
        Fetch daily stock data for a given symbol within a date range.
        """
        data = yf.download(symbol, start=start_date, end=end_date, interval="1d")
        return data[['Open', 'Close', 'High', 'Low', 'Volume']]

    def stockquoteWeekly(symbol, start_date, end_date):
        """
        Fetch weekly stock data for a given symbol within a date range.
        """
        data = yf.download(symbol, start=start_date, end=end_date, interval="1wk")
        return data[['Open', 'Close', 'High', 'Low', 'Volume']]

    def stockquoteMonthly(symbol, start_date, end_date):
        """
        Fetch monthly stock data for a given symbol within a date range.
        """
        data = yf.download(symbol, start=start_date, end=end_date, interval="1mo")
        return data[['Open', 'Close', 'High', 'Low', 'Volume']]

    def stockquoteQuarterly(symbol, start_date, end_date):
        """
        Fetch quarterly stock data for a given symbol within a date range.
        """
        data = yf.download(symbol, start=start_date, end=end_date, interval="3mo")
        return data[['Open', 'Close', 'High', 'Low', 'Volume']]

    def stockquoteYearly(symbol, start_date, end_date):
        """
        Fetch yearly stock data for a given symbol within a date range.
        """
        data = yf.download(symbol, start=start_date, end=end_date, interval="1y")
        return data[['Open', 'Close', 'High', 'Low', 'Volume']]

    def get_stock_news(symbol):
        """
        Fetch news articles for a given stock symbol.
        """
        stock = yf.Ticker(symbol)
        return stock.news

    def get_top_hot_stocks():
        """
        Return the top hot stocks based on their percentage change.
        """
        stock_symbols = ["AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "META", "NVDA", "NFLX", "AMD", "INTC"]
        hot_stocks = []
        for symbol in stock_symbols:
            try:
                # Extract the stock's data
                stock = yf.Ticker(symbol)
                open_price = stock.info.get("regularMarketOpen", 0)
                close_price = stock.info.get("regularMarketPrice", 0)
                percent_change = ((close_price - open_price) / open_price) * 100 if open_price else 0
                domain = convert_website_to_domain(stock.info.get("website", None))
                # Append stock info to the list
                hot_stocks.append({
                    "symbol": symbol,
                    "price": round(close_price, 2),
                    "percent_change": round(percent_change, 2),
                    "domain": domain
                })
            except Exception as e:
                print(f"Error fetching data for {symbol}: {e}")
        hot_stocks = sorted(hot_stocks, key=lambda x: x["percent_change"], reverse=True)
        return hot_stocks

def convert_website_to_domain(website):
    """
    Convert a website URL to its domain name.
    """
    if not website:
        return None
    if 'www' in website:
        return website.split('www.')[1]
    if 'http://' in website or 'https://' in website:
        return website.split('://')[1]