require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const cors = require('cors');
const rateLimiter = require('./middlewares/rateLimiter.middleware');
const connectDB = require('./config/db');

const authRoutes = require('./routes/auth.route')

const app = express();
connectDB();

app.use(helmet());
app.use(express.json());
app.use(cookieParser());
app.use(rateLimiter);

app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}));

app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
