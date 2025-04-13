from flask import request, jsonify
from app.models.user import User
from app import db, redis_client
from app.schemas.user_schema import UserSchema

user_schema = UserSchema()
users_schema = UserSchema(many=True)


def get_all_users():
    cached_key = "user_all"
    cached = redis_client.get(cached_key)
    if cached:
        return jsonify(eval(cached))
    users = User.query.all()
    data = user_schema.dump(users)
    redis_client.set(cached_key, str(data), ex=60)
    return jsonify(data)


def create_user():
    data = request.json
    errors = user_schema.validate(data)
    if errors:
        return {"errors": errors}, 400

    user = User(username=data["username"], email=data["email"])
    db.session.add(user)
    db.session.commit()
    return user_schema.dump(user), 201
