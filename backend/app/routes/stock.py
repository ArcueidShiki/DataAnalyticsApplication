from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required, verify_jwt_in_request
import app.controllers.stock_controller as controller
from flask_cors import cross_origin

stock_bp = Blueprint('stock', __name__, url_prefix='/stock')

@stock_bp.route('/<string:symbol>/overview', methods=['GET'])
def show_overview(symbol):
    return controller.show_overview(symbol)

@stock_bp.route('/<string:symbol>/analyst', methods=['GET'])
def show_analyst(symbol):
    return controller.show_analyst(symbol)

@stock_bp.route('/<string:symbol>/company', methods=['GET'])
def show_company(symbol):
    return controller.show_company(symbol)

@stock_bp.route('/<string:symbol>/financials', methods=['GET'])
def show_financials(symbol):
    return controller.show_financials(symbol)

@stock_bp.route('/<string:symbol>/news', methods=['GET'])
def show_news(symbol):
    return controller.show_news(symbol)

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


@stock_bp.route('/hot', methods=['GET'])
def get_top_hot_stocks():
    return controller.get_top_hot_stocks()

@stock_bp.after_request
def add_cors_headers(response):
    origin = request.headers.get("Origin")
    if origin and origin.startswith("http://127.0.0.1"):
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
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
    return controller.add_to_watchlist()

@stock_bp.route('/watchlist/remove', methods=['POST', 'OPTIONS'])
@jwt_required()
def remove_from_watchlist():
    return controller.remove_from_watchlist()

@stock_bp.route('/market/<string:date>', methods=['GET'])
def get_yesterday_market_summary(date):
    return controller.get_yesterday_market_summary(date)

@stock_bp.route('/all/symbols', methods=['GET'])
def get_all_symbols():
    return controller.get_all_symbols()