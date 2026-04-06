# Finance Backend

Simple backend for a finance dashboard with JWT authentication, role-based access control, financial record management, and dashboard analytics.

## Tech Stack
- Node.js
- Express
- MongoDB Atlas + Mongoose
- JWT (`jsonwebtoken`)
- Password hashing (`bcryptjs`)

## Project Structure
- `server.js` - app setup, DB connection, route mounting, error handling
- `models/` - Mongoose schemas (`User`, `FinancialRecord`)
- `routes/` - API route definitions
- `controllers/` - request/response handlers
- `services/` - business logic and data operations
- `middlewares/` - auth and role checks

## Setup
## 1) Install dependencies
```bash
npm install
```

## 2) Configure environment
Create `.env` with:
```env
PORT=3000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_strong_secret
JWT_EXPIRES_IN=2h
```

## 3) Run server
```bash
npm start
```
Dev mode:
```bash
npm run dev
```

Server base URL:
- `http://localhost:3000`

Health check:
- `GET /health`

## Authentication
Login endpoint:
- `POST /auth/login`

Body:
```json
{
  "email": "admin@finance.local",
  "password": "Admin@123"
}
```

Response returns:
- `accessToken`
- `tokenType` (`Bearer`)
- `user`

Use token in protected routes:
```http
Authorization: Bearer <accessToken>
```

## Roles and Access
- `viewer`
  - Can view dashboard data
- `analyst`
  - Can view records
  - Can view dashboard data
- `admin`
  - Full access to users and records
  - Can view dashboard data

## API Reference
Detailed endpoint documentation is in [API.md](API.md).

## Validation and Error Handling
- Returns meaningful status codes:
  - `400` bad input
  - `401` unauthorized / invalid token
  - `403` forbidden (role or inactive user)
  - `404` not found
  - `409` conflict (duplicate email)
  - `500` server error
- Service layer validates business rules (date ranges, types, required fields, etc.)

## Assumptions
- System users are managed by admin or pre-existing DB data.
- Public self-registration is not exposed.
- Atlas connection string points to the target database.

## Tradeoffs
- Simple architecture prioritizes readability over advanced abstractions.
- Validation is mostly service-level for easier student-level understanding.
- No pagination/search/rate-limiting in final scope to keep solution focused.
