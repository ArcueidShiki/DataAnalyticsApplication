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









@chat_bp.route('/list', methods=('GET',))
@jwt_required()
def get_chat_list():
    return controller.get_chat_list()

@chat_bp.route('/history/<string:partner_id>', methods=('GET',))
@jwt_required()
def get_history(partner_id):
    return controller.get_history(partner_id)

@chat_bp.route('/close', methods=('POST',))
@jwt_required()
def close():
    return controller.close()

# send profit and loss picture
@chat_bp.route('/send/pl', methods=('POST',))
@jwt_required()
def send_profit_loss():
    return controller.send_profit_loss()

@chat_bp.route('/send/text', methods=('POST',))
@jwt_required()
def send_text():
    return controller.send_text()