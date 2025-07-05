from flask import Blueprint, request, jsonify, current_app, send_from_directory
from models.user import User, db
from utils.jwt_utils import token_required
import os
import time
import json
import magic
from werkzeug.utils import secure_filename
from PIL import Image
import logging
from flask_limiter.util import get_remote_address
from flask_limiter import Limiter

profile_bp = Blueprint('profile', __name__)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def allowed_file(filename):
    """Check if file type is allowed"""
    return '.' in filename and \
        filename.rsplit('.', 1)[1].lower() in current_app.config['ALLOWED_EXTENSIONS']

def validate_file_content(file):
    """Validate file content using magic numbers"""
    try:
        # Read first 2048 bytes for magic number detection
        file.seek(0)
        header = file.read(2048)
        file.seek(0)  # Reset file pointer
        
        # Check MIME type
        mime_type = magic.from_buffer(header, mime=True)
        allowed_mimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
        
        if mime_type not in allowed_mimes:
            return False, f"Invalid file type: {mime_type}"
        
        return True, None
    except Exception as e:
        logger.error(f"File validation error: {str(e)}")
        return False, "File validation failed"

def process_image(filepath, filename):
    """Process uploaded image with compression and resizing"""
    try:
        with Image.open(filepath) as img:
            # Convert to RGB if necessary
            if img.mode in ('RGBA', 'LA', 'P'):
                img = img.convert('RGB')
            
            # Get original dimensions
            original_width, original_height = img.size
            
            # Resize image while maintaining aspect ratio
            max_size = current_app.config['MAX_IMAGE_SIZE']
            img.thumbnail(max_size, Image.Resampling.LANCZOS)
            
            # Save with compression
            quality = current_app.config['IMAGE_QUALITY']
            img.save(filepath, 'JPEG', quality=quality, optimize=True)
            
            # Generate thumbnail
            thumbnail_filename = f"thumb_{filename}"
            thumbnail_path = os.path.join(os.path.dirname(filepath), thumbnail_filename)
            
            # Create thumbnail
            with Image.open(filepath) as thumb_img:
                thumb_size = current_app.config['THUMBNAIL_SIZE']
                thumb_img.thumbnail(thumb_size, Image.Resampling.LANCZOS)
                thumb_img.save(thumbnail_path, 'JPEG', quality=80, optimize=True)
            
            logger.info(f"Image processed: {filename} ({original_width}x{original_height} -> {img.size[0]}x{img.size[1]})")
            return True, thumbnail_filename
            
    except Exception as e:
        logger.error(f"Image processing error: {str(e)}")
        return False, str(e)

def validate_profile_data(data):
    """Validate profile update data"""
    errors = []
    
    # Bio validation
    if 'bio' in data and data['bio'] and len(data['bio']) > 1000:
        errors.append('Bio must be less than 1000 characters')
    
    # Location validation
    if 'location' in data and data['location'] and len(data['location']) > 120:
        errors.append('Location must be less than 120 characters')
    
    # Phone validation
    if 'phone' in data and data['phone']:
        import re
        phone_clean = data['phone'].replace(' ', '').replace('-', '').replace('(', '').replace(')', '')
        if not re.match(r"^[\+]?[1-9][\d]{0,15}$", phone_clean):
            errors.append('Invalid phone number format')
    
    # Website validation
    if 'website' in data and data['website']:
        import re
        if not re.match(r"^https?://.*", data['website']):
            errors.append('Website must start with http:// or https://')
    
    # Experience years validation
    if 'experience_years' in data and data['experience_years'] is not None:
        try:
            exp_years = int(data['experience_years'])
            if exp_years < 0 or exp_years > 50:
                errors.append('Experience years must be between 0 and 50')
        except (ValueError, TypeError):
            errors.append('Experience years must be a valid number')
    
    # JSON fields validation
    json_fields = ['education', 'certifications', 'social_links']
    for field in json_fields:
        if field in data and data[field]:
            try:
                if isinstance(data[field], str):
                    json.loads(data[field])
            except json.JSONDecodeError:
                errors.append(f'{field.replace("_", " ").title()} must be valid JSON')
    
    return errors

@profile_bp.route('/api/profile', methods=['GET'])
@token_required
def get_profile(user_id):
    """Get user profile"""
    try:
        user = User.query.get(int(user_id))
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify(user.to_dict()), 200
    
    except Exception as e:
        logger.error(f"Error getting profile: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@profile_bp.route('/api/profile', methods=['PUT'])
@token_required
def update_profile(user_id):
    """Update user profile"""
    try:
        user = User.query.get(int(user_id))
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Validate incoming data
        validation_errors = validate_profile_data(data)
        if validation_errors:
            return jsonify({'error': 'Validation failed', 'details': validation_errors}), 400
        
        # Update profile using the model method
        try:
            user.update_profile(data)
            db.session.commit()
            logger.info(f"Profile updated for user {user_id}")
            return jsonify(user.to_dict()), 200
        except ValueError as e:
            db.session.rollback()
            return jsonify({'error': str(e)}), 400
    
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error updating profile: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@profile_bp.route('/api/profile/image', methods=['POST'])
@token_required
def upload_profile_image(user_id):
    """Upload profile image with enhanced processing and validation"""
    try:
        user = User.query.get(int(user_id))
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Check if file is present
        if 'image' not in request.files:
            return jsonify({'error': 'No file part'}), 400
        
        file = request.files['image']
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400
        
        # Validate file extension
        if not allowed_file(file.filename):
            return jsonify({'error': 'Invalid file type. Only PNG, JPG, JPEG, GIF allowed'}), 400
        
        # Validate file content using magic numbers
        is_valid, error_msg = validate_file_content(file)
        if not is_valid:
            return jsonify({'error': error_msg}), 400
        
        # Check file size
        file.seek(0, 2)  # Seek to end
        file_size = file.tell()
        file.seek(0)  # Reset to beginning
        
        max_size = current_app.config['MAX_CONTENT_LENGTH']
        if file_size > max_size:
            return jsonify({'error': f'File too large. Maximum size is {max_size // (1024*1024)}MB'}), 400
        
        # Generate secure filename
        if current_app.config['SECURE_FILENAME']:
            filename = secure_filename(file.filename or 'image')
        else:
            filename = file.filename or 'image'
        
        ext = filename.rsplit('.', 1)[1].lower()
        timestamp = int(time.time())
        new_filename = f"profile_{user_id}_{timestamp}.{ext}"
        
        # Ensure upload directory exists
        upload_folder = current_app.config['UPLOAD_FOLDER']
        os.makedirs(upload_folder, exist_ok=True)
        
        # Save file
        filepath = os.path.join(upload_folder, new_filename)
        file.save(filepath)
        
        # Process image
        success, result = process_image(filepath, new_filename)
        if not success:
            logger.warning(f"Image processing failed for {new_filename}: {result}")
            # Continue with original file if processing fails
        
        # Update user profile
        user.image_url = f"/static/profile_images/{new_filename}"
        db.session.commit()
        
        logger.info(f"Profile image uploaded for user {user_id}: {new_filename}")
        return jsonify({
            'image_url': user.image_url,
            'message': 'Image uploaded successfully',
            'filename': new_filename
        }), 200
    
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error uploading profile image: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@profile_bp.route('/static/profile_images/<filename>')
def serve_profile_image(filename):
    """Serve uploaded profile images with security checks"""
    try:
        # Basic security check - only allow image files
        if not allowed_file(filename):
            return jsonify({'error': 'Invalid file type'}), 400
        
        # Check if file exists
        filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
        if not os.path.exists(filepath):
            return jsonify({'error': 'Image not found'}), 404
        
        return send_from_directory(current_app.config['UPLOAD_FOLDER'], filename)
    
    except Exception as e:
        logger.error(f"Error serving image {filename}: {str(e)}")
        return jsonify({'error': 'Error serving image'}), 500

@profile_bp.route('/api/profile/skills', methods=['GET'])
@token_required
def get_skills(user_id):
    """Get user skills"""
    try:
        user = User.query.get(int(user_id))
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        skills = user.skills.split(',') if user.skills else []
        skills = [skill.strip() for skill in skills if skill.strip()]
        
        return jsonify({'skills': skills}), 200
    
    except Exception as e:
        logger.error(f"Error getting skills: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@profile_bp.route('/api/profile/skills', methods=['PUT'])
@token_required
def update_skills(user_id):
    """Update user skills"""
    try:
        user = User.query.get(int(user_id))
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        if not data or 'skills' not in data:
            return jsonify({'error': 'Skills data required'}), 400
        
        # Validate skills data
        if not isinstance(data['skills'], list):
            return jsonify({'error': 'Skills must be an array'}), 400
        
        # Update skills
        user.skills = ','.join(data['skills'])
        db.session.commit()
        
        logger.info(f"Skills updated for user {user_id}")
        return jsonify({'skills': data['skills']}), 200
    
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error updating skills: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

# Routes will be implemented here 