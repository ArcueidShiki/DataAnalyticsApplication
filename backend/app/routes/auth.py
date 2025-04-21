from flask import Blueprint, request
from app.controllers.user_controller import register_user, user_login
from flasgger import Swagger, swag_from

# all the api return json response

auth_bp = Blueprint('auth', __name__, url_prefix='/auth')

@auth_bp.route('/register', methods=('POST',))
def register():
    data = request.get_json()
    response, status_code = register_user(data)
    return response, status_code

@auth_bp.route('/login',  methods=('POST',))
def login():
    data = request.get_json()
    response, status_code = user_login(data)
    return response, status_code