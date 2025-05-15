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

@auth_bp.route('/upload/img', methods=('POST',))
@jwt_required()
def upload_profile_img():
    return controller.upload_profile_img()

@auth_bp.route('/user/update', methods=('Post',))
@jwt_required()
def update_user_info():
    return controller.update_user_info()