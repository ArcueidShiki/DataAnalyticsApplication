from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required, verify_jwt_in_request
import app.controllers.stock_controller as controller
from flask_cors import cross_origin

stock_bp = Blueprint('stock', __name__, url_prefix='/stock')

@stock_bp.route('/all/symbols', methods=['GET'])
def get_all_symbols():
    return controller.get_all_symbols()

@stock_bp.route('/<string:symbol>/overview', methods=['GET'])
def get_ticker_overview(symbol):
    return controller.get_ticker_overview(symbol)

@stock_bp.route('/<string:symbol>/financials', methods=['GET'])
def get_financials(symbol):
    return controller.get_financials(symbol)

@stock_bp.route('/<string:symbol>/news', methods=['GET'])
def get_news(symbol):
    return controller.get_news(symbol)

@stock_bp.route('/<string:symbol>/daily', methods=['GET'])
def get_daliy_data(symbol):
    return controller.get_daliy_data(symbol)

@stock_bp.route('/<string:symbol>/weekly', methods=['GET'])
def get_weekly_data(symbol):
    return controller.get_weekly_data(symbol)

@stock_bp.route('/<string:symbol>/monthly', methods=['GET'])
def get_monthly_data(symbol):
    return controller.get_monthly_data(symbol)

@stock_bp.after_request
def add_cors_headers(response):
    origin = request.headers.get("Origin")
    if origin and (origin.startswith("http://127.0.0.1") or origin.startswith("http://[::1]")):
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-CSRF-Token"
    return response

@stock_bp.route('/watchlist', methods=['GET', 'POST', 'OPTIONS'])
@jwt_required()
def show_watchlist():
    if request.method == 'OPTIONS':
        response = jsonify({"message": "Preflight request successful"})
        return add_cors_headers(response), 204
    user_id = get_jwt_identity()
    return controller.show_watchlist(user_id)

@stock_bp.route('/watchlist/add', methods=['POST', 'OPTIONS'])
@jwt_required()
def add_to_watchlist():
    if request.method == 'OPTIONS':
        response = jsonify({"message": "Preflight request successful"})
        return add_cors_headers(response), 204
    return controller.add_to_watchlist()

@stock_bp.route('/watchlist/remove', methods=['POST', 'OPTIONS'])
@jwt_required()
def remove_from_watchlist():
    if request.method == 'OPTIONS':
        response = jsonify({"message": "Preflight request successful"})
        return add_cors_headers(response), 204
    return controller.remove_from_watchlist()

@stock_bp.route('/buy', methods=['POST', 'OPTIONS'])
@jwt_required()
def buy():
    if request.method == 'OPTIONS':
        response = jsonify({"message": "Preflight request successful"})
        return add_cors_headers(response), 204
    return controller.buy()

@stock_bp.route('/sell', methods=['POST', 'OPTIONS'])
@jwt_required()
def sell():
    if request.method == 'OPTIONS':
        response = jsonify({"message": "Preflight request successful"})
        return add_cors_headers(response), 204
    return controller.sell()