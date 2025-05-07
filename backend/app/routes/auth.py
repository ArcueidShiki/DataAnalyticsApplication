from flask import Blueprint
import app.controllers.user_controller as controller

auth_bp = Blueprint('auth', __name__, url_prefix='/auth')

@auth_bp.route('/register', methods=('POST',))
def register():
    return controller.register()

@auth_bp.route('/login',  methods=('POST',))
def login():
    return controller.login()

@auth_bp.route('/logout', methods=('POST',))
def logout():
    return controller.logout()