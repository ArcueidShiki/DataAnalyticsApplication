import logging
from polygon.rest import RESTClient
from datetime import datetime, timedelta

API_KEY = "O0f43W3ucKbFkB32_1JpehLCLIznObMz"
client = RESTClient(API_KEY)

def get_market_summary(date):
    if not date:
        yesterday = (datetime.now() - timedelta(days=1)).strftime('%Y-%m-%d')
        date = yesterday
    results = client.get_grouped_daily_aggs(
        date,
        adjusted="true",
    )
    return results