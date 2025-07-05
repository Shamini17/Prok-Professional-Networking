#!/usr/bin/env python3
"""
Simple JWT test script
"""

import jwt
from datetime import datetime, timedelta

# Test JWT creation and validation
secret = 'your-super-secret-jwt-key-change-this-in-production'

# Create a token
payload = {
    'sub': 1,  # user id
    'iat': datetime.utcnow(),
    'exp': datetime.utcnow() + timedelta(hours=1)
}

token = jwt.encode(payload, secret, algorithm='HS256')
print(f"Created token: {token}")

# Decode the token
try:
    decoded = jwt.decode(token, secret, algorithms=['HS256'])
    print(f"Decoded payload: {decoded}")
    print("✅ JWT test successful!")
except Exception as e:
    print(f"❌ JWT test failed: {e}") 