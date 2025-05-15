from flask import Blueprint, request
from flask_socketio import emit
from app import wsocket
from flask_jwt_extended import jwt_required
import app.controllers.chat_controller as controller

chat_bp = Blueprint('chat', __name__, url_prefix='/chat')

@wsocket.on('connect', namespace='/chat')
def handle_connect():
    print("Client connected to chat namespace")

@wsocket.on('authenticate')
def handle_authenticate(data):
    """
    Authenticate the user when they connect via WebSocket.
    """
    token = data.get('access_token')
    user_id = controller.authenticate_user(token)
    if user_id:
        emit('authenticated', {'message': 'Authentication successful'})
    else:
        emit('error', {'message': 'Authentication failed'})

@wsocket.on('send_message')
def handle_send_message(data):
    """
    Handle sending a message from one user to another.
    """
    response = controller.handle_message(data)
    emit('message_sent', response, room=request.sid)

@wsocket.on('disconnect')
def handle_disconnect():
    print("Client disconnected")

@chat_bp.route('/new', methods=('POST',))
@jwt_required()
def new_chat():
    return controller.new_chat()

@chat_bp.route('/list', methods=('GET',))
@jwt_required()
def get_list():
    return controller.get_list()

@chat_bp.route('/history', methods=('GET',))
@jwt_required()
def get_history():
    return controller.get_history()

@chat_bp.route('/clear', methods=('DELETE',))
@jwt_required()
def clear_history():
    return controller.clear_history()

@chat_bp.route('/send/text', methods=('POST',))
@jwt_required()
def send_text():
    return controller.send_text()

@chat_bp.route('/send/img', methods=('POST',))
@jwt_required()
def send_img():
    return controller.send_img()

@chat_bp.route('/send/bulk/img', methods=('POST',))
@jwt_required()
def bulk_send_img():
    return controller.bulk_send_img()

@chat_bp.route('/send/bulk/text', methods=('POST',))
@jwt_required()
def bulk_send_text():
    return controller.bulk_send_text()