import os
BASE_DIR = os.path.abspath(os.path.dirname(__file__))

class Config:
    SQLALCHEMY_DATABASE_URI = "sqlite:///" + os.path.join(BASE_DIR, "instance/app.db")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    REDIS_URL = "redis://localhost:6379/0"
    SWAGGER = {
        "title": "Data Analytics API",
        "uiversion": 3,
        "description": "API documentation for the Data Analytics Application",
    }
