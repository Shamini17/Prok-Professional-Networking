# Prok Professional Networking - Deployment Guide

This guide will help you deploy the Prok Professional Networking application to production.

## Prerequisites

- Git repository access
- Cloud platform account (Render, Heroku, AWS, etc.)
- Database service (PostgreSQL recommended for production)
- Domain name (optional)

## Backend Deployment

### 1. Environment Variables

Set the following environment variables in your cloud platform:

```bash
# Flask Configuration
FLASK_CONFIG=production
FLASK_DEBUG=False

# Security (Generate strong, unique keys)
SECRET_KEY=your-super-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-key-here

# Database Configuration
DATABASE_URL=postgresql://username:password@host:port/database_name

# CORS Configuration (comma-separated)
ALLOWED_ORIGINS=https://your-frontend-domain.com,https://www.your-frontend-domain.com

# File Upload Configuration
MAX_CONTENT_LENGTH=5242880
```

### 2. Database Setup

For production, use PostgreSQL:

1. Create a PostgreSQL database
2. Set the `DATABASE_URL` environment variable
3. The application will automatically create tables on first run

### 3. File Upload Storage

For production, consider using cloud storage (AWS S3, Google Cloud Storage) instead of local file storage.

### 4. Deployment Commands

```bash
# Install dependencies
pip install -r requirements.txt

# Run migrations (if using Flask-Migrate)
flask db upgrade

# Start the application
gunicorn --bind 0.0.0.0:$PORT main:app
```

## Frontend Deployment

### 1. Environment Variables

Create a `.env.production` file:

```bash
VITE_API_URL=https://your-backend-url.com
```

### 2. Build and Deploy

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Deploy the dist/ folder to your hosting service
```

### 3. Popular Frontend Hosting Options

- **Vercel**: Connect your GitHub repo and deploy automatically
- **Netlify**: Drag and drop the `dist/` folder or connect to Git
- **GitHub Pages**: Deploy from the `dist/` folder
- **Firebase Hosting**: Use Firebase CLI to deploy

## Platform-Specific Deployment

### Render

#### Backend (Web Service)

1. Connect your GitHub repository
2. Set build command: `pip install -r requirements.txt`
3. Set start command: `gunicorn --bind 0.0.0.0:$PORT main:app`
4. Add environment variables
5. Deploy

#### Frontend (Static Site)

1. Connect your GitHub repository
2. Set build command: `npm install && npm run build`
3. Set publish directory: `dist`
4. Add environment variables
5. Deploy

### Heroku

#### Backend

1. Create a new Heroku app
2. Add PostgreSQL addon
3. Set environment variables
4. Deploy using Git:

```bash
heroku git:remote -a your-app-name
git push heroku main
```

#### Frontend

1. Create a new Heroku app
2. Set buildpacks for Node.js
3. Add environment variables
4. Deploy

### AWS

#### Backend (Elastic Beanstalk)

1. Create an Elastic Beanstalk environment
2. Upload your backend code
3. Configure environment variables
4. Set up RDS for PostgreSQL

#### Frontend (S3 + CloudFront)

1. Create an S3 bucket for static hosting
2. Upload the `dist/` folder contents
3. Configure CloudFront for CDN
4. Set up custom domain (optional)

## Security Considerations

### 1. Environment Variables

- Never commit `.env` files to version control
- Use strong, unique secret keys
- Rotate keys regularly

### 2. CORS Configuration

- Only allow necessary origins
- Use HTTPS in production
- Configure proper headers

### 3. Database Security

- Use strong passwords
- Enable SSL connections
- Regular backups
- Access control

### 4. File Upload Security

- Validate file types
- Limit file sizes
- Scan for malware
- Use cloud storage for production

## Monitoring and Logging

### 1. Application Logs

- Monitor application logs for errors
- Set up log aggregation (ELK stack, etc.)
- Configure alerts for critical errors

### 2. Performance Monitoring

- Monitor response times
- Track database performance
- Set up uptime monitoring

### 3. Error Tracking

- Use services like Sentry for error tracking
- Monitor user-reported issues
- Set up automated error reporting

## SSL/HTTPS Configuration

### 1. Backend

- Most cloud platforms provide SSL automatically
- Configure custom domains with SSL certificates
- Use Let's Encrypt for free certificates

### 2. Frontend

- Enable HTTPS on your hosting platform
- Configure HSTS headers
- Use secure cookies

## Database Migration

### 1. Development to Production

```bash
# Export development data (if needed)
flask db dump

# Import to production
flask db load
```

### 2. Schema Changes

```bash
# Generate migration
flask db migrate -m "Description of changes"

# Apply migration
flask db upgrade
```

## Troubleshooting

### Common Issues

1. **CORS Errors**: Check `ALLOWED_ORIGINS` configuration
2. **Database Connection**: Verify `DATABASE_URL` format
3. **File Uploads**: Check file permissions and storage configuration
4. **Environment Variables**: Ensure all required variables are set

### Debug Mode

For debugging production issues:

```bash
# Enable debug mode temporarily
FLASK_DEBUG=True
FLASK_CONFIG=development
```

## Performance Optimization

### 1. Database

- Add indexes for frequently queried fields
- Optimize queries
- Use connection pooling

### 2. Caching

- Implement Redis for session storage
- Cache frequently accessed data
- Use CDN for static assets

### 3. Image Optimization

- Compress images
- Use appropriate formats (WebP, AVIF)
- Implement lazy loading

## Backup Strategy

### 1. Database Backups

- Automated daily backups
- Test restore procedures
- Store backups securely

### 2. File Backups

- Backup uploaded files
- Version control for code
- Document configuration

## Support and Maintenance

### 1. Regular Updates

- Keep dependencies updated
- Monitor security advisories
- Test updates in staging

### 2. Documentation

- Maintain deployment documentation
- Document configuration changes
- Keep runbooks updated

---

For additional support, refer to the platform-specific documentation or contact the development team. 