from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
import app.controllers.asset_controller as controller

asset_bp = Blueprint('asset', __name__, url_prefix='/asset')

@asset_bp.after_request
def add_cors_headers(response):
    origin = request.headers.get("Origin")
    if origin and origin.startswith("http://127.0.0.1"):
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    return response

@asset_bp.route('/', methods=['GET', 'POST', 'OPTIONS'])
@jwt_required()
def get_total_asset():
    if request.method == 'OPTIONS':
        response = jsonify({"message": "Preflight request successful"})
        return add_cors_headers(response), 204
    return controller.get_total_asset()