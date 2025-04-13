class Config:
    SQLALCHEMY_DATABASE_URI = "sqlite:///app.db"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    REDIS_URL = "redis://localhost:6379/0"
    SWAGGER = {
        "title": "Data Analytics API",
        "uiversion": 3,
        "description": "API documentation for the Data Analytics Application",
    }
