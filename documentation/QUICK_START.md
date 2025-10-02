# 🚀 Quick Start Guide

## 1. Install Dependencies
```bash
npm install
```

## 2. Configure Environment Variables
```bash
# Create .env file
touch .env

# Edit .env file and add your configuration:
# DB_HOST=localhost
# DB_PORT=3306
# DB_NAME=fatgrid_db
# DB_USER=root
# DB_PASSWORD=your_database_password
# FATGRID_SESSION_TOKEN=your_token_here
```

## 3. Start Server
```bash
# Option 1: Use the startup script
./start.sh

# Option 2: Manual start
npm start

# Option 3: Development mode (auto-reload)
npm run dev
```

## 4. Test the API
The server will start on: **http://localhost:3000**

### Test Health Check
```bash
curl http://localhost:3000/health
```

### Test FatGrid Endpoint
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:3000/fatgrid/get_data
```

## 5. Get Your FatGrid Session Token
1. Log into FatGrid in your browser
2. Open Developer Tools (F12)
3. Go to Network tab
4. Make any API request
5. Look for `Authorization: Bearer YOUR_TOKEN` in request headers
6. Copy the token part (after "Bearer ")

## 🎯 Available Endpoints

### FatGrid
- `GET /fatgrid/get_data` - Get domains and unlocked domains
- `GET /fatgrid/test_connection` - Test API connection

### General
- `GET /health` - Health check
- `GET /` - API documentation

## 📁 Project Structure
```
├── server.js                    # Main Express server
├── api/
│   ├── routes/
│   │   └── fatgrid.js          # Route definitions
│   ├── controllers/
│   │   └── fatgrid.js          # Request handling
│   ├── services/
│   │   └── fatgrid.js          # Business logic
│   ├── models/
│   │   └── FatgridDomains.js   # Domain model
│   └── repositories/
│       └── fatgrid_domains.js  # Database operations
├── config/
│   └── database.js             # Database configuration
├── config.example.js           # Configuration template
└── start.sh                   # Startup script
```

## 🔧 Environment Variables
```bash
FATGRID_BASE_URL=https://api.fatgrid.com
FATGRID_SESSION_TOKEN=your_token_here
PORT=3000
NODE_ENV=development
CORS_ORIGIN=*
```

## 📊 Example API Usage

### Get Domains with Custom Parameters
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     "http://localhost:3000/fatgrid/get_data?limit=50&sort=-dr&page=1"
```

### Test Connection
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:3000/fatgrid/test_connection
```

### Using Query Parameter for Token
```bash
curl "http://localhost:3000/fatgrid/get_data?sessionToken=YOUR_TOKEN"
```

## ⚠️ Important Notes
- This tool is for educational purposes only
- Respect API Terms of Service
- Use responsibly and at your own risk
- Don't overwhelm APIs with requests

## 🆘 Troubleshooting

### "Session token is required"
- Check your session token
- Make sure you're logged into FatGrid
- Verify the token is correct (no extra spaces)
- Try different authentication methods (header, query param, env var)

### "Connection failed"
- Verify your session token is valid
- Check if you're logged into FatGrid
- Ensure the API is accessible

### "Module not found"
- Run `npm install` to install dependencies
- Make sure you're in the project directory

### "Port already in use"
- Change the port: `PORT=3001 npm start`
- Kill any existing Node.js processes

### Server won't start
- Check Node.js version: `node --version` (should be 16+)
- Check npm version: `npm --version`
- Try deleting `node_modules` and running `npm install` again

## 🔄 Adding New Companies

To add support for a new company (e.g., "dadsy"):

1. Create `api/services/dadsy.js`
2. Create `api/controllers/dadsy.js`
3. Create `api/routes/dadsy.js`
4. Create `api/models/DadsyDomains.js` (if needed)
5. Create `api/repositories/dadsy_domains.js` (if needed)
6. Add to `server.js`: `app.use('/dadsy', dadsyRoutes);`

The endpoint will be available at: `http://localhost:3000/dadsy/get_data`