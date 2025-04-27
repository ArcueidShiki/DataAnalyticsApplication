import yfinance as yf

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

# print(get_stock_news("AAPL"))


tickers = yf.Tickers('msft aapl goog')
# print(tickers.tickers['MSFT'].info)
# tickers.tickers['AAPL'].history(period="1mo")
# print(tickers.tickers['GOOG'].actions)

spy = yf.Ticker("SPY")
data = spy.funds_data

print(data.description)
print(data.fund_overview)
print(data.fund_operations)
print(data.asset_classes)
print(data.top_holdings)
print(data.equity_holdings)
print(data.bond_holdings)
print(data.bond_ratings)
print(data.sector_weightings)