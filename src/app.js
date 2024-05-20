import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import router from './routes/userRoutes.js';

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(express.static('public'));
app.use(cookieParser());

// ROUTES DECLARATION
app.use('/users', router);

// URL Example:
// http://localhost:8000/users/register

export { app };
