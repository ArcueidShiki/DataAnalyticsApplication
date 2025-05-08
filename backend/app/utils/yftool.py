from venv import logger
from flask import jsonify, logging
import yfinance as yf
# https://ranaroussi.github.io/yfinance/reference/yfinance.price_history.html
# Valid periods: 1d,5d,1mo,3mo,6mo,1y,2y,5y,10y,ytd,max Either Use period parameter or use start and end
# Valid intervals: 1m,2m,5m,15m,30m,60m,90m,1h,1d,5d,1wk,1mo,3mo Intraday data cannot extend last 60 days
# start: str Download start date string (YYYY-MM-DD) or _datetime, inclusive. Default is 99 years ago E.g. for start=”2020-01-01”, the first data point will be on “2020-01-01”
# end: str Download end date string (YYYY-MM-DD) or _datetime, exclusive. Default is now E.g. for end=”2023-01-01”, the last data point will be on “2022-12-31”

periods = ["1d", "5d", "1mo", "3mo", "6mo", "1y", "2y", "5y", "10y", "max"]
intervals = ["1m", "2m", "5m", "15m", "30m", "60m", "90m", "1d", "5d", "1wk", "1mo", "3mo"]
intraday_intervals = ["1m", "2m", "5m", "15m", "30m", "60m", "90m"]
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
    if '://' in website:
        return website.split('://')[1]

def get_intraday_data(symbol, interval='1m', period='1d'):
    """
    Fetch intraday data for a given stock symbol.
    """
    try:
        ticker = yf.Ticker(symbol)
        intraday_data = ticker.history(period=period, interval=interval)
        formatted_data = intraday_data[['Open', 'High', 'Low', 'Close', 'Volume']]
        print(formatted_data)
        return intraday_data
    except Exception as e:
        logger.error(f"Error fetching intraday data for {symbol}: {e}")
        return None

def check_period_interval(period, interval):
    if period not in periods or interval not in intervals:
        return False
    if interval in intraday_intervals and period not in ["1d", "5d", "1mo", "2mo"]:
        logging.error(f"Invalid period {period} for interval {interval}, Intraday data cannot extend last 60 days")
        return True

def get_ticker(symbol, interval='15m', period='1d'):
    if check_period_interval(period, interval):
        return jsonify({"error": f"Invalid period {period} for interval {interval}, Intraday data cannot extend last 60 days"}), 400
    stock = yf.Ticker(symbol)
    data = stock.history(period=period, interval=interval)

    if data.empty:
        return jsonify({"error": f"No data found for symbol: {symbol}"}), 404

    formatted_data = data[['Open', 'High', 'Low', 'Close', 'Volume']]
    print(formatted_data)
    # candlestick_data = []
    # volume_data = []
    # for index, row in data.iterrows():
    #     timestamp = int(index.timestamp() * 1000)  # Convert to milliseconds
    #     candlestick_data.append([
    #         timestamp,  # X-axis (time)
    #         row["Open"],  # Open
    #         row["Close"],  # Close
    #         row["Low"],  # Low
    #         row["High"],  # High
    #     ])
    #     volume_data.append([timestamp, row["Volume"]])  # Volume data

    # return jsonify({
    #     "symbol": symbol,
    #     "interval": interval,
    #     "candlestick": candlestick_data,
    #     "volume": volume_data,
    # }), 200

def get_price(symbol):
    """
    Fetch the current market price for a given stock symbol.
    """
    try:
        ticker = yf.Ticker(symbol)
        data = ticker.history(period="1d")
        if not data.empty:
            return round(data['Close'].iloc[-1], 2)
    except Exception as e:
        print(f"Error fetching price for {symbol}: {e}")
    return 0.0
