from datetime import datetime
from app import db
from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String, Date, Boolean

# User table
class User(db.Model):
    __tablename__ = 'users'
    id = Column(String, primary_key=True)
    email = Column(String, unique=True, nullable=True)
    phone = Column(String, unique=True, nullable=True)
    username = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)
    first_name = Column(String, nullable=True)
    last_name = Column(String, nullable=True)
    date_of_birth = Column(Date, nullable=True)
    is_google_user = Column(Boolean, default=False)
    is_apple_user = Column(Boolean, default=False)

    portfolio = db.relationship('Portfolio', back_populates="user")
    def __repr__(self):
        return f"<User {self.username}>"

# Assets could be stocks, bonds, currency, etc.
class Asset(db.Model):
    __tablename__ = 'assets'
    id = Column(Integer, primary_key=True, autoincrement=True)
    symbol = Column(String(20), nullable=False)  # e.g., AAPL, USD, AUD, JPN
    name = Column(String(100))
    type = Column(String, nullable=False)  # e.g., stock, bond, currency, etc.

    portfolio = db.relationship('Portfolio', back_populates="asset")

    def __repr__(self):
        return f"<Asset {self.symbol}>"

class Portfolio(db.Model):
    __tablename__ = 'portfolio'
    # composite primary key ensures primary key(user_id, asset_id) is unique
    user_id = Column(String, ForeignKey('users.id'), primary_key=True)
    asset_id = Column(Integer, ForeignKey('assets.id'), primary_key=True)
    quantity = Column(Float, nullable=False, default=0.0)
    avg_cost = Column(Float, default=0.0) # for stocks, bonds, etc.
    last_updated = Column(DateTime) # for stocks, bonds, etc.
    cur_price = Column(Float) # get from API

    # access each other through: user.portfolio; portfolio.user
    user = db.relationship('User', back_populates='portfolio')
    asset = db.relationship('Asset', back_populates='portfolio')
    def __repr__(self):
        return f"<Portfolio(asset_id='{self.asset_id}', avg_cost={self.avg_cost}, cur_price={self.cur_price}, quantity={self.quantity}, user_id={self.user_id})>"

# join query, filter example
# portfolio = Portfolio.query.join(Asset).filter(
#     Portfolio.user_id == user.id,
#     Asset.type == 'stock'
# ).all()


class Watchlist(db.Model):
    __tablename__ = 'watchlist'
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String, db.ForeignKey('users.id'), nullable=False)
    symbol = Column(String, nullable=False)
    is_favorite = Column(Boolean, default=False)

    def __repr__(self):
        return f"<Watchlist {self.symbol}>"

class Transaction(db.Model):
    __tablename__ = 'transactions'
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    asset_id = Column(Integer, ForeignKey('assets.id'), nullable=False)
    amount = Column(Float, nullable=False)  # Amount of asset bought/sold
    price = Column(Float, nullable=False)  # Price per unit of asset
    timestamp = Column(DateTime, nullable=False, default=datetime.utcnow)  # Date and time of transaction
    type = Column(String, nullable=False)  # Type of transaction: 'buy' or 'sell'
    status = Column(String, nullable=False)  # Status of transaction: 'completed', 'pending', 'failed'

class Market(db.Model):
    __tablename__ = 'market'
    id = Column(Integer, primary_key=True, autoincrement=True)
    symbol = Column(String(20), nullable=False)
    name = Column(String(100))
    volume = Column(Float)
    vwap = Column(Float)
    open = Column(Float)
    close = Column(Float)
    high = Column(Float)
    low = Column(Float)
    transactions = Column(Integer)
    timestamp = Column(Integer)
    date = Column(Date)

    def __repr__(self):
        return f"<Market {self.symbol}>"