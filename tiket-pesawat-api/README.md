# Tiket Pesawat API

REST API sistem pemesanan tiket pesawat berbasis Node.js, Express, dan MongoDB.

## Ketua Kelompok
Ruth Jelia Dolok Saribu - 24111452

## Anggota Kelompok
1. Suci Aisya - 241110512
2. Rizky Berema Putra Ginting - 241112610
3. Siti Azizah Yahya - 241111657

## Tech Stack
- Node.js + Express 5
- MongoDB + Mongoose
- JWT Authentication
- express-validator

## Resource
1. Users
2. Airlines
3. Airports
4. Flights
5. Bookings

## Cara Menjalankan
1. Clone repo
2. `npm install`
3. Buat file `.env` isi:
PORT=5000
MONGODB_URI=mongodb://localhost:27017/tiket_pesawat
JWT_SECRET=jeljel2525
4. `npm run dev`

## Base URL
http://localhost:5000/api

## Endpoints
### Auth
- POST /auth/register
- POST /auth/login
- GET  /auth/profile

### Airlines
- GET    /airlines
- GET    /airlines/:id
- POST   /airlines
- PUT    /airlines/:id
- DELETE /airlines/:id

### Airports
- GET    /airports
- GET    /airports/:id
- POST   /airports
- PUT    /airports/:id
- DELETE /airports/:id

### Flights
- GET    /flights
- GET    /flights/:id
- POST   /flights
- PUT    /flights/:id
- DELETE /flights/:id

### Bookings
- GET    /bookings
- GET    /bookings/:id
- POST   /bookings
- PUT    /bookings/:id
- DELETE /bookings/:id