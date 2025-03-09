import { User } from "@/types";

export const addUser = async (user: User): Promise<User> => {
  // Simulate adding a user to a database
  await new Promise((resolve) => setTimeout(resolve, 500));
  
  // Generate a unique ID (in a real app, this would be handled by the database)
  const id = Math.random().toString(36).substring(2, 15);
  
  return { ...user, id };
};

export const getUsers = async (): Promise<User[]> => {
  // Simulate fetching users from a database
  await new Promise((resolve) => setTimeout(resolve, 500));

  const usersData = localStorage.getItem('users');
  let users: User[] = usersData ? JSON.parse(usersData) : [];

  return users;
};

export const updateUser = async (id: string, updates: Partial<User>): Promise<User | null> => {
  // Simulate updating a user in a database
  await new Promise((resolve) => setTimeout(resolve, 500));

  const usersData = localStorage.getItem('users');
  let users: User[] = usersData ? JSON.parse(usersData) : [];

  const userIndex = users.findIndex(user => user.id === id);

  if (userIndex === -1) {
    return null;
  }

  const updatedUser = { ...users[userIndex], ...updates, id: id };
  users[userIndex] = updatedUser;

  localStorage.setItem('users', JSON.stringify(users));

  return updatedUser;
};

export const deleteUser = async (id: string): Promise<boolean> => {
  // Simulate deleting a user from a database
  await new Promise((resolve) => setTimeout(resolve, 500));

  const usersData = localStorage.getItem('users');
  let users: User[] = usersData ? JSON.parse(usersData) : [];

  const initialLength = users.length;
  users = users.filter(user => user.id !== id);

  if (users.length === initialLength) {
    return false;
  }

  localStorage.setItem('users', JSON.stringify(users));
  return true;
};

// SMTP Settings type
export interface SmtpSettings {
  host: string;
  port: number;
  secure: boolean;
  username: string;
  password: string;
  fromEmail: string;
  fromName: string;
}

// POP3 Settings type
export interface PopSettings {
  host: string;
  port: number;
  secure: boolean;
  username: string;
  password: string;
  leaveOnServer: boolean;
  autoCheckInterval: number;
}

// SMTP Settings Functions
export const getSmtpSettings = async (): Promise<SmtpSettings | null> => {
  // For demo purposes, we'll retrieve settings from localStorage
  const settingsStr = localStorage.getItem('smtpSettings');
  return settingsStr ? JSON.parse(settingsStr) : null;
};

export const saveSmtpSettings = async (settings: SmtpSettings): Promise<void> => {
  // For demo purposes, we'll save settings to localStorage
  localStorage.setItem('smtpSettings', JSON.stringify(settings));
  // In a real app, you would send these settings to your backend
  return Promise.resolve();
};

export const testSmtpConnection = async (settings: SmtpSettings): Promise<{success: boolean, message?: string}> => {
  // This is a mock function, in a real application you would send a request to your backend
  // which would attempt to establish a connection with the SMTP server
  
  // Simulate a network delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Simulate success/failure based on the settings
  // For demo purposes, we'll assume the connection is successful if the host is not empty
  if (settings.host && settings.host.length > 0) {
    return { success: true };
  } else {
    return { success: false, message: "Не удалось установить соединение с сервером" };
  }
};

// POP3 Settings Functions
export const getPopSettings = async (): Promise<PopSettings | null> => {
  // For demo purposes, we'll retrieve settings from localStorage
  const settingsStr = localStorage.getItem('popSettings');
  return settingsStr ? JSON.parse(settingsStr) : null;
};

export const savePopSettings = async (settings: PopSettings): Promise<void> => {
  // For demo purposes, we'll save settings to localStorage
  localStorage.setItem('popSettings', JSON.stringify(settings));
  // In a real app, you would send these settings to your backend
  return Promise.resolve();
};

export const testPopConnection = async (settings: PopSettings): Promise<{success: boolean, message?: string}> => {
  // This is a mock function, in a real application you would send a request to your backend
  // which would attempt to establish a connection with the POP3 server
  
  // Simulate a network delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Simulate success/failure based on the settings
  // For demo purposes, we'll assume the connection is successful if the host is not empty
  if (settings.host && settings.host.length > 0) {
    return { success: true };
  } else {
    return { success: false, message: "Не удалось установить соединение с сервером" };
  }
};
