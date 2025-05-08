import os
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
POLYGON_API_KEY = "O0f43W3ucKbFkB32_1JpehLCLIznObMz"

class Config:
    SQLALCHEMY_DATABASE_URI = "sqlite:///" + os.path.join(BASE_DIR, "app.db")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    REDIS_URL = "redis://localhost:6379/0"

class TestConfig:
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'  # In-memory database for tests
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    TESTING = True
