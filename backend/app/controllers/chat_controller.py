import os
from flask import request, jsonify
from flask_jwt_extended import decode_token, get_jwt_identity
from app.utils.img import create_summary_image
from app import db
from app.models.db import Message, User
from datetime import datetime
from werkzeug.utils import secure_filename
from sqlalchemy import or_

# for chat, socket io
user_sessions = {}

def get_all_users():
    """
    Get all users for chat.
    """
    users = User.query.all()
    user_list = []
    for user in users:
        user_list.append({
            "user_id": user.id,
            "username": user.username,
            "profile_img": user.profile_img
        })
    return jsonify(user_list), 200

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

def send_summary_img(data):
    """
    Send profit and loss picture.
    """
    print("data:", data)
    sender_id = data.get("sender_id")
    partner_id = data.get("receiver_id")
    symbol = data.get("symbol")
    avg_cost = float(data.get("avg_cost"))
    price = float(data.get("price"))

    user = User.query.filter_by(id=sender_id).first()
    bg_img_path = "app/static/pl/profit.png" if price >= avg_cost else "app/static/pl/loss.png"
    date = datetime.now().strftime("%Y-%m-%d")
    directory = f"app/static/users/summary/{sender_id}"
    if not os.path.exists(directory):
        os.makedirs(directory)
    output_path = f"app/static/users/summary/{sender_id}/{date}.png"
    save_path = f"static/users/summary/{sender_id}/{date}.png"
    print("output_path:", output_path)
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
        sender_id=sender_id,
        receiver_id=partner_id,
        message=save_path,
        type='image'
    )
    db.session.add(new_message)
    db.session.commit()
    return {"image_url": save_path}

def send_text(data):
    sender_id = data.get("sender_id")
    partner_id = data.get("receiver_id")
    message = data.get("message")
    print("message:", message)
    if not message or not partner_id:
        print("partner_id:", partner_id)
        return jsonify({"error": "Message and partner user ID are required"})

    new_message = Message(
        sender_id=sender_id,
        receiver_id=partner_id,
        message=message,
        type='text'
    )
    db.session.add(new_message)
    db.session.commit()
    print("new_message:", new_message)
    return {"message": message}

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
    Save the message to the database and return the response.
    """
    sender_id = data.get('sender_id')
    receiver_id = data.get('receiver_id')
    message = data.get('message')
    new_message = Message(
        sender_id=sender_id,
        receiver_id=receiver_id,
        message=message,
        timestamp=datetime.utcnow()
    )
    db.session.add(new_message)
    db.session.commit()
    return new_message.to_dict()

def get_receiver_sid(receiver_id):
    """
    Get the WebSocket session ID for a given user ID.
    """
    return user_sessions.get(receiver_id)

def add_user_session(user_id, sid):
    """
    Add a user to the session map.
    """
    user_sessions[user_id] = sid

def remove_user_session(sid):
    """
    Remove a user from the session map using their session ID.
    """
    for user_id, session_id in list(user_sessions.items()):
        if session_id == sid:
            del user_sessions[user_id]
            break
