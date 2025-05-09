from flask import Blueprint, jsonify
from app.controllers.myasset_controller import get_user_portfolio  # ✅ New import

myasset_bp = Blueprint('myasset', __name__, url_prefix='/myasset')

@myasset_bp.route('/<user_id>', methods=['GET'])
def get_user_assets(user_id):
    result = get_user_portfolio(user_id)  # ✅ Delegates logic to controller
    return jsonify(result), 200

