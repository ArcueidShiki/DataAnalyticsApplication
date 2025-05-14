from flask import Blueprint, request
from flask_jwt_extended import jwt_required
import app.controllers.user_controller as controller
from flasgger import Swagger, swag_from

# all the api return json response

auth_bp = Blueprint('auth', __name__, url_prefix='/auth')

@auth_bp.route('/register', methods=('POST',))
def register():
    data = request.get_json()
    response, status_code = controller.register(data)
    return response, status_code
@auth_bp.route('/login',  methods=('POST',))
def login():
    data = request.get_json()
    response, status_code = controller.login(data)
    return response, status_code

@auth_bp.route('/upload/img', methods=('POST',))
@jwt_required()
def upload_profile_img():
    return controller.upload_profile_img()