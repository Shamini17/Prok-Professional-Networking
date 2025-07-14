from flask import Blueprint, request, jsonify, current_app, send_from_directory
from models.user import User, db
from utils.jwt_utils import token_required
import os
import time
import json
from werkzeug.utils import secure_filename
from PIL import Image
import logging
from flask_jwt_extended import jwt_required, get_jwt_identity

profile_bp = Blueprint('profile', __name__)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def allowed_file(filename):
    """Check if file type is allowed"""
    return '.' in filename and \
        filename.rsplit('.', 1)[1].lower() in current_app.config['ALLOWED_EXTENSIONS']

def validate_file_content(file):
    """Validate file content using file extension and basic checks"""
    try:
        # Check file extension
        filename = file.filename.lower()
        allowed_extensions = ['.jpg', '.jpeg', '.png', '.gif']
        
        if not any(filename.endswith(ext) for ext in allowed_extensions):
            return False, "Invalid file extension"
        
        # Basic file size check
        file.seek(0, 2)  # Seek to end
        file_size = file.tell()
        file.seek(0)  # Reset to beginning
        
        if file_size == 0:
            return False, "Empty file"
        
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
    
    # Basic validation rules
    validation_rules = {
        'first_name': {'max_length': 50, 'message': 'First name must be less than 50 characters'},
        'last_name': {'max_length': 50, 'message': 'Last name must be less than 50 characters'},
        'bio': {'max_length': 1000, 'message': 'Bio must be less than 1000 characters'},
        'location': {'max_length': 120, 'message': 'Location must be less than 120 characters'},
        'company': {'max_length': 100, 'message': 'Company name must be less than 100 characters'},
        'job_title': {'max_length': 100, 'message': 'Job title must be less than 100 characters'},
        'industry': {'max_length': 100, 'message': 'Industry must be less than 100 characters'},
        'website': {'max_length': 255, 'message': 'Website URL too long'}
    }
    
    # Check field lengths
    for field, rule in validation_rules.items():
        if field in data and data[field]:
            if len(str(data[field])) > rule['max_length']:
                errors.append(rule['message'])
    
    # Phone validation
    if 'phone' in data and data['phone']:
        import re
        clean_phone = re.sub(r'[^\d+]', '', data['phone'])
        if not re.match(r"^[\+]?[1-9][\d]{0,15}$", clean_phone):
            errors.append('Invalid phone number format')
    
    # Website validation
    if 'website' in data and data['website']:
        import re
        if not re.match(r"^https?://.*", data['website']):
            errors.append('Website must start with http:// or https://')
    
    # Experience years validation
    if 'experience_years' in data and data['experience_years'] is not None:
        try:
            if isinstance(data['experience_years'], str):
                exp_years = int(data['experience_years'])
            elif isinstance(data['experience_years'], int):
                exp_years = data['experience_years']
            else:
                errors.append('Experience years must be a valid number')
                exp_years = None
            if exp_years is not None and (exp_years < 0 or exp_years > 50):
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
    
    # Boolean fields validation
    boolean_fields = ['is_public', 'show_email', 'show_phone']
    for field in boolean_fields:
        if field in data and data[field] is not None:
            if not isinstance(data[field], bool):
                errors.append(f'{field.replace("_", " ").title()} must be a boolean value')
    
    return errors

@profile_bp.route('/api/profile', methods=['GET'])
@token_required
def get_profile(user_id):
    """Get user profile - returns full profile for owner, public profile for others"""
    try:
        user = User.query.get(int(user_id))
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Check if profile is public
        if not user.is_public:
            return jsonify({'error': 'Profile is private'}), 403
        
        # Return full profile for owner, public profile for others
        profile_data = user.to_dict()
        
        # Add computed fields
        profile_data['full_name'] = user.get_full_name()
        profile_data['profile_completion'] = user.get_profile_completion_percentage()
        profile_data['is_complete'] = user.is_profile_complete()
        profile_data['banner_url'] = user.banner_url # Add banner_url to the response
        
        return jsonify(profile_data), 200
    
    except Exception as e:
        logger.error(f"Error getting profile: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@profile_bp.route('/api/profile', methods=['PUT'])
@token_required
def update_profile(user_id):
    """Update user profile with comprehensive validation"""
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
            
            # Return updated profile with computed fields
            profile_data = user.to_dict()
            profile_data['full_name'] = user.get_full_name()
            profile_data['profile_completion'] = user.get_profile_completion_percentage()
            profile_data['is_complete'] = user.is_profile_complete()
            
            return jsonify(profile_data), 200
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
        
        # Debug logging
        logger.info(f"Image upload request for user {user_id}")
        logger.info(f"Request files: {list(request.files.keys())}")
        logger.info(f"Request content type: {request.content_type}")
        
        # Check if file is present
        if 'image' not in request.files:
            logger.error(f"No 'image' field in request files: {list(request.files.keys())}")
            return jsonify({'error': 'No file part'}), 400
        
        file = request.files['image']
        logger.info(f"File received: {file.filename}, size: {file.content_length if hasattr(file, 'content_length') else 'unknown'}")
        
        if file.filename == '':
            logger.error("Empty filename received")
            return jsonify({'error': 'No selected file'}), 400
        
        # Validate file extension
        logger.info(f"Validating file extension: {file.filename}")
        if not allowed_file(file.filename):
            logger.error(f"Invalid file extension: {file.filename}")
            return jsonify({'error': 'Invalid file type. Only PNG, JPG, JPEG, GIF allowed'}), 400
        
        # Validate file content using magic numbers
        logger.info("Validating file content")
        is_valid, error_msg = validate_file_content(file)
        if not is_valid:
            logger.error(f"File content validation failed: {error_msg}")
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
        
        # Update user profile with image URLs
        user.image_url = f"/static/profile_images/{new_filename}"
        if success:
            user.thumbnail_url = f"/static/profile_images/thumb_{new_filename}"
        
        db.session.commit()
        
        logger.info(f"Profile image uploaded for user {user_id}: {new_filename}")
        return jsonify({
            'image_url': user.image_url,
            'thumbnail_url': user.thumbnail_url,
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
        
        response = send_from_directory(current_app.config['UPLOAD_FOLDER'], filename)
        
        # Add CORS headers for image serving
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Access-Control-Allow-Methods'] = 'GET, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
        
        return response
    
    except Exception as e:
        logger.error(f"Error serving image {filename}: {str(e)}")
        return jsonify({'error': 'Error serving image'}), 500

@profile_bp.route('/api/profile/skills', methods=['GET'])
@token_required
def get_skills(user_id):
    """Get user skills as a list"""
    try:
        user = User.query.get(int(user_id))
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        skills_list = user.get_skills_list()
        
        return jsonify({'skills': skills_list}), 200
    
    except Exception as e:
        logger.error(f"Error getting skills: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@profile_bp.route('/api/profile/skills', methods=['PUT'])
@token_required
def update_skills(user_id):
    """Update user skills with validation"""
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
        
        # Validate individual skills
        skills_list = []
        for skill in data['skills']:
            if isinstance(skill, str) and skill.strip():
                if len(skill.strip()) > 50:
                    return jsonify({'error': 'Skill name too long (max 50 characters)'}), 400
                skills_list.append(skill.strip())
        
        # Limit number of skills
        if len(skills_list) > 20:
            return jsonify({'error': 'Maximum 20 skills allowed'}), 400
        # Enforce minimum number of skills
        if len(skills_list) < 3:
            return jsonify({'error': 'At least 3 skills are required'}), 400
        # Update skills
        user.set_skills_list(skills_list)
        db.session.commit()
        
        logger.info(f"Skills updated for user {user_id}")
        return jsonify({'skills': skills_list}), 200
    
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error updating skills: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@profile_bp.route('/api/profile/education', methods=['GET'])
@token_required
def get_education(user_id):
    """Get user education as a list"""
    try:
        user = User.query.get(int(user_id))
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        education_list = user.get_education_list()
        
        return jsonify({'education': education_list}), 200
    
    except Exception as e:
        logger.error(f"Error getting education: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@profile_bp.route('/api/profile/education', methods=['PUT'])
@token_required
def update_education(user_id):
    """Update user education with validation"""
    try:
        user = User.query.get(int(user_id))
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        if not data or 'education' not in data:
            return jsonify({'error': 'Education data required'}), 400
        
        # Validate education data
        if not isinstance(data['education'], list):
            return jsonify({'error': 'Education must be an array'}), 400
        
        # Validate individual education entries
        for edu in data['education']:
            if not isinstance(edu, dict):
                return jsonify({'error': 'Each education entry must be an object'}), 400
            
            required_fields = ['degree', 'school', 'year']
            for field in required_fields:
                if field not in edu:
                    return jsonify({'error': f'Education entry missing required field: {field}'}), 400
        
        # Update education
        user.set_education_list(data['education'])
        db.session.commit()
        
        logger.info(f"Education updated for user {user_id}")
        return jsonify({'education': data['education']}), 200
    
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error updating education: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@profile_bp.route('/api/profile/certifications', methods=['GET'])
@token_required
def get_certifications(user_id):
    """Get user certifications as a list"""
    try:
        user = User.query.get(int(user_id))
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        certifications_list = user.get_certifications_list()
        
        return jsonify({'certifications': certifications_list}), 200
    
    except Exception as e:
        logger.error(f"Error getting certifications: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@profile_bp.route('/api/profile/certifications', methods=['PUT'])
@token_required
def update_certifications(user_id):
    """Update user certifications with validation"""
    try:
        user = User.query.get(int(user_id))
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        if not data or 'certifications' not in data:
            return jsonify({'error': 'Certifications data required'}), 400
        
        # Validate certifications data
        if not isinstance(data['certifications'], list):
            return jsonify({'error': 'Certifications must be an array'}), 400
        
        # Validate individual certification entries
        for cert in data['certifications']:
            if not isinstance(cert, dict):
                return jsonify({'error': 'Each certification entry must be an object'}), 400
            
            required_fields = ['name', 'issuer', 'year']
            for field in required_fields:
                if field not in cert:
                    return jsonify({'error': f'Certification entry missing required field: {field}'}), 400
        
        # Update certifications
        user.set_certifications_list(data['certifications'])
        db.session.commit()
        
        logger.info(f"Certifications updated for user {user_id}")
        return jsonify({'certifications': data['certifications']}), 200
    
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error updating certifications: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@profile_bp.route('/api/profile/social-links', methods=['GET'])
@token_required
def get_social_links(user_id):
    """Get user social links as a dictionary"""
    try:
        user = User.query.get(int(user_id))
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        social_links_dict = user.get_social_links_dict()
        
        return jsonify({'social_links': social_links_dict}), 200
    
    except Exception as e:
        logger.error(f"Error getting social links: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@profile_bp.route('/api/profile/social-links', methods=['PUT'])
@token_required
def update_social_links(user_id):
    """Update user social links with validation"""
    try:
        user = User.query.get(int(user_id))
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        if not data or 'social_links' not in data:
            return jsonify({'error': 'Social links data required'}), 400
        
        # Validate social links data
        if not isinstance(data['social_links'], dict):
            return jsonify({'error': 'Social links must be an object'}), 400
        
        # Validate URLs in social links
        import re
        for platform, url in data['social_links'].items():
            if not isinstance(url, str):
                return jsonify({'error': f'Invalid URL for {platform}'}), 400
            
            if not re.match(r"^https?://.*", url):
                return jsonify({'error': f'Invalid URL format for {platform}'}), 400
        
        # Update social links
        user.set_social_links_dict(data['social_links'])
        db.session.commit()
        
        logger.info(f"Social links updated for user {user_id}")
        return jsonify({'social_links': data['social_links']}), 200
    
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error updating social links: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@profile_bp.route('/api/profile/completion', methods=['GET'])
@token_required
def get_profile_completion(user_id):
    """Get profile completion percentage and status"""
    try:
        user = User.query.get(int(user_id))
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        completion_data = {
            'percentage': user.get_profile_completion_percentage(),
            'is_complete': user.is_profile_complete(),
            'full_name': user.get_full_name(),
            'missing_fields': []
        }
        
        # Check which fields are missing
        required_fields = ['first_name', 'last_name', 'bio', 'company', 'job_title']
        for field in required_fields:
            if not getattr(user, field):
                completion_data['missing_fields'].append(field.replace('_', ' ').title())
        
        return jsonify(completion_data), 200
    
    except Exception as e:
        logger.error(f"Error getting profile completion: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500 

@profile_bp.route('/api/profile/banner', methods=['POST'])
@token_required
def upload_banner(user_id):
    """Upload banner image with validation and processing"""
    try:
        user = User.query.get(int(user_id))
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Check if file is present
        if 'banner' not in request.files:
            return jsonify({'error': 'No file part'}), 400
        
        file = request.files['banner']
        if not file or not file.filename:
            return jsonify({'error': 'No selected file'}), 400
        
        # Validate file extension
        if not allowed_file(file.filename):
            return jsonify({'error': 'Invalid file type. Only PNG, JPG, JPEG, GIF allowed'}), 400
        
        # Validate file content
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
        ext = file.filename.rsplit('.', 1)[1].lower()
        timestamp = int(time.time())
        new_filename = f"banner_{user_id}_{timestamp}.{ext}"
        
        # Ensure banner upload directory exists
        banner_folder = os.path.join(current_app.root_path, 'uploads', 'banner_images')
        os.makedirs(banner_folder, exist_ok=True)
        
        # Save file
        filepath = os.path.join(banner_folder, new_filename)
        file.save(filepath)
        
        # Process image (optional - for banner images we might want to keep original size)
        try:
            with Image.open(filepath) as img:
                # Convert to RGB if necessary
                if img.mode in ('RGBA', 'LA', 'P'):
                    img = img.convert('RGB')
                
                # For banner images, we might want to resize to a reasonable width
                # but maintain aspect ratio
                max_width = 1200  # Reasonable banner width
                if img.size[0] > max_width:
                    ratio = max_width / img.size[0]
                    new_height = int(img.size[1] * ratio)
                    img = img.resize((max_width, new_height), Image.Resampling.LANCZOS)
                
                # Save with compression
                img.save(filepath, 'JPEG', quality=85, optimize=True)
        except Exception as e:
            logger.warning(f"Banner image processing failed for {new_filename}: {str(e)}")
            # Continue with original file if processing fails
        
        # Update user profile with banner URL
        user.banner_url = f"/static/banner_images/{new_filename}"
        db.session.commit()
        
        logger.info(f"Banner image uploaded for user {user_id}: {new_filename}")
        return jsonify({'banner_url': user.banner_url}), 200
    
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error uploading banner image: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500 