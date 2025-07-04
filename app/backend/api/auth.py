from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from extensions import db
from models.user import User
from flask_jwt_extended import create_access_token
from flask_limiter.util import get_remote_address
import re

# Blueprint
auth_bp = Blueprint('auth', __name__)

# Password complexity regex
PASSWORD_REGEX = re.compile(r'^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$')

def sanitize_input(value):
    # Basic sanitization (expand as needed)
    return str(value).strip()

from flask_limiter import Limiter
from flask import current_app

# Get limiter instance from app
def get_limiter():
    return current_app.extensions.get('limiter')

@auth_bp.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    username = sanitize_input(data.get('username', ''))
    email = sanitize_input(data.get('email', ''))
    password = data.get('password', '')

    # Validate input
    if not username or not email or not password:
        return jsonify({'msg': 'Missing required fields'}), 400
    if not PASSWORD_REGEX.match(password):
        return jsonify({'msg': 'Password must be at least 8 characters, include a letter and a number'}), 400

    # Check uniqueness
    if User.query.filter((User.username == username) | (User.email == email)).first():
        return jsonify({'msg': 'Username or email already exists'}), 400

    # Hash password and save user
    password_hash = generate_password_hash(password)
    user = User(username=username, email=email, password_hash=password_hash)
    db.session.add(user)
    db.session.commit()
    return jsonify({'msg': 'User created'}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    identifier = sanitize_input(data.get('username', '') or data.get('email', ''))
    password = data.get('password', '')

    # Find user by username or email
    user = User.query.filter((User.username == identifier) | (User.email == identifier)).first()
    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({'msg': 'Invalid credentials'}), 401

    # Generate JWT token
    access_token = create_access_token(identity=user.id)
    return jsonify({
        'access_token': access_token,
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email
        }
    }), 200

# Routes will be implemented here 