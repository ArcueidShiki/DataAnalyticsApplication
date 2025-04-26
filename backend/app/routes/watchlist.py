from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
import app.controllers.watchlist_controller as controller
from app.routes.stock import stock_bp

@stock_bp.route('/watchlist/show', methods=['GET'])
@jwt_required()
def show_watchlist():
    return controller.show_watchlist()

@stock_bp.route('/watchlist/add', methods=['POST'])
@jwt_required()
def add_to_watchlist():
    return controller.add_to_watchlist()

@stock_bp.route('/watchlist/remove', methods=['POST'])
@jwt_required()
def remove_from_watchlist():
    return controller.remove_from_watchlist()