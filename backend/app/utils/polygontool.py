import logging
from polygon.rest import RESTClient
from datetime import datetime, timedelta

class Polygon:
    _instance = None

    def __new__(cls, *args, **kwargs):
        if not cls._instance:
            cls._instance = super(Polygon, cls).__new__(cls, *args, **kwargs)
        return cls._instance

    def __init__(self):
        if not hasattr(self, "client"):
            self.API_KEY = "O0f43W3ucKbFkB32_1JpehLCLIznObMz"
            self.client = RESTClient(self.API_KEY)

    def get_all_symbols(self, date = None):
        """
        https://polygon.io/docs/rest/stocks/aggregates/daily-market-summary
        get all symbols from polygon.io at initialization to populate or update
        us_stocks, daily_us_market table
        """
        if not date:
            yesterday = (datetime.now() - timedelta(days=1)).strftime('%Y-%m-%d')
            date = yesterday
        results = self.client.get_grouped_daily_aggs(
            date,
            adjusted="true",
        )
        return results

    def get_ticker_overview(self, symbol):
        """
        https://polygon.io/docs/rest/stocks/tickers/ticker-overview
        triggers when in the ticker overview page.
        retrieves the data from polygon for only once, then save them or update in local database
        us_stocks, us_companies, us_addresses, sectors
        """
        try:
            result = self.client.get_ticker_details(symbol)
            return result
        except Exception as e:
            logging.error(f"Error fetching ticker overview for {symbol}: {e}")
            return None

    def validdate_date(self, params):
        if not params.fromDate:
            yesterday = (datetime.now() - timedelta(days=1)).strftime('%Y-%m-%d')
            params.fromDate = yesterday
        # Ensure fromDate is within the last two years
        two_years_ago = (datetime.now() - timedelta(days=730)).strftime('%Y-%m-%d')
        if params.fromDate < two_years_ago:
            raise ValueError("fromDate must be within the last two years.")
        if params.fromDate > params.toDate:
            raise ValueError("fromDate must be before toDate.")

    def get_ticker_data(self, params):
        """
        params(symbol, multiplier, timespan, from, to)
        multiplier: number
        timespan: second, minute, hour, day, week, month, quarter, year
        from: start date (YYYY-MM-DD) within 2 years for free plan.
        to: end date (YYYY-MM-DD)
        limit: default 5000, max 50,000
        sort: asc, desc
        https://polygon.io/docs/rest/stocks/aggregates/custom-bars (intraday, daily, weely, monthly)
        """
        try:
            self.validdate_date(params)
            result = []
            for data in self.client.list_aggs(
                params.symbol,
                params.multiplier,
                params.timespan,
                params.fromDate,
                params.toDate,
                limit=params.limit,
            ):
                result.append(data)
            return result
        except Exception as e:
            logging.error(f"Error fetching data for {params.symbol}: {e}")
            return None

    def get_financials(self, symbol):
        """
        https://polygon.io/docs/rest/stocks/fundamentals/financials
        Limit the number of results returned, default is 10 and max is 100.
        timeframe: annual, quarterly, ttm
        """
        try:
            financials = []
            for f in self.client.vx.list_stock_financials(
                    ticker=symbol,
                    order="asc",
                    limit="10",
                    sort="filing_date",
                ):
                financials.append(f)
            return financials
        except Exception as e:
            logging.error(f"Error fetching financials for {symbol}: {e}")
            return None

    def get_news(self, params):
        """
        https://polygon.io/docs/rest/stocks/news
        Limit the number of results returned, default is 10 and max is 1000.
        """
        try:
            news = []
            for n in self.client.list_ticker_news(
                ticker=params.symbol,
                order="asc",
                limit=params.limit,
                sort="published_utc",
                ):
                news.append(n)
            return news
        except Exception as e:
            logging.error(f"Error fetching news for {params}: {e}")
            return None

    @staticmethod
    def website_to_domain(website):
        """
        Convert a website URL to its domain name.
        """
        if not website:
            return None
        if 'www' in website:
            return website.split('www.')[1]
        if '://' in website:
            return website.split('://')[1]

polygon = Polygon()