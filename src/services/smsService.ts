
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

interface VerificationSettings {
  method: "email" | "phone";
  enabled: boolean;
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

export const getVerificationSettings = async (): Promise<VerificationSettings | null> => {
  try {
    const response = await axios.get("http://localhost:3001/api/settings/verification-method");
    return response.data;
  } catch (error) {
    console.error("Error getting verification settings:", error);
    return null;
  }
};

export const isVerificationEnabled = async (): Promise<boolean> => {
  try {
    const settings = await getVerificationSettings();
    return settings?.enabled !== false; // Default to true if not specified
  } catch (error) {
    console.error("Error checking if verification is enabled:", error);
    return true; // Default to true in case of error
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
