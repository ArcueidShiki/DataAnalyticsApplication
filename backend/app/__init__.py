import os
from app import models
from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_redis import FlaskRedis
from flask_jwt_extended import JWTManager
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography import x509
from cryptography.x509.oid import NameOID
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives.serialization import Encoding, PrivateFormat, NoEncryption
from datetime import datetime, timedelta

db = SQLAlchemy()
redis_client = FlaskRedis()
from app.routes.auth import auth_bp
from app.routes.stock import stock_bp

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

def generate_tls_certificates():
    # Generate private key
    key = rsa.generate_private_key(public_exponent=65537, key_size=2048)

    # Generate self-signed certificate
    subject = issuer = x509.Name([
        x509.NameAttribute(NameOID.COUNTRY_NAME, "AU"),
        x509.NameAttribute(NameOID.STATE_OR_PROVINCE_NAME, "WA"),
        x509.NameAttribute(NameOID.LOCALITY_NAME, "Perth"),
        x509.NameAttribute(NameOID.ORGANIZATION_NAME, "My Company"),
        x509.NameAttribute(NameOID.COMMON_NAME, "localhost"),
    ])
    cert = x509.CertificateBuilder().subject_name(subject).issuer_name(issuer).public_key(
        key.public_key()).serial_number(x509.random_serial_number()).not_valid_before(
        datetime.utcnow()).not_valid_after(datetime.utcnow() + timedelta(days=365)).add_extension(
        x509.SubjectAlternativeName([x509.DNSName("localhost")]), critical=False).sign(key, hashes.SHA256())

    # Write key and certificate to files
    with open("secrets/key.pem", "wb") as f:
        f.write(key.private_bytes(Encoding.PEM, PrivateFormat.TraditionalOpenSSL, NoEncryption()))
    with open("secrets/cert.pem", "wb") as f:
        f.write(cert.public_bytes(Encoding.PEM))

def create_app():
    app = Flask(__name__)
    app.config.from_object('app.config.Config')
    db_path = app.config.get('SQLALCHEMY_DATABASE_URI').replace('sqlite:///', '')
    db.init_app(app)
    if not os.path.exists(db_path):
        with app.app_context():
            # SQLAlchemy will create the database tables for all models
            # it will check if the tables already exist and will not create them again
            db.create_all()
    generate_rsa_keys()
    generate_tls_certificates()
    app.config['JWT_ALGORITHM'] = 'RS256'
    app.config['JWT_PRIVATE_KEY'] = open(PRIVATE_KEY_PATH).read()
    app.config['JWT_PUBLIC_KEY'] = open(PUBLIC_KEY_PATH).read()
    # This secret key is for signning symmetric algorithm "HS256" to generate JWT tokens
    # app.config['JWT_SECRET_KEY'] = 'your_jwt_secret_key'
    CORS(app)
    redis_client.init_app(app)
    jwt = JWTManager(app)
    app.register_blueprint(auth_bp)
    app.register_blueprint(stock_bp)
    return app
