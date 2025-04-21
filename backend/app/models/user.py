import uuid
from app import db
from sqlalchemy.dialects.sqlite import BLOB
from sqlalchemy import Column, String, Date, Boolean

# User table
class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = db.Column(String, unique=True, nullable=False)
    phone = db.Column(String, unique=True, nullable=False)
    username = db.Column(String, unique=True, nullable=False)
    password = db.Column(String, nullable=False)
    first_name = db.Column(String, nullable=False)
    last_name = db.Column(String, nullable=False)
    date_of_birth = db.Column(Date, nullable=False)
    is_google_user = db.Column(Boolean, default=False)
    is_apple_user = db.Column(Boolean, default=False)

    def __repr__(self):
        return f"<User {self.username}>"