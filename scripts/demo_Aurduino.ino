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
  int moisture = 0;
  unsigned long lastUpdate = 0;
} sensorData;

// Timing
unsigned long lastSensorUpdate = 0;
const unsigned long SENSOR_UPDATE_INTERVAL = 30000; // 30 seconds
unsigned long lastMqttReconnectAttempt = 0;
const unsigned long MQTT_RECONNECT_INTERVAL = 5000; // 5 seconds

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
  
  // Connect to WiFi
  setupWiFi();
  
  // Configure MQTT
  mqtt.setServer(MQTT_SERVER, MQTT_PORT);
  mqtt.setCallback(mqttCallback);
  mqtt.setBufferSize(MQTT_BUFFER_SIZE);
  
  // Initialize NTP
  timeClient.begin();
  timeClient.setTimeOffset(0);
}

void loop() {
  if (!mqtt.connected()) {
    reconnectMQTT();
  }
  mqtt.loop();
  timeClient.update();

  // Update and publish sensor data
  unsigned long currentMillis = millis();
  if (currentMillis - lastSensorUpdate >= SENSOR_UPDATE_INTERVAL) {
    updateSensorData();
    publishSensorData();
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
  sensorData.temperature = dht.readTemperature();
  sensorData.moisture = map(analogRead(MOISTURE_SENSOR_PIN), 0, 1023, 100, 0);
  sensorData.lastUpdate = timeClient.getEpochTime();
}

void publishSensorData() {
  StaticJsonDocument<200> doc;
  
  doc["temperature"] = sensorData.temperature;
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