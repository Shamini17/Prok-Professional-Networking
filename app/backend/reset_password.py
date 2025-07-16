from werkzeug.security import generate_password_hash
from models.user import db, User
from main import create_app

# --- CONFIGURE THESE ---
EMAIL = "ramesh5@gmail.com"  # Email of the user to reset
NEW_PASSWORD = "YourNewPassword1!"  # New password (must meet requirements)
# ----------------------

app = create_app()

with app.app_context():
    user = User.query.filter_by(email=EMAIL).first()
    if user:
        user.password = generate_password_hash(NEW_PASSWORD)
        db.session.commit()
        print(f"Password for {EMAIL} updated successfully.")
    else:
        print(f"User with email {EMAIL} not found.") 