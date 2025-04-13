from flask import jsonify, request, Blueprint
from app.controllers.user_controller import get_all_users, create_user
from app import db, redis_client

user_bp = Blueprint("user", __name__, url_prefix="/users")


@user_bp.route("./", methods=["GET"])
def get_users():
    return "Hello from Flask!"
    # return get_all_users()


@user_bp.route("./", methods=["POST"])
def post_user():
    return create_user()
