# API Scraping Server

A Node.js Express server for scraping data from various APIs with a clean, scalable architecture.

## ⚠️ Important Legal Notice

**This tool is for educational and research purposes only.** Any attempt to bypass API restrictions may violate Terms of Service and could result in:

- Account suspension or termination
- Legal consequences
- Violation of computer fraud and abuse laws

Use this tool responsibly and at your own risk.

## Architecture

The server follows a clean architecture pattern:

```
server.js (middlewares, express configuration, and endpoint routing)
├── /api
    ├── /routes (route definitions - redirect to controllers)
    ├── /controllers (request handling - redirect to services)
    └── /services (business logic)
```

## Project Structure

```
├── server.js                    # Main Express server
├── api/
│   ├── routes/
│   │   └── fatgrid.js          # FatGrid route definitions
│   ├── controllers/
│   │   └── fatgrid.js          # FatGrid request handling
│   ├── services/
│   │   └── fatgrid.js          # FatGrid business logic
│   ├── models/
│   │   └── FatgridDomains.js   # FatGrid domain model
│   └── repositories/
│       └── fatgrid_domains.js  # FatGrid database operations
├── config/
│   └── database.js             # Database configuration
├── config.example.js           # Configuration template
├── package.json                # Dependencies
└── start.sh                   # Startup script
```

## Available Endpoints

### FatGrid API

#### `GET /fatgrid/get_data`
Get FatGrid domains and unlocked domains data with pagination support.

**Query Parameters:**
- `limit`: Number of domains per page (default: 100)
- `page_from`: Starting page number (default: 1)
- `page_to`: Ending page number (default: 1)
- `sort`: Sort order (default: '-totalTraffic')
- `type`: Domain type (default: 'guest_post')

**Authentication:**
- Authorization header: `Bearer YOUR_TOKEN`
- Query parameter: `?sessionToken=YOUR_TOKEN`
- Request body: `{"sessionToken": "YOUR_TOKEN"}`
- Environment variable: `FATGRID_SESSION_TOKEN`

**Example:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     "http://localhost:3000/fatgrid/get_data?limit=50&page_from=1&page_to=3&sort=-dr"
```

#### `GET /fatgrid/test_connection`
Test connection to FatGrid API.

**Example:**
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     "http://localhost:3000/fatgrid/test_connection"
```

### General Endpoints

#### `GET /health`
Health check endpoint.

#### `GET /`
API documentation and available endpoints.

## Installation

```bash
# Install dependencies
npm install

# Create .env file for environment variables
touch .env

# Copy configuration file (optional)
cp config.example.js config.js
```

### Environment Variables Setup

Create a `.env` file in the root directory with the following variables:

```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=fatgrid_db
DB_USER=root
DB_PASSWORD=your_database_password
DB_DIALECT=mysql

# FatGrid API Configuration
FATGRID_BASE_URL=https://api.fatgrid.com
FATGRID_SESSION_TOKEN=your_fatgrid_session_token_here

# Server Configuration
PORT=3000
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=*
```

## Usage

### Start the Server
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start

# Or use the startup script
./start.sh
```

The server will start on `http://localhost:3000` by default.

### Environment Variables

```bash
# FatGrid Configuration
FATGRID_BASE_URL=https://api.fatgrid.com
FATGRID_SESSION_TOKEN=your_session_token_here

# Server Configuration
PORT=3000
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=*
```

## How to Get Your FatGrid Session Token

1. Log into FatGrid in your browser
2. Open Developer Tools (F12)
3. Go to the Network tab
4. Make any API request (like viewing the domains list)
5. Look for the `Authorization` header in the request
6. Copy the token (the part after "Bearer ")

## API Response Format

### Success Response
```json
{
  "success": true,
  "message": "Data retrieved successfully",
  "data": {
    "success": true,
    "timestamp": "2024-01-01T00:00:00.000Z",
    "summary": {
      "totalDomains": 100,
      "unlockedDomains": 5,
      "maskedDomains": 95,
      "unlockRate": "5.00"
    },
    "domains": [...],
    "unlocks": [...],
    "unlockMap": {...}
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Session token is required",
  "message": "Please provide FatGrid session token",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Adding New Companies

To add support for a new company (e.g., "dadsy"):

1. Create service file: `api/services/dadsy.js`
2. Create controller file: `api/controllers/dadsy.js`
3. Create routes file: `api/routes/dadsy.js`
4. Create model file: `api/models/DadsyDomains.js` (if needed)
5. Create repository file: `api/repositories/dadsy_domains.js` (if needed)
6. Add route to `server.js`: `app.use('/dadsy', dadsyRoutes);`

## Development

### Project Structure Guidelines

- **Routes**: Only define endpoints and redirect to controllers
- **Controllers**: Handle HTTP requests/responses and redirect to services
- **Services**: Contain all business logic and API interactions
- **Server.js**: Configure middleware and route mounting

### Error Handling

All errors are handled consistently across the application:
- Service errors are caught and returned with success: false
- Controller errors return appropriate HTTP status codes
- Server errors are logged and return generic error messages

## Contributing

1. Follow the established architecture pattern
2. Add proper error handling
3. Include JSDoc comments for all public methods
4. Test your endpoints thoroughly
5. Update documentation as needed

## License

MIT License - Use responsibly and at your own risk.