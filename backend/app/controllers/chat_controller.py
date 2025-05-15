from flask import request, jsonify
from flask_jwt_extended import decode_token, get_jwt_identity
from app import db
from app.models.db import User
from datetime import datetime
from werkzeug.utils import secure_filename

def new_chat():
    """
    Create a new chat between two users.
    """
    data = request.get_json()
    from_user_id = get_jwt_identity()
    to_user_id = data.get("to_user_id")

    if not to_user_id:
        return jsonify({"error": "Recipient user ID is required"}), 400

    to_user = User.query.filter_by(id=to_user_id).first()
    if not to_user:
        return jsonify({"error": "Recipient user does not exist"}), 404

    # existing_chat = Chat.query.filter_by(from_user_id=from_user_id, to_user_id=to_user_id).first()
    # if existing_chat:
    #     return jsonify({"message": "Chat already exists", "chat_id": existing_chat.id}), 200

    # new_chat = Chat(from_user_id=from_user_id, to_user_id=to_user_id)
    # db.session.add(new_chat)
    # db.session.commit()

    return jsonify({"message": "New chat created", "chat_id": new_chat.id}), 201

def get_list():
    """
    Get the list of chats for the current user.
    """
    user_id = get_jwt_identity()
    # chats = Chat.query.filter(Chat.from_user_id == user_id).all()

    # chat_list = []
    # for chat in chats:
    #     to_user = User.query.get(chat.to_user_id)
    #     chat_list.append({
    #         "chat_id": chat.id,
    #         "other_user": {
    #             "id": to_user.id,
    #             "username": to_user.username,
    #             "profile_img": to_user.profile_img
    #         }
    #     })

    # return jsonify(chat_list), 200

def get_history():
    """
    Get chat history between two users.
    """
    from_user_id = get_jwt_identity()
    to_user_id = request.args.get("to_user_id")

    if not to_user_id:
        return jsonify({"error": "Recipient user ID is required"}), 400

    # # Get the chat list entry
    # chat = Chat.query.filter_by(from_user_id=from_user_id, to_user_id=to_user_id).first()
    # if not chat:
    #     return jsonify({"error": "Chat does not exist"}), 404

    # # Get chat history
    # history = ChatHistory.query.filter_by(chat_list_id=chat.id).order_by(ChatHistory.timestamp.asc()).all()
    # return jsonify([message.to_dict() for message in history]), 200


def clear_history():
    """
    Clear chat history between two users.
    """
    from_user_id = get_jwt_identity()
    to_user_id = request.args.get("to_user_id")

    if not to_user_id:
        return jsonify({"error": "Recipient user ID is required"}), 400

    # # Get the chat list entry
    # chat = Chat.query.filter_by(from_user_id=from_user_id, to_user_id=to_user_id).first()
    # if not chat:
    #     return jsonify({"error": "Chat does not exist"}), 404

    # # Delete chat history
    # ChatHistory.query.filter_by(chat_list_id=chat.id).delete()
    # db.session.commit()

    return jsonify({"message": "Chat history cleared"}), 200


def send_text():
    """
    Send a text message in a chat.
    """
    data = request.get_json()
    from_user_id = get_jwt_identity()
    to_user_id = data.get("to_user_id")
    message = data.get("message")

    if not to_user_id or not message:
        return jsonify({"error": "Recipient user ID and message are required"}), 400

    # Get or create the chat list entry
    # chat = Chat.query.filter_by(from_user_id=from_user_id, to_user_id=to_user_id).first()
    # if not chat:
    #     chat = Chat(from_user_id=from_user_id, to_user_id=to_user_id)
    #     db.session.add(chat)
    #     db.session.commit()

    # # Add the message to chat history
    # chat_message = ChatHistory(
    #     chat_list_id=chat.id,
    #     user_id=from_user_id,
    #     message=message,
    #     message_type="text",
    #     timestamp=datetime.utcnow()
    # )
    # db.session.add(chat_message)
    # db.session.commit()

    # return jsonify({"message": "Message sent", "chat_id": chat.id}), 201


def send_img():
    """
    Send an image in a chat.
    """
    from_user_id = get_jwt_identity()
    to_user_id = request.form.get("to_user_id")
    file = request.files.get("file")

    if not to_user_id or not file:
        return jsonify({"error": "Recipient user ID and image file are required"}), 400

    # Save the image
    filename = secure_filename(file.filename)
    file_path = f"static/chat_images/{filename}"
    file.save(file_path)

    # # Get or create the chat list entry
    # chat = Chat.query.filter_by(from_user_id=from_user_id, to_user_id=to_user_id).first()
    # if not chat:
    #     chat = Chat(from_user_id=from_user_id, to_user_id=to_user_id)
    #     db.session.add(chat)
    #     db.session.commit()

    # # Add the image to chat history
    # chat_message = ChatHistory(
    #     chat_list_id=chat.id,
    #     user_id=from_user_id,
    #     message=file_path,
    #     message_type="image",
    #     timestamp=datetime.utcnow()
    # )
    # db.session.add(chat_message)
    # db.session.commit()

    # return jsonify({"message": "Image sent", "chat_id": chat.id, "image_url": file_path}), 201


def bulk_send_img():
    """
    Send multiple images in a chat.
    """
    from_user_id = get_jwt_identity()
    to_user_id = request.form.get("to_user_id")
    files = request.files.getlist("files")

    if not to_user_id or not files:
        return jsonify({"error": "Recipient user ID and image files are required"}), 400

    # # Get or create the chat list entry
    # chat = Chat.query.filter_by(from_user_id=from_user_id, to_user_id=to_user_id).first()
    # if not chat:
    #     chat = Chat(from_user_id=from_user_id, to_user_id=to_user_id)
    #     db.session.add(chat)
    #     db.session.commit()

    # # Save each image and add to chat history
    # for file in files:
    #     filename = secure_filename(file.filename)
    #     file_path = f"static/chat_images/{filename}"
    #     file.save(file_path)

    #     chat_message = ChatHistory(
    #         chat_list_id=chat.id,
    #         user_id=from_user_id,
    #         message=file_path,
    #         message_type="image",
    #         timestamp=datetime.utcnow()
    #     )
    #     db.session.add(chat_message)

    # db.session.commit()

    # return jsonify({"message": "Images sent", "chat_id": chat.id}), 201


def bulk_send_text():
    """
    Send multiple text messages in a chat.
    """
    data = request.get_json()
    from_user_id = get_jwt_identity()
    to_user_id = data.get("to_user_id")
    messages = data.get("messages")

    if not to_user_id or not messages:
        return jsonify({"error": "Recipient user ID and messages are required"}), 400

    # Get or create the chat list entry
    # chat = Chat.query.filter_by(from_user_id=from_user_id, to_user_id=to_user_id).first()
    # if not chat:
    #     chat = Chat(from_user_id=from_user_id, to_user_id=to_user_id)
    #     db.session.add(chat)
    #     db.session.commit()

    # # Add each message to chat history
    # for message in messages:
    #     chat_message = ChatHistory(
    #         chat_list_id=chat.id,
    #         user_id=from_user_id,
    #         message=message,
    #         message_type="text",
    #         timestamp=datetime.utcnow()
    #     )
    #     db.session.add(chat_message)

    # db.session.commit()

    # return jsonify({"message": "Messages sent", "chat_id": chat.id}), 201

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

    # Get or create Chat
    # chat = Chat.query.filter_by(user_id=from_user_id, other_user_id=to_user_id).first()
    # if not chat:
    #     chat = Chat(user_id=from_user_id, other_user_id=to_user_id, is_deleted=False, is_other_deleted=False)
    #     db.session.add(chat)
    #     db.session.commit()

    # # Save message to ChatHistory
    # chat_message = ChatHistory(
    #     chat_id=chat.id,
    #     sender_id=from_user_id,
    #     receiver_id=to_user_id,
    #     message=message,
    #     message_type=message_type,
    #     timestamp=datetime.utcnow(),
    #     is_read=False
    # )
    # db.session.add(chat_message)

    # # Update Chat
    # chat.last_message = message
    # chat.last_message_time = datetime.utcnow()
    # db.session.commit()

    # return {
    #     'from_user_id': from_user_id,
    #     'to_user_id': to_user_id,
    #     'message': message,
    #     'message_type': message_type,
    #     'timestamp': chat_message.timestamp.isoformat()
    # }