import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors';
import connectToDb, { connectToDbWithRetry, getDbStatus, setupDbEventHandlers } from './src/db/index.js';
import mainRouter from './src/routes/index.js'
import cookieParser from 'cookie-parser';
import errorHandler from './src/middlewares/errorHandler.js';
import dbHealthMiddleware from './src/middlewares/dbHealthMiddleware.js';
dotenv.config();

const port = process.env.PORT
const app = express()
app.set('trust proxy', true);

app.use(cors({
    origin: ["https://admin.antesobiomedicalopc.com", 'http://localhost:3000',
        'http://localhost:8000',
        'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://192.168.88.19:8000'],
    credentials: true,
}));
// app.use(express.json());
// app.use(express.urlencoded({ extended: true })); // for form data
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use(cookieParser());
app.get('/', (req, res) => {
    res.send("tesst route")
})

app.get('/health', (req, res) => {
    const dbStatus = getDbStatus();
    res.status(dbStatus.connected ? 200 : 503).json({
        success: dbStatus.connected,
        message: dbStatus.connected ? 'API is healthy' : 'API is up but database is unavailable',
        db: dbStatus,
    });
});

//test push
app.use((req, res, next) => {
    console.log("👉 Incoming request:", req.method, req.originalUrl);
    next();
});

app.use(dbHealthMiddleware);
app.use('/anteso', mainRouter)
console.log("calling this after the update-------------------------------------------")
app.use(errorHandler);
const startServer = async () => {
    try {
        setupDbEventHandlers();

        try {
            await connectToDbWithRetry(3, 2000);
        } catch (error) {
            console.error('MongoDB initial connection failed after retries:', error.message);
            console.warn('Server will start in degraded mode until database reconnects.');
        }

        app.listen(port, () => {
            console.log(`server running on ${port}`);
            console.log(`health check: http://localhost:${port}/health`);
        });
    } catch (error) {
        console.log("Server failed to start:", error);
    }
}

// const startServer = async () => {
//     try {
//         await connectToDb();
//         app.listen(port, "0.0.0.0", () => {
//             console.log(`server running on ${port}`);
//         });
//     } catch (error) {
//         console.log("MONGO db connection failed !!! ", error);
//     }
// }
startServer();
//dummy test
