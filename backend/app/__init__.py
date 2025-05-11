import logging
import os
from app import models
from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_redis import FlaskRedis
from flask_jwt_extended import JWTManager
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives.asymmetric import rsa
import subprocess
from flask_migrate import Migrate, upgrade, migrate
from alembic.config import Config

db = SQLAlchemy()
db_migrate = Migrate()
redis_client = FlaskRedis()
from app.routes.auth import auth_bp
from app.routes.stock import stock_bp
from app.routes.asset import asset_bp
from app.routes.myasset import myasset_bp

KEY_FOLDER = "secrets"
PRIVATE_KEY_PATH = os.path.join(KEY_FOLDER, "rsa_private.pem")
PUBLIC_KEY_PATH = os.path.join(KEY_FOLDER, "rsa_public.pem")

def generate_rsa_keys():
    os.makedirs(KEY_FOLDER, exist_ok=True)
    if not os.path.exists(PRIVATE_KEY_PATH):
        private_key = rsa.generate_private_key(
            public_exponent=65537,
            key_size=2048,
        )
        with open(PRIVATE_KEY_PATH, "wb") as f:
            f.write(private_key.private_bytes(
                encoding=serialization.Encoding.PEM,
                format=serialization.PrivateFormat.TraditionalOpenSSL,
                encryption_algorithm=serialization.NoEncryption(),
            ))
        public_key = private_key.public_key()
        with open(PUBLIC_KEY_PATH, "wb") as f:
            f.write(public_key.public_bytes(
                encoding=serialization.Encoding.PEM,
                format=serialization.PublicFormat.SubjectPublicKeyInfo,
            ))

def init_database(app):
    db_path = app.config.get('SQLALCHEMY_DATABASE_URI').replace('sqlite:///', '')
    db.init_app(app)
    db_migrate.init_app(app, db)
    if not os.path.exists(db_path):
        with app.app_context():
            # SQLAlchemy will create the database tables for all models
            # it will check if the tables already exist and will not create them again
            logging.info("Creating database...")
            db.create_all()
    else:
        with app.app_context():
            # Configure Alembic
            alembic_cfg = Config("migrations/alembic.ini")
            try:
                migrate(directory="migrations", message="Automatic migration")
                upgrade()
            except Exception as e:
                logging.error(f"Error during upgrade: {e}")


def init_jwt_config(app):
    generate_rsa_keys()
    app.config['JWT_ALGORITHM'] = 'RS256'
    app.config['JWT_PRIVATE_KEY'] = open(PRIVATE_KEY_PATH).read()
    app.config['JWT_PUBLIC_KEY'] = open(PUBLIC_KEY_PATH).read()
    app.config["JWT_TOKEN_LOCATION"] = ["cookies"]
    app.config["JWT_COOKIE_CSRF_PROTECT"] = True
    app.config["JWT_ACCESS_COOKIE_PATH"] = "/"
    app.config["JWT_COOKIE_SECURE"] = False  # True if HTTPS only
    app.config["JWT_COOKIE_SAMESITE"] = "None"
    # This secret key is for signning symmetric algorithm "HS256" to generate JWT tokens
    # app.config['JWT_SECRET_KEY'] = 'your_jwt_secret_key'
    jwt = JWTManager(app)

def create_app(TESTING=False):
    app = Flask(__name__)
    if TESTING == True:
        app.config.from_object('app.config.TestConfig')
    else:
        app.config.from_object('app.config.Config')
    init_database(app)
    init_jwt_config(app)
    # CORS(app, resources={r"/*": {"origins": "http://127.0.0.1:5500"}}, supports_credentials=True)
    # CORS(app, origins=["null", r"http://localhost:\d+"], supports_credentials=True)
    # CORS(app, origins=["http://127.0.0.1:5500"], supports_credentials=True)
    CORS(app, supports_credentials=True)
    # CORS(app, supports_credentials=True, resources={r"/*": {"origins": r"http://127\.0\.0\.1:\d+"}})
    redis_client.init_app(app)
    app.register_blueprint(auth_bp)
    app.register_blueprint(stock_bp)
    app.register_blueprint(asset_bp)
    app.register_blueprint(myasset_bp)
    return app


