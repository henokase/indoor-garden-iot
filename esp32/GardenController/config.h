#ifndef CONFIG_H
#define CONFIG_H

// WiFi Configuration
const char* WIFI_SSID = "your_wifi_ssid";
const char* WIFI_PASSWORD = "your_wifi_password";

// MQTT Configuration
const char* MQTT_BROKER = "your_mqtt_broker";
const int MQTT_PORT = 8883;
const char* MQTT_USERNAME = "your_mqtt_username";
const char* MQTT_PASSWORD = "your_mqtt_password";
const char* MQTT_CLIENT_ID = "esp32_garden_controller";

// MQTT Topics
const char* MQTT_SENSOR_TOPIC = "indoor-garden/sensors";
const char* MQTT_COMMAND_TOPIC = "indoor-garden/commands";

#endif 