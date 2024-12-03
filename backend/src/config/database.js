import mongoose from 'mongoose';
import { env } from './env.js';
import { SystemLog } from '../models/SystemLog.js';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.MONGODB_URI); // No options needed

    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Log successful connection
    await SystemLog.create({
      level: 'info',
      source: 'system',
      message: 'Database connection established',
    });

    // Handle connection errors after initial connect
    mongoose.connection.on('error', async (error) => {
      console.error('MongoDB connection error:', error);
      await SystemLog.create({
        level: 'error',
        source: 'system',
        message: 'Database connection error',
        details: { error: error.message },
      });
    });

    // Handle disconnection
    mongoose.connection.on('disconnected', async () => {
      console.log('MongoDB disconnected');
      await SystemLog.create({
        level: 'warning',
        source: 'system',
        message: 'Database disconnected',
      });
    });
  } catch (error) {
    console.error('Database connection failed:', error);

    // Log connection failure
    await SystemLog.create({
      level: 'critical',
      source: 'system',
      message: 'Database connection failed',
      details: { error: error.message },
    });

    process.exit(1);
  }
};
