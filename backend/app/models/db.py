from app import db
from datetime import datetime
from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String, Date, Boolean, TIMESTAMP

class User(db.Model):
    __tablename__ = 'users'
    id = Column(String, primary_key=True)
    email = Column(String, unique=True)
    phone = Column(String, unique=True)
    username = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)
    first_name = Column(String)
    last_name = Column(String)
    date_of_birth = Column(Date)
    is_google_user = Column(Boolean, default=False)
    is_apple_user = Column(Boolean, default=False)
    portfolio = db.relationship('Portfolio', back_populates="user")
    balance = db.relationship('Balance', back_populates="user")
    watchlist = db.relationship('Watchlist', back_populates="user")
    transactions = db.relationship('Transaction', back_populates="user")
    def __repr__(self):
        return f"<User {self.username}>"

class Currency(db.Model):
    __tablename__ = 'currencies'
    symbol = Column(String(20), primary_key=True, nullable=False)
    name = Column(String(100))
    def __repr__(self):
        return f"<Currency {self.symbol} {self.name}>"

# Cash - Relationship table: User <-> Currency
class Balance(db.Model):
    __tablename__ = 'balances'
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String, ForeignKey('users.id'), nullable=False)
    currency = Column(Integer, ForeignKey('currencies.symbol'), nullable=False)
    amount = Column(Float, nullable=False, default=0.0)
    user = db.relationship('User', back_populates='balance')
    __table_args__ = (db.UniqueConstraint('user_id', 'currency', name='unique_user_currency'),)

class Asset(db.Model):
    __tablename__ = 'assets'
    id = Column(Integer, primary_key=True, autoincrement=True)
    symbol = Column(String(20), nullable=False)
    name = Column(String(100))
    type = Column(String, nullable=False)
    cur_price = Column(Float)
    last_updated = Column(DateTime)
    portfolio = db.relationship('Portfolio', back_populates="asset")
    def __repr__(self):
        return f"<Asset {self.symbol}>"

class Portfolio(db.Model):
    __tablename__ = 'portfolio'
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String, ForeignKey('users.id'), nullable=False)
    asset_id = Column(Integer, ForeignKey('assets.id'), nullable=False)
    quantity = Column(Float, nullable=False, default=0.0)
    avg_cost = Column(Float, default=0.0)
    user = db.relationship('User', back_populates='portfolio')
    asset = db.relationship('Asset', back_populates='portfolio')
    __table_args__ = (db.UniqueConstraint('user_id', 'asset_id', name='unique_user_asset'),)
    def __repr__(self):
        return f"<Portfolio(asset_id='{self.asset_id}', avg_cost={self.avg_cost}, cur_price={self.cur_price}, quantity={self.quantity}, user_id={self.user_id})>"

class Watchlist(db.Model):
    __tablename__ = 'watchlist'
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String, ForeignKey('users.id'), nullable=False)
    symbol = Column(String, ForeignKey('us_stocks.symbol'), nullable=False)
    is_favorite = Column(Boolean, default=False)
    user = db.relationship('User', back_populates='watchlist')
    __table_args__ = (db.UniqueConstraint('user_id', 'symbol', name='unique_user_symbol'),)
    def __repr__(self):
        return f"<Watchlist {self.symbol}>"

class Transaction(db.Model):
    __tablename__ = 'transactions'
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    asset_id = Column(Integer, ForeignKey('assets.id'), nullable=False)
    amount = Column(Float, nullable=False)
    price = Column(Float, nullable=False)
    timestamp = Column(TIMESTAMP, default=datetime.utcnow)
    type = Column(String, nullable=False)
    status = Column(String, nullable=False)
    user = db.relationship('User', back_populates='transactions')
    __table_args__ = (db.UniqueConstraint('user_id', 'asset_id', 'timestamp', name='unique_transaction'),)
    def __repr__(self):
        return f"<Transaction {self.id}>"

class PortfolioHistory(db.Model):
    __tablename__ = 'portfolio_history'
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String, ForeignKey('users.id'), nullable=False)
    date = Column(Date, nullable=False)
    total_value = Column(Float, nullable=False)
    profit = Column(Float, nullable=False)
    loss = Column(Float, nullable=False)
    __table_args__ = (db.UniqueConstraint('user_id', 'date', name='unique_user_date'),)
    def __repr__(self):
        return f"<PortfolioHistory {self.user_id} on {self.date}>"

# SIC (Standard Industrial Classification)
class Sector(db.Model):
    __tablename__ = 'sectors'
    code = Column(String(10), primary_key=True)
    description = Column(String(255))
    us_companies = db.relationship('USCompany', back_populates='sector')

class USCompany(db.Model):
    __tablename__ = 'us_companies'
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    description = Column(String)
    domain = Column(String(255))
    symbol = Column(String(20), ForeignKey('us_stocks.symbol'), nullable=False, unique=True)
    stock = db.relationship('USStock', back_populates='company')
    sic_code = Column(String(10), ForeignKey('sectors.code'))
    sector = db.relationship('Sector', back_populates='us_companies')
    list_date = Column(Date)
    phone_number = Column(String)
    total_employees = Column(Integer)
    address = db.relationship('USAddress', back_populates='company')
    financials = db.relationship('Financials', back_populates='company')
    news = db.relationship("News", back_populates="company")
    def __repr__(self):
        return f"<Company {self.name} ({self.symbol})>"

class USAddress(db.Model):
    __tablename__ = 'us_addresses'
    id = Column(Integer, primary_key=True, autoincrement=True)
    company_id = Column(Integer, ForeignKey('us_companies.id'), nullable=False)
    company = db.relationship('USCompany', back_populates='address')
    address = Column(String(255))
    city = Column(String(100))
    post_code = Column(String(20))
    state = Column(String(100))
    def __repr__(self):
        return f"<Address {self.address}, {self.city}, {self.state}>"

class USStock(db.Model):
    __tablename__ = 'us_stocks'
    symbol = Column(String(20), primary_key=True, nullable=False)
    active = Column(Boolean, nullable=False, default=True)
    primary_exchange = Column(String)
    market_cap = Column(Float)
    shares_outstanding = Column(Float)
    weighted_shares_outstanding = Column(Float)
    company = db.relationship('USCompany', back_populates='stock')
    intraday_market_data = db.relationship('IntradayUSMarket', back_populates='stock')
    daily_market_data = db.relationship('DailyUSMarketData', back_populates='stock')
    weekly_market_data = db.relationship('WeeklyUSMarketData', back_populates='stock')
    monthly_market_data = db.relationship('MonthlyUSMarketData', back_populates='stock')
    def __repr__(self):
        return f"<Stock {self.symbol} >"

class IntradayUSMarket(db.Model):
    __tablename__ = 'intraday_us_market'
    id = Column(Integer, primary_key=True, autoincrement=True)
    symbol = Column(String(20), ForeignKey('us_stocks.symbol'))
    timestamp = Column(TIMESTAMP)
    multipler = Column(Integer)
    timespan = Column(String(10))
    open = Column(Float)
    close = Column(Float)
    high = Column(Float)
    low = Column(Float)
    volume = Column(Float)
    vwap = Column(Float)
    transactions = Column(Integer)
    stock = db.relationship('USStock', back_populates='intraday_market_data')
    __table_args__ = (db.UniqueConstraint('symbol', 'timestamp', 'multipler', 'timespan', name='unique_intraday_data'),)
    def __repr__(self):
        return f"<IntradayMarketData {self.symbol} at {self.timestamp} ({self.interval})>"

class DailyUSMarketData(db.Model):
    __tablename__ = 'daily_us_market'
    id = Column(Integer, primary_key=True, autoincrement=True)
    symbol = Column(String(20), ForeignKey('us_stocks.symbol'))
    timestamp = Column(TIMESTAMP)
    open = Column(Float)
    close = Column(Float)
    high = Column(Float)
    low = Column(Float)
    volume = Column(Float)
    vwap = Column(Float)
    transactions = Column(Integer)
    stock = db.relationship('USStock', back_populates='daily_market_data')
    __table_args__ = (db.UniqueConstraint('symbol', 'timestamp', name='unique_daily_data'),)
    def __repr__(self):
        return f"<DailyMarketData {self.symbol}>"

class WeeklyUSMarketData(db.Model):
    __tablename__ = 'weekly_us_market'
    id = Column(Integer, primary_key=True, autoincrement=True)
    symbol = Column(String(20), ForeignKey('us_stocks.symbol'))
    timestamp = Column(TIMESTAMP)
    open = Column(Float)
    close = Column(Float)
    high = Column(Float)
    low = Column(Float)
    volume = Column(Float)
    vwap = Column(Float)
    transactions = Column(Integer)
    stock = db.relationship('USStock', back_populates='weekly_market_data')
    __table_args__ = (db.UniqueConstraint('symbol', 'timestamp', name='unique_weekly_data'),)
    def __repr__(self):
        return f"<WeeklyMarketData {self.symbol}>"

class MonthlyUSMarketData(db.Model):
    __tablename__ = 'monthly_us_market'
    id = Column(Integer, primary_key=True, autoincrement=True)
    symbol = Column(String(20), ForeignKey('us_stocks.symbol'))
    timestamp = Column(TIMESTAMP)
    open = Column(Float)
    close = Column(Float)
    high = Column(Float)
    low = Column(Float)
    volume = Column(Float)
    vwap = Column(Float)
    transactions = Column(Integer)
    stock = db.relationship('USStock', back_populates='monthly_market_data')
    __table_args__ = (db.UniqueConstraint('symbol', 'timestamp', name='unique_monthly_data'),)
    def __repr__(self):
        return f"<WeeklyMarketData {self.symbol}>"
class Financials(db.Model):
    __tablename__ = 'financials'
    id = Column(Integer, primary_key=True, autoincrement=True)
    company_id = Column(Integer, ForeignKey('us_companies.id'), nullable=False)
    fiscal_year = Column(Integer, nullable=False)
    fiscal_period = Column(String(10), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    filing_date = Column(Date, nullable=False)
    total_assets = Column(Float)
    total_liabilities = Column(Float)
    total_equity = Column(Float)
    current_assets = Column(Float)
    current_liabilities = Column(Float)
    noncurrent_assets = Column(Float)
    noncurrent_liabilities = Column(Float)
    net_income = Column(Float)
    revenues = Column(Float)
    gross_profit = Column(Float)
    operating_income = Column(Float)
    net_cash_flow = Column(Float)
    source_filing_url = Column(String)
    company = db.relationship('USCompany', back_populates='financials')
    def __repr__(self):
        return f"<Financials {self.company_id} {self.fiscal_year} {self.fiscal_period}>"

class News(db.Model):
    __tablename__ = 'news'
    id = Column(String(64), primary_key=True)
    company_id = Column(Integer, ForeignKey('us_companies.id'), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(String)
    article_url = Column(String, nullable=False)
    image_url = Column(String)
    published_utc = Column(Date, nullable=False)
    author = Column(String(100))
    publisher_name = Column(String(100))
    publisher_homepage_url = Column(String)
    publisher_logo_url = Column(String)
    publisher_favicon_url = Column(String)
    company = db.relationship('USCompany', back_populates='news')
    def __repr__(self):
        return f"<News {self.id} {self.title}>"