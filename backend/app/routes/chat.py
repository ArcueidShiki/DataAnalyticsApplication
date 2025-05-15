from flask import Blueprint, jsonify, request
from flask_socketio import disconnect, emit
from app import wsocket
from flask_jwt_extended import jwt_required
import app.controllers.chat_controller as controller

chat_bp = Blueprint('chat', __name__, url_prefix='/chat')


@chat_bp.after_request
def add_cors_headers(response):
    origin = request.headers.get("Origin")
    if origin and (origin.startswith("http://127.0.0.1") or origin.startswith("http://[::1]") or origin.startswith("http://localhost")):
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-CSRF-Token"
    return response

@wsocket.on('connect', namespace='/chat')
def handle_connect():
    print("Client connected to chat namespace")

@wsocket.on('authenticate', namespace='/chat')
def handle_authenticate(data):
    """
    Authenticate the user when they connect via WebSocket.
    """
    token = data.get('access_token')
    user_id = controller.authenticate_user(token)
    if user_id:
        controller.add_user_session(user_id, request.sid)
        emit('authenticated', {'message': 'Authentication successful'})
    else:
        emit('error', {'message': 'Authentication failed'})

@wsocket.on('disconnect', namespace='/chat')
def handle_disconnect():
    controller.remove_user_session(request.sid)
    disconnect()
    print("Client disconnected")


@chat_bp.route('/all/users', methods=('GET',))
def get_all_users():
    if request.method == 'OPTIONS':
        response = jsonify({"message": "Preflight request successful"})
        return add_cors_headers(response), 204
    return controller.get_all_users()

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

@chat_bp.route('/send/text', methods=('POST',))
@jwt_required()
def send_text():
    return controller.send_text()

@wsocket.on('send_text', namespace='/chat')
def send_text(data):
    print("Received text message:", data)
    response = controller.send_text(data)
    emit('text_sent', response, room=request.sid)  # Acknowledge the sender
    # Forward the message to the recipient if they are connected
    receiver_id = data.get('receiver_id')
    receiver_sid = controller.get_receiver_sid(receiver_id)  # Get recipient's WebSocket session ID
    if receiver_sid:
        emit('receive_text', response, room=receiver_sid)

# send profit and loss picture
@wsocket.on('send_summary_img', namespace='/chat')
def send_summary_img(data):
    response = controller.send_summary_img(data)
    print("response:", response)
    emit('summary_img_sent', response, room=request.sid)
    # Forward the message to the recipient if they are connected
    receiver_id = data.get('receiver_id')
    receiver_sid = controller.get_receiver_sid(receiver_id)
    if receiver_sid:
        emit('receive_summary_img', response, room=receiver_sid)