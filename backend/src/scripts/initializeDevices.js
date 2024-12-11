import mongoose from 'mongoose';
import { Device } from '../models/Device.js'; // Adjust the path as necessary

// Replace with your MongoDB connection string
const MONGODB_URI = 'mongodb+srv://henokasegdew110:HGftBnUG808vPacZ@cluster0.eqeyl.mongodb.net/indoor-garden?retryWrites=true&w=majority&appName=Cluster0';

async function initializeDevices() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, {});
    console.log('Connected to MongoDB');

    // Define default devices
    const devices = [
      { name: 'fan', status: false, autoMode: true, powerRating: 35 },
      { name: 'irrigation', status: false, autoMode: true, powerRating: 45, waterRate: 2 },
      { name: 'lighting', status: true, autoMode: true, powerRating: 50 },
      { name: 'fertilizer', status: false, autoMode: true, powerRating: 25 }
    ];

    // Insert devices into the database
    await Device.insertMany(devices);
    console.log('Default devices initialized successfully');

    // Close the connection
    await mongoose.connection.close();
    console.log('Connection closed');
  } catch (error) {
    console.error('Error initializing devices:', error);
  }
}

// Call the function to initialize the devices
initializeDevices();