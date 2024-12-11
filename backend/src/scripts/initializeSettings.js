import mongoose from 'mongoose';
import { Settings } from '../models/Settings.js';

// Replace with your MongoDB connection string
const MONGODB_URI = 'mongodb+srv://henokasegdew110:HGftBnUG808vPacZ@cluster0.eqeyl.mongodb.net/indoor-garden?retryWrites=true&w=majority&appName=Cluster0';

async function initializeDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, {
    });
    console.log('Connected to MongoDB');

    // Create a new settings document
    const defaultSettings = new Settings({
      // You can specify any custom values here, or leave it empty to use defaults
    });

    // Save the document to the database
    await defaultSettings.save();
    console.log('Default settings saved:', defaultSettings);

    // Close the connection
    await mongoose.connection.close();
    console.log('Connection closed');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

// Call the function to initialize the database
initializeDatabase();