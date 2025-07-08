from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from .user import User, db

class Post(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    media_url = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User', backref=db.backref('posts', lazy=True))

    def __init__(self, user_id, content, media_url=None):
        self.user_id = user_id
        self.content = content
        self.media_url = media_url

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'content': self.content,
            'media_url': self.media_url,
            'created_at': self.created_at.isoformat(),
            'user': {
                'id': self.user.id,
                'username': self.user.username
            } if self.user else None
        } 