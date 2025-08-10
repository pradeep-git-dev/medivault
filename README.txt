MediVault Fullstack (demo)

Backend: backend/
Frontend (static): frontend/

Quick start (backend):
1. cd backend
2. npm install
3. copy .env.example to .env and set MONGO_URI, JWT_SECRET, FRONTEND_URL
4. npm start
5. open http://localhost:5000

Notes:
- POST /api/auth/register  registers user and returns a dataURL QR code
- POST /api/auth/login     returns JWT token and user id
- GET  /api/auth/me        returns current logged-in user (protected)
- GET  /api/user/:id       public profile (used by QR)
