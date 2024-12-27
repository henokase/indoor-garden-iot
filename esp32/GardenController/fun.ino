#include <Adafruit_Sensor.h>
#include <DHT.h>
#include <DHT_U.h>

// Define DHT sensor type and pin
#define DHTPIN 4       // GPIO pin connected to the DHT sensor
#define DHTTYPE DHT11  // Change to DHT22 or DHT21 if using a different sensor

// Initialize DHT sensor
DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(115200);  // Start serial communication
  dht.begin();           // Initialize the DHT sensor
  Serial.println("DHT Sensor Test");
}

void loop() {
  delay(2000);  // Wait 2 seconds between readings

  // Read temperature and humidity
  float humidity = dht.readHumidity();
  float temperature = dht.readTemperature(); // Celsius
  // float temperatureF = dht.readTemperature(true); // Uncomment for Fahrenheit

  // Check if any reads failed
  if (isnan(humidity) || isnan(temperature)) {
    Serial.println("Failed to read from DHT sensor!");
    return;
  }

  // Print the readings
  Serial.print("Humidity: ");
  Serial.print(humidity);
  Serial.print("%  Temperature: ");
  Serial.print(temperature);
  Serial.println("°C");
  // Serial.print(temperatureF);
  // Serial.println("°F");  // Uncomment for Fahrenheit
}
