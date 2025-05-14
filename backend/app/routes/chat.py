from flask import Blueprint
from flask_jwt_extended import jwt_required
import app.controllers.chat_controller as controller

chat_bp = Blueprint('chat', __name__, url_prefix='/chat')

@chat_bp.route('/new', methods=('POST',))
@jwt_required()
def new_chat():
    return controller.new_chat()

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