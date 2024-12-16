import { useEffect, useRef } from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import { useDeviceStatusForNotifications } from './useDeviceStatus';
import { useSensorData } from './useSensorData';
import { notificationService } from '../services/notificationService';
import { useFetchSettings } from './useSettings';
import api from '../lib/axios';

export function useDeviceAlerts() {
  const { addNotification } = useNotifications();
  const { data: deviceStatus, isLoading: deviceLoading } = useDeviceStatusForNotifications();
  const { sensorData } = useSensorData();
  const { data: settings } = useFetchSettings();
  
  // Keep track of the last values to prevent constant notifications
  const lastValues = useRef({
    temperature: null,
    moisture: null,
    lastNotificationTime: 0
  });

  useEffect(() => {
    // Ensure we have all required data
    if (!sensorData?.temperature || !sensorData?.moisture || deviceLoading || !settings?.preferences || !settings?.notifications) {
      return;
    }

    const now = Date.now();
    // Only check for alerts every 15 seconds
    if (now - lastValues.current.lastNotificationTime < 15000) {
      return;
    }

    // Check temperature
    const temp = Number(sensorData.temperature);
    const { minTemperatureThreshold, maxTemperatureThreshold } = settings.preferences;

    // Only create temperature alert if it's the first reading or the value has changed significantly (0.5 degrees)
    const tempDiff = Math.abs((lastValues.current.temperature || temp) - temp);
    if (!isNaN(temp) && 
        (lastValues.current.temperature === null || tempDiff > 0.5) && 
        (temp > maxTemperatureThreshold || temp < minTemperatureThreshold)) {
      const alert = {
        type: 'temperature',
        value: temp,
        // threshold: temp > maxTemperatureThreshold ? maxTemperatureThreshold : minTemperatureThreshold,
        isHigh: temp > maxTemperatureThreshold
      };

      const shouldNotify = notificationService.shouldNotifyForAlert(alert, deviceStatus, settings.notifications);
      
      if (shouldNotify.push) {
        const notification = notificationService.getNotificationContent(alert);
        if (notification) {
          addNotification(notification);
          lastValues.current.lastNotificationTime = now;
        }
      }

      if (shouldNotify.email) {
        // Send email notification through backend
        api.post('/alerts/email', alert)
          .catch(error => console.error('Failed to send email alert:', error));
      }
      lastValues.current.temperature = temp;
    }

    // Check moisture
    const moisture = Number(sensorData.moisture);
    const { minMoistureThreshold, maxMoistureThreshold } = settings.preferences;

    // Only create moisture alert if it's the first reading or the value has changed significantly (2%)
    const moistureDiff = Math.abs((lastValues.current.moisture || moisture) - moisture);
    if (!isNaN(moisture) && 
        (lastValues.current.moisture === null || moistureDiff > 2) && 
        (moisture < minMoistureThreshold || moisture > maxMoistureThreshold)) {
      const alert = {
        type: 'moisture',
        value: moisture,
        // threshold: moisture > maxMoistureThreshold ? maxMoistureThreshold : minMoistureThreshold,
        isHigh: moisture > maxMoistureThreshold
      };

      const shouldNotify = notificationService.shouldNotifyForAlert(alert, deviceStatus, settings.notifications);
      
      if (shouldNotify.push) {
        const notification = notificationService.getNotificationContent(alert);
        if (notification) {
          addNotification(notification);
          lastValues.current.lastNotificationTime = now;
        }
      }

      if (shouldNotify.email) {
        // Send email notification through backend
        api.post('/alerts/email', alert)
          .catch(error => console.error('Failed to send email alert:', error));
      }
      lastValues.current.moisture = moisture;
    }
  }, [sensorData, deviceStatus, settings, addNotification, deviceLoading]);
}
