from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_redis import FlaskRedis
from flasgger import Swagger
from flask_cors import CORS

db = SQLAlchemy()
redis_client = FlaskRedis()


def create_app(config_name=None):
    app = Flask(__name__)
    app.config.from_object("app.config.Config")
    CORS(app)
    db.init_app(app)
    redis_client.init_app(app)
    Swagger(app)
    from app.views.user_view import user_bp

    app.register_blueprint(user_bp)
    return app
