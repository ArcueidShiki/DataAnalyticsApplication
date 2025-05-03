from flask import jsonify, make_response, request
from flask_jwt_extended import get_jwt_identity
from app.models.db import Watchlist
from app import db
from app.utils.yftool import StockUtils, convert_website_to_domain
import yfinance as yf

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
    # print("user id from jwt:", user_id)
    watchlist = Watchlist.query.filter_by(user_id=user_id).all()
    # print(watchlist)
    stock_data = []
    for item in watchlist:
        stock = yf.Ticker(item.symbol)
        hist = stock.history(period="1d")  # Fetch historical data for 1 day
        if not hist.empty:
            # Attempt to get the company domain from yfinance
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