from flask import Blueprint
from flask_jwt_extended import jwt_required
import app.controllers.user_controller as controller

auth_bp = Blueprint('auth', __name__, url_prefix='/auth')

@auth_bp.route('/register', methods=('POST',))
def register():
    return controller.register()

@auth_bp.route('/login',  methods=('POST',))
def login():
    return controller.login()

@auth_bp.route('/logout', methods=('GET',))
@jwt_required()
def logout():
    return controller.logout()