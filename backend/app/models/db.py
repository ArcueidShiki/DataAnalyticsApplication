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
    profile_img = Column(String, default="static/users/profile/default.png")
    portfolio = db.relationship('Portfolio', back_populates="user")
    balance = db.relationship('Balance', back_populates="user")
    watchlist = db.relationship('Watchlist', back_populates="user")
    transactions = db.relationship('Transaction', back_populates="user")
    sent_messages = db.relationship('Message', foreign_keys='Message.sender_id', back_populates='sender')
    received_messages = db.relationship('Message', foreign_keys='Message.receiver_id', back_populates='receiver')
    def __repr__(self):
        return f"<User {self.username}>"
    def to_dict(self):
        balanceMap = {}
        for balance in self.balance:
            balanceMap[balance.currency] = balance.to_dict()
        portfolioMap = {}
        for portfolio in self.portfolio:
            portfolioMap[portfolio.symbol] = portfolio.to_dict()
        return {
            "id": self.id,
            "email": self.email,
            "phone": self.phone,
            "username": self.username,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "date_of_birth": self.date_of_birth.isoformat() if self.date_of_birth else None,
            "profile_img": self.profile_img,
            "balance": balanceMap,
            "portfolio": portfolioMap,
        }

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
    currency = Column(String(20), ForeignKey('currencies.symbol'), nullable=False)
    amount = Column(Float, nullable=False, default=0.0)
    user = db.relationship('User', back_populates='balance')
    __table_args__ = (db.UniqueConstraint('user_id', 'currency', name='unique_user_currency'),)
    def __repr__(self):
        return f"<Balance {self.user_id} {self.currency} {self.amount}>"
    def to_dict(self):
        return {
            "symbol": self.currency,
            "amount": self.amount,
        }

class Asset(db.Model):
    __tablename__ = 'assets'
    id = Column(Integer, primary_key=True, autoincrement=True)
    symbol = Column(String(20), nullable=False)
    name = Column(String(100))
    type = Column(String, nullable=False)
    cur_price = Column(Float)
    last_updated = Column(DateTime)
    def __repr__(self):
        return f"<Asset {self.symbol}>"

class Portfolio(db.Model):
    __tablename__ = 'portfolio'
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String, ForeignKey('users.id'), nullable=False)
    symbol = Column(String, ForeignKey('us_stocks.symbol'), nullable=False)
    quantity = Column(Float, nullable=False, default=0.0)
    avg_cost = Column(Float, default=0.0)
    user = db.relationship('User', back_populates='portfolio')
    usstock = db.relationship('USStock', back_populates='portfolio')
    __table_args__ = (db.UniqueConstraint('user_id', 'symbol', name='unique_user_portfolio'),)
    def to_dict(self):
        price = None
        if self.usstock and self.usstock.daily_market_data:
            # Sort by timestamp and get the most recent entry
            latest_data = max(self.usstock.daily_market_data, key=lambda x: x.timestamp, default=None)
            price = latest_data.close if latest_data else None
        unrealized_profit = (price - self.avg_cost) * self.quantity if price else 0
        unrealized_profit_percent = (unrealized_profit / self.avg_cost * 100) if self.avg_cost else 0
        return {
            "symbol": self.symbol,
            "price": price,
            "quantity": self.quantity,
            "avg_cost": self.avg_cost,
            "total_value": self.quantity * price if price else 0,
            "profit_loss": unrealized_profit,
            "profit_loss_percent": unrealized_profit_percent,
        }

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
    address = db.relationship('USAddress', back_populates='company', uselist=False)
    financials = db.relationship('Financials', back_populates='company')
    news = db.relationship("News", back_populates="company")
    def __repr__(self):
        return f"<Company {self.name} ({self.symbol})>"
    def to_dict(self):
        financialsMap = {}
        if self.financials:
            for financial in self.financials:
                if financial:
                    year = financial.fiscal_year
                    quarter = financial.fiscal_period
                    type = financial.type
                    sub_type = financial.sub_type
                    financialsMap[year][quarter][type][sub_type] = financial.to_dict()
        return {
            "name": self.name,
            "description": self.description,
            "domain": self.domain,
            "symbol": self.symbol,
            "sic_code": self.sic_code,
            "sector": self.sector.description if self.sector else None,
            "list_date": self.list_date.isoformat() if self.list_date else None,
            "phone_number": self.phone_number,
            "total_employees": self.total_employees,
            "address": self.address.to_dict() if self.address else None,
            "financials": financialsMap,
        }

class USAddress(db.Model):
    __tablename__ = 'us_addresses'
    id = Column(Integer, primary_key=True, autoincrement=True)
    company_id = Column(Integer, ForeignKey('us_companies.id'), nullable=False)
    company = db.relationship('USCompany', back_populates='address', uselist=False)
    address = Column(String(255))
    city = Column(String(100))
    post_code = Column(String(20))
    state = Column(String(100))
    __table_args__ = (db.UniqueConstraint('company_id', 'post_code', name='company_post_code'),)
    def __repr__(self):
        return f"<Address {self.address}, {self.city}, {self.state}>"
    def to_dict(self):
        return {
            "address": self.address,
            "city": self.city,
            "post_code": self.post_code,
            "state": self.state,
        }
class USStock(db.Model):
    __tablename__ = 'us_stocks'
    symbol = Column(String(20), primary_key=True, nullable=False)
    active = Column(Boolean, nullable=False, default=True)
    primary_exchange = Column(String)
    market_cap = Column(Float)
    share_class_shares_outstanding = Column(Float)
    weighted_shares_outstanding = Column(Float)
    company = db.relationship('USCompany', back_populates='stock', uselist=False)
    intraday_market_data = db.relationship('IntradayUSMarket', back_populates='stock')
    daily_market_data = db.relationship('DailyUSMarketData', back_populates='stock')
    weekly_market_data = db.relationship('WeeklyUSMarketData', back_populates='stock')
    monthly_market_data = db.relationship('MonthlyUSMarketData', back_populates='stock')
    portfolio = db.relationship('Portfolio', back_populates='usstock')
    def __repr__(self):
        return f"<Stock {self.symbol} >"
    def to_dict(self):
        return {
            "symbol": self.symbol,
            "active": self.active,
            "primary_exchange": self.primary_exchange,
            "market_cap": self.market_cap,
            "share_class_shares_outstanding": self.share_class_shares_outstanding,
            "weighted_shares_outstanding": self.weighted_shares_outstanding,
            "company": self.company.to_dict() if self.company else None,
        }

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
    def to_dict(self):
        return {
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
            "open": self.open,
            "close": self.close,
            "high": self.high,
            "low": self.low,
            "volume": self.volume,
        }


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
    def to_dict(self):
        return {
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
            "open": self.open,
            "close": self.close,
            "high": self.high,
            "low": self.low,
            "volume": self.volume,
        }

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
    def to_dict(self):
        return {
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
            "open": self.open,
            "close": self.close,
            "high": self.high,
            "low": self.low,
            "volume": self.volume,
        }

# quarterly financials
class Financials(db.Model):
    __tablename__ = 'financials'
    id = Column(Integer, primary_key=True, autoincrement=True)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    fiscal_period = Column(String(10), nullable=False)
    cik = Column(String(20))
    fiscal_year = Column(Integer, nullable=False)
    company_id = Column(Integer, ForeignKey('us_companies.id'), nullable=False)
    symbol = Column(String(20), ForeignKey('us_stocks.symbol'), nullable=False)
    type = Column(String(10), nullable=False) # balance_sheet, cash_flow_statement, income_statement，etc
    sub_type = Column(String(10), nullable=False) # e.g. wages, current_liabilities, accounts_payable
    value = Column(Integer, nullable=False)
    unit = Column(String(10)) # USD, CNY, etc
    labal = Column(String(100), nullable=False) # e.g. total_assets, total_liabilities, etc
    order = Column(Integer, nullable=False) # order of the financials
    company = db.relationship('USCompany', back_populates='financials')
    __table_args__ = (
        db.UniqueConstraint('company_id', 'fiscal_year', 'fiscal_period', 'type', 'sub_type', name='unique_financials'),
        db.ForeignKeyConstraint(['company_id'], ['us_companies.id'], name='fk_financials_company_id'),
        db.ForeignKeyConstraint(['symbol'], ['us_stocks.symbol'], name='fk_financials_symbol'),
    )
    def __repr__(self):
        return f"<Financials {self.company_id} {self.fiscal_year} {self.fiscal_period}>"
    def to_dict(self):
        return {
            "value": self.value,
            "unit": self.unit,
            "label": self.labal,
            "order": self.order
        }

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

class Message(db.Model):
    __tablename__ = 'messages'
    id = Column(Integer, primary_key=True, autoincrement=True)
    sender_id = Column(String, ForeignKey('users.id'), nullable=False)
    receiver_id = Column(String, ForeignKey('users.id'), nullable=False)
    message = Column(String, nullable=False)
    type = Column(String, nullable=False, default='text')
    timestamp = Column(TIMESTAMP, default=datetime.utcnow)
    is_read = Column(Boolean, default=False)
    is_sender_deleted = Column(Boolean, default=False)
    is_receiver_deleted = Column(Boolean, default=False)

    sender = db.relationship('User', foreign_keys=[sender_id], back_populates='sent_messages')
    receiver = db.relationship('User', foreign_keys=[receiver_id], back_populates='received_messages')

    def __repr__(self):
        return f"<Message {self.id} from {self.sender_id} to {self.receiver_id}>"

    def to_dict(self):
        return {
            "id": self.id,
            "sender_id": self.sender_id,
            "receiver_id": self.receiver_id,
            "message": self.message,
            "type": self.type,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
            "is_read": self.is_read,
            "is_sender_deleted": self.is_sender_deleted,
            "is_receiver_deleted": self.is_receiver_deleted,
        }