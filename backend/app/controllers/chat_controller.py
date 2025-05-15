from flask import request, jsonify
from flask_jwt_extended import decode_token, get_jwt_identity
from app.utils.img import create_summary_image
from app import db
from app.models.db import Message, User
from datetime import datetime
from werkzeug.utils import secure_filename
from sqlalchemy import or_

def get_chat_list():
    """
    Get the list of chats for the current user.
    """
    user_id = get_jwt_identity()
    messages = db.session.query(Message).filter(
        or_(
            (Message.sender_id == user_id) & (Message.is_sender_deleted == False),
            (Message.receiver_id == user_id) & (Message.is_receiver_deleted == False)
        )
    ).all()

    chat_partners = set()
    for message in messages:
        if message.sender_id != user_id:
            chat_partners.add(message.sender_id)
        if message.receiver_id != user_id:
            chat_partners.add(message.receiver_id)

    chat_partners_data = []
    for partner_id in chat_partners:
        partner = User.query.filter_by(id=partner_id).first()
        if partner:
            chat_partners_data.append({
                "user_id": partner.id,
                "username": partner.username,
                "profile_img": partner.profile_img
            })

    return jsonify(chat_partners_data), 200

def get_history(partner_id):
    """
    Get chat history between two users.
    """
    user_id = get_jwt_identity()
    messages = db.session.query(Message).filter(
        or_(
            ((Message.sender_id == user_id) & (Message.receiver_id == partner_id) & (Message.is_sender_deleted == False)),
            ((Message.sender_id == partner_id) & (Message.receiver_id == user_id) & (Message.is_receiver_deleted == False))
        )
    ).order_by(Message.timestamp.asc()).all()

    history = [message.to_dict() for message in messages]
    return {"history": history}, 200

def send_message(sender_id, receiver_id, message, message_type='text'):
    new_message = Message(
        sender_id=sender_id,
        receiver_id=receiver_id,
        message=message,
        message_type=message_type
    )
    db.session.add(new_message)
    db.session.commit()
    return {"msg": "Message sent successfully"}, 201


def close():
    """
    Close the chat between two users.
    """
    data = request.get_json()
    user_id = get_jwt_identity()
    partner_id = data.get("partner_id")

    if not partner_id:
        return jsonify({"error": "Partner user ID is required"}), 400

    sent_messages = db.session.query(Message).filter(
            (Message.sender_id == user_id) & (Message.receiver_id == partner_id)
    ).all()
    received_messages = db.session.query(Message).filter(
            (Message.sender_id == partner_id) & (Message.receiver_id == user_id)
    ).all()
    for msg in sent_messages:
        msg.is_sender_deleted = True
    for msg in received_messages:
        msg.is_receiver_deleted = True
    db.session.commit()
    return jsonify({"message": "Chat closed successfully"}), 200

def send_profit_loss():
    """
    Send profit and loss picture.
    """
    data = request.get_json()
    user_id = get_jwt_identity()
    partner_id = data.get("partner_id")
    symbol = data.get("symbol")
    avg_cost = data.get("avg_cost")
    price = data.get("price")

    user = User.query.filter_by(id=user_id).first()
    bg_img_path = price >= avg_cost and "static/pl/profit.png" or "static/pl/loss.png"
    date = datetime.now().strftime("%Y-%m-%d")
    output_path = f"static/users/summary/{user_id}/{date}.png"
    create_summary_image(
        bg_image_path=bg_img_path,
        output_path=output_path,
        profit_value=price - avg_cost,
        symbol=symbol,
        price=price,
        avg_cost=avg_cost,
        username=user.username
    )
    new_message = Message(
        sender_id=user_id,
        receiver_id=partner_id,
        message=output_path,
        message_type='image'
    )
    db.session.add(new_message)
    db.session.commit()
    return {"msg": "File sent successfully"}, 201

def send_text():
    """
    Send text message.
    """
    data = request.get_json()
    user_id = get_jwt_identity()
    partner_id = data.get("partner_id")
    message = data.get("message")

    if not message or not partner_id:
        return jsonify({"error": "Message and partner user ID are required"}), 400

    new_message = Message(
        sender_id=user_id,
        receiver_id=partner_id,
        message=message,
        message_type='text'
    )
    db.session.add(new_message)
    db.session.commit()
    return {"msg": "Message sent successfully"}, 201

def authenticate_user(token):
    """
    Decode the JWT token and return the user ID.
    """
    try:
        decoded_token = decode_token(token)
        return decoded_token['sub']
    except Exception as e:
        print(f"Authentication failed: {e}")
        return None

def handle_message(data):
    """
    Handle the logic for sending a message.
    """
    from_user_id = data.get('from_user_id')
    to_user_id = data.get('to_user_id')
    message = data.get('message')
    message_type = data.get('message_type', 'text')

    if not from_user_id or not to_user_id or not message:
        return {'error': 'Invalid message data'}
