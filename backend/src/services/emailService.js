import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: env.EMAIL.USER,
        pass: env.EMAIL.PASS
      }
    });
  }

  getAlertIcon(type, isHigh) {
    if (type === 'temperature') {
      return isHigh ? '🌡️' : '❄️';
    }
    return isHigh ? '💧' : '🏜️';
  }

  getAlertColor(isHigh) {
    return isHigh ? '#ef4444' : '#3b82f6';
  }

  async sendAlertEmail(userEmail, alert) {
    const { type, value, isHigh } = alert;
    
    const icon = this.getAlertIcon(type, isHigh);
    const color = this.getAlertColor(isHigh);
    let title = '';
    let message = '';
    let recommendation = '';
    
    if (type === 'temperature') {
      title = isHigh ? 'High Temperature Alert' : 'Low Temperature Alert';
      message = `Temperature is ${isHigh ? 'too high' : 'too low'} (${value.toFixed(1)}°C)`;
      recommendation = isHigh
        ? 'Consider turning on the fan or adjusting your cooling system.'
        : 'Consider adjusting your heating system or checking for drafts.';
    } else if (type === 'moisture') {
      title = isHigh ? 'High Moisture Alert' : 'Low Moisture Alert';
      message = `Soil moisture is ${isHigh ? 'too high' : 'too low'} (${value.toFixed(1)}%)`;
      recommendation = isHigh
        ? 'Consider reducing watering frequency or improving drainage.'
        : 'Your plants may need water. Consider adjusting your watering schedule.';
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${title}</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <!-- Header -->
              <div style="background-color: ${color}; color: white; padding: 20px; text-align: center;">
                <div style="font-size: 48px; margin-bottom: 10px;">${icon}</div>
                <h1 style="margin: 0; font-size: 24px;">${title}</h1>
              </div>
              
              <!-- Content -->
              <div style="padding: 20px;">
                <div style="background-color: ${color}15; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
                  <p style="margin: 0; font-size: 18px; color: #374151; text-align: center;">
                    <strong>${message}</strong>
                  </p>
                </div>
                
                <div style="border-left: 4px solid ${color}; padding-left: 15px; margin-bottom: 20px;">
                  <p style="margin: 0; color: #4b5563; line-height: 1.5;">
                    ${recommendation}
                  </p>
                </div>

                <div style="background-color: #f3f4f6; border-radius: 8px; padding: 15px;">
                  <p style="margin: 0; color: #6b7280; font-size: 14px;">
                    This is an automated alert from your Indoor Garden System.
                    <br>
                    Time of alert: ${new Date().toLocaleString()}
                  </p>
                </div>
              </div>
              
              <!-- Footer -->
              <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
                <p style="margin: 0; color: #9ca3af; font-size: 14px;">
                  Indoor Garden Monitoring System
                </p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    try {
      await this.transporter.sendMail({
        from: `Indoor Garden System <${env.SMTP_USER}>`,
        to: userEmail,
        subject: `${icon} ${title}`,
        text: `${message}\n\n${recommendation}\n\nThis is an automated alert from your Indoor Garden System.`,
        html: htmlContent,
      });
      return true;
    } catch (error) {
      console.error(`Failed to send email to ${userEmail}:`, error);
      return false;
    }
  }

  async verifyConnection() {
    try {
      await this.transporter.verify();
      console.log('SMTP connection verified successfully');
      return true;
    } catch (error) {
      console.error('SMTP verification failed:', error);
      console.log('Current SMTP settings:', {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS ? '****' : 'not set'
      });
      return false;
    }
  }
}

export const emailService = new EmailService();
