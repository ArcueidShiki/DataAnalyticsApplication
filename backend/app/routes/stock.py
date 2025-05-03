from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
import app.controllers.stock_controller as controller

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