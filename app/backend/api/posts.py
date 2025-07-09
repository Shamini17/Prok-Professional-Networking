from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
import os
from models.user import db, User
from models.post import Post
from datetime import datetime
from sqlalchemy import desc, asc, func, and_, or_
import re
from utils.jwt_utils import token_required

posts_bp = Blueprint('posts', __name__)

# Use config for allowed extensions and upload folder
ALLOWED_EXTENSIONS = None
POSTS_UPLOAD_FOLDER = None
IMAGE_MAX_SIZE = 5 * 1024 * 1024  # 5MB
VIDEO_MAX_SIZE = 20 * 1024 * 1024  # 20MB

def allowed_file(filename):
    if not filename or '.' not in filename:
        return False
    ext = filename.rsplit('.', 1)[1].lower()
    return ext in (ALLOWED_EXTENSIONS or [])

@posts_bp.route('/api/posts', methods=['GET'])
@token_required
def get_posts(user_id):
    """Get posts with advanced filtering, sorting, and pagination"""
    try:
        # Get query parameters
        page = request.args.get('page', 1, type=int)
        per_page = min(request.args.get('per_page', 10, type=int), 50)  # Max 50 per page
        search = request.args.get('search', '').strip()
        category = request.args.get('category', '').strip()
        visibility = request.args.get('visibility', '').strip()
        tags = request.args.get('tags', '').strip()
        sort_by = request.args.get('sort_by', 'created_at')
        sort_order = request.args.get('sort_order', 'desc')
        
        # Validate sort parameters
        valid_sort_fields = ['created_at', 'likes_count', 'views_count', 'comments_count']
        if sort_by not in valid_sort_fields:
            sort_by = 'created_at'
        
        if sort_order not in ['asc', 'desc']:
            sort_order = 'desc'
        
        # Build query
        query = Post.query.join(User)
        
        # Apply search filter
        if search:
            search_terms = search.split()
            search_conditions = []
            for term in search_terms:
                search_conditions.append(
                    or_(
                        Post.content.ilike(f'%{term}%'),
                        User.username.ilike(f'%{term}%'),
                        User.first_name.ilike(f'%{term}%'),
                        User.last_name.ilike(f'%{term}%')
                    )
                )
            query = query.filter(or_(*search_conditions))
        
        # Apply category filter
        if category:
            query = query.filter(Post.category == category)
        # Apply visibility filter
        if visibility:
            query = query.filter(Post.visibility == visibility)
        
        # Apply tags filter (if implemented)
        if tags:
            tag_list = [tag.strip() for tag in tags.split(',') if tag.strip()]
            # This would need to be implemented based on your tagging system
            pass
        
        # Apply sorting
        if sort_by == 'likes_count':
            # This would need likes_count field in Post model
            query = query.order_by(desc(Post.created_at))
        elif sort_by == 'views_count':
            # This would need views_count field in Post model
            query = query.order_by(desc(Post.created_at))
        elif sort_by == 'comments_count':
            # This would need comments_count field in Post model
            query = query.order_by(desc(Post.created_at))
        else:  # created_at
            if sort_order == 'desc':
                query = query.order_by(desc(Post.created_at))
            else:
                query = query.order_by(asc(Post.created_at))
        
        # Apply pagination
        pagination = query.paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )
        
        # Prepare response
        posts_data = []
        for post in pagination.items:
            post_dict = post.to_dict()
            # Add additional fields if needed
            post_dict['likes_count'] = 0  # Placeholder
            post_dict['views_count'] = 0  # Placeholder
            post_dict['comments_count'] = 0  # Placeholder
            posts_data.append(post_dict)
        
        return jsonify({
            'posts': posts_data,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': pagination.total,
                'pages': pagination.pages,
                'has_next': pagination.has_next,
                'has_prev': pagination.has_prev
            }
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Error getting posts: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@posts_bp.route('/api/posts/categories', methods=['GET'])
@token_required
def get_categories(user_id):
    """Get all available post categories with real post counts"""
    try:
        from models.post import Post
        from models.user import db
        # Query all categories and their counts
        results = db.session.query(Post.category, db.func.count(Post.id)).group_by(Post.category).all()
        categories = []
        for idx, (cat, count) in enumerate(results, 1):
            categories.append({'id': idx, 'name': cat or 'Uncategorized', 'count': count})
        return jsonify({'categories': categories}), 200
    except Exception as e:
        current_app.logger.error(f"Error getting categories: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@posts_bp.route('/api/posts/popular-tags', methods=['GET'])
@token_required
def get_popular_tags(user_id):
    """Get most popular tags"""
    try:
        # This is a placeholder - implement based on your tagging system
        popular_tags = [
            {'name': 'javascript', 'count': 0},
            {'name': 'react', 'count': 0},
            {'name': 'python', 'count': 0},
            {'name': 'design', 'count': 0},
            {'name': 'startup', 'count': 0},
        ]
        
        return jsonify({'tags': popular_tags}), 200
        
    except Exception as e:
        current_app.logger.error(f"Error getting popular tags: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@posts_bp.route('/api/posts/debug', methods=['GET'])
def debug_get_all_posts():
    from models.post import Post
    from models.user import db
    posts = db.session.query(Post).all()
    return jsonify({'posts': [p.to_dict() for p in posts]}), 200

@posts_bp.route('/api/posts', methods=['POST'])
@token_required
def create_post(user_id):
    print('--- POST /api/posts called ---')
    print('Request content type:', request.content_type)
    print('Request form:', request.form)
    print('Request files:', request.files)
    try:
        print('Request JSON:', request.get_json())
    except Exception as e:
        print('Request JSON error:', e)
    user = User.query.filter_by(id=user_id).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404

    # Debug: print request info
    # logging.debug(f"Request content type: {request.content_type}")
    # logging.debug(f"Request form: {request.form}")
    # logging.debug(f"Request files: {request.files}")
    # try:
    #     logging.debug(f"Request JSON: {request.get_json()}")
    # except Exception as e:
    #     logging.debug(f"Request JSON error: {e}")

    # Get config values with fallback
    allowed_extensions = set(current_app.config.get('ALLOWED_EXTENSIONS') or ['png', 'jpg', 'jpeg', 'gif', 'mp4', 'mov', 'avi', 'webm'])
    posts_upload_folder = current_app.config.get('POSTS_UPLOAD_FOLDER') or os.path.join(os.path.dirname(os.path.abspath(__file__)), '../uploads/posts')
    os.makedirs(posts_upload_folder, exist_ok=True)

    # logging.debug(f"Request content type: {request.content_type}")
    # logging.debug(f"Request form: {request.form}")
    # logging.debug(f"Request json: {request.get_json(silent=True)}")
    # logging.debug(f"Request files: {request.files}")

    if request.content_type and request.content_type.startswith('multipart/form-data'):
        content = request.form.get('content')
        visibility = request.form.get('visibility', 'public')
        category = request.form.get('category')
    else:
        data = request.get_json() or {}
        content = data.get('content')
        visibility = data.get('visibility', 'public')
        category = data.get('category')

    # logging.debug(f"Parsed content: {content}")
    # logging.debug(f"Parsed visibility: {visibility}")
    # logging.debug(f"Parsed category: {category}")

    if not content or not content.strip():
        # logging.debug("Content is missing or empty. Returning 400.")
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

    post = Post(user_id, content, media_url, visibility, category)
    db.session.add(post)
    db.session.commit()
    return jsonify({'message': 'Post created', 'post': post.to_dict()}), 201

@posts_bp.route('/api/posts/<int:post_id>/like', methods=['POST'])
@token_required
def like_post(user_id, post_id):
    post = Post.query.get(post_id)
    
    if not post:
        return jsonify({'error': 'Post not found'}), 404
    
    # This is a placeholder - implement like functionality
    return jsonify({'message': 'Post liked', 'likes_count': 0}), 200 

@posts_bp.route('/api/posts/<int:post_id>', methods=['DELETE'])
@token_required
def delete_post(user_id, post_id):
    post = Post.query.get(post_id)
    if not post:
        return jsonify({'error': 'Post not found'}), 404
    if post.user_id != user_id:
        return jsonify({'error': 'Unauthorized'}), 403
    db.session.delete(post)
    db.session.commit()
    return jsonify({'message': 'Post deleted'}), 200 