from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_redis import FlaskRedis
from flasgger import Swagger
from flask_cors import CORS
from app import models

db = SQLAlchemy()
redis_client = FlaskRedis()
from app.routes.auth import auth_bp


def create_app(config_name=None):
    app = Flask(__name__)
    app.config.from_object("app.config.Config")
    CORS(app)
    db.init_app(app)
    redis_client.init_app(app)
    Swagger(app)
    app.register_blueprint(auth_bp)
    with app.app_context():
        # SQLAlchemy will create the database tables for all models
        # it will check if the tables already exist and will not create them again
        db.create_all()
    return app
