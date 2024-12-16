export const notificationService = {
  shouldNotifyForAlert(alert, deviceStatus, notifications) {
    
    // Check if device is in manual mode
    const device = alert.type === 'temperature' ? deviceStatus?.fan : deviceStatus?.irrigation;
    const isManualMode = device?.mode === 'manual';
    
    return {
      push: isManualMode && notifications?.push,
      email: isManualMode && notifications?.email.enabled
    };
  },

  getNotificationContent(alert) {
    
    if (alert.type === 'temperature') {
      const title = alert.isHigh ? '🌡️ High Temperature Alert' : '🌡️ Low Temperature Alert';
      const message = alert.isHigh
        ? `Temperature is too high (${alert.value.toFixed(1)}°C). Consider turning on the fan.`
        : `Temperature is too low (${alert.value.toFixed(1)}°C). Consider adjusting the environment.`;
      
      return { title, message };
    }
    
    if (alert.type === 'moisture') {
      const title = alert.isHigh ? '💧 High Moisture Alert' : '💧 Low Moisture Alert';
      const message = alert.isHigh
        ? `Soil moisture is too high (${alert.value.toFixed(1)}%). Consider reducing watering.`
        : `Soil moisture is too low (${alert.value.toFixed(1)}%). Plants may need water.`;
      
      return { title, message };
    }

    return null;
  }
};
