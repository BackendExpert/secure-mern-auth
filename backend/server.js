require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const cors = require('cors');
const rateLimiter = require('./src/middlewares/rateLimiter');
const connectDB = require('./src/config/db');

const authRoutes = require('./src/routes/authRoutes');

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

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
