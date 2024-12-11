import mqtt from 'mqtt';
import dotenv from 'dotenv';

dotenv.config();

// MQTT Configuration
const MQTT_CONFIG = {
  host: 'd55d1972759041bf83d36d8d821741ab.s1.eu.hivemq.cloud',
  port: 8883,
  protocol: 'mqtts',
  username: 'indoor_garden_system',
  password: 'Hero4433>test43',
  clientId: 'SIMULATOR_' + Math.random().toString(16).substring(2, 8)
};

// Topics
const TOPICS = {
  SENSORS: 'indoor-garden/sensors',
  DEVICES: 'indoor-garden/devices',
  COMMANDS: 'indoor-garden/commands'
};

// Device States
const deviceStates = {
  fan: { status: false, autoMode: true, lastUpdated: Date.now() },
  irrigation: { status: false, autoMode: true, lastUpdated: Date.now() },
  lighting: { status: false, autoMode: true, lastUpdated: Date.now() },
  fertilizer: { status: false, autoMode: true, lastUpdated: Date.now() }
};

// Sensor Data with realistic ranges
const sensorData = {
  temperature: 23.0,
  moisture: 55,
  timestamp: Date.now()
};

// Add debug mode
const DEBUG = true;

// Connect to MQTT broker
const client = mqtt.connect({
  host: MQTT_CONFIG.host,
  port: MQTT_CONFIG.port,
  protocol: MQTT_CONFIG.protocol,
  username: MQTT_CONFIG.username,
  password: MQTT_CONFIG.password,
  clientId: MQTT_CONFIG.clientId
});

// Handle connection
client.on('connect', () => {
  console.log('Connected to MQTT broker');
  console.log('Client ID:', MQTT_CONFIG.clientId);
  console.log('Broker:', MQTT_CONFIG.host);
  client.subscribe(TOPICS.COMMANDS);
  publishDeviceStates();
  startSimulation();
});

// Handle incoming commands
client.on('message', (topic, message) => {
  if (topic === TOPICS.COMMANDS) {
    try {
      const command = JSON.parse(message.toString());
      console.log('Received command:', command);
      
      if (command.device && deviceStates[command.device]) {
        deviceStates[command.device].status = command.status;
        deviceStates[command.device].autoMode = command.autoMode ?? true;
        deviceStates[command.device].lastUpdated = Date.now();
        
        console.log(`Updated ${command.device}:`, deviceStates[command.device]);
        publishDeviceStates();
      }
    } catch (error) {
      console.error('Error processing command:', error);
    }
  }
});

// Publish device states
function publishDeviceStates() {
  const payload = {
    devices: deviceStates,
    timestamp: Date.now()
  };
  
  client.publish(TOPICS.DEVICES, JSON.stringify(payload));
  if (DEBUG) {
    console.log('Published device states:', JSON.stringify(payload, null, 2));
  }
}

// Simulate sensor data changes
function updateSensorData() {
  // Add small random variations to simulate real sensor readings
  sensorData.temperature += (Math.random() - 0.5) * 0.5; // ±0.25°C change
  sensorData.temperature = Math.max(18, Math.min(30, sensorData.temperature));
  
  sensorData.moisture += (Math.random() - 0.5) * 2; // ±1% change
  sensorData.moisture = Math.max(30, Math.min(90, sensorData.moisture));
  
  sensorData.timestamp = Date.now();
  
  const data = { ...sensorData };
  if (DEBUG) {
    console.log('Generated sensor data:', JSON.stringify(data, null, 2));
  }
  return data;
}

// Simulate device automation
function handleAutomation() {
  const { temperature, moisture } = sensorData;
  const now = Date.now();
  
  // Fan control
  if (deviceStates.fan.autoMode) {
    const newStatus = temperature > 26;
    if (deviceStates.fan.status !== newStatus) {
      deviceStates.fan.status = newStatus;
      deviceStates.fan.lastUpdated = now;
    }
  }
  
  // Irrigation control
  if (deviceStates.irrigation.autoMode) {
    const newStatus = moisture < 45;
    if (deviceStates.irrigation.status !== newStatus) {
      deviceStates.irrigation.status = newStatus;
      deviceStates.irrigation.lastUpdated = now;
    }
  }
  
  // Lighting control
  if (deviceStates.lighting.autoMode) {
    const hour = new Date().getHours();
    const newStatus = hour >= 6 && hour < 18;
    if (deviceStates.lighting.status !== newStatus) {
      deviceStates.lighting.status = newStatus;
      deviceStates.lighting.lastUpdated = now;
    }
  }
  
  // Fertilizer control (runs for 10 minutes at 8 AM)
  if (deviceStates.fertilizer.autoMode) {
    const date = new Date();
    const hour = date.getHours();
    const minute = date.getMinutes();
    
    const newStatus = hour === 8 && minute < 10;
    if (deviceStates.fertilizer.status !== newStatus) {
      deviceStates.fertilizer.status = newStatus;
      deviceStates.fertilizer.lastUpdated = now;
    }
  }
}

// Start simulation loop
function startSimulation() {
  // Update and publish sensor data every 30 seconds
  setInterval(() => {
    const newSensorData = updateSensorData();
    client.publish(TOPICS.SENSORS, JSON.stringify(newSensorData));
    console.log('Published sensor data:', newSensorData);
    
    // Run automation logic
    handleAutomation();
    publishDeviceStates();
  }, 30000);
  
  // Initial publish
  client.publish(TOPICS.SENSORS, JSON.stringify(sensorData));
}

// Handle errors
client.on('error', (error) => {
  console.error('MQTT Error:', error);
});

// Handle disconnection
client.on('close', () => {
  console.log('Disconnected from MQTT broker');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down simulator...');
  client.end();
  process.exit();
});

// Add packet logging
client.on('packetsend', (packet) => {
  if (DEBUG) {
    console.log('Packet sent:', packet.cmd);
  }
});

client.on('packetreceive', (packet) => {
  if (DEBUG) {
    console.log('Packet received:', packet.cmd);
  }
}); 