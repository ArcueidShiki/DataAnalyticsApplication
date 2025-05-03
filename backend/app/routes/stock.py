from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
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

@stock_bp.route('/buy', methods=['POST'])
@jwt_required()
def buy():
    data = request.get_json()
    return controller.buy(data)

@stock_bp.route('/sell', methods=['POST'])
@jwt_required()
def sell():
    data = request.get_json()
    return controller.sell(data)


@stock_bp.route('/hot', methods=['GET'])
def get_top_hot_stocks():
    return controller.get_top_hot_stocks()


@stock_bp.route('/watchlist', methods=['GET', 'POST', 'OPTIONS'])
@jwt_required()
def show_watchlist():
    # print("Authorization Header:", request.headers.get("Authorization"))
    # return jsonify({"msg": "ok"})
    # print("request method:", request.method)
    if request.method == 'OPTIONS':
        # print("Preflight request received")
        response = jsonify({"message": "Preflight request successful"})
        response.headers.add("Access-Control-Allow-Origin", "http://127.0.0.1:5500")
        response.headers.add("Access-Control-Allow-Credentials", "true")
        response.headers.add("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type, Authorization")
        return response, 204
    else:
        print("GET request received")
    return controller.show_watchlist()

@stock_bp.route('/watchlist/add', methods=['POST'])
@jwt_required()
def add_to_watchlist():
    return controller.add_to_watchlist()

@stock_bp.route('/watchlist/remove', methods=['POST'])
@jwt_required()
def remove_from_watchlist():
    return controller.remove_from_watchlist()