from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from models.user import User, db
from utils.jwt_utils import create_token, token_required
import re
from flask_cors import CORS
from flask import Flask

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/api/auth/login', methods=['POST'])
def login():
    """Login endpoint"""
    try:
        data = request.get_json()
        if not data or not data.get('password'):
            return jsonify({'error': 'Username/email and password required'}), 400
        
        # Try to find user by username or email
        username_or_email = data.get('username') or data.get('email')
        if not username_or_email:
            return jsonify({'error': 'Username or email required'}), 400
        
        user = User.query.filter(
            (User.username == username_or_email) | (User.email == username_or_email)
        ).first()
        
        if not user or not check_password_hash(user.password, data['password']):
            return jsonify({'error': 'Invalid username/email or password'}), 401
        
        access_token = create_token(user.id)
        return jsonify({
            'access_token': access_token,
            'user': user.to_dict(include_sensitive=True)
        }), 200
    
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@auth_bp.route('/api/auth/signup', methods=['POST'])
def signup():
    """Signup endpoint"""
    try:
        data = request.get_json()
        if not data or not data.get('username') or not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Username, email, and password required'}), 400
        
        # Username validation: only allow letters, numbers, and underscores
        if not re.match(r'^\w+$', data['username']):
            return jsonify({'error': 'Username can only contain letters, numbers, and underscores'}), 400
        
        # Password validation: must contain at least one capital, one small, one special char, and one number
        password = data['password']
        if len(password) < 8:
            return jsonify({'error': 'Password must be at least 8 characters long'}), 400
        
        if not re.search(r'[A-Z]', password):
            return jsonify({'error': 'Password must contain at least one capital letter'}), 400
        
        if not re.search(r'[a-z]', password):
            return jsonify({'error': 'Password must contain at least one small letter'}), 400
        
        if not re.search(r'[0-9]', password):
            return jsonify({'error': 'Password must contain at least one number'}), 400
        
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
            return jsonify({'error': 'Password must contain at least one special character (!@#$%^&*(),.?":{}|<>)'}), 400
        
        # Check if user already exists
        if User.query.filter_by(username=data['username']).first():
            return jsonify({'error': 'Username already exists'}), 400
        
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'Email already exists'}), 400
        
        # Create new user
        hashed_password = generate_password_hash(data['password'])
        new_user = User()
        new_user.username = data['username']
        new_user.email = data['email']
        new_user.password = hashed_password
        
        db.session.add(new_user)
        db.session.commit()
        
        access_token = create_token(new_user.id)
        return jsonify({
            'access_token': access_token,
            'user': new_user.to_dict(include_sensitive=True)
        }), 201
    
    except Exception as e:
        db.session.rollback()
        print(f"Signup error: {str(e)}")  # Debug logging
        return jsonify({'error': 'Internal server error', 'details': str(e)}), 500

@auth_bp.route('/api/auth/me', methods=['GET'])
@token_required
def get_current_user(user_id):
    """Get current user info"""
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify(user.to_dict()), 200
    
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

# Routes will be implemented here 