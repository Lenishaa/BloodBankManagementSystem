# Quick Setup Guide

Follow these steps to get your Blood Bank Management System up and running.

## Prerequisites Check

```bash
# Check Node.js version (should be v14+)
node --version

# Check npm version
npm --version

# Check MySQL is running
mysql --version
```

## Step 1: Database Setup

### Option A: Using MySQL Command Line

```bash
# Login to MySQL as root
mysql -u root -p

# Execute the schema file
mysql -u root -p < database/schema.sql
```

### Option B: Using MySQL Workbench

1. Open MySQL Workbench
2. Create a new database named `blood_bank_management`
3. Go to Server → Data Import
4. Select "Import from Self-Contained File"
5. Choose `database/schema.sql`
6. Click "Start Import"

## Step 2: Backend Configuration

```bash
cd backend

# Install dependencies
npm install

# Edit .env file with your settings
# IMPORTANT: Change these values:
# - DB_PASSWORD: Your MySQL root password
# - JWT_SECRET: Generate a secure random string
```

### Generate JWT Secret

```bash
# On Linux/Mac
openssl rand -base64 64

# On Windows (PowerShell)
[Convert]::ToBase64String((1..64 | ForEach-Object { Get-Random -Maximum 256 }))
```

### Update .env File

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_actual_mysql_password
DB_NAME=blood_bank_management
DB_PORT=3306

JWT_SECRET=your_generated_secret_key_here
JWT_EXPIRE=7d

PORT=5000
NODE_ENV=development

CORS_ORIGIN=http://localhost:3000
```

## Step 3: Start Backend Server

```bash
# In the backend directory
npm run dev

# You should see:
# Server is running on port 5000
# Environment: development
```

Keep this terminal running!

## Step 4: Start Frontend Application

Open a new terminal:

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# You should see:
# VITE v5.x.x  ready in xxx ms
# ➜  Local:   http://localhost:3000/
# ➜  Network: use --host to expose
```

## Step 5: Access the Application

1. Open your browser
2. Go to `http://localhost:3000`
3. Click "Register here" to create your first blood bank account
4. Fill in the registration form
5. Start managing your blood bank!

## Troubleshooting

### Backend Issues

**Error: Cannot connect to MySQL**
- Ensure MySQL service is running
- Check credentials in .env file
- Verify database exists: `SHOW DATABASES;`

**Error: Port 5000 already in use**
```bash
# Change PORT in .env to 5001 or another port
# Also update CORS_ORIGIN in .env accordingly
```

### Frontend Issues

**Error: Cannot connect to backend**
- Verify backend is running on port 5000
- Check browser console for CORS errors
- Ensure vite.config.js proxy is configured

**Error: Module not found**
```bash
# Delete node_modules and reinstall
rm -rf node_modules
npm install
```

### Database Issues

**Error: Table doesn't exist**
- Re-run the schema.sql file
- Check you're using the correct database: `USE blood_bank_management;`

## Testing the Application

### Test Registration

1. Go to `http://localhost:3000/register`
2. Fill in blood bank details:
   - Blood Bank ID: "BB001" (unique identifier for your blood bank)
   - Blood Bank Name: "Test Blood Bank"
   - Location: "New York"
   - Contact: "+1-555-0100"
3. Fill in manager details:
   - Manager Name: "John Doe"
   - Password: "password123"
4. Click "Register Blood Bank"

### Test Login

1. Go to `http://localhost:3000/login`
2. Enter Blood Bank ID: "BB001"
3. Enter Password: "password123"
4. Click "Sign In"

### Test Features

After login, test:
- Dashboard: View statistics
- Blood Stocks: Add a new blood stock
- Donors: Add a new donor
- Reports: View expired/utilized stocks

## Production Deployment

### Backend

```bash
# Set environment to production
export NODE_ENV=production

# Install PM2 globally
npm install -g pm2

# Start with PM2
pm2 start server.js --name "blood-bank-api"

# Save PM2 configuration
pm2 save
pm2 startup
```

### Frontend

```bash
# Build for production
npm run build

# The dist folder contains the production build
# Deploy this folder to your web server
```

### Environment Variables for Production

```env
NODE_ENV=production
DB_HOST=your_production_db_host
DB_USER=your_production_db_user
DB_PASSWORD=your_secure_production_password
JWT_SECRET=your_very_secure_jwt_secret
CORS_ORIGIN=https://yourdomain.com
```

## Security Checklist

- [ ] Changed JWT_SECRET to a secure random string
- [ ] Changed default database password
- [ ] Enabled HTTPS in production
- [ ] Configured proper CORS origins
- [ ] Set NODE_ENV=production
- [ ] Enabled MySQL slow query log
- [ ] Set up database backups
- [ ] Configured firewall rules
- [ ] Limited API rate limiting (consider adding)
- [ ] Regular security updates

## Next Steps

1. Customize the UI colors and branding
2. Add more blood types if needed
3. Configure email notifications
4. Add data export functionality
5. Implement audit logging
6. Add user roles and permissions
7. Set up monitoring and logging
8. Configure automated backups

## Support

If you encounter any issues:
1. Check the console logs for error messages
2. Verify all prerequisites are installed
3. Ensure all configuration files are properly set
4. Review the README.md for detailed documentation

## Project Structure

```
blood-bank-management/
├── backend/          # Node.js API server
├── frontend/         # React application
├── database/         # MySQL schema
├── README.md         # Full documentation
├── SETUP.md          # This file
└── .gitignore        # Git ignore rules
```

## Quick Commands Reference

```bash
# Backend
cd backend
npm install          # Install dependencies
npm run dev          # Start development server
npm start            # Start production server

# Frontend
cd frontend
npm install          # Install dependencies
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build

# Database
mysql -u root -p < database/schema.sql  # Setup database
```

---

**Your Blood Bank Management System is now ready to use!** 🩸