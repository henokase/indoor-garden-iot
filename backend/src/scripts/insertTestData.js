import mongoose from 'mongoose'
import { ResourceUsage } from '../models/ResourceUsage.js'

const MONGODB_URI = 'mongodb+srv://henokasegdew110:HGftBnUG808vPacZ@cluster0.eqeyl.mongodb.net/indoor-garden?retryWrites=true&w=majority&appName=Cluster0';

async function insertTestData() {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('Connected to MongoDB')

    // Clear existing data
    await ResourceUsage.deleteMany({})

    // Create test data for the last 7 days
    const testData = []
    for (let i = 0; i < 7; i++) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)

      const energyBreakdown = {
        hvac: 25 + Math.random() * 10,
        lighting: 15 + Math.random() * 5,
        equipment: 20 + Math.random() * 8
      }

      const waterBreakdown = {
        kitchen: 100 + Math.random() * 20,
        bathroom: 150 + Math.random() * 30,
        irrigation: 80 + Math.random() * 15
      }

      const energyTotal = Object.values(energyBreakdown).reduce((a, b) => a + b, 0)
      const waterTotal = Object.values(waterBreakdown).reduce((a, b) => a + b, 0)

      testData.push({
        date,
        energy: {
          total: Number(energyTotal.toFixed(1)),
          breakdown: energyBreakdown
        },
        water: {
          total: Number(waterTotal.toFixed(1)),
          breakdown: waterBreakdown
        }
      })
    }

    await ResourceUsage.insertMany(testData)
    console.log('Test data inserted successfully')
  } catch (error) {
    console.error('Error inserting test data:', error)
  } finally {
    await mongoose.disconnect()
    console.log('Disconnected from MongoDB')
  }
}

insertTestData()
