from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from .user import User, db

class Post(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    media_url = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    visibility = db.Column(db.String(20), default='public', nullable=False)
    category = db.Column(db.String(100), nullable=True)

    user = db.relationship('User', backref=db.backref('posts', lazy=True))

    def __init__(self, user_id, content, media_url=None, visibility='public', category=None):
        self.user_id = user_id
        self.content = content
        self.media_url = media_url
        self.visibility = visibility
        self.category = category

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'content': self.content,
            'media_url': self.media_url,
            'created_at': self.created_at.isoformat(),
            'visibility': self.visibility,
            'category': self.category,
            'user': {
                'id': self.user.id,
                'username': self.user.username,
                'first_name': self.user.first_name,
                'last_name': self.user.last_name,
                'image_url': self.user.image_url
            } if self.user else None
        } 