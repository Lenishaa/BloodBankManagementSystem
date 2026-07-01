# Blood Bank Management System

A comprehensive, production-ready blood bank management application built with React.js, Node.js, and MySQL.

## Features

- **Authentication & Authorization**
  - Manager login with employee ID and password
  - New blood bank registration
  - JWT-based session management

- **Dashboard**
  - Real-time statistics
  - Blood type distribution
  - Expiry alerts (7 days)
  - Recent activities

- **Blood Stock Management**
  - Add, edit, delete blood stocks
  - Track blood type, quantity, collection/expiry dates
  - Mark stocks as expired or utilized
  - Filter by blood type, status, and expiry

- **Donor Management**
  - Register and manage donors
  - Track donor information and history
  - Search donors by name, contact, or email
  - Filter by blood type

- **Reports**
  - Expired stocks report with date filtering
  - Utilized stocks report with purpose filtering
  - Comprehensive data views

## Tech Stack

### Backend
- Node.js with Express.js
- MySQL database
- JWT authentication
- bcrypt for password hashing
- CORS enabled

### Frontend
- React 18
- React Router v6
- Axios for API calls
- Vite for build tooling
- Pure CSS (no external UI libraries)

## Prerequisites

- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- npm or yarn

## Installation

### 1. Clone the Repository

```bash
cd BloodBankManagementSystem
```

### 2. Database Setup

```bash
# Login to MySQL
mysql -u root -p

# Create and setup database
mysql -u root -p < database/schema.sql
```

Or manually:

```bash
mysql -u root -p
```

Then in MySQL:
```sql
CREATE DATABASE bloodbank;
USE bloodbank;
source database/schema.sql;
```

### 3. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment variables
# Edit .env file with your database credentials
# Update DB_PASSWORD, JWT_SECRET, and other settings

# Start the backend server
npm run dev
```

The backend will run on `http://localhost:5000`

### 4. Frontend Setup

Open a new terminal:

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will run on `http://localhost:3000`

## Configuration

### Backend (.env)

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=bloodbank
DB_PORT=3306

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here_change_in_production
JWT_EXPIRE=7d

# Server Configuration
PORT=5000
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

**Important:** Change the `JWT_SECRET` to a secure random string in production!

## Usage

### First Time Setup

1. Open the application at `http://localhost:3000`
2. Click "Register here" to create a new blood bank account
3. Fill in blood bank details and manager information
4. After registration, you'll be automatically logged in

### Managing Blood Stocks

1. Navigate to "Blood Stocks" from the sidebar
2. Click "+ Add Blood Stock" to add new inventory
3. Use filters to view specific stocks
4. Mark stocks as "Expired" or "Utilized" when appropriate

### Managing Donors

1. Navigate to "Donors" from the sidebar
2. Click "+ Add Donor" to register new donors
3. Use search and filters to find specific donors
4. Edit or delete donor information as needed

### Viewing Reports

1. Navigate to "Reports" from the sidebar
2. Switch between "Expired Stocks" and "Utilized Stocks" tabs
3. Apply date filters to view specific periods
4. Export or analyze the data

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new blood bank
- `POST /api/auth/login` - Manager login
- `GET /api/auth/profile` - Get manager profile

### Blood Stocks
- `GET /api/blood-stocks` - Get all stocks (with filters)
- `GET /api/blood-stocks/summary` - Get stock summary
- `GET /api/blood-stocks/:id` - Get stock by ID
- `POST /api/blood-stocks` - Add new stock
- `PUT /api/blood-stocks/:id` - Update stock
- `DELETE /api/blood-stocks/:id` - Delete stock
- `PATCH /api/blood-stocks/:id/expire` - Mark as expired
- `PATCH /api/blood-stocks/:id/utilize` - Mark as utilized

### Donors
- `GET /api/donors` - Get all donors (with filters)
- `GET /api/donors/stats` - Get donor statistics
- `GET /api/donors/:id` - Get donor by ID
- `POST /api/donors` - Add new donor
- `PUT /api/donors/:id` - Update donor
- `DELETE /api/donors/:id` - Delete donor

### Reports
- `GET /api/reports/expired` - Get expired stocks report
- `GET /api/reports/utilized` - Get utilized stocks report
- `GET /api/reports/dashboard` - Get dashboard statistics
- `GET /api/reports/monthly` - Get monthly report

## Project Structure

```
blood-bank-management/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── bloodStockController.js
│   │   ├── donorController.js
│   │   └── reportController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── bloodStocks.js
│   │   ├── donors.js
│   │   └── reports.js
│   ├── .env
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.jsx
│   │   │   └── Loading.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── BloodStocks.jsx
│   │   │   ├── Donors.jsx
│   │   │   └── Reports.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── database/
    └── schema.sql
```
