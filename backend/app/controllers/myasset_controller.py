from app.models.db import db, Portfolio, Asset
from app.utils.yftool import get_price

def get_user_portfolio(user_id):
    portfolios = Portfolio.query.filter_by(user_id=user_id).all()
    result = []

    for p in portfolios:
        asset = Asset.query.get(p.asset_id)
        if not asset:
            continue

        current_price = get_price(asset.symbol)
        total_value = round(p.quantity * current_price, 2)
        gain_loss = round((current_price - p.avg_cost) * p.quantity, 2)

        result.append({
            'symbol': asset.symbol,
            'name': asset.name,
            'type': asset.type,
            'quantity': p.quantity,
            'avg_cost': p.avg_cost,
            'cur_price': current_price,
            'total_value': total_value,
            'gain_loss': gain_loss
        })

    return result
