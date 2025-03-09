export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  phone?: string;
  company?: string;
  tariffId: string;
  isSubscriptionActive: boolean;
  subscriptionEndDate?: string;
  storeCount?: number;
  avatar?: string;
  isInTrial?: boolean;
  trialEndDate?: string;
  role?: 'admin' | 'user';
  status?: 'active' | 'inactive';
  registeredAt: string;
  lastLogin?: string;
}

export interface SubscriptionData {
  status: 'active' | 'trial' | 'expired';
  endDate?: string;
  daysRemaining?: number;
  tariffId?: string;
}

export interface PaymentHistoryItem {
  id: string;
  date: string;
  amount: number;
  description: string;
  status: string;
  tariff: string;
  period: string;
}

export interface SmtpSettings {
  host: string;
  port: number;
  secure: boolean;
  username: string;
  password: string;
  fromEmail: string;
  fromName: string;
}

export interface Pop3Settings {
  host: string;
  port: number;
  secure: boolean;
  username: string;
  password: string;
  leaveOnServer: boolean;
  autoCheckInterval: number;
}

export interface EmailSettings {
  smtp: SmtpSettings;
  pop3?: Pop3Settings;
}

export const TARIFF_STORE_LIMITS: Record<string, number> = {
  "1": 1,  // Стартовый
  "2": 3,  // Бизнес
  "3": 10, // Премиум
  "4": 999 // Корпоративный
};

export const getUsers = async (): Promise<User[]> => {
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
  
  const storedUsers = localStorage.getItem('users');
  if (storedUsers) {
    return JSON.parse(storedUsers);
  }
  
  const mockUsers: User[] = [
    {
      id: '1',
      name: 'Администратор',
      email: 'admin@example.com',
      tariffId: '3',
      isSubscriptionActive: true,
      subscriptionEndDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString(),
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
      role: 'admin',
      status: 'active',
      registeredAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      storeCount: 2
    },
    {
      id: '2',
      name: 'Иван Иванов',
      email: 'ivan@example.com',
      tariffId: '2',
      isSubscriptionActive: true,
      phone: '+7 (999) 123-45-67',
      company: 'ООО Компания',
      subscriptionEndDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString(),
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ivan',
      role: 'user',
      status: 'active',
      registeredAt: new Date(new Date().setMonth(new Date().getMonth() - 2)).toISOString(),
      lastLogin: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(),
      storeCount: 1
    },
    {
      id: '3',
      name: 'Мария Петрова',
      email: 'maria@example.com',
      tariffId: '1',
      isSubscriptionActive: false,
      isInTrial: true,
      trialEndDate: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString(),
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
      role: 'user',
      status: 'active',
      registeredAt: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(),
      storeCount: 1
    }
  ];
  
  localStorage.setItem('users', JSON.stringify(mockUsers));
  return mockUsers;
};

export const addUser = async (userData: Partial<User>): Promise<User> => {
  await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay
  
  const users = await getUsers();
  
  const newUser: User = {
    id: Date.now().toString(),
    name: userData.name || '',
    email: userData.email || '',
    tariffId: userData.tariffId || '1',
    isSubscriptionActive: userData.isSubscriptionActive || false,
    status: userData.status || 'active',
    role: userData.role || 'user',
    avatar: userData.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.name?.replace(/\s+/g, '') || 'user'}`,
    registeredAt: userData.registeredAt || new Date().toISOString(),
    storeCount: 0
  };
  
  const updatedUsers = [...users, newUser];
  localStorage.setItem('users', JSON.stringify(updatedUsers));
  
  return newUser;
};

export const updateUser = async (userId: string, userData: Partial<User>): Promise<User | null> => {
  await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay
  
  const users = await getUsers();
  const userIndex = users.findIndex(user => user.id === userId);
  
  if (userIndex === -1) return null;
  
  const updatedUser = { ...users[userIndex], ...userData };
  users[userIndex] = updatedUser;
  
  localStorage.setItem('users', JSON.stringify(users));
  
  return updatedUser;
};

export const authenticate = async (
  email: string, 
  password: string
): Promise<{ success: boolean; user?: User; errorMessage?: string }> => {
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
  
  if (email === 'admin' && password === 'admin') {
    const users = await getUsers();
    const adminUser = users.find(user => user.role === 'admin') || users[0];
    
    if (adminUser) {
      adminUser.lastLogin = new Date().toISOString();
      await updateUser(adminUser.id, { lastLogin: adminUser.lastLogin });
      
      return { 
        success: true,
        user: adminUser
      };
    }
  }
  
  const users = await getUsers();
  const user = users.find(u => u.email === email);
  
  if (user && (password === 'password' || password === user.password)) {
    user.lastLogin = new Date().toISOString();
    await updateUser(user.id, { lastLogin: user.lastLogin });
    
    return { 
      success: true,
      user
    };
  }
  
  return { 
    success: false,
    errorMessage: 'Неверный логин или пароль'
  };
};

export const registerUser = async (
  name: string, 
  email: string, 
  password: string
): Promise<{ success: boolean; user?: User; errorMessage?: string }> => {
  await new Promise(resolve => setTimeout(resolve, 1200)); // Simulate network delay
  
  const users = await getUsers();
  const userExists = users.some(user => user.email === email);
  
  if (userExists) {
    return {
      success: false,
      errorMessage: 'Пользователь с таким email уже существует'
    };
  }
  
  const newUser: User = {
    id: Date.now().toString(),
    name,
    email,
    password,
    tariffId: '3',
    isSubscriptionActive: false,
    isInTrial: true,
    trialEndDate: new Date(new Date().setDate(new Date().getDate() + 3)).toISOString(),
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name.replace(/\s+/g, '')}`,
    role: 'user',
    status: 'active',
    registeredAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
    storeCount: 0
  };
  
  users.push(newUser);
  localStorage.setItem('users', JSON.stringify(users));
  
  return {
    success: true,
    user: newUser
  };
};

export const activateSubscription = async (
  userId: string, 
  tariffId: string, 
  months: number = 1
): Promise<{ success: boolean; user?: User; message?: string }> => {
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
  
  const users = await getUsers();
  const userIndex = users.findIndex(user => user.id === userId);
  
  if (userIndex === -1) {
    return { success: false, message: "Пользователь не найден" };
  }
  
  const user = users[userIndex];
  
  const currentDate = new Date();
  let endDate = new Date();
  
  if (user.isSubscriptionActive && user.subscriptionEndDate && user.tariffId === tariffId) {
    const existingEndDate = new Date(user.subscriptionEndDate);
    if (existingEndDate > currentDate) {
      endDate = new Date(existingEndDate);
    }
  }
  
  endDate.setMonth(endDate.getMonth() + months);
  
  const updatedUser: User = {
    ...user,
    tariffId,
    isSubscriptionActive: true,
    isInTrial: false,
    trialEndDate: undefined,
    subscriptionEndDate: endDate.toISOString()
  };
  
  users[userIndex] = updatedUser;
  localStorage.setItem('users', JSON.stringify(users));
  
  return { 
    success: true, 
    user: updatedUser,
    message: `Подписка активирована до ${endDate.toLocaleDateString()}`
  };
};

export const getSmtpSettings = async (): Promise<EmailSettings | null> => {
  await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
  
  const storedSettings = localStorage.getItem('email_settings');
  if (storedSettings) {
    return JSON.parse(storedSettings);
  }
  
  const defaultSettings: EmailSettings = {
    smtp: {
      host: "smtp.gmail.com",
      port: 587,
      secure: true,
      username: "",
      password: "",
      fromEmail: "",
      fromName: "Zerofy System"
    },
    pop3: {
      host: "pop.gmail.com",
      port: 995,
      secure: true,
      username: "",
      password: "",
      leaveOnServer: true,
      autoCheckInterval: 15
    }
  };
  
  return defaultSettings;
};

export const saveSmtpSettings = async (settings: EmailSettings): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
  
  localStorage.setItem('email_settings', JSON.stringify(settings));
};

export const testSmtpConnection = async (settings: SmtpSettings): Promise<{ success: boolean; message: string }> => {
  await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
  
  try {
    console.log("Testing SMTP connection with settings:", settings);
    
    // Validation of required fields
    if (!settings.host) {
      return { success: false, message: "Неверный хост SMTP-сервера" };
    }
    
    if (!settings.port || settings.port <= 0) {
      return { success: false, message: "Неверный порт SMTP-сервера" };
    }
    
    if (!settings.username) {
      return { success: false, message: "Имя пользователя SMTP-сервера не указано" };
    }
    
    if (!settings.password) {
      return { success: false, message: "Пароль SMTP-сервера не указан" };
    }
    
    if (!settings.fromEmail) {
      return { success: false, message: "Email отправителя не указан" };
    }
    
    // In a real application, we would actually test the connection
    // For this demo, we'll simulate a successful connection only with specific credentials
    // or simulate failures for common issues
    
    // For demo purposes: Simulate a failed connection with specific error messages
    if (settings.host === "smtp.gmail.com" && settings.password === "wrongpassword") {
      return { 
        success: false, 
        message: "Ошибка аутентификации: неверное имя пользователя или пароль" 
      };
    }
    
    if (settings.host === "mail.qr-falcon.kg" && settings.password !== "Ik507727280$@") {
      return { 
        success: false, 
        message: "Ошибка аутентификации: неверное имя пользователя или пароль" 
      };
    }
    
    // Common validation for email providers
    if (settings.host.includes('gmail.com')) {
      if (settings.secure && settings.port !== 465) {
        return { 
          success: false, 
          message: "Для защищенного соединения с Gmail рекомендуется использовать порт 465" 
        };
      } else if (!settings.secure && settings.port !== 587) {
        return { 
          success: false, 
          message: "Для незащищенного соединения с Gmail рекомендуется использовать порт 587" 
        };
      }
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(settings.fromEmail)) {
      return { 
        success: false, 
        message: "Неверный формат email отправителя" 
      };
    }
    
    return { success: true, message: "Соединение успешно установлено" };
  } catch (error) {
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "Неизвестная ошибка при подключении к SMTP-серверу" 
    };
  }
};

export const testPop3Connection = async (settings: Pop3Settings): Promise<{ success: boolean; message: string }> => {
  await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
  
  try {
    console.log("Testing POP3 connection with settings:", settings);
    
    // Validation of required fields
    if (!settings.host) {
      return { success: false, message: "Неверный хост POP3-сервера" };
    }
    
    if (!settings.port || settings.port <= 0) {
      return { success: false, message: "Неверный порт POP3-сервера" };
    }
    
    if (!settings.username) {
      return { success: false, message: "Имя пользователя POP3-сервера не указано" };
    }
    
    if (!settings.password) {
      return { success: false, message: "Пароль POP3-сервера не указан" };
    }
    
    // Simulate a failed connection with specific error message for wrong password
    if (settings.host === "pop.gmail.com" && settings.password === "wrongpassword") {
      return { 
        success: false, 
        message: "Ошибка аутентификации: неверное имя пользователя или пароль" 
      };
    }
    
    if (settings.host === "mail.qr-falcon.kg" && settings.password !== "Ik507727280$@") {
      return { 
        success: false, 
        message: "Ошибка аутентификации: неверное имя пользователя или пароль" 
      };
    }
    
    return { success: true, message: "Соединение успешно установлено" };
  } catch (error) {
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "Неизвестная ошибка при подключении к POP3-серверу" 
    };
  }
};

export const sendEmail = async (
  to: string,
  subject: string,
  htmlContent: string
): Promise<{ success: boolean; message: string }> => {
  await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay
  
  try {
    const emailSettings = await getSmtpSettings();
    if (!emailSettings || !emailSettings.smtp) {
      return { success: false, message: "SMTP настройки не найдены" };
    }
    
    const smtpSettings = emailSettings.smtp;
    
    // Validate that SMTP settings are complete
    if (!smtpSettings.host || !smtpSettings.username || !smtpSettings.password || !smtpSettings.fromEmail) {
      return { success: false, message: "SMTP настройки неполные" };
    }
    
    console.log(`
      Sending email:
      From: ${smtpSettings.fromName} <${smtpSettings.fromEmail}>
      To: ${to}
      Subject: ${subject}
      Content: ${htmlContent}
      Using SMTP server: ${smtpSettings.host}:${smtpSettings.port}
    `);
    
    // In a real application, we would actually send the email
    // For our demo, simulate the result based on the settings
    
    // Simulate a failure for specific email domains or hosts
    if (smtpSettings.host.includes('invalid') || to.includes('invalid')) {
      return { 
        success: false, 
        message: "Не удалось отправить email: недействительный домен" 
      };
    }
    
    // For demo, only simulate successful sending to certain domains to match our test credentials
    if ((smtpSettings.host === "mail.qr-falcon.kg" && smtpSettings.password === "Ik507727280$@") ||
        (smtpSettings.host !== "mail.qr-falcon.kg")) {
      return { success: true, message: "Email отправлен успешно" };
    } else {
      return { 
        success: false, 
        message: "Ошибка отправки email: проверьте настройки SMTP и учетные данные" 
      };
    }
  } catch (error) {
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "Неизвестная ошибка при отправке email" 
    };
  }
};

export const requestPasswordReset = async (
  email: string
): Promise<{ success: boolean; message: string }> => {
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
  
  const users = await getUsers();
  const user = users.find(u => u.email === email);
  
  if (!user) {
    return { 
      success: true, 
      message: "Если указанный email зарегистрирован в системе, инструкции по восстановлению пароля будут отправлены на него."
    };
  }
  
  const resetToken = Math.random().toString(36).substring(2, 15);
  const resetExpiry = new Date(new Date().getTime() + 60 * 60 * 1000); // 1 hour
  
  localStorage.setItem(`reset_token_${user.id}`, JSON.stringify({
    token: resetToken,
    expiry: resetExpiry.toISOString()
  }));
  
  const resetUrl = `?resetToken=${resetToken}&resetEmail=${encodeURIComponent(email)}`;
  
  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
      <h2 style="color: #333; text-align: center;">Восстановление пароля</h2>
      <p>Здравствуйте!</p>
      <p>Вы запросили сброс пароля для вашей учетной записи в системе Zerofy. Пожалуйста, перейдите по ссылке ниже для создания нового пароля:</p>
      <div style="text-align: center; margin: 20px 0;">
        <a href="${resetUrl}" style="background-color: #4a6cf7; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Сбросить пароль</a>
      </div>
      <p>Ссылка действительна в течение 1 часа. Если вы не запрашивали сброс пароля, проигнорируйте это сообщение.</p>
      <p>С уважением,<br>Команда Zerofy</p>
    </div>
  `;
  
  try {
    const emailResult = await sendEmail(
      email,
      "Восстановление пароля",
      emailHtml
    );
    
    console.log(`Password reset link for ${email}: ${resetUrl}`);
    
    if (!emailResult.success) {
      console.error(`Failed to send reset email: ${emailResult.message}`);
    }
  } catch (error) {
    console.error("Error sending reset email:", error);
  }
  
  return { 
    success: true, 
    message: "Если указанный email зарегистрирован в системе, инструкции по восстановлению пароля будут отправлены на него."
  };
};

export const resetPassword = async (
  email: string,
  token: string,
  newPassword: string
): Promise<{ success: boolean; message: string }> => {
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
  
  const users = await getUsers();
  const userIndex = users.findIndex(u => u.email === email);
  
  if (userIndex === -1) {
    return { success: false, message: "Неверные данные для сброса пароля" };
  }
  
  const user = users[userIndex];
  
  const storedResetData = localStorage.getItem(`reset_token_${user.id}`);
  
  if (!storedResetData) {
    return { success: false, message: "Срок действия ссылки для сброса пароля истек" };
  }
  
  const resetData = JSON.parse(storedResetData);
  const now = new Date();
  const expiry = new Date(resetData.expiry);
  
  if (now > expiry || resetData.token !== token) {
    return { success: false, message: "Срок действия ссылки для сброса пароля истек" };
  }
  
  users[userIndex] = {
    ...user,
    password: newPassword
  };
  
  localStorage.setItem('users', JSON.stringify(users));
  
  localStorage.removeItem(`reset_token_${user.id}`);
  
  return { 
    success: true, 
    message: "Пароль успешно сброшен. Теперь вы можете войти в систему, используя новый пароль." 
  };
};

export const getTrialDaysRemaining = (user: User): number => {
  if (!user.isInTrial || !user.trialEndDate) {
    return 0;
  }
  
  const trialEnd = new Date(user.trialEndDate);
  const today = new Date();
  
  const diffTime = trialEnd.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return Math.max(0, diffDays);
};

export const getSubscriptionStatus = (user: User): SubscriptionData => {
  if (user.isInTrial) {
    return {
      status: 'trial',
      endDate: user.trialEndDate,
      daysRemaining: getTrialDaysRemaining(user),
      tariffId: '3'
    };
  }
  
  if (user.isSubscriptionActive) {
    const today = new Date();
    const endDate = user.subscriptionEndDate ? new Date(user.subscriptionEndDate) : null;
    const daysRemaining = endDate 
      ? Math.max(0, Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))) 
      : 0;
    
    return {
      status: 'active',
      endDate: user.subscriptionEndDate,
      daysRemaining,
      tariffId: user.tariffId
    };
  }
  
  return { 
    status: 'expired',
    endDate: user.subscriptionEndDate,
    tariffId: user.tariffId
  };
};

export const getPaymentHistory = async (userId: string): Promise<PaymentHistoryItem[]> => {
  await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay
  
  const storedHistory = localStorage.getItem(`payment_history_${userId}`);
  if (storedHistory) {
    return JSON.parse(storedHistory);
  }
  
  const mockHistory: PaymentHistoryItem[] = [
    {
      id: '1',
      date: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString(),
      amount: 5000,
      description: 'Оплата подписки',
      status: 'success',
      tariff: '2',
      period: '1'
    },
    {
      id: '2',
      date: new Date().toISOString(),
      amount: 5000,
      description: 'Продление подписки',
      status: 'success',
      tariff: '2',
      period: '1'
    }
  ];
  
  localStorage.setItem(`payment_history_${userId}`, JSON.stringify(mockHistory));
  return mockHistory;
};

export const addPaymentRecord = async (
  userId: string,
  tariff: string,
  amount: number,
  months: number
): Promise<PaymentHistoryItem> => {
  await new Promise(resolve => setTimeout(resolve, 600)); // Simulate network delay
  
  const newPayment: PaymentHistoryItem = {
    id: Date.now().toString(),
    date: new Date().toISOString(),
    amount,
    description: 'Оплата подписки',
    status: 'success',
    tariff,
    period: months.toString()
  };
  
  const history = await getPaymentHistory(userId);
  const updatedHistory = [newPayment, ...history];
  
  localStorage.setItem(`payment_history_${userId}`, JSON.stringify(updatedHistory));
  
  return newPayment;
};

export const getUserSubscriptionData = async (userId: string): Promise<SubscriptionData> => {
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
  
  const storedUsers = localStorage.getItem('users');
  if (!storedUsers) {
    return { status: 'expired' };
  }
  
  const users: User[] = JSON.parse(storedUsers);
  const user = users.find(u => u.id === userId);
  
  if (!user) {
    return { status: 'expired' };
  }
  
  return getSubscriptionStatus(user);
};

export const changePassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; message?: string }> => {
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
  
  const users = await getUsers();
  const userIndex = users.findIndex(user => user.id === userId);
  
  if (userIndex === -1) {
    return { success: false, message: "Пользователь не найден" };
  }
  
  const user = users[userIndex];
  
  // Check if the current password is correct (for admin)
  if (user.role === 'admin' && currentPassword === 'admin') {
    // Admin user with default 'admin' password
    user.password = newPassword;
    users[userIndex] = user;
    localStorage.setItem('users', JSON.stringify(users));
    
    // Also update the logged-in user data in localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const loggedInUser = JSON.parse(storedUser);
      if (loggedInUser.id === userId) {
        loggedInUser.password = newPassword;
        localStorage.setItem('user', JSON.stringify(loggedInUser));
      }
    }
    
    return { success: true };
  } else if (user.password && user.password === currentPassword) {
    // Regular user with matching stored password
    user.password = newPassword;
    users[userIndex] = user;
    localStorage.setItem('users', JSON.stringify(users));
    
    // Also update the logged-in user data in localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const loggedInUser = JSON.parse(storedUser);
      if (loggedInUser.id === userId) {
        loggedInUser.password = newPassword;
        localStorage.setItem('user', JSON.stringify(loggedInUser));
      }
    }
    
    return { success: true };
  } else {
    return { success: false, message: "Неверный текущий пароль" };
  }
};

export { 
  TARIFF_STORE_LIMITS, 
  requestPasswordReset, 
  resetPassword, 
  getTrialDaysRemaining, 
  getSubscriptionStatus, 
  getPaymentHistory, 
  addPaymentRecord, 
  getUserSubscriptionData 
};

export type { User, SubscriptionData, PaymentHistoryItem };
