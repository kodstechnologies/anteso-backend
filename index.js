import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors';
import connectToDb from './src/db/index.js';
import mainRouter from './src/routes/index.js'
import cookieParser from 'cookie-parser';
import { asyncHandler } from './src/utils/AsyncHandler.js';
import errorHandler from './src/middlewares/errorHandler.js';
dotenv.config();

const port = process.env.PORT
const app = express()
app.set('trust proxy', true);

app.use(cors({
    origin: ["https://admin.antesobiomedicalopc.com", 'http://localhost:3000',
        'http://localhost:8000',
        'http://localhost:5173','http://localhost:5174','http://localhost:5175'],
    credentials: true,
}));
// app.use(express.json());
// app.use(express.urlencoded({ extended: true })); // for form data
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use(cookieParser());
app.get('/', (req, res) => {
    res.send("test route")
})

//test push
app.use((req, res, next) => {
    console.log("👉 Incoming request:", req.method, req.originalUrl);
    next();
});

app.use('/anteso', mainRouter)
app.use(errorHandler);
const startServer = async () => {
    try {
        await connectToDb()
        app.listen(port, () => {
            console.log(`server running on ${port}`);
        })
    } catch (error) {
        console.log("MONGO db connection failed !!! ", error);
    }
}
startServer();
//dummy test
