import mongoose from 'mongoose';
import { env } from './env.js';
// import { SystemLog } from '../models/SystemLog.js';

const connectDB = async () => {
  const options = {
    serverSelectionTimeoutMS: 5000,
    autoIndex: true,
    maxPoolSize: 10,
    socketTimeoutMS: 45000,
  };

  try {
    const connection = await mongoose.connect(env.MONGODB_URI, options);
    console.log(`MongoDB Connected: ${connection.connection.host}`);

    mongoose.connection.on('error', err => {
      console.error('MongoDB connection error:', err);
      reconnect();
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected. Attempting to reconnect...');
      reconnect();
    });

    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);

  } catch (error) {
    console.error('MongoDB connection error:', error);
    reconnect();
  }
};

const reconnect = (() => {
  let retryCount = 0;
  const maxRetries = 5;
  const baseDelay = 1000;

  return () => {
    if (retryCount < maxRetries) {
      const delay = baseDelay * Math.pow(2, retryCount);
      retryCount++;

      console.log(`Retrying connection in ${delay/1000} seconds... (Attempt ${retryCount} of ${maxRetries})`);
      
      setTimeout(async () => {
        try {
          await mongoose.connect(env.MONGODB_URI);
          console.log('MongoDB reconnected successfully');
          retryCount = 0;
        } catch (error) {
          console.error('Reconnection attempt failed:', error);
          reconnect();
        }
      }, delay);
    } else {
      console.error(`Failed to reconnect after ${maxRetries} attempts. Please check your database connection and restart the server.`);
      cleanup();
    }
  };
})();

const cleanup = async () => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed through app termination');
    process.exit(0);
  } catch (err) {
    console.error('Error during cleanup:', err);
    process.exit(1);
  }
};

export default connectDB;
