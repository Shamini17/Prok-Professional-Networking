#!/usr/bin/env python3
"""
Database setup script to fix column sizes and create tables
"""

import mysql.connector
from config import Config
import re

def setup_database():
    """Setup database with correct column sizes"""
    
    # Parse database connection from config
    db_uri = Config.SQLALCHEMY_DATABASE_URI
    match = re.match(r'mysql://([^:]+):([^@]+)@([^/]+)/(.+)', db_uri)
    
    if not match:
        print("❌ Invalid database URI format")
        return False
    
    user, password, host, database = match.groups()
    
    try:
        # Connect to MySQL server (without specifying database)
        connection = mysql.connector.connect(
            host=host,
            user=user,
            password=password
        )
        
        cursor = connection.cursor()
        
        # Create database if it doesn't exist
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {database}")
        print(f"✅ Database '{database}' created/verified")
        
        # Use the database
        cursor.execute(f"USE {database}")
        
        # Drop existing user table if it exists
        cursor.execute("DROP TABLE IF EXISTS user")
        print("✅ Dropped existing user table")
        
        # Create user table with correct column sizes
        create_user_table = """
        CREATE TABLE user (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(80) UNIQUE NOT NULL,
            email VARCHAR(120) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL
        )
        """
        
        cursor.execute(create_user_table)
        print("✅ Created user table with correct column sizes")
        
        connection.commit()
        cursor.close()
        connection.close()
        
        print("✅ Database setup completed successfully!")
        return True
        
    except mysql.connector.Error as err:
        print(f"❌ Database error: {err}")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Setting up database...")
    setup_database() 