import os
import re
import uuid
from app import db
from flask import app, jsonify, logging, request
from datetime import datetime
from datetime import timedelta
from app.models.db import Asset, Balance, Portfolio, User
from werkzeug.utils import secure_filename
from werkzeug.security import check_password_hash, generate_password_hash
from flask_jwt_extended import create_access_token, get_csrf_token, get_jwt_identity, set_access_cookies, unset_jwt_cookies

def init_new_user_funds(userid):
    balance = Balance(
        user_id=userid,
        currency='USD',
        amount=1000000,
    )
    db.session.add(balance)
    db.session.commit()

def register():
    data = request.get_json()
    required_fields = ['email', 'phone', 'username', 'password', 'first_name', 'last_name', 'date_of_birth']
    valid = False
    for f in required_fields:
        if f == 'password' and f not in data:
            return jsonify({"msg": f"Missing field: {f}"}), 400
        if (f == 'email' or f == 'phone' or f == 'username') and f in data:
            valid = True
    if not valid:
        return jsonify({"msg": "Missing field"}), 400

    email = None
    if "email" in data:
        if not re.match(r"[^@]+@[^@]+\.[^@]+", data['email']):
            return jsonify({"msg": "Invalid email format"}), 400
        else:
            email = data['email']
    phone = None
    if "phone" in data:
        if not re.match(r"^\+61\d{9}$", data['phone']):
            return jsonify({"msg": "Invalid phone format"}), 400
        else:
            phone = data['phone']
    username = None
    uid = str(uuid.uuid4())
    if "username" in data:
        if not re.match(r"^[a-zA-Z0-9_]+$", data['username']):
            return jsonify({"msg": "Invalid username format"}), 400
        else:
            username = data['username']
    else:
        username = f"user_{uid}"
    # Validate password strength (example: at least 8 characters, 1 uppercase, 1 lowercase, 1 digit)
    # if not re.match(r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$", data['password']):
    #     return jsonify({"msg": "Weak password"}), 400
    try:
        dob = None
        if "date_of_birth" in data:
            dob = datetime.strptime(data['date_of_birth'], '%Y-%m-%d').date()
    except ValueError:
        return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 400

    first_name = None
    if "first_name" in data:
        first_name = data['first_name']
    last_name = None
    if "last_name" in data:
        last_name = data['last_name']

    # Check if user already exists
    if email and User.query.filter_by(email=data['email']).first():
        return jsonify({"msg": "Email already registered"}), 400
    if phone and User.query.filter_by(phone=data['phone']).first():
        return jsonify({"msg": "Phone number already registered"}), 400
    if username and User.query.filter_by(username=data['username']).first():
        return jsonify({"msg": "Username already taken"}), 400

    user = User(
        id=uid,
        email=email,
        phone=phone,
        username=username,
        password=generate_password_hash(data['password']),
        first_name=first_name,
        last_name=last_name,
        date_of_birth=dob
    )

    db.session.add(user)
    db.session.commit()
    init_new_user_funds(user.id)
    response = jsonify({"msg": "User registered successfully"})
    return response, 201

def login():
    data = request.get_json()
    required_fields = ['username', 'password']
    for f in required_fields:
        if f not in data:
            return jsonify({"msg": f"Missing field: {f}"}), 400

    user = User.query.filter_by(username=data['username']).first()
    if user is None or not check_password_hash(user.password, data['password']):
        return jsonify({"msg": "Invalid username or password"}), 401
    access_token = create_access_token(identity=user.id, expires_delta=timedelta(days=30))
    csrf_token = get_csrf_token(access_token)
    # the access_token_cookie contains csrf_access_token, but it needs to be extract at frontend
    response = jsonify({
        "msg": "Login successful",
        "access_token": access_token,
        "csrf_token": csrf_token,
        "user": user.to_dict()
    })
    set_access_cookies(response, access_token)
    return response, 200

def logout():
    response = jsonify({"msg": "Logout successful"})
    unset_jwt_cookies(response)
    return response, 200

def allowed_file(filename):
    if '.' in filename:
        suffix = filename.rsplit('.', 1)[1].lower()
        return suffix in {'png', 'jpg', 'jpeg', 'gif'}
    else:
        return False

def upload_profile_img():
    user_id = get_jwt_identity()
    if not user_id:
        return jsonify({"msg": "Missing user_id"}), 400
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    if 'file' not in request.files:
        return jsonify({"msg": "No file part"}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"msg": "No selected file"}), 400
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        user_folder = os.path.join('app/static/users/profile/', user_id)
        os.makedirs(user_folder, exist_ok=True)
        file_path = os.path.join(user_folder, filename)
        file.save(file_path)
        user.profile_img = f"static/users/profile/{user_id}/{filename}"
        db.session.commit()
        return jsonify({"message": "File uploaded successfully", "image_url": user.profile_img}), 200
    return jsonify({"error": "File type not allowed"}), 400