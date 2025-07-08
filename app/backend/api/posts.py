from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
import os
from models.user import db, User
from models.post import Post
from datetime import datetime

posts_bp = Blueprint('posts', __name__)

# Use config for allowed extensions and upload folder
ALLOWED_EXTENSIONS = None
POSTS_UPLOAD_FOLDER = None
IMAGE_MAX_SIZE = 5 * 1024 * 1024  # 5MB
VIDEO_MAX_SIZE = 20 * 1024 * 1024  # 20MB

def allowed_file(filename):
    ext = filename.rsplit('.', 1)[1].lower() if '.' in filename else ''
    return ext in ALLOWED_EXTENSIONS

@posts_bp.route('/api/posts', methods=['POST'])
@jwt_required()
def create_post():
    user_id = get_jwt_identity()
    user = User.query.filter_by(id=user_id).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404

    # Get config values with fallback
    allowed_extensions = set(current_app.config.get('ALLOWED_EXTENSIONS') or ['png', 'jpg', 'jpeg', 'gif', 'mp4', 'mov', 'avi', 'webm'])
    posts_upload_folder = current_app.config.get('POSTS_UPLOAD_FOLDER') or os.path.join(os.path.dirname(os.path.abspath(__file__)), '../uploads/posts')
    os.makedirs(posts_upload_folder, exist_ok=True)

    if request.content_type and request.content_type.startswith('multipart/form-data'):
        content = request.form.get('content')
    else:
        data = request.get_json() or {}
        content = data.get('content')

    if not content or not content.strip():
        return jsonify({'error': 'Content is required'}), 400

    media_url = None
    if 'media' in request.files:
        file = request.files['media']
        if file and file.filename and '.' in file.filename:
            ext = file.filename.rsplit('.', 1)[1].lower()
            if ext in allowed_extensions:
                file.seek(0, os.SEEK_END)
                file_length = file.tell()
                file.seek(0)
                if ext in {'mp4', 'mov', 'avi', 'webm'}:
                    if file_length > VIDEO_MAX_SIZE:
                        return jsonify({'error': 'Video file too large (max 20MB)'}), 400
                else:
                    if file_length > IMAGE_MAX_SIZE:
                        return jsonify({'error': 'Image file too large (max 5MB)'}), 400
                filename = secure_filename(f"post_{user_id}_{int(datetime.utcnow().timestamp())}_{file.filename}")
                file_path = os.path.join(posts_upload_folder, filename)
                file.save(file_path)
                media_url = f"/static/posts/{filename}"
            else:
                return jsonify({'error': 'Invalid file type'}), 400
        else:
            return jsonify({'error': 'Invalid file type'}), 400

    post = Post(user_id, content, media_url)
    db.session.add(post)
    db.session.commit()
    return jsonify({'message': 'Post created', 'post': post.to_dict()}), 201 