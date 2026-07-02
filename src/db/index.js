import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URL = process.env.MONGODB_URL;
const MAX_RECONNECT_ATTEMPTS = 15;
const RECONNECT_BASE_DELAY_MS = 2000;
const RECONNECT_MAX_DELAY_MS = 30000;

let reconnectTimer = null;
let reconnectAttempts = 0;
let isConnecting = false;

const connectionOptions = {
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  maxPoolSize: 10,
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const isDbConnected = () => mongoose.connection.readyState === 1;

export const getDbStatus = () => {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];

  return {
    connected: isDbConnected(),
    state: states[mongoose.connection.readyState] || 'unknown',
    host: mongoose.connection.host || null,
    name: mongoose.connection.name || null,
    reconnectAttempts,
  };
};

const waitForExistingConnection = () =>
  new Promise((resolve, reject) => {
    if (mongoose.connection.readyState === 1) {
      resolve();
      return;
    }

    const onConnected = () => {
      cleanup();
      resolve();
    };

    const onError = (err) => {
      cleanup();
      reject(err);
    };

    const cleanup = () => {
      mongoose.connection.off('connected', onConnected);
      mongoose.connection.off('error', onError);
    };

    mongoose.connection.once('connected', onConnected);
    mongoose.connection.once('error', onError);
  });

const scheduleReconnect = () => {
  if (reconnectTimer || isConnecting) return;

  if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
    console.error('MongoDB: max reconnect attempts reached. Will retry on next API request.');
    reconnectAttempts = 0;
    return;
  }

  const delay = Math.min(
    RECONNECT_BASE_DELAY_MS * 2 ** reconnectAttempts,
    RECONNECT_MAX_DELAY_MS,
  );

  reconnectAttempts += 1;
  console.warn(`MongoDB: reconnect attempt ${reconnectAttempts} in ${delay}ms`);

  reconnectTimer = setTimeout(async () => {
    reconnectTimer = null;

    try {
      await connectToDb({ isRetry: true });
      reconnectAttempts = 0;
    } catch (err) {
      console.error('MongoDB reconnect failed:', err.message);
      scheduleReconnect();
    }
  }, delay);
};

export const setupDbEventHandlers = () => {
  mongoose.connection.on('connected', () => {
    console.log('MongoDB connected');
    reconnectAttempts = 0;
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected — scheduling reconnect');
    scheduleReconnect();
  });

  mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err.message);
  });

  mongoose.connection.on('reconnected', () => {
    console.log('MongoDB reconnected');
    reconnectAttempts = 0;
  });
};

const connectToDb = async ({ isRetry = false } = {}) => {
  if (!MONGODB_URL) {
    throw new Error('MONGODB_URL is not set in environment variables');
  }

  if (mongoose.connection.readyState === 1) {
    return;
  }

  if (mongoose.connection.readyState === 2) {
    await waitForExistingConnection();
    return;
  }

  if (isConnecting) {
    await waitForExistingConnection();
    return;
  }

  isConnecting = true;

  try {
    await mongoose.connect(MONGODB_URL, connectionOptions);
    console.log(isRetry ? 'MongoDB reconnected successfully' : 'MongoDB connected');
    reconnectAttempts = 0;
  } finally {
    isConnecting = false;
  }
};

export const ensureDbConnection = async (timeoutMs = 8000) => {
  if (isDbConnected()) {
    return true;
  }

  try {
    await Promise.race([
      connectToDb({ isRetry: true }),
      new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Database connection timeout')), timeoutMs);
      }),
    ]);

    return isDbConnected();
  } catch (err) {
    console.warn('ensureDbConnection failed:', err.message);
    scheduleReconnect();
    return false;
  }
};

export const connectToDbWithRetry = async (attempts = 3, delayMs = 2000) => {
  let lastError;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      await connectToDb();
      return;
    } catch (err) {
      lastError = err;
      console.error(`MongoDB connect attempt ${attempt}/${attempts} failed:`, err.message);

      if (attempt < attempts) {
        await sleep(delayMs);
      }
    }
  }

  throw lastError;
};

export default connectToDb;
