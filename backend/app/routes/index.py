from flask import send_from_directory, Blueprint, jsonify, request

index_bp = Blueprint('index', __name__,)

@index_bp.route("/", methods=["GET"])
def index():
    print("index")
    return send_from_directory("app/static", "index.html")