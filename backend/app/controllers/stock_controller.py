import yfinance as yf
from flask import jsonify, request
from flask_jwt_extended import get_jwt_identity
from app.models.position import Position
from app import db

def show_overview(symbol):
    print(symbol)
    stock = yf.Ticker(symbol)
    hist = stock.history(period="1d")  # Fetch historical data for 1 day
    if not hist.empty:
        # Attempt to get the company domain from yfinance
        domain = stock.info.get('website', '').replace('http://', '').replace('https://', '').split('/')[0]
        logo_url = f"https://www.google.com/s2/favicons?sz=64&domain={domain}" if domain else "No logo available"

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
            'Logo': logo_url,
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