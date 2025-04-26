from app import db
from sqlalchemy import Column, String, Date, Boolean, Integer

class Watchlist(db.Model):
    __tablename__ = 'watchlist'
    id = db.Column(Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(String, db.ForeignKey('users.id'), nullable=False)
    symbol = db.Column(String, nullable=False)
    is_favorite = db.Column(Boolean, default=False)

    def __repr__(self):
        return f"<Watchlist {self.symbol}>"