require('dotenv').config();
const express      = require('express');
const cors         = require('cors');
const connectDB    = require('./config/db');
const errorHandler = require('./middlewares/errorHandler');

connectDB();

const app = express();
app.set('json spaces', 2);

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth',     require('./routes/authRoutes'));
app.use('/api/users',    require('./routes/userRoutes'));
app.use('/api/airlines', require('./routes/airlineRoutes'));
app.use('/api/airports', require('./routes/airportRoutes'));
app.use('/api/flights',  require('./routes/flightRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));

app.get('/', (req, res) => res.send('API Tiket Pesawat is running...'));
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));