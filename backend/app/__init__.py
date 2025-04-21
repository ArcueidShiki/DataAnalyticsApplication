import os
from app import models
from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_redis import FlaskRedis
from flask_jwt_extended import JWTManager
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import rsa

db = SQLAlchemy()
redis_client = FlaskRedis()
from app.routes.auth import auth_bp

KEY_FOLDER = "secrets"
PRIVATE_KEY_PATH = os.path.join(KEY_FOLDER, "rsa_private.pem")
PUBLIC_KEY_PATH = os.path.join(KEY_FOLDER, "rsa_public.pem")

def generate_rsa_keys():
    os.makedirs(KEY_FOLDER, exist_ok=True)
    print("KEY_FOLDER: ", KEY_FOLDER)
    print("PRIVATE_KEY_PATH: ", PRIVATE_KEY_PATH)
    print("PUBLIC_KEY_PATH: ", PUBLIC_KEY_PATH)
    if not os.path.exists(PRIVATE_KEY_PATH):
        private_key = rsa.generate_private_key(
            public_exponent=65537,
            key_size=2048,
        )
        # Save private key
        with open(PRIVATE_KEY_PATH, "wb") as f:
            f.write(private_key.private_bytes(
                encoding=serialization.Encoding.PEM,
                format=serialization.PrivateFormat.TraditionalOpenSSL,
                encryption_algorithm=serialization.NoEncryption(),
            ))
        # Save public key
        public_key = private_key.public_key()
        with open(PUBLIC_KEY_PATH, "wb") as f:
            f.write(public_key.public_bytes(
                encoding=serialization.Encoding.PEM,
                format=serialization.PublicFormat.SubjectPublicKeyInfo,
            ))

def create_app():
    app = Flask(__name__)
    app.config.from_object('app.config.Config')
    print("DATABASE URI: ", app.config['SQLALCHEMY_DATABASE_URI'])
    db_path = app.config.get('SQLALCHEMY_DATABASE_URI').replace('sqlite:///', '')
    print("DB PATH: ", db_path)
    db.init_app(app)
    if not os.path.exists(db_path):
        with app.app_context():
            # SQLAlchemy will create the database tables for all models
            # it will check if the tables already exist and will not create them again
            db.create_all()
    generate_rsa_keys()
    app.config['JWT_ALGORITHM'] = 'RS256'
    app.config['JWT_PRIVATE_KEY'] = open(PRIVATE_KEY_PATH).read()
    app.config['JWT_PUBLIC_KEY'] = open(PUBLIC_KEY_PATH).read()
    # This secret key is for signning symmetric algorithm "HS256" to generate JWT tokens
    # app.config['JWT_SECRET_KEY'] = 'your_jwt_secret_key'
    CORS(app)
    redis_client.init_app(app)
    jwt = JWTManager(app)
    app.register_blueprint(auth_bp)
    return app
