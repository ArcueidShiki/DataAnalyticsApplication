from sqlalchemy import func
from app import db
from flask import jsonify, request
from datetime import datetime
from datetime import timedelta
from app.models.db import Asset, Portfolio, User
from flask_jwt_extended import get_jwt_identity, jwt_required

@jwt_required()
def get_total_asset():
    user_id = get_jwt_identity()
    return jsonify({"msg": "User ID retrieved successfully", "user_id": user_id}), 200
    # assets = (
    #     db.session.query(
    #         Asset.id,
    #         Asset.symbol,
    #         Asset.type,
    #         Portfolio.quantity,
    #         Market.close,
    #         Portfolio.avg_cost,
    #         (Market.close - Market.open).label("today_profit"),
    #         (Market.close - Portfolio.avg_cost).label("profit"),
    #         ((Market.close - Market.open) / Market.open * 100).label("percentage")
    #     )
    #     .join(Asset, Portfolio.asset_id == Asset.id)
    #     .join(Market, Asset.symbol == Market.symbol)
    #     .filter(Portfolio.user_id == user_id)
    #     .filter(
    #         Market.date == db.session.query(func.max(Market.date))
    #         .filter(Market.symbol == Asset.symbol)
    #         .correlate(Asset)
    #         .scalar_subquery()
    #     ).all()
    # )
    # formatted_assets = [
    #     {
    #         "id": asset[0],
    #         "symbol": asset[1],
    #         "type": asset[2],
    #         "quantity": asset[3],
    #         "close": asset[4],
    #         "avg_cost": asset[5],
    #         "today_profit": asset[6],
    #         "profit": asset[7],
    #         "percentage": asset[8],
    #     }
    #     for asset in assets
    # ]

    # Return the formatted response
    return jsonify(formatted_assets), 200
