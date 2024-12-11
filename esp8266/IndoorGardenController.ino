#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <DHT.h>
#include <NTPClient.h>
#include <WiFiUdp.h>

// Pin Definitions
#define DHT_PIN D4
#define MOISTURE_SENSOR_PIN A0
#define FAN_PIN D1
#define PUMP_PIN D2
#define LIGHT_PIN D3
#define FERTILIZER_PIN D5

// Constants
#define DHT_TYPE DHT22
#define MQTT_BUFFER_SIZE 512

// WiFi Configuration
const char* WIFI_SSID = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

// MQTT Configuration
const char* MQTT_SERVER = "d55d1972759041bf83d36d8d821741ab.s1.eu.hivemq.cloud";
const int MQTT_PORT = 8883;
const char* MQTT_USER = "indoor_garden_system";
const char* MQTT_PASSWORD = "Hero4433>test43";
const char* MQTT_CLIENT_ID = "ESP8266_CONTROLLER";

// MQTT Topics
const char* TOPIC_PREFIX = "indoor-garden";
const char* TOPIC_SENSORS = "indoor-garden/sensors";
const char* TOPIC_DEVICES = "indoor-garden/devices";
const char* TOPIC_COMMANDS = "indoor-garden/commands";

// Objects
WiFiClient espClient;
PubSubClient mqtt(espClient);
DHT dht(DHT_PIN, DHT_TYPE);
WiFiUDP ntpUDP;
NTPClient timeClient(ntpUDP, "pool.ntp.org");

// Device States
struct DeviceState {
  bool status = false;
  bool autoMode = true;
} fan, pump, light, fertilizer;

// Sensor Data
struct SensorData {
  float temperature = 0;
  float humidity = 0;
  int moisture = 0;
  unsigned long lastUpdate = 0;
} sensorData;

// Timing
unsigned long lastSensorUpdate = 0;
const unsigned long SENSOR_UPDATE_INTERVAL = 30000; // 30 seconds
unsigned long lastMqttReconnectAttempt = 0;
const unsigned long MQTT_RECONNECT_INTERVAL = 5000; // 5 seconds

// Additional Constants for Offline Automation
#define WIFI_RETRY_DELAY 5000
#define WIFI_MAX_RETRIES 5
#define CONNECTION_CHECK_INTERVAL 10000

// Thresholds for Offline Automation
const float TEMP_MIN = 15.0;
const float TEMP_MAX = 28.0;
const int MOISTURE_MIN = 40;
const int MOISTURE_MAX = 60;
const int FERTILIZER_DURATION = 600000; // 10 minutes in milliseconds

// Additional Timing Variables
unsigned long lastConnectionCheck = 0;
unsigned long lastFertilizerStart = 0;
bool fertilizerRunning = false;
bool isOfflineMode = false;
int wifiRetryCount = 0;

void setup() {
  Serial.begin(115200);
  
  // Initialize pins
  pinMode(FAN_PIN, OUTPUT);
  pinMode(PUMP_PIN, OUTPUT);
  pinMode(LIGHT_PIN, OUTPUT);
  pinMode(FERTILIZER_PIN, OUTPUT);
  pinMode(MOISTURE_SENSOR_PIN, INPUT);
  
  // Initialize sensors
  dht.begin();
  
  // Set all devices to auto mode by default
  fan.autoMode = true;
  pump.autoMode = true;
  light.autoMode = true;
  fertilizer.autoMode = true;
  
  // Try to connect to WiFi
  setupWiFi();
  
  if (WiFi.status() == WL_CONNECTED) {
    // Configure MQTT
    mqtt.setServer(MQTT_SERVER, MQTT_PORT);
    mqtt.setCallback(mqttCallback);
    mqtt.setBufferSize(MQTT_BUFFER_SIZE);
    
    // Initialize NTP
    timeClient.begin();
    timeClient.setTimeOffset(0);
  } else {
    enterOfflineMode();
  }
}

void loop() {
  unsigned long currentMillis = millis();
  
  // Check connection status periodically
  if (currentMillis - lastConnectionCheck >= CONNECTION_CHECK_INTERVAL) {
    checkConnectivity();
    lastConnectionCheck = currentMillis;
  }

  if (isOfflineMode) {
    handleOfflineAutomation();
  } else {
    // Online mode operations
    if (!mqtt.connected()) {
      reconnectMQTT();
    }
    mqtt.loop();
    timeClient.update();
  }

  // Update sensor data regardless of mode
  if (currentMillis - lastSensorUpdate >= SENSOR_UPDATE_INTERVAL) {
    updateSensorData();
    if (!isOfflineMode) {
      publishSensorData();
    }
    lastSensorUpdate = currentMillis;
  }
}

void setupWiFi() {
  Serial.println("Connecting to WiFi...");
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  Serial.println("\nWiFi connected");
  Serial.println("IP address: " + WiFi.localIP().toString());
}

void reconnectMQTT() {
  if (millis() - lastMqttReconnectAttempt < MQTT_RECONNECT_INTERVAL) return;
  
  lastMqttReconnectAttempt = millis();
  
  if (mqtt.connect(MQTT_CLIENT_ID, MQTT_USER, MQTT_PASSWORD)) {
    Serial.println("Connected to MQTT");
    mqtt.subscribe(TOPIC_COMMANDS);
    publishDeviceStates();
  }
}

void mqttCallback(char* topic, byte* payload, unsigned int length) {
  StaticJsonDocument<200> doc;
  deserializeJson(doc, payload, length);
  
  const char* device = doc["device"];
  bool status = doc["status"];
  bool autoMode = doc["autoMode"] | true;
  
  if (strcmp(device, "fan") == 0) {
    fan.status = status;
    fan.autoMode = autoMode;
    digitalWrite(FAN_PIN, status);
  }
  else if (strcmp(device, "irrigation") == 0) {
    pump.status = status;
    pump.autoMode = autoMode;
    digitalWrite(PUMP_PIN, status);
  }
  else if (strcmp(device, "lighting") == 0) {
    light.status = status;
    light.autoMode = autoMode;
    digitalWrite(LIGHT_PIN, status);
  }
  else if (strcmp(device, "fertilizer") == 0) {
    fertilizer.status = status;
    fertilizer.autoMode = autoMode;
    digitalWrite(FERTILIZER_PIN, status);
  }
  
  publishDeviceStates();
}

void updateSensorData() {
  // Read sensors with error checking
  float newTemp = dht.readTemperature();
  float newHumidity = dht.readHumidity();
  
  if (!isnan(newTemp)) {
    sensorData.temperature = newTemp;
  }
  if (!isnan(newHumidity)) {
    sensorData.humidity = newHumidity;
  }
  
  // Read moisture with moving average to reduce noise
  static int moistureReadings[5] = {0};
  static int readIndex = 0;
  static long moistureTotal = 0;
  
  moistureTotal -= moistureReadings[readIndex];
  moistureReadings[readIndex] = analogRead(MOISTURE_SENSOR_PIN);
  moistureTotal += moistureReadings[readIndex];
  readIndex = (readIndex + 1) % 5;
  
  sensorData.moisture = map(moistureTotal / 5, 0, 1023, 100, 0);
  sensorData.lastUpdate = isOfflineMode ? millis() : timeClient.getEpochTime();
}

void publishSensorData() {
  StaticJsonDocument<200> doc;
  
  doc["temperature"] = sensorData.temperature;
  doc["humidity"] = sensorData.humidity;
  doc["moisture"] = sensorData.moisture;
  doc["timestamp"] = sensorData.lastUpdate;
  
  char buffer[MQTT_BUFFER_SIZE];
  serializeJson(doc, buffer);
  mqtt.publish(TOPIC_SENSORS, buffer);
}

void publishDeviceStates() {
  StaticJsonDocument<200> doc;
  JsonObject devices = doc.createNestedObject("devices");
  
  JsonObject fanObj = devices.createNestedObject("fan");
  fanObj["status"] = fan.status;
  fanObj["autoMode"] = fan.autoMode;
  
  JsonObject pumpObj = devices.createNestedObject("irrigation");
  pumpObj["status"] = pump.status;
  pumpObj["autoMode"] = pump.autoMode;
  
  JsonObject lightObj = devices.createNestedObject("lighting");
  lightObj["status"] = light.status;
  lightObj["autoMode"] = light.autoMode;
  
  JsonObject fertilizerObj = devices.createNestedObject("fertilizer");
  fertilizerObj["status"] = fertilizer.status;
  fertilizerObj["autoMode"] = fertilizer.autoMode;
  
  char buffer[MQTT_BUFFER_SIZE];
  serializeJson(doc, buffer);
  mqtt.publish(TOPIC_DEVICES, buffer);
}

void checkConnectivity() {
  if (WiFi.status() != WL_CONNECTED) {
    if (wifiRetryCount < WIFI_MAX_RETRIES) {
      Serial.println("WiFi connection lost. Attempting to reconnect...");
      WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
      wifiRetryCount++;
      delay(WIFI_RETRY_DELAY);
    } else if (!isOfflineMode) {
      enterOfflineMode();
    }
  } else {
    wifiRetryCount = 0;
    if (isOfflineMode && mqtt.connect(MQTT_CLIENT_ID, MQTT_USER, MQTT_PASSWORD)) {
      exitOfflineMode();
    }
  }
}

void enterOfflineMode() {
  isOfflineMode = true;
  Serial.println("Entering offline mode - Activating local automation");
  
  // Force all devices to auto mode in offline mode
  fan.autoMode = true;
  pump.autoMode = true;
  light.autoMode = true;
  fertilizer.autoMode = true;
}

void exitOfflineMode() {
  isOfflineMode = false;
  Serial.println("Exiting offline mode - Resuming normal operation");
  publishDeviceStates(); // Sync states with server
}

void handleOfflineAutomation() {
  // Temperature control
  if (sensorData.temperature > TEMP_MAX && !fan.status) {
    digitalWrite(FAN_PIN, HIGH);
    fan.status = true;
  } else if (sensorData.temperature < TEMP_MIN && fan.status) {
    digitalWrite(FAN_PIN, LOW);
    fan.status = false;
  }

  // Moisture control
  if (sensorData.moisture < MOISTURE_MIN && !pump.status) {
    digitalWrite(PUMP_PIN, HIGH);
    pump.status = true;
  } else if (sensorData.moisture > MOISTURE_MAX && pump.status) {
    digitalWrite(PUMP_PIN, LOW);
    pump.status = false;
  }

  // Lighting control based on time
  int currentHour = (timeClient.getEpochTime() / 3600) % 24;
  bool shouldLightBeOn = (currentHour >= 6 && currentHour < 18); // 6 AM to 6 PM
  
  if (shouldLightBeOn != light.status) {
    digitalWrite(LIGHT_PIN, shouldLightBeOn);
    light.status = shouldLightBeOn;
  }

  // Fertilizer control
  unsigned long currentMillis = millis();
  if (fertilizerRunning && (currentMillis - lastFertilizerStart >= FERTILIZER_DURATION)) {
    digitalWrite(FERTILIZER_PIN, LOW);
    fertilizer.status = false;
    fertilizerRunning = false;
  }
} 