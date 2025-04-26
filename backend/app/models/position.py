from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from app import db

class Position(db.Model):
    __tablename__ = 'positions'
    id = db.Column(Integer, primary_key=True, autoincrement=True)
    symbol = db.Column(String, nullable=False)
    avg_cost = db.Column(Float, nullable=False)
    cur_price = db.Column(Float, nullable=False)
    quantity = db.Column(Float, nullable=False)
    user_id = db.Column(Integer, ForeignKey('users.id'), nullable=False)

    def __repr__(self):
        return f"<Position(symbol='{self.symbol}', avg_cost={self.avg_cost}, cur_price={self.cur_price}, quantity={self.quantity}, user_id={self.user_id})>"