#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <DHT.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <SPIFFS.h>
#include "config.h"

// Pin Definitions
#define TEMP_SENSOR_PIN 4      // DHT22 data pin
#define MOISTURE_SENSOR_PIN 36 // Analog moisture sensor pin
#define FAN_PIN 16
#define IRRIGATION_PIN 17
#define LIGHTING_PIN 18
#define FERTILIZER_PIN 19

// Device state constants
#define FAN_INDEX 0
#define IRRIGATION_INDEX 1
#define LIGHTING_INDEX 2
#define FERTILIZER_INDEX 3

// Initialize components
DHT dht(TEMP_SENSOR_PIN, DHT22);
LiquidCrystal_I2C lcd(0x27, 16, 2);  // I2C address 0x27, 16 columns, 2 rows
WiFiClient espClient;
PubSubClient mqttClient(espClient);

// Global variables
unsigned long lastSensorRead = 0;
unsigned long lastMqttReconnectAttempt = 0;
unsigned long lastWifiCheckTime = 0;
const long SENSOR_READ_INTERVAL = 30000;    // 30 seconds
const long WIFI_CHECK_INTERVAL = 5000;      // 5 seconds
const long MQTT_RETRY_INTERVAL = 5000;      // 5 seconds
bool deviceStates[4] = {false, false, false, false};

// Function declarations
void connectWiFi();
void connectMQTT();
void handleMqttMessage(char* topic, byte* payload, unsigned int length);
void saveStates();
void loadStates();
void updateDevices();
void updateLCD(float temperature, float moisture);
void publishSensorData(float temperature, float moisture);

void setup() {
  Serial.begin(115200);
  
  // Initialize pins
  pinMode(MOISTURE_SENSOR_PIN, INPUT);
  pinMode(FAN_PIN, OUTPUT);
  pinMode(IRRIGATION_PIN, OUTPUT);
  pinMode(LIGHTING_PIN, OUTPUT);
  pinMode(FERTILIZER_PIN, OUTPUT);

  // Initialize I2C and LCD
  Wire.begin();
  lcd.init();
  lcd.backlight();
  lcd.clear();
  lcd.print("Starting up...");

  // Initialize DHT sensor
  dht.begin();

  // Initialize SPIFFS
  if (!SPIFFS.begin(true)) {
    Serial.println("SPIFFS init failed");
    lcd.clear();
    lcd.print("Storage failed!");
    delay(2000);
  }

  // Load saved states
  loadStates();
  
  // Initial WiFi connection
  connectWiFi();

  // Setup MQTT
  mqttClient.setServer(MQTT_BROKER, MQTT_PORT);
  mqttClient.setCallback(handleMqttMessage);
}

void loop() {
  unsigned long currentMillis = millis();

  // Check WiFi connection
  if (currentMillis - lastWifiCheckTime >= WIFI_CHECK_INTERVAL) {
    lastWifiCheckTime = currentMillis;
    if (WiFi.status() != WL_CONNECTED) {
      connectWiFi();
    }
  }

  // Handle MQTT connection
  if (WiFi.status() == WL_CONNECTED) {
    if (!mqttClient.connected() && 
        currentMillis - lastMqttReconnectAttempt >= MQTT_RETRY_INTERVAL) {
      lastMqttReconnectAttempt = currentMillis;
      connectMQTT();
    }
    if (mqttClient.connected()) {
      mqttClient.loop();
    }
  }

  // Read and publish sensor data
  if (currentMillis - lastSensorRead >= SENSOR_READ_INTERVAL) {
    lastSensorRead = currentMillis;
    
    float temperature = dht.readTemperature();
    float moisture = map(analogRead(MOISTURE_SENSOR_PIN), 4095, 0, 0, 100);

    if (!isnan(temperature) && !isnan(moisture)) {
      updateLCD(temperature, moisture);
      
      if (mqttClient.connected()) {
        publishSensorData(temperature, moisture);
      }
    }
  }

  // Always update devices based on current states
  updateDevices();
}

void connectWiFi() {
  if (WiFi.status() == WL_CONNECTED) return;

  lcd.clear();
  lcd.print("WiFi connecting..");
  
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    attempts++;
    Serial.print(".");
  }

  lcd.clear();
  if (WiFi.status() == WL_CONNECTED) {
    lcd.print("WiFi connected");
    Serial.println("\nWiFi connected");
  } else {
    lcd.print("WiFi failed");
    Serial.println("\nWiFi connection failed");
  }
  delay(1000);
}

void connectMQTT() {
  if (mqttClient.connect(MQTT_CLIENT_ID, MQTT_USERNAME, MQTT_PASSWORD)) {
    Serial.println("MQTT connected");
    mqttClient.subscribe(MQTT_COMMAND_TOPIC);
  }
}

void handleMqttMessage(char* topic, byte* payload, unsigned int length) {
  StaticJsonDocument<200> doc;
  DeserializationError error = deserializeJson(doc, payload, length);
  
  if (error) {
    Serial.println("JSON parsing failed");
    return;
  }

  const char* device = doc["device"];
  bool status = doc["status"];

  int deviceIndex = -1;
  if (strcmp(device, "fan") == 0) deviceIndex = FAN_INDEX;
  else if (strcmp(device, "irrigation") == 0) deviceIndex = IRRIGATION_INDEX;
  else if (strcmp(device, "lighting") == 0) deviceIndex = LIGHTING_INDEX;
  else if (strcmp(device, "fertilizer") == 0) deviceIndex = FERTILIZER_INDEX;

  if (deviceIndex >= 0) {
    deviceStates[deviceIndex] = status;
    saveStates();
    updateDevices();
  }
}

void saveStates() {
  File file = SPIFFS.open("/states.json", "w");
  if (!file) {
    Serial.println("Failed to open file for writing");
    return;
  }

  StaticJsonDocument<200> doc;
  doc["fan"] = deviceStates[FAN_INDEX];
  doc["irrigation"] = deviceStates[IRRIGATION_INDEX];
  doc["lighting"] = deviceStates[LIGHTING_INDEX];
  doc["fertilizer"] = deviceStates[FERTILIZER_INDEX];

  if (serializeJson(doc, file) == 0) {
    Serial.println("Failed to write to file");
  }
  file.close();
}

void loadStates() {
  File file = SPIFFS.open("/states.json", "r");
  if (!file) {
    Serial.println("No saved states found");
    return;
  }

  StaticJsonDocument<200> doc;
  DeserializationError error = deserializeJson(doc, file);
  file.close();

  if (error) {
    Serial.println("Failed to read file");
    return;
  }

  deviceStates[FAN_INDEX] = doc["fan"] | false;
  deviceStates[IRRIGATION_INDEX] = doc["irrigation"] | false;
  deviceStates[LIGHTING_INDEX] = doc["lighting"] | false;
  deviceStates[FERTILIZER_INDEX] = doc["fertilizer"] | false;
}

void updateDevices() {
  digitalWrite(FAN_PIN, deviceStates[FAN_INDEX]);
  digitalWrite(IRRIGATION_PIN, deviceStates[IRRIGATION_INDEX]);
  digitalWrite(LIGHTING_PIN, deviceStates[LIGHTING_INDEX]);
  digitalWrite(FERTILIZER_PIN, deviceStates[FERTILIZER_INDEX]);
}

void updateLCD(float temperature, float moisture) {
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Temp: ");
  lcd.print(temperature, 1);
  lcd.print("C");
  
  lcd.setCursor(0, 1);
  lcd.print("Moist: ");
  lcd.print(moisture, 0);
  lcd.print("%");
}

void publishSensorData(float temperature, float moisture) {
  StaticJsonDocument<200> doc;
  doc["temperature"] = temperature;
  doc["moisture"] = moisture;
  doc["timestamp"] = millis();

  char buffer[200];
  serializeJson(doc, buffer);
  mqttClient.publish(MQTT_SENSOR_TOPIC, buffer);
} 