import os
import csv
import logging
from sqlalchemy import and_, func
from app import db
from datetime import datetime, timedelta
from app.models.db import Asset, Balance, Currency, DailyUSMarketData, Financials, IntradayUSMarket, MonthlyUSMarketData, Portfolio, Sector, USAddress, USCompany, USStock, Watchlist, WeeklyUSMarketData
from flask_jwt_extended import get_jwt_identity
from flask import json, jsonify, make_response, request
from app.utils.polygontool import polygon, Polygon
from sqlalchemy.orm import joinedload

def show_watchlist(user_id):
    watchlist = Watchlist.query.filter_by(user_id=user_id).all()
    stock_data = []
    for item in watchlist:
        stock = (
            db.session.query(
                USStock.symbol,
                USStock.market_cap,
                USCompany.domain.label("domain"),
                USCompany.name.label("company"),
                DailyUSMarketData.close.label("close"),
                (DailyUSMarketData.close - DailyUSMarketData.open).label("change"),
                ((DailyUSMarketData.close - DailyUSMarketData.open) / DailyUSMarketData.open * 100).label("percent_change"),
                DailyUSMarketData.timestamp
            )
            .join(USCompany, USStock.symbol == USCompany.symbol)
            .join(DailyUSMarketData, USStock.symbol == DailyUSMarketData.symbol)
            .filter(
                USStock.symbol == item.symbol,
                DailyUSMarketData.timestamp >= func.date(func.now()) - timedelta(days=2)
            )
            .order_by(DailyUSMarketData.timestamp.desc())
            .first()
        )
        if stock:
            stock_data.append({
                "symbol": stock.symbol,
                "domain": stock.domain,
                "company": stock.company,
                "close": stock.close,
                "change": stock.change,
                "percent_change": stock.percent_change,
                "market_cap": stock.market_cap,
            })
    response = make_response(jsonify(stock_data), 200)
    return response

def check_watchlist_exists(symbol):
    user_id = get_jwt_identity()
    if not symbol:
        return jsonify({"msg": "Missing field: symbol"}), 400
    watchlist_item = Watchlist.query.filter_by(user_id=user_id, symbol=symbol).first()
    return jsonify({"exists": True if watchlist_item else False}), 200

def add_to_watchlist():
    user_id = get_jwt_identity()
    data = request.get_json()

    if not data:
        return jsonify({"msg": "Missing JSON data"}), 400

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

def populate_common_currencies():
    count = Currency.query.count()
    if count > 0:
        logging.info("Common currencies already populated in the database.")
        return
    currencies = [
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
    data = []
    for item in currencies:
        data.append(Currency(symbol=item['symbol'], name=item['name']))
    db.session.bulk_save_objects(data)
    db.session.commit()
    return currencies

def populate_us_stocks_table(rows):
    stocks = []
    for row in rows:
        stock = USStock.query.filter_by(symbol=row['symbol']).first()
        if not stock:
            stocks.append(USStock(symbol=row['symbol']))
    db.session.bulk_save_objects(stocks)
    db.session.commit()

def populate_daily_market_table(rows, date=None):
    market_data = []
    for row in rows:
        item = db.session.query(DailyUSMarketData).filter(
            DailyUSMarketData.symbol == rows["symbol"],
            func.date(DailyUSMarketData.timestamp) == date  # Convert timestamp to date and compare
        ).first()
        if not item:
            market_data.append(DailyUSMarketData(
                symbol=row['symbol'],
                timestamp=int(row['timestamp']) if row['timestamp'] else 0,  # Use 0 if empty
                open=float(row['open']) if row['open'] else 0.0,        # Use 0.0 if empty
                close=float(row['close']) if row['close'] else 0.0,     # Use 0.0 if empty
                high=float(row['high']) if row['high'] else 0.0,        # Use 0.0 if empty
                low=float(row['low']) if row['low'] else 0.0,           # Use 0.0 if empty
                volume=float(row['volume']) if row['volume'] else 0.0,  # Use 0.0 if empty
                vwap=float(row['vwap']) if row['vwap'] else 0.0,        # Use 0.0 if empty
                transactions=int(row['transactions']) if row['transactions'] else 0,  # Use 0 if empty
            ))
    db.session.bulk_save_objects(market_data)
    db.session.commit()

def populate_database_from_csv(filepath):
    if not filepath:
        filepath = "all_market_symbols.csv"
    if os.path.exists(filepath):
        with open(filepath, mode='r') as csv_file:
            csv_reader = csv.DictReader(csv_file)
            rows = list(csv_reader)

        data_cnt = DailyUSMarketData.query.count()
        stock_cnt = USStock.query.count()
        row_cnt = len(rows)
        if data_cnt == row_cnt and stock_cnt == row_cnt:
            logging.info("Database is consistent with the CSV file. No action needed.")
            return True
        logging.info("Database is inconsistent with the CSV file. Inserting missing rows...")
        if data_cnt < row_cnt:
            populate_daily_market_table(rows)
        if stock_cnt < row_cnt:
            populate_us_stocks_table(rows)
        return True
    else:
        logging.warn(f"CSV file {filepath} does not exist.")
        return False

def convert_timestamp(timestamp):
    return datetime.utcfromtimestamp(timestamp / 1000 if timestamp > 1e10 else timestamp)

# This run first and only once
def save_all_symbols(csv_file_path, date, results):
    with open(csv_file_path, mode='w', newline='') as csv_file:
        csv_writer = csv.writer(csv_file)
        csv_writer.writerow(["symbol", "volume", "vwap", "open", "close", "high", "low", "timestamp", "transactions", "date"])
        tickers = []
        stocks = []
        for item in results:
            stock = db.session.query(USStock).filter_by(symbol=item.ticker).first()
            if not stock:
                stock = USStock(symbol=item.ticker)
                stocks.append(stock)
            ticker = db.session.query(DailyUSMarketData).filter(
                and_(
                    DailyUSMarketData.symbol == item.ticker,
                    DailyUSMarketData.timestamp == convert_timestamp(item.timestamp),
                )
            ).first()
            if not ticker:
                ticker = DailyUSMarketData(
                    symbol=item.ticker,
                    timestamp=convert_timestamp(item.timestamp),
                    open=item.open,
                    close=item.close,
                    high=item.high,
                    low=item.low,
                    volume=item.volume,
                    vwap=item.vwap,
                    transactions=item.transactions,
                )
                tickers.append(ticker)

            csv_writer.writerow([
                item.ticker,
                item.volume,
                item.vwap,
                item.open,
                item.close,
                item.high,
                item.low,
                item.timestamp,
                item.transactions,
                date
            ])
        if len(stocks) > 0:
            db.session.add(stock)
            db.session.commit()
        if len(tickers) > 0:
            db.session.bulk_save_objects(tickers)
            db.session.commit()

def fetch_data_from_polygon(csv_file_path, date):
    results = polygon.get_all_symbols(date)
    save_all_symbols(csv_file_path, date, results)
    return results

def update_sic(data):
    if data.sic_code:
        sector = db.session.query(Sector).filter_by(code=data.sic_code).first()
        if not sector:
            sector = Sector(
                code=data.sic_code,
                description=data.sic_description
            )
            db.session.add(sector)
            db.session.commit()

def update_company_info(data):
    company = db.session.query(USCompany).filter_by(name=data.name, symbol=data.ticker).first()
    if company:
        company.description = data.description
        company.domain = polygon.website_to_domain(data.homepage_url)
        company.symbol = data.ticker
        company.sic_code = data.sic_code
        company.list_date = datetime.strptime(data.list_date, '%Y-%m-%d').date()
        company.phone_number = data.phone_number if data.phone_number else None
        company.total_employees = data.total_employees if data.total_employees else None
    else:
        company = USCompany(
            name=data.name,
            description=data.description,
            domain=polygon.website_to_domain(data.homepage_url),
            symbol=data.ticker,
            sic_code=data.sic_code,
            list_date=datetime.strptime(data.list_date, '%Y-%m-%d').date(),
            phone_number=data.phone_number if data.phone_number else None,
            total_employees=data.total_employees if data.total_employees else None,
        )
        db.session.add(company)
    db.session.commit()
    print("company:", company)
    return company

def update_address(company, data):
    address = db.session.query(USAddress).filter_by(company_id=company.id).first()
    if not address:
        address = USAddress(
            company_id=company.id,
            address=data.address.address1 if data.address else None,
            city=data.address.city if data.address else None,
            post_code=data.address.postal_code if data.address else None,
            state=data.address.state if data.address else None,
        )
        db.session.add(address)
        db.session.commit()

def update_stock_info(data):
    stock = db.session.query(USStock).filter_by(symbol=data.ticker).first()
    if stock:
        stock.active = data.active
        stock.primary_exchange = data.primary_exchange
        stock.market_cap = data.market_cap
        stock.share_class_shares_outstanding = data.share_class_shares_outstanding
        stock.weighted_shares_outstanding = data.weighted_shares_outstanding
    else:
        stock = USStock(
            symbol=data.ticker,
            active=data.active,
            primary_exchange=data.primary_exchange,
            market_cap=data.market_cap,
            share_class_shares_outstanding=data.share_class_shares_outstanding,
            weighted_shares_outstanding=data.weighted_shares_outstanding,
        )
        db.session.add(stock)
    db.session.commit()

def update_overview_info(symbol):
    data = polygon.get_ticker_overview(symbol)
    if data:
        update_stock_info(data)
        update_sic(data)
        company = update_company_info(data)
        update_address(company, data)

def get_ticker_overview(symbol):
    try:
        stock = (
            db.session.query(USStock).join(USCompany)
                .join(USAddress).join(Sector).filter(USStock.symbol == symbol).first()
        )
        if stock and stock.market_cap and stock.company and stock.company.financials:
            return jsonify(stock.to_dict()), 200
        if not (stock and stock.company):
            update_overview_info(symbol)
        stock = db.session.query(USStock).filter(USStock.symbol == symbol).first()
        if stock and stock.market_cap and stock.company:
            return jsonify(stock.to_dict()), 200
        else:
            return jsonify({"error": "Some data missing"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def get_financials(symbol):
    return get_company_financials(symbol)

def get_company_financials(symbol):

    company = db.session.query(USCompany).filter_by(symbol=symbol).first()
    print("Geting financials for symbol:", symbol, company)
    if company and company.financials:
        print(company.financials)
        return jsonify(company.to_dict()), 200
    results = polygon.get_financials(symbol)
    if not results:
        return jsonify({"error": "No financial data found"}), 404
    print("result:", results)
    # Save financial data into a JSON file
    with open("result.json", "w") as json_file:
        json.dump(results, json_file, indent=4)
    financials = []
    if results:
        for result in results:
            print("fiscal_year:", result.fiscal_year)
            print("fiscal_period:", result.fiscal_period)
            financial = db.session.query(Financials).filter_by(
                symbol=symbol,
                fiscal_year=result.fiscal_year,
                fiscal_period=result.fiscal_period,
            ).first()
            if not financial:
                for type, details in result.financials.items():
                    print("type:", type, "details:", details)
                    for sub_type, detail in details.items():
                        financial = Financials(
                            start_date=datetime.strptime(result.start_date, "%Y-%m-%d").date(),
                            end_date=datetime.strptime(result.end_date, "%Y-%m-%d").date(),
                            cik=result.cik,
                            fiscal_year=result.fiscal_year,
                            fiscal_period=result.fiscal_period,
                            copmany_id=company.id,
                            symbol=symbol,
                            type=type,
                            sub_type=sub_type,
                            value = detail.value,
                            unit=detail.unit,
                            label=detail.label,
                            order=detail.order,
                        )
                        financials.append(financial)
                db.session.bulk_save_objects(financials)
                db.session.commit()
            else:
                financials.append(financial)


def get_news(symbol):
    print(symbol)

def get_all_symbols():
    try:
        stocks = db.session.query(USStock.symbol).all()
        if not stocks:
            populate_common_currencies()
            csv_file_path = "all_market_symbols.csv"
            if populate_database_from_csv(csv_file_path):
                return jsonify({"msg": "Database is updated with the CSV file"}), 200
            yesterday = (datetime.now() - timedelta(days=2)).strftime('%Y-%m-%d')
            stocks = fetch_data_from_polygon(csv_file_path, yesterday)
        symbols = [stock.symbol for stock in stocks]
        return jsonify(symbols), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


class Params:
    def __init__(self, symbol, fromDate, toDate, multiplier=1, timespan='day', limit=500, sort='asc', adjusted="true"):
        self.symbol = symbol
        self.multiplier = multiplier
        self.timespan = timespan
        self.fromDate = fromDate.strftime('%Y-%m-%d')
        self.toDate = toDate.strftime('%Y-%m-%d')
        self.limit = limit
        self.sort = sort
        self.adjusted = adjusted

# not in pricing plan
def get_intraday_data(symbol, date=None):
    try:
        if not date:
            yesterday = (datetime.now() - timedelta(days=2)).strftime('%Y-%m-%d')
            date = yesterday
        # get intraday data from database
        results = db.session.query(IntradayUSMarket).filter(
            IntradayUSMarket.symbol == symbol,
            func.date(IntradayUSMarket.timestamp) == date  # Convert timestamp to date and compare
        ).all()
        if results:
            return jsonify([result.to_dict() for result in results]), 200
        # if not, get from polygon.io
        params = Params(symbol, date, date, 1, "minute")
        results = polygon.get_ticker_data(params)
        # save to database
        data = []
        for item in results:
            intraday_data = IntradayUSMarket(
                symbol=symbol,
                timestamp=convert_timestamp(item.timestamp),
                multiplier=params.multiplier,
                timespan=params.timespan,
                open=item.open,
                close=item.close,
                high=item.high,
                low=item.low,
                volume=item.volume,
                vwap=item.vwap,
                transactions=item.transactions
            )
            data.append(intraday_data)
        db.session.bulk_save_objects(data)
        db.session.commit()
        return jsonify(results), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def get_daliy_data(symbol):
    try:
        # get data from database
        toDate = datetime.utcnow().date()
        fromDate = toDate - timedelta(days=365)
        results = db.session.query(DailyUSMarketData).filter(
            DailyUSMarketData.symbol == symbol,
            and_(
                func.date(DailyUSMarketData.timestamp) >= fromDate,  # Convert timestamp to date and compare
                func.date(DailyUSMarketData.timestamp) <= toDate
            )
        ).all()
        if results:
            return jsonify([result.to_dict() for result in results]), 200
        # if not, get from polygon.io
        params = Params(symbol, fromDate, toDate, 1, "day", 800)
        results = polygon.get_ticker_data(params)
        # save to database
        data = []
        for item in results:
            daily_data = DailyUSMarketData(
                symbol=symbol,
                timestamp=convert_timestamp(item.timestamp),
                open=item.open,
                close=item.close,
                high=item.high,
                low=item.low,
                volume=item.volume,
                vwap=item.vwap,
                transactions=item.transactions
            )
            data.append(daily_data)
        db.session.bulk_save_objects(data)
        db.session.commit()
        results = db.session.query(DailyUSMarketData).filter(
            DailyUSMarketData.symbol == symbol,
            and_(
                func.date(DailyUSMarketData.timestamp) >= fromDate,  # Convert timestamp to date and compare
                func.date(DailyUSMarketData.timestamp) <= toDate
            )
        ).all()
        return jsonify([result.to_dict() for result in results]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def get_weekly_data(symbol):
    try:
        # get data from database
        toDate = datetime.utcnow().date()
        fromDate = toDate - timedelta(days=365)
        results = db.session.query(WeeklyUSMarketData).filter(
            WeeklyUSMarketData.symbol == symbol,
            and_(
                func.date(WeeklyUSMarketData.timestamp) >= fromDate,  # Convert timestamp to date and compare
                func.date(WeeklyUSMarketData.timestamp) <= toDate
            )
        ).all()
        if results:
            return jsonify([result.to_dict() for result in results]), 200
        # if not, get from polygon.io
        params = Params(symbol, fromDate, toDate, 1, "week", 200)
        results = polygon.get_ticker_data(params)
        # save to database
        data = []
        for item in results:
            weekly_data = WeeklyUSMarketData(
                symbol=symbol,
                timestamp=convert_timestamp(item.timestamp),
                open=item.open,
                close=item.close,
                high=item.high,
                low=item.low,
                volume=item.volume,
                vwap=item.vwap,
                transactions=item.transactions
            )
            data.append(weekly_data)
        db.session.bulk_save_objects(data)
        db.session.commit()
        results = db.session.query(WeeklyUSMarketData).filter(
            WeeklyUSMarketData.symbol == symbol,
            and_(
                func.date(WeeklyUSMarketData.timestamp) >= fromDate,  # Convert timestamp to date and compare
                func.date(WeeklyUSMarketData.timestamp) <= toDate
            )
        ).all()
        return jsonify([result.to_dict() for result in results]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def get_monthly_data(symbol):
    try:
        # get data from database
        toDate = datetime.utcnow().date()
        fromDate = toDate - timedelta(days=365)
        results = db.session.query(MonthlyUSMarketData).filter(
            MonthlyUSMarketData.symbol == symbol,
            and_(
                func.date(MonthlyUSMarketData.timestamp) >= fromDate,  # Convert timestamp to date and compare
                func.date(MonthlyUSMarketData.timestamp) <= toDate
            )
        ).all()
        if results:
            return jsonify([result.to_dict() for result in results]), 200
        # if not, get from polygon.io
        params = Params(symbol, fromDate, toDate, 1, "month", 50)
        results = polygon.get_ticker_data(params)
        # save to database
        data = []
        for item in results:
            monthly_data = MonthlyUSMarketData(
                symbol=symbol,
                timestamp=convert_timestamp(item.timestamp),
                open=item.open,
                close=item.close,
                high=item.high,
                low=item.low,
                volume=item.volume,
                vwap=item.vwap,
                transactions=item.transactions
            )
            data.append(monthly_data)
        db.session.bulk_save_objects(data)
        db.session.commit()
        results = db.session.query(MonthlyUSMarketData).filter(
            MonthlyUSMarketData.symbol == symbol,
            and_(
                func.date(MonthlyUSMarketData.timestamp) >= fromDate,  # Convert timestamp to date and compare
                func.date(MonthlyUSMarketData.timestamp) <= toDate
            )
        ).all()
        return jsonify([result.to_dict() for result in results]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


def buy():
    data = request.json
    symbol = data["symbol"]
    quantity = int(data["quantity"])
    price = float(data["price"])
    user_id = get_jwt_identity()
    if not symbol or not quantity or not price:
        return jsonify({"error": "Missing required fields"}), 400
    if quantity <= 0 or price <= 0:
        return jsonify({"error": "Quantity and price must be greater than 0"}), 400
    # Check if the user has enough balance
    # Check if the stock is in the user's watchlist
    balance = db.session.query(Balance).filter_by(user_id=user_id, currency='USD').first()
    if not balance:
        return jsonify({"error": "User does not have a balance"}), 400
    if balance.amount < quantity * price:
        return jsonify({"error": "Insufficient balance"}), 400
    balance.amount -= quantity * price
    # Update user's portfolio
    portfolio = db.session.query(Portfolio).filter_by(user_id=user_id, symbol=symbol).first()
    if portfolio:
        portfolio.avg_cost = (portfolio.avg_cost * portfolio.quantity + price * quantity) / (portfolio.quantity + quantity)
        portfolio.quantity += quantity
    else:
        portfolio = Portfolio(user_id=user_id, symbol=symbol, quantity=quantity, avg_cost=price)
        db.session.add(portfolio)
    db.session.commit()
    return jsonify({
        "balance": balance.to_dict(),
        "portfolio": portfolio.to_dict()
    }), 200

def sell():
    data = request.json
    symbol = data["symbol"]
    quantity = int(data["quantity"])
    price = float(data["price"])
    user_id = get_jwt_identity()
    if not symbol or not quantity or not price:
        return jsonify({"error": "Missing required fields"}), 400
    if quantity <= 0 or price <= 0:
        return jsonify({"error": "Quantity and price must be greater than 0"}), 400
    # Check if the stock is in the user's portfolio
    portfolio = db.session.query(Portfolio).filter_by(user_id=user_id, symbol=symbol).first()
    if not portfolio:
        return jsonify({"error": "Stock not in portfolio"}), 400
    if portfolio.quantity < quantity:
        return jsonify({"error": "Insufficient quantity in portfolio"}), 400
    total = quantity * price
    # Update user's portfolio allow zero quantity
    if portfolio.quantity == quantity:
        portfolio.avg_cost = 0
    else:
        portfolio.avg_cost = (portfolio.avg_cost * portfolio.quantity - total) / (portfolio.quantity - quantity)
    portfolio.quantity -= quantity
    balance = db.session.query(Balance).filter_by(user_id=user_id, currency='USD').first()
    if not balance:
        balance = Balance(user_id=user_id, currency='USD', amount=total)
        db.session.add(balance)
    else:
        balance.amount += total
    db.session.commit()
    return jsonify({
        "balance": balance.to_dict(),
        "portfolio": portfolio.to_dict()
    }), 200