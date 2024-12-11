import mongoose from 'mongoose';
import { env } from './env.js';
import { SystemLog } from '../models/SystemLog.js';

export const connectDB = async () => {
  try {
    await mongoose.connect(env.MONGODB_URI);
    console.log('MongoDB Connected');

    mongoose.connection.on('connected', () => {
      console.log('Mongoose connected to MongoDB');
    });

    mongoose.connection.on('error', (error) => {
      console.error('MongoDB error:', error);
      SystemLog.create({
        level: 'error',
        source: 'database',
        message: 'MongoDB connection error',
        details: { error: error.message }
      }).catch(console.error);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
      SystemLog.create({
        level: 'warning',
        source: 'database',
        message: 'MongoDB disconnected'
      }).catch(console.error);
    });

    mongoose.set('debug', true);

  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};
