import requests
import datetime

class PolygonUtils:
    BASE_URL = "https://api.polygon.io"
    API_KEY = "O0f43W3ucKbFkB32_1JpehLCLIznObMz"  # Replace with your actual API key

    @staticmethod
    def get_candlestick_data(symbol, multiplier, timespan, from_date, to_date):
        """
        Fetch candlestick data from Polygon.io.

        :param symbol: Stock ticker symbol (e.g., "AAPL").
        :param multiplier: Multiplier for the timespan (e.g., 1, 5).
        :param timespan: Timespan type (e.g., "minute", "hour", "day").
        :param from_date: Start date (YYYY-MM-DD).
        :param to_date: End date (YYYY-MM-DD).
        :return: List of candlestick data or error message.
        """
        endpoint = f"/v2/aggs/ticker/{symbol}/range/{multiplier}/{timespan}/{from_date}/{to_date}"
        url = f"{PolygonUtils.BASE_URL}{endpoint}"
        params = {"apiKey": PolygonUtils.API_KEY}

        try:
            response = requests.get(url, params=params)
            response.raise_for_status()  # Raise an error for HTTP codes 4xx/5xx
            data = response.json()

            if "results" in data:
                return data["results"]
            else:
                return {"error": "No data found for the given parameters."}
        except requests.exceptions.RequestException as e:
            return {"error": str(e)}

    @staticmethod
    def format_candlestick_data(raw_data):
        """
        Format raw candlestick data for frontend consumption.

        :param raw_data: Raw data from Polygon.io.
        :return: Formatted candlestick data.
        """
        formatted_data = []
        for item in raw_data:
            formatted_data.append({
                "timestamp": item["t"],  # Unix timestamp in milliseconds
                "open": item["o"],
                "high": item["h"],
                "low": item["l"],
                "close": item["c"],
                "volume": item["v"],
            })
        return formatted_data