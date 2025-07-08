# How to Run the Prok Professional Networking Application

## 🚀 Quick Start

### Method 1: Using the Flask Runner Script (Recommended)
```bash
cd app/backend
./run_flask.sh
```

### Method 2: Manual Flask Run
```bash
cd app/backend
source venv/bin/activate
export FLASK_APP=main.py
flask run
```

### Method 3: Direct Python Execution
```bash
cd app/backend
source venv/bin/activate
python main.py
```

## 🌐 Application URLs

- **Backend API**: http://localhost:5000
- **Frontend**: http://localhost:5173
- **API Documentation**: See `PROFILE_BACKEND_README.md`

## 📋 Prerequisites

1. **Python 3.8+** installed
2. **Node.js 16+** installed
3. **Virtual environment** activated

## 🔧 Setup Instructions

### Backend Setup
```bash
# Navigate to backend directory
cd app/backend

# Activate virtual environment
source venv/bin/activate

# Install dependencies (if not already installed)
pip install -r requirements.txt

# Create upload directory
mkdir -p uploads/profile_images

# Run the application
./run_flask.sh
```

### Frontend Setup
```bash
# Navigate to frontend directory
cd app/frontend

# Install dependencies (if not already installed)
npm install

# Start development server
npm run dev
```

## 🧪 Testing the Application

### Test Backend API
```bash
# Run comprehensive test suite
python3 test_profile_backend.py

# Test individual endpoints
curl http://localhost:5000/
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@example.com","password":"testpass"}'
```

### Test Frontend
1. Open http://localhost:5173 in your browser
2. Navigate to profile pages
3. Test image upload functionality

## 🔍 Troubleshooting

### Common Issues

#### 1. Port Already in Use
```bash
# Kill processes using port 5000
lsof -ti:5000 | xargs kill -9

# Or use a different port
flask run --port=5001
```

#### 2. Virtual Environment Not Found
```bash
# Create virtual environment
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

#### 3. Flask App Not Found
```bash
# Set Flask app environment variable
export FLASK_APP=main.py
flask run
```

#### 4. Permission Denied on Script
```bash
# Make script executable
chmod +x run_flask.sh
```

### Environment Variables

Create a `.env` file in the backend directory:
```bash
# Backend environment variables
SECRET_KEY=your-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-key-here
DATABASE_URL=sqlite:///prok_app.db
```

## 📁 Project Structure

```
Prok-Professional-Networking/
├── app/
│   ├── backend/
│   │   ├── api/              # API endpoints
│   │   ├── models/           # Database models
│   │   ├── uploads/          # File uploads
│   │   ├── main.py           # Flask application
│   │   ├── run_flask.sh      # Runner script
│   │   └── requirements.txt  # Python dependencies
│   └── frontend/
│       ├── src/              # React source code
│       ├── package.json      # Node.js dependencies
│       └── vite.config.ts    # Vite configuration
├── test_profile_backend.py   # Test suite
└── README.md                 # Project documentation
```

## 🎯 Available Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login

### Profile Management
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update profile
- `POST /api/profile/image` - Upload profile image
- `GET /api/profile/skills` - Get skills
- `PUT /api/profile/skills` - Update skills

### File Serving
- `GET /static/profile_images/<filename>` - Serve uploaded images

## 🔒 Security Features

- JWT authentication for all endpoints
- File upload validation and processing
- Rate limiting to prevent abuse
- Input validation and sanitization
- Secure file serving

## 📊 Monitoring

### Backend Logs
The Flask application provides detailed logging:
- Request logs
- Error logs
- Image processing logs
- Database operation logs

### Health Check
```bash
curl http://localhost:5000/
# Should return: {"error": "Resource not found"}
# This indicates the server is running
```

## 🚀 Production Deployment

For production deployment:

1. **Use a production WSGI server** (Gunicorn, uWSGI)
2. **Set up a reverse proxy** (Nginx, Apache)
3. **Use a production database** (PostgreSQL, MySQL)
4. **Configure environment variables**
5. **Set up SSL/TLS certificates**
6. **Configure proper logging**

### Production Example
```bash
# Install Gunicorn
pip install gunicorn

# Run with Gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 main:app
```

## 📞 Support

If you encounter any issues:

1. Check the troubleshooting section above
2. Review the logs in the terminal
3. Ensure all dependencies are installed
4. Verify the virtual environment is activated
5. Check that ports are not in use

---

**Happy coding! 🎉** 