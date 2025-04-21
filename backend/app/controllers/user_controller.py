from app.models.user import User
from app import db
from app.utils.hash import hash_password, verify_password
import re
from datetime import timedelta
from flask import jsonify
from flask_jwt_extended import create_access_token, jwt_required, set_access_cookies, unset_jwt_cookies

def register_user(data):
    required_fields = ['email', 'phone', 'username', 'password', 'first_name', 'last_name', 'date_of_birth']
    for f in required_fields:
        if f not in data:
            return jsonify({"msg": f"Missing field: {f}"}), 400
    # Validate email format
    if not re.match(r"[^@]+@[^@]+\.[^@]+", data['email']):
        return jsonify({"msg": "Invalid email format"}), 400
    # Validate phone format (example: AU phone number)
    if not re.match(r"^\+61\d{9}$", data['phone']):
        return jsonify({"msg": "Invalid phone format"}), 400
    # Validate username format (example: alphanumeric and underscores only)
    if not re.match(r"^[a-zA-Z0-9_]+$", data['username']):
        return jsonify({"msg": "Invalid username format"}), 400
    # Validate password strength (example: at least 8 characters, 1 uppercase, 1 lowercase, 1 digit)
    # if not re.match(r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$", data['password']):
    #     return jsonify({"msg": "Weak password"}), 400

    # Check if user already exists
    if User.query.filter_by(email=data['email']).first():
        return jsonify({"msg": "Email already registered"}), 400
    if User.query.filter_by(phone=data['phone']).first():
        return jsonify({"msg": "Phone number already registered"}), 400
    if User.query.filter_by(username=data['username']).first():
        return jsonify({"msg": "Username already taken"}), 400

    user = User(
        email=data['email'],
        phone=data['phone'],
        username=data['username'],
        password=hash_password(data['password']),
        first_name=data['first_name'],
        last_name=data['last_name'],
        date_of_birth=data['date_of_birth']
    )
    db.session.add(user)
    db.session.commit()

def user_login(data):
    required_fields = ['username', 'password']
    for f in required_fields:
        if f not in data:
            return jsonify({"msg": f"Missing field: {f}"}), 400

    user = User.query.filter_by(username=data['username']).first()
    if user is None or not verify_password(data['password'], user.password):
        return jsonify({"msg": "Invalid username or password"}), 401
    response = jsonify({"msg": "Login successful"})
    access_token = create_access_token(identity=user.id, expires_delta=timedelta(days=30))
    set_access_cookies(response, access_token)
    return response, 200