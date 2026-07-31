  import mongoose from 'mongoose';
  import dotenv from 'dotenv';

  dotenv.config();

  const MONGODB_URL = process.env.MONGODB_URL;

  const MAX_RECONNECT_ATTEMPTS = 15;
  const RECONNECT_BASE_DELAY_MS = 2000;
  const RECONNECT_MAX_DELAY_MS = 30000;
  const ENSURE_RETRY_COOLDOWN_MS = 5000;

  let reconnectTimer = null;
  let reconnectAttempts = 0;
  let isConnecting = false;
  let lastEnsureFailureAt = 0;
  let dbEventHandlersBound = false;

  // const connectionOptions = {
  //   serverSelectionTimeoutMS: 10000,
  //   socketTimeoutMS: 45000,
  //   // Keep pool conservative for Atlas M0/M2 tiers.
  //   maxPoolSize: 3,
  //   minPoolSize: 0,
  //   // maxIdleTimeMS: 10000,
  //   waitQueueTimeoutMS: 5000,
  //   // heartbeatFrequencyMS: 10000,
  //   family: 4,
  // };

  const connectionOptions = {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
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
    if (dbEventHandlersBound) {
      return;
    }
    dbEventHandlersBound = true;

    mongoose.connection.on('connected', () => {
      console.log('✅ MongoDB connected');
      reconnectAttempts = 0;
    });
    mongoose.connection.on("disconnecting", () => {
      console.log("🚨 disconnecting event fired");
  });
    mongoose.connection.on("disconnected", () => {
      console.log("❌ MongoDB disconnected");
      console.log("readyState:", mongoose.connection.readyState);
      // scheduleReconnect();
    });
    mongoose.connection.on('close', () => {
      console.log('⚠️ MongoDB connection closed');
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB error');
      console.error(err); // Print the complete error object
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB reconnected');
      reconnectAttempts = 0;
    });
  };

  const connectToDb = async ({ isRetry = false } = {}) => {
    console.trace("connectToDb called");
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

    const now = Date.now();
    const inCooldown = now - lastEnsureFailureAt < ENSURE_RETRY_COOLDOWN_MS;
    if (inCooldown) {
      return false;
    }

    if (mongoose.connection.readyState === 2 || isConnecting) {
      try {
        await Promise.race([
          waitForExistingConnection(),
          new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Database connection timeout')), timeoutMs);
          }),
        ]);
        return isDbConnected();
      } catch (err) {
        lastEnsureFailureAt = Date.now();
        console.warn('ensureDbConnection failed:', err.message);
        return false;
      }
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
      lastEnsureFailureAt = Date.now();
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
