
import axios from "axios";

interface SMSSettings {
  smsProvider: string;
  apiKey: string;
  apiSecret?: string;
  senderName: string;
  webhookUrl?: string;
  testPhone?: string;
  smsTemplate?: string;
}

export const sendVerificationSMS = async (phoneNumber: string, code: string): Promise<boolean> => {
  try {
    const response = await axios.post("http://localhost:3001/api/sms/verification", {
      phoneNumber,
      code
    });
    return response.status === 200;
  } catch (error) {
    console.error("Error sending verification SMS:", error);
    return false;
  }
};

export const verifySMSCode = async (phoneNumber: string, code: string): Promise<boolean> => {
  try {
    const response = await axios.post("http://localhost:3001/api/sms/verify", {
      phoneNumber,
      code
    });
    return response.data.verified === true;
  } catch (error) {
    console.error("Error verifying SMS code:", error);
    return false;
  }
};

export const generateVerificationCode = (): string => {
  // Generate a 6-digit verification code
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const getSMSSettings = async (): Promise<SMSSettings | null> => {
  try {
    const response = await axios.get("http://localhost:3001/api/settings/sms");
    return response.data;
  } catch (error) {
    console.error("Error getting SMS settings:", error);
    return null;
  }
};

export const testSMSIntegration = async (settings: SMSSettings): Promise<boolean> => {
  try {
    await axios.post("http://localhost:3001/api/settings/sms/test", settings);
    return true;
  } catch (error) {
    console.error("Error testing SMS integration:", error);
    return false;
  }
};
