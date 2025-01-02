#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <DHT.h>
#include <NTPClient.h>
#include <WiFiUdp.h>
#include <WiFiClientSecure.h>
#include <time.h>

// Pin Definitions
#define DHT_PIN 4
#define MOISTURE_SENSOR_PIN 36
#define FAN_PIN 16
#define PUMP_PIN 17
#define LIGHT_PIN 18
#define FERTILIZER_PIN 19

// Constants
#define DHT_TYPE DHT11
#define MQTT_BUFFER_SIZE 512

// WiFi Configuration
const char* WIFI_SSID = "Usurur";
const char* WIFI_PASSWORD = "m33333333m";

// WiFi reconnection settings
const int WIFI_RETRY_DELAY = 5000;      // 5 seconds between retries
const int WIFI_MAX_RETRIES = 3;         // Maximum number of retry attempts
unsigned long lastWiFiRetry = 0;
int wifiRetryCount = 0;

// MQTT Configuration
const char* MQTT_SERVER = "0c75d1c1cf464db1ac3a8cdb1c5a7ff0.s1.eu.hivemq.cloud";
const int MQTT_PORT = 8883;
const char* MQTT_USER = "indoor_garden_system";
const char* MQTT_PASSWORD = "Hero4433>test43";
const char* MQTT_CLIENT_ID = "ESP8266_CONTROLLER";

// MQTT Topics
const char* TOPIC_PREFIX = "indoor-garden";
const char* TOPIC_SENSORS = "sensors";  // Changed to match backend's topic structure
const char* TOPIC_DEVICES = "devices"; // This should be "commands" instead of "devices"

// Root CA Certificate for HiveMQ
const char* root_ca = R"EOF(
-----BEGIN CERTIFICATE-----
MIIFazCCA1OgAwIBAgIRAIIQz7DSQONZRGPgu2OCiwAwDQYJKoZIhvcNAQELBQAw
TzELMAkGA1UEBhMCVVMxKTAnBgNVBAoTIEludGVybmV0IFNlY3VyaXR5IFJlc2Vh
cmNoIEdyb3VwMRUwEwYDVQQDEwxJU1JHIFJvb3QgWDEwHhcNMTUwNjA0MTEwNDM4
WhcNMzUwNjA0MTEwNDM4WjBPMQswCQYDVQQGEwJVUzEpMCcGA1UEChMgSW50ZXJu
ZXQgU2VjdXJpdHkgUmVzZWFyY2ggR3JvdXAxFTATBgNVBAMTDElTUkcgUm9vdCBY
MTCCAiIwDQYJKoZIhvcNAQEBBQADggIPADCCAgoCggIBAK3oJHP0FDfzm54rVygc
h77ct984kIxuPOZXoHj3dcKi/vVqbvYATyjb3miGbESTtrFj/RQSa78f0uoxmyF+
0TM8ukj13Xnfs7j/EvEhmkvBioZxaUpmZmyPfjxwv60pIgbz5MDmgK7iS4+3mX6U
A5/TR5d8mUgjU+g4rk8Kb4Mu0UlXjIB0ttov0DiNewNwIRt18jA8+o+u3dpjq+sW
T8KOEUt+zwvo/7V3LvSye0rgTBIlDHCNAymg4VMk7BPZ7hm/ELNKjD+Jo2FR3qyH
B5T0Y3HsLuJvW5iB4YlcNHlsdu87kGJ55tukmi8mxdAQ4Q7e2RCOFvu396j3x+UC
B5iPNgiV5+I3lg02dZ77DnKxHZu8A/lJBdiB3QW0KtZB6awBdpUKD9jf1b0SHzUv
KBds0pjBqAlkd25HN7rOrFleaJ1/ctaJxQZBKT5ZPt0m9STJEadao0xAH0ahmbWn
OlFuhjuefXKnEgV4We0+UXgVCwOPjdAvBbI+e0ocS3MFEvzG6uBQE3xDk3SzynTn
jh8BCNAw1FtxNrQHusEwMFxIt4I7mKZ9YIqioymCzLq9gwQbooMDQaHWBfEbwrbw
qHyGO0aoSCqI3Haadr8faqU9GY/rOPNk3sgrDQoo//fb4hVC1CLQJ13hef4Y53CI
rU7m2Ys6xt0nUW7/vGT1M0NPAgMBAAGjQjBAMA4GA1UdDwEB/wQEAwIBBjAPBgNV
HRMBAf8EBTADAQH/MB0GA1UdDgQWBBR5tFnme7bl5AFzgAiIyBpY9umbbjANBgkq
hkiG9w0BAQsFAAOCAgEAVR9YqbyyqFDQDLHYGmkgJykIrGF1XIpu+ILlaS/V9lZL
ubhzEFnTIZd+50xx+7LSYK05qAvqFyFWhfFQDlnrzuBZ6brJFe+GnY+EgPbk6ZGQ
3BebYhtF8GaV0nxvwuo77x/Py9auJ/GpsMiu/X1+mvoiBOv/2X/qkSsisRcOj/KK
NFtY2PwByVS5uCbMiogziUwthDyC3+6WVwW6LLv3xLfHTjuCvjHIInNzktHCgKQ5
ORAzI4JMPJ+GslWYHb4phowim57iaztXOoJwTdwJx4nLCgdNbOhdjsnvzqvHu7Ur
TkXWStAmzOVyyghqpZXjFaH3pO3JLF+l+/+sKAIuvtd7u+Nxe5AW0wdeRlN8NwdC
jNPElpzVmbUq4JUagEiuTDkHzsxHpFKVK7q4+63SM1N95R1NbdWhscdCb+ZAJzVc
oyi3B43njTOQ5yOf+1CceWxG1bQVs5ZufpsMljq4Ui0/1lvh+wjChP4kqKOJ2qxq
4RgqsahDYVvTH9w7jXbyLeiNdd8XM2w9U/t7y0Ff/9yi0GE44Za4rF2LN9d11TPA
mRGunUHBcnWEvgJBQl9nJEiU0Zsnvgc/ubhPgXRR4Xq37Z0j4r7g1SgEEzwxA57d
emyPxgcYxn/eR44/KJ4EBs+lVDR3veyJm+kXQ99b21/+jh5Xos1AnX5iItreGCc=
-----END CERTIFICATE-----
)EOF";

// Objects
WiFiClientSecure espClient;
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
const unsigned long SENSOR_UPDATE_INTERVAL = 5000; // 30 seconds
unsigned long lastMqttReconnectAttempt = 0;
const unsigned long MQTT_RECONNECT_INTERVAL = 5000; // 5 seconds

// MQTT Command Topic
const char* MQTT_COMMAND_TOPIC = "indoor-garden/commands";

// Offline mode thresholds
bool isOfflineMode = false;

unsigned long lastFertilizerStart = 0;  // Track fertilizer start time

// Enhanced settings structure
struct Settings {
  // Temperature thresholds
  float minTemp = 25.0;
  float maxTemp = 27.0;
  
  // Moisture thresholds
  int minMoisture = 8;
  int maxMoisture = 21;
  
  // Lighting schedule
  int lightStartHour = 6;
  int lightEndHour = 18;
  
  // Fertilizer schedule
  enum FertilizerSchedule { DAILY, WEEKLY, MONTHLY } fertilizerSchedule = DAILY;
  int fertilizerHour = 8;
  int fertilizerMinute = 30;
  int fertilizerDayOfWeek = 1;  // Monday
  int fertilizerDayOfMonth = 1;
} settings;

// Add after other global variables
bool settingsLoaded = false;
unsigned long pumpStartTime = 0;
const unsigned long PUMP_DURATION = 5000; // 5 seconds

void setup() {
  Serial.begin(115200);
  Serial.println("\n=== Indoor Garden System Starting ===");
  Serial.println("Initializing components...");
  
  // Initialize pins
  pinMode(FAN_PIN, OUTPUT);
  pinMode(PUMP_PIN, OUTPUT);
  pinMode(LIGHT_PIN, OUTPUT);
  pinMode(FERTILIZER_PIN, OUTPUT);
  pinMode(MOISTURE_SENSOR_PIN, INPUT);
  Serial.println("✓ Pins initialized");
  
  // Set initial pin states (active low)
  digitalWrite(FAN_PIN, HIGH);
  digitalWrite(PUMP_PIN, HIGH);
  digitalWrite(LIGHT_PIN, HIGH);
  digitalWrite(FERTILIZER_PIN, HIGH);
  
  // Verify DHT sensor
  float testReading = dht.readTemperature();
  if (isnan(testReading)) {
    Serial.println("✗ DHT sensor initialization failed!");
    Serial.println("Please check:");
    Serial.println(" - Power connection to DHT sensor");
    Serial.println(" - Data pin connection");
    Serial.println(" - DHT sensor type (DHT22/DHT11)");
  } else {
    Serial.println("✓ DHT sensor initialized successfully");
    Serial.printf("Initial temperature reading: %.2f°C\n", testReading);
  }
  
  // Set all devices to auto mode by default
  fan.autoMode = true;
  pump.autoMode = true;
  light.autoMode = true;
  fertilizer.autoMode = true;
  Serial.println("✓ Device states initialized to auto mode");
  
  // Connect to WiFi
  setupWiFi();
  
  Serial.println("Configuring MQTT and NTP...");
  
  // Configure SSL
  Serial.println("Setting up SSL...");
  espClient.setCACert(root_ca);
  Serial.println("✓ SSL certificate configured");
  
  // Configure MQTT with detailed error reporting
  mqtt.setServer(MQTT_SERVER, MQTT_PORT);
  mqtt.setCallback(mqttCallback);
  mqtt.setBufferSize(MQTT_BUFFER_SIZE);
  Serial.println("✓ MQTT client configured");
  
  // Initialize NTP
  timeClient.begin();
  timeClient.setTimeOffset(0);
  Serial.println("✓ NTP client initialized");
  
  // Initial MQTT connection attempt
  reconnectMQTT();
  
  Serial.println("Setup complete!\n");
  Serial.printf("Temperature range: %.1f-%.1f°C\n", settings.minTemp, settings.maxTemp);
  Serial.printf("Moisture range: %d-%d%%\n", settings.minMoisture, settings.maxMoisture);
}

void loop() {
  unsigned long currentMillis = millis();
  
  // Try to reconnect WiFi if disconnected
  bool wifiConnected = tryReconnectWiFi();
  isOfflineMode = !wifiConnected;
  
  if (!isOfflineMode) {
    if (!mqtt.connected()) {
      reconnectMQTT();
    }
    mqtt.loop();
    timeClient.update();
  }

  // Update sensor data
  if (currentMillis - lastSensorUpdate >= SENSOR_UPDATE_INTERVAL) {
    updateSensorData();
    
    if (!isOfflineMode) {
      publishSensorData();
    } else {
      handleOfflineControl();
    }
    
    lastSensorUpdate = currentMillis;
  }

  // Allow other tasks to run
  yield();
}

void setupWiFi() {
  Serial.println("\nAttempting WiFi connection...");
  Serial.printf("SSID: %s\n", WIFI_SSID);
  
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✓ WiFi connected successfully!");
    Serial.printf("IP address: %s\n", WiFi.localIP().toString().c_str());
    Serial.printf("Signal strength: %d dBm\n", WiFi.RSSI());
  } else {
    Serial.println("\n✗ WiFi connection failed!");
  }
}

bool tryReconnectWiFi() {
  if (WiFi.status() == WL_CONNECTED) {
    wifiRetryCount = 0;
    return true;
  }

  if (millis() - lastWiFiRetry < WIFI_RETRY_DELAY) {
    return false;
  }

  if (wifiRetryCount >= WIFI_MAX_RETRIES) {
    if (wifiRetryCount == WIFI_MAX_RETRIES) {
      Serial.println("\n✗ Maximum WiFi retry attempts reached. Switching to offline mode.");
      wifiRetryCount++; // Increment to avoid printing the message again
    }
    return false;
  }

  Serial.printf("\nWiFi disconnected. Retry attempt %d/%d...\n", wifiRetryCount + 1, WIFI_MAX_RETRIES);
  
  WiFi.disconnect();
  delay(100);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(200);
    Serial.print(".");
    attempts++;
  }
  
  lastWiFiRetry = millis();
  wifiRetryCount++;
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✓ WiFi reconnected successfully!");
    Serial.printf("IP address: %s\n", WiFi.localIP().toString().c_str());
    Serial.printf("Signal strength: %d dBm\n", WiFi.RSSI());
    wifiRetryCount = 0;
    return true;
  } else {
    Serial.println("\n✗ WiFi reconnection failed!");
    return false;
  }
}

void reconnectMQTT() {
  if (millis() - lastMqttReconnectAttempt < MQTT_RECONNECT_INTERVAL) return;
  
  lastMqttReconnectAttempt = millis();
  Serial.println("\nAttempting MQTT connection...");
  Serial.printf("Broker: %s:%d\n", MQTT_SERVER, MQTT_PORT);
  Serial.printf("ClientID: %s\n", MQTT_CLIENT_ID);
  
  if (mqtt.connect(MQTT_CLIENT_ID, MQTT_USER, MQTT_PASSWORD)) {
    Serial.println("✓ Connected to MQTT broker");
    
    // Subscribe to device control topic with prefix
    char deviceTopic[50];
    snprintf(deviceTopic, sizeof(deviceTopic), "%s/%s", TOPIC_PREFIX, TOPIC_DEVICES);
    
    if (mqtt.subscribe(deviceTopic)) {
      Serial.printf("✓ Subscribed to topic: %s\n", deviceTopic);
    } else {
      Serial.printf("✗ Failed to subscribe to topic: %s\n", deviceTopic);
    }
    
    // Reset connection monitoring
    unsigned long lastPingTime = millis();
    int connectionLostCount = 0;
  } else {
    int state = mqtt.state();
    Serial.printf("✗ MQTT connection failed, rc=%d\n", state);
    switch (state) {
      case -4: Serial.println("Connection timeout"); break;
      case -3: Serial.println("Connection lost"); break;
      case -2: Serial.println("Connection failed"); break;
      case -1: Serial.println("Disconnected"); break;
      case 1: Serial.println("Bad protocol"); break;
      case 2: Serial.println("Bad client ID"); break;
      case 3: Serial.println("Unavailable"); break;
      case 4: Serial.println("Bad credentials"); break;
      case 5: Serial.println("Unauthorized"); break;
      default: Serial.println("Unknown error");
    }
  }
}

void mqttCallback(char* topic, byte* payload, unsigned int length) {
  Serial.print("Message arrived in topic: ");
  Serial.println(topic);
  Serial.print("Message:");
  for (int i = 0; i < length; i++) {
      Serial.print((char) payload[i]);
  }
  Serial.println();
  Serial.println("-----------------------");
  
  // Create a null-terminated string from the payload
  char* payloadStr = new char[length + 1];
  memcpy(payloadStr, payload, length);
  payloadStr[length] = '\0';
  
  Serial.printf("Topic: %s\n", topic);
  Serial.printf("Payload: %s\n", payloadStr);
  
  StaticJsonDocument<512> doc;
  DeserializationError error = deserializeJson(doc, payloadStr, length);
  
  delete[] payloadStr;  // Clean up allocated memory
  
  if (error) {
    Serial.printf("✗ JSON parsing failed: %s\n", error.c_str());
    return;
  }

  // Get the device type and status from the message
  const char* device = doc["device"];
  bool status = doc["status"];
  bool autoMode = doc["autoMode"];

  if (!device) {
    Serial.println("✗ No device specified in message");
    return;
  }

  Serial.print("\n\nUpdating device: ");
  Serial.println(device);

  // Update the appropriate device - Using non-blocking approach
  if (strcmp(device, "fan") == 0) {
    fan.status = status;
    fan.autoMode = autoMode;
    digitalWrite(FAN_PIN, !fan.status);
    Serial.print("Fan status updated to: ");
    Serial.println(fan.status ? "ON\n\n" : "OFF\n\n");
  }
  else if (strcmp(device, "irrigation") == 0) {
    pump.status = status;
    pump.autoMode = autoMode;
    
    if (pump.status) {
      // Start pump and record start time
      pumpStartTime = millis();
      digitalWrite(PUMP_PIN, !pump.status);
      Serial.println("Pump started");
    } else {
      digitalWrite(PUMP_PIN, !pump.status);
      Serial.println("Pump stopped");
    }
    
    // Allow other tasks to run
    yield();
    
    Serial.print("Pump status updated to: ");
    Serial.println(pump.status ? "ON\n\n" : "OFF\n\n");
  }
  else if (strcmp(device, "lighting") == 0) {
    light.status = status;
    light.autoMode = autoMode;
    digitalWrite(LIGHT_PIN, !light.status);
    Serial.print("Light status updated to: ");
    Serial.println(light.status ? "ON\n\n" : "OFF\n\n");
  }
  else if (strcmp(device, "fertilizer") == 0) {
    // Handle fertilizer state change in a non-blocking way
    fertilizer.status = status;
    fertilizer.autoMode = autoMode;
    digitalWrite(FERTILIZER_PIN, !fertilizer.status);
    Serial.print("Fertilizer status updated to: ");
    Serial.println(fertilizer.status ? "ON\n\n" : "OFF\n\n");
    // Allow other tasks to run
    yield();
  }
  else {
    Serial.println("✗ Unknown device type");
  }
  
  // Allow other tasks to run
  yield();
}

void updateSensorData() {
  Serial.println("\nUpdating sensor readings...");
  
  // Read temperature
  float newTemp = dht.readTemperature();
  if (!isnan(newTemp)) {
    sensorData.temperature = newTemp;
    Serial.printf("Temperature: %.2f°C\n", newTemp);
  } else {
    Serial.println("✗ Failed to read temperature!");
  }
  
  // Read moisture
  sensorData.moisture = map(analogRead(MOISTURE_SENSOR_PIN), 0, 4095, 100, 0);
  Serial.printf("Moisture: %d%%\n", sensorData.moisture);
  
  sensorData.lastUpdate = timeClient.getEpochTime();
}

void publishSensorData() {
  char topic[50];
  snprintf(topic, sizeof(topic), "%s/%s", TOPIC_PREFIX, TOPIC_SENSORS);
  
  // Get current time from NTP
  time_t epochTime = timeClient.getEpochTime();
  struct tm *ptm = gmtime((time_t *)&epochTime);
  
  char timestamp[25];
  strftime(timestamp, sizeof(timestamp), "%Y-%m-%dT%H:%M:%SZ", ptm);
  
  StaticJsonDocument<200> doc;
  doc["temperature"] = sensorData.temperature;
  doc["moisture"] = sensorData.moisture;
  doc["timestamp"] = timestamp;  // Now sending ISO string format

  char buffer[512];
  size_t n = serializeJson(doc, buffer);
  
  if (mqtt.publish(topic, buffer, n)) {
    Serial.println("✓ Sensor data published successfully");
    Serial.printf("  Temperature: %.2f°C\n", sensorData.temperature);
    Serial.printf("  Moisture: %d%%\n", sensorData.moisture);
    Serial.printf("  Timestamp: %s\n", timestamp);
  } else {
    Serial.println("✗ Failed to publish sensor data");
  }
}

void handleOfflineControl() {
  Serial.println("\nRunning enhanced offline automation...");
  
  // Temperature control (Fan)
    if (sensorData.temperature > settings.maxTemp) {
      fan.status = true;
      digitalWrite(FAN_PIN, !fan.status);
      Serial.printf("Temperature high (%.1f°C) - Fan turned ON\n", sensorData.temperature);
    } else if (sensorData.temperature < settings.minTemp) {
      fan.status = false;
      digitalWrite(FAN_PIN, !fan.status);
      Serial.printf("Temperature low (%.1f°C) - Fan turned OFF\n", sensorData.temperature);
    }

  // Moisture control (Pump) with duration control and yield
    if (sensorData.moisture < settings.minMoisture) {
      pump.status = true;
      pumpStartTime = millis();
      digitalWrite(PUMP_PIN, !pump.status);
      Serial.printf("Moisture low (%d%%) - Pump turned ON\n", sensorData.moisture);
      
      // Allow other tasks to run
      yield();
    } 
    else if (pump.status && (millis() - pumpStartTime >= PUMP_DURATION)) {
      pump.status = false;
      digitalWrite(PUMP_PIN, !pump.status);
      Serial.println("Pump duration complete - turned OFF");
      
      // Allow other tasks to run
      yield();
    }

  // Enhanced time-based control
  struct tm timeinfo;
  if (getLocalTime(&timeinfo)) {
    // Lighting control with schedule
      bool shouldLightBeOn = (timeinfo.tm_hour >= settings.lightStartHour && 
                             timeinfo.tm_hour < settings.lightEndHour);
      
      if (shouldLightBeOn != light.status) {
        light.status = shouldLightBeOn;
        digitalWrite(LIGHT_PIN, !light.status);
        Serial.printf("Light schedule: turned %s (Hour: %d)\n", 
                     shouldLightBeOn ? "ON" : "OFF", 
                     timeinfo.tm_hour);
      }

    // Enhanced fertilizer scheduling
      bool shouldStartFertilizer = false;
      
      switch (settings.fertilizerSchedule) {
        case Settings::DAILY:
          shouldStartFertilizer = (timeinfo.tm_hour == settings.fertilizerHour &&
                                 timeinfo.tm_min == settings.fertilizerMinute);
          break;
          
        case Settings::WEEKLY:
          shouldStartFertilizer = (timeinfo.tm_wday == settings.fertilizerDayOfWeek && 
                                 timeinfo.tm_hour == settings.fertilizerHour &&
                                 timeinfo.tm_min == settings.fertilizerMinute);
          break;
          
        case Settings::MONTHLY:
          shouldStartFertilizer = (timeinfo.tm_mday == settings.fertilizerDayOfMonth && 
                                 timeinfo.tm_hour == settings.fertilizerHour &&
                                 timeinfo.tm_min == settings.fertilizerMinute);
          break;
      }

      if (shouldStartFertilizer && !fertilizer.status) {
        fertilizer.status = true;
        digitalWrite(FERTILIZER_PIN, !fertilizer.status);
        Serial.println("Starting scheduled fertilizer cycle");
      }
  }
}