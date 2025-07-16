# 🚀 Quick Deployment Guide

This is a quick reference for deploying the Prok Professional Networking application.

## 📋 Prerequisites

- Git repository access
- Cloud platform account (Render, Heroku, Vercel, etc.)
- PostgreSQL database (for production)

## 🔧 Backend Deployment

### Environment Variables (Required)

```bash
FLASK_CONFIG=production
SECRET_KEY=your-super-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-key-here
DATABASE_URL=postgresql://username:password@host:port/database_name
ALLOWED_ORIGINS=https://your-frontend-domain.com
```

### Quick Deploy Commands

```bash
# Install dependencies
pip install -r requirements.txt

# Start application
gunicorn --bind 0.0.0.0:$PORT main:app
```

### Platform-Specific

**Render:**
- Build: `pip install -r requirements.txt`
- Start: `gunicorn --bind 0.0.0.0:$PORT main:app`

**Heroku:**
- Uses `Procfile` automatically
- Add PostgreSQL addon

## 🎨 Frontend Deployment

### Environment Variables

```bash
VITE_API_URL=https://your-backend-url.com
```

### Quick Deploy Commands

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Deploy dist/ folder
```

### Platform-Specific

**Vercel:**
- Connect GitHub repo
- Set environment variables
- Auto-deploys

**Netlify:**
- Drag `dist/` folder or connect Git
- Set environment variables

## 🔐 Security Checklist

- [ ] Strong secret keys generated
- [ ] HTTPS enabled
- [ ] CORS properly configured
- [ ] Environment variables set
- [ ] Database secured
- [ ] File upload limits set

## 🐛 Common Issues

1. **CORS Errors**: Check `ALLOWED_ORIGINS`
2. **Database Connection**: Verify `DATABASE_URL` format
3. **Environment Variables**: Ensure all required vars are set

## 📞 Support

For detailed deployment instructions, see `DEPLOYMENT_GUIDE.md`

---

**Quick Start:**
1. Set environment variables
2. Deploy backend
3. Deploy frontend
4. Test application 