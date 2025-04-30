import yfinance as yf
from flask import jsonify, request
from flask_jwt_extended import get_jwt_identity
from app.models.db import Watchlist
from app import db

def show_watchlist():
    user_id = get_jwt_identity()
    watchlist = Watchlist.query.filter_by(user_id=user_id).all()
    print(watchlist)
    stock_data = []
    for item in watchlist:
        print(item.symbol)
        stock = yf.Ticker(item.symbol)
        hist = stock.history(period="1d")  # Fetch historical data for 1 day
        if not hist.empty:
            # Attempt to get the company domain from yfinance
            domain = stock.info.get('website', '').replace('http://', '').replace('https://', '').split('/')[0]
            logo_url = f"https://www.google.com/s2/favicons?sz=64&domain={domain}" if domain else "No logo available"

            stock_data.append({
                'Symbol': item.symbol,
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
                'Logo': logo_url,
                'is_favorite': item.is_favorite
            })
    return jsonify(stock_data), 200

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