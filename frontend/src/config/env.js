const env = {
    VITE_API_URL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
    VITE_MQTT_BROKER: import.meta.env.VITE_MQTT_BROKER,
    VITE_MQTT_PORT: import.meta.env.VITE_MQTT_PORT,
    VITE_MQTT_USERNAME: import.meta.env.VITE_MQTT_USERNAME,
    VITE_MQTT_PASSWORD: import.meta.env.VITE_MQTT_PASSWORD,
    VITE_MQTT_TOPIC_PREFIX: import.meta.env.VITE_MQTT_TOPIC_PREFIX,
}

export { env } 