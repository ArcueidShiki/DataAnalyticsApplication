import csv
from datetime import datetime, timedelta
import logging
import os
from flask import jsonify, make_response, request
from flask_jwt_extended import get_jwt_identity
from app.models.db import Asset, Market, Watchlist
from app import db
from app.utils.yftool import StockUtils, convert_website_to_domain
import yfinance as yf
from app.utils.polygontool import get_market_summary

def show_overview(symbol):
    print(symbol)
    stock = yf.Ticker(symbol)
    hist = stock.history(period="1d")  # Fetch historical data for 1 day
    if not hist.empty:
        # Attempt to get the company domain from yfinance
        domain = convert_website_to_domain(stock.info.get('website', ''))

        return jsonify({
            'Symbol': symbol,
            'Info': stock.info.get('shortName', 'N/A'),
            'Close': float(hist['Close'].iloc[-1]),
            'High': float(hist['High'].iloc[-1]),
            'Low': float(hist['Low'].iloc[-1]),
            'Open': float(hist['Open'].iloc[-1]),
            'Volume': int(hist['Volume'].iloc[-1]),
            'Turnover': float(hist['Volume'].iloc[-1] * hist['Close'].iloc[-1]),  # Convert to float
            'Change': float(hist['Close'].iloc[-1] - hist['Open'].iloc[-1]),
            'Change%': float(((hist['Close'].iloc[-1] - hist['Open'].iloc[-1]) / hist['Open'].iloc[-1]) * 100),
            'MarketCap': stock.info.get('marketCap', 'N/A'),
            'PE': stock.info.get('forwardPE', 'N/A'),
            'EPS': stock.info.get('trailingEps', 'N/A'),
            'DividendYield': stock.info.get('dividendYield', 'N/A'),
            '52WeekHigh': stock.info.get('fiftyTwoWeekHigh', 'N/A'),
            '52WeekLow': stock.info.get('fiftyTwoWeekLow', 'N/A'),
            '52WeekChange': stock.info.get('52WeekChange', 'N/A'),
            'domain': domain,
        }), 200

def show_analyst(symbol):
    return yf.Ticker(symbol).recommendations

def show_company(symbol):
    return yf.Ticker(symbol).info

def show_financials(symbol):
    return yf.Ticker(symbol).financials

def show_news(symbol):
    return yf.Ticker(symbol).news

def buy():
    return jsonify({"error": "Bull endpoint not implemented"}), 501

def sell():
    return jsonify({"error": "Sell endpoint not implemented"}), 501

def get_top_hot_stocks():
    """
    Fetch the top 5 hot stocks based on their percentage change.
    """
    try:
        hot_stocks = StockUtils.get_top_hot_stocks()
        return jsonify(hot_stocks), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


def show_watchlist():
    user_id = get_jwt_identity()
    watchlist = Watchlist.query.filter_by(user_id=user_id).all()
    stock_data = []
    for item in watchlist:
        stock = yf.Ticker(item.symbol)
        hist = stock.history(period="1d")
        if not hist.empty:
            domain = convert_website_to_domain(stock.info.get('website', ''))

            stock_data.append({
                'symbol': item.symbol,
                'info': stock.info.get('shortName', 'N/A'),
                'close': float(hist['Close'].iloc[-1]),
                'high': float(hist['High'].iloc[-1]),
                'low': float(hist['Low'].iloc[-1]),
                'open': float(hist['Open'].iloc[-1]),
                'volume': int(hist['Volume'].iloc[-1]),
                'turnover': float(hist['Volume'].iloc[-1] * hist['Close'].iloc[-1]),  # Convert to float
                'change': float(hist['Close'].iloc[-1] - hist['Open'].iloc[-1]),
                'percent_change': float(((hist['Close'].iloc[-1] - hist['Open'].iloc[-1]) / hist['Open'].iloc[-1]) * 100),
                'marketCap': stock.info.get('marketCap', 'N/A'),
                # 'PE': stock.info.get('forwardPE', 'N/A'),
                # 'EPS': stock.info.get('trailingEps', 'N/A'),
                # 'DividendYield': stock.info.get('dividendYield', 'N/A'),
                # '52WeekHigh': stock.info.get('fiftyTwoWeekHigh', 'N/A'),
                # '52WeekLow': stock.info.get('fiftyTwoWeekLow', 'N/A'),
                # '52WeekChange': stock.info.get('52WeekChange', 'N/A'),
                'domain': domain,
                # 'is_favorite': item.is_favorite
            })
    response = make_response(jsonify(stock_data), 200)
    response.headers['Access-Control-Allow-Origin'] = 'http://127.0.0.1:5500'
    response.headers['Access-Control-Allow-Credentials'] = 'true'
    return response

def add_to_watchlist():
    user_id = get_jwt_identity()
    data = request.get_json()
    symbol = data.get('symbol')
    if not symbol:
        return jsonify({"msg": "Missing field: symbol"}), 400
    existing = Watchlist.query.filter_by(user_id=user_id, symbol=symbol).first()
    if existing:
        return jsonify({"msg": "Already in watchlist"}), 400
    new_watchlist_item = Watchlist(
        user_id=user_id,
        symbol=symbol,
        is_favorite=data.get('is_favorite', False)
    )
    db.session.add(new_watchlist_item)
    db.session.commit()
    return jsonify({"msg": "Added to watchlist"}), 201

def remove_from_watchlist():
    user_id = get_jwt_identity()
    data = request.get_json()
    symbol = data.get('symbol')
    if not symbol:
        return jsonify({"msg": "Missing field: symbol"}), 400
    watchlist_item = Watchlist.query.filter_by(user_id=user_id, symbol=symbol).first()
    if not watchlist_item:
        return jsonify({"msg": "Not in watchlist"}), 404
    db.session.delete(watchlist_item)
    db.session.commit()
    return jsonify({"msg": "Removed from watchlist"}), 200

# default 1 day period, interval 15min
def get_ticker(symbol, interval='15m', period='1d'):
    try:
        data = request.get_json()
        symbol = data.get('symbol')
        if not symbol:
            return jsonify({"error": "Missing required parameter: symbol"}), 400
        interval = data.get('interval', '15m')
        period = data.get('period', '1d')
        return StockUtils.get_ticker(symbol, interval=interval, period=period)

    except Exception as e:
        return jsonify({"error": str(e)}), 500


def get_common_currencies():
    return [
        {'symbol': 'AUD', 'name': 'Australian Dollar'},
        {'symbol': 'USD', 'name': 'United States Dollar'},
        {'symbol': 'JPN', 'name': 'Japanese Yen'},
        {'symbol': 'HKD', 'name': 'Hong Kong Dollar'},
        {'symbol': 'SGD', 'name': 'Singapore Dollar'},
        {'symbol': 'CNY', 'name': 'Chinese Yuan'},
        {'symbol': 'MYR', 'name': 'Malaysian Ringgit'},
        {'symbol': 'CAD', 'name': 'Canadian Dollar'},
        {'symbol': 'EUR', 'name': 'Euro'},
        {'symbol': 'CHF', 'name': 'Swiss Franc'},
        {'symbol': 'FRF', 'name': 'French Franc'}
    ]

def populate_common_currencies():
    assets_data = []
    for currency in get_common_currencies():
        if not Asset.query.filter_by(symbol=currency['symbol']).first():
            # Check if the currency already exists in the database
            assets_data.append(Asset(
                symbol=currency['symbol'],
                name=currency['name'],
                type="currency",
            ))
    db.session.bulk_save_objects(assets_data)
    db.session.commit()

def populate_asset_table(csv_rows):
    populate_common_currencies()
    assets_data = []
    for row in csv_rows:
        existing_asset = Asset.query.filter_by(symbol=row['symbol']).first()
        if not existing_asset:
            assets_data.append(Asset(
                symbol=row['symbol'],
                name=row['name'] if row['name'] else None,
                type="stock",
            ))
    db.session.bulk_save_objects(assets_data)
    db.session.commit()

def populate_market_table(csv_rows):
    market_data = []
    for row in csv_rows:
        existing_market = Market.query.filter_by(
            symbol=row['symbol'],
            date=datetime.strptime(row['date'], '%Y-%m-%d').date()
        ).first()
        if not existing_market:
            market_data.append(Market(
                symbol=row['symbol'],
                name=row['name'] if row['name'] else None,
                volume=float(row['volume']) if row['volume'] else 0.0,  # Use 0.0 if empty
                vwap=float(row['vwap']) if row['vwap'] else 0.0,        # Use 0.0 if empty
                open=float(row['open']) if row['open'] else 0.0,        # Use 0.0 if empty
                close=float(row['close']) if row['close'] else 0.0,     # Use 0.0 if empty
                high=float(row['high']) if row['high'] else 0.0,        # Use 0.0 if empty
                low=float(row['low']) if row['low'] else 0.0,           # Use 0.0 if empty
                timestamp=int(row['timestamp']) if row['timestamp'] else 0,  # Use 0 if empty
                transactions=int(row['transactions']) if row['transactions'] else 0,  # Use 0 if empty
                date=datetime.strptime(row['date'], '%Y-%m-%d').date()
            ))
    db.session.bulk_save_objects(market_data)
    db.session.commit()

def populate_database_from_csv(csv_file_path, date):
    if not csv_file_path:
        csv_file_path = "yesterday_market_summary.csv"
    if os.path.exists(csv_file_path):
        with open(csv_file_path, mode='r') as csv_file:
            csv_reader = csv.DictReader(csv_file)
            csv_rows = list(csv_reader)
        db_stock_count = Market.query.filter_by(date=datetime.strptime(date, '%Y-%m-%d').date()).count()
        db_asset_count = Asset.query.count()
        csv_row_count = len(csv_rows)
        currency_count = len(get_common_currencies())
        if db_stock_count == csv_row_count and db_asset_count == csv_row_count + currency_count:
            logging.info("Database is consistent with the CSV file. No action needed.")
            return True
        logging.info("Database is inconsistent with the CSV file. Inserting missing rows...")
        if db_stock_count < csv_row_count:
            populate_market_table(csv_rows)
        if db_asset_count < csv_row_count + currency_count:
            populate_asset_table(csv_rows)
        return True
    else:
        logging.error(f"CSV file {csv_file_path} does not exist.")
        return False

def save_data_to_csv_database(csv_file_path, date, results):
    market_data = []
    assets_data = []
    with open(csv_file_path, mode='w', newline='') as csv_file:
        csv_writer = csv.writer(csv_file)
        csv_writer.writerow(["symbol", "name", "volume", "vwap", "open", "close", "high", "low", "timestamp", "transactions", "date"])
        for item in results:
            ticker = Market(
                symbol=item.ticker,
                name=None,  # Placeholder for name
                volume=item.volume,
                vwap=item.vwap,
                open=item.open,
                close=item.close,
                high=item.high,
                low=item.low,
                timestamp=item.timestamp,
                transactions=item.transactions,
                date=datetime.strptime(date, '%Y-%m-%d').date()
            )
            asset = Asset(
                symbol=item.ticker,
                name=None,  # Placeholder for name
                type="stock",
            )
            market_data.append(ticker)
            assets_data.append(asset)
            csv_writer.writerow([
                item.ticker,  # symbol
                None,       # name (placeholder, as it's not provided in the API response)
                item.volume,  # volume
                item.vwap, # vwap
                item.open,  # open
                item.close,  # close
                item.high,  # high
                item.low,  # low
                item.timestamp,  # timestamp
                item.transactions,  # transactions
                date   # date
            ])
    db.session.bulk_save_objects(market_data)
    db.session.bulk_save_objects(assets_data)
    db.session.commit()

def fetch_data_from_polygon(csv_file_path, date):
    results = get_market_summary(date)
    logging.info(f"Saving market summary to {csv_file_path}, listed stocks: {len(results)}")
    save_data_to_csv_database(csv_file_path, date, results)

def get_yesterday_market_summary(date):
    try:
        if not date:
            yesterday = (datetime.now() - timedelta(days=1)).strftime('%Y-%m-%d')
            date = yesterday
        csv_file_path = "yesterday_market_summary.csv"
        if populate_database_from_csv(csv_file_path, date):
            return jsonify({"msg": "Database is updated with the CSV file"}), 200
        fetch_data_from_polygon(csv_file_path, date)
        return jsonify({"msg": "Market summary updated successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500