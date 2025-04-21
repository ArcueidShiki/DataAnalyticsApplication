from app import db
from sqlalchemy.dialects.sqlite import BLOB
from sqlalchemy import Column, String, Date, Boolean

# User table
class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(String, primary_key=True)
    email = db.Column(String, unique=True, nullable=True)
    phone = db.Column(String, unique=True, nullable=True)
    username = db.Column(String, unique=True, nullable=False)
    password = db.Column(String, nullable=False)
    first_name = db.Column(String, nullable=True)
    last_name = db.Column(String, nullable=True)
    date_of_birth = db.Column(Date, nullable=True)
    is_google_user = db.Column(Boolean, default=False)
    is_apple_user = db.Column(Boolean, default=False)

    def __repr__(self):
        return f"<User {self.username}>"