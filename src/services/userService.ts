
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
  isActive: boolean;
  daysRemaining: number;
  endDate?: string;
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

export const TARIFF_STORE_LIMITS: Record<string, number> = {
  "1": 1,  // Стартовый
  "2": 3,  // Бизнес
  "3": 10, // Премиум
  "4": 999 // Корпоративный
};

// Get users from localStorage or return mock data if empty
export const getUsers = async (): Promise<User[]> => {
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
  
  const storedUsers = localStorage.getItem('users');
  if (storedUsers) {
    return JSON.parse(storedUsers);
  }
  
  // Return mock users if no data in localStorage
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
  
  // For demo purposes, allow "admin" email and password
  if (email === 'admin' && password === 'admin') {
    const users = await getUsers();
    const adminUser = users.find(user => user.role === 'admin') || users[0];
    
    if (adminUser) {
      // Update lastLogin
      adminUser.lastLogin = new Date().toISOString();
      await updateUser(adminUser.id, { lastLogin: adminUser.lastLogin });
      
      return { 
        success: true,
        user: adminUser
      };
    }
  }
  
  // Check for users in localStorage
  const users = await getUsers();
  const user = users.find(u => u.email === email);
  
  if (user && (password === 'password' || password === user.password)) {
    // Update lastLogin
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
  
  // Check if user already exists
  const users = await getUsers();
  const userExists = users.some(user => user.email === email);
  
  if (userExists) {
    return {
      success: false,
      errorMessage: 'Пользователь с таким email уже существует'
    };
  }
  
  // Create new user with trial period
  const newUser: User = {
    id: Date.now().toString(),
    name,
    email,
    password,
    tariffId: '1', // Start with basic plan
    isSubscriptionActive: false,
    isInTrial: true,
    trialEndDate: new Date(new Date().setDate(new Date().getDate() + 14)).toISOString(), // 14 days trial
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name.replace(/\s+/g, '')}`,
    role: 'user',
    status: 'active',
    registeredAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
    storeCount: 0
  };
  
  // Add to users
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
  
  // Calculate new subscription end date
  const currentDate = new Date();
  const endDate = new Date();
  
  // If user has an active subscription, extend it
  if (user.isSubscriptionActive && user.subscriptionEndDate) {
    const existingEndDate = new Date(user.subscriptionEndDate);
    if (existingEndDate > currentDate) {
      endDate.setTime(existingEndDate.getTime());
    }
  }
  
  // Add months to end date
  endDate.setMonth(endDate.getMonth() + months);
  
  // Update user subscription
  const updatedUser: User = {
    ...user,
    tariffId,
    isSubscriptionActive: true,
    isInTrial: false, // End trial if active
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

export const changePassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; message?: string }> => {
  // In a real application, this would be an API call
  // For now, we'll simulate success with a mock implementation
  
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
  
  // Get the user from localStorage
  const storedUser = localStorage.getItem('user');
  if (!storedUser) {
    return { success: false, message: "Пользователь не найден" };
  }
  
  const user = JSON.parse(storedUser);
  
  // Mock password check (in a real app, this would be a proper authentication check)
  if (user.id !== userId) {
    return { success: false, message: "Пользователь не найден" };
  }
  
  // In a real app, we'd have a proper password verification
  // Here we're just simulating it
  if (currentPassword !== 'current-password' && currentPassword !== user.password) {
    return { success: false, message: "Неверный текущий пароль" };
  }
  
  // Update the password
  user.password = newPassword;
  
  // Save back to localStorage
  localStorage.setItem('user', JSON.stringify(user));
  
  return { success: true };
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

export const getSubscriptionStatus = (user: User): 'active' | 'trial' | 'expired' => {
  if (user.isInTrial) {
    return 'trial';
  }
  
  if (user.isSubscriptionActive) {
    return 'active';
  }
  
  return 'expired';
};

export const getPaymentHistory = async (userId: string): Promise<PaymentHistoryItem[]> => {
  await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay
  
  // Try to get payment history from localStorage
  const storedHistory = localStorage.getItem(`payment_history_${userId}`);
  if (storedHistory) {
    return JSON.parse(storedHistory);
  }
  
  // Create mock payment history
  const mockHistory: PaymentHistoryItem[] = [
    {
      id: '1',
      date: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString(),
      amount: 5000,
      description: 'Оплата подписки',
      status: 'success',
      tariff: 'Бизнес',
      period: '1 месяц'
    },
    {
      id: '2',
      date: new Date().toISOString(),
      amount: 5000,
      description: 'Продление подписки',
      status: 'success',
      tariff: 'Бизнес',
      period: '1 месяц'
    }
  ];
  
  localStorage.setItem(`payment_history_${userId}`, JSON.stringify(mockHistory));
  return mockHistory;
};

export const addPaymentRecord = async (
  userId: string,
  tariffId: string,
  amount: number,
  months: number
): Promise<PaymentHistoryItem> => {
  await new Promise(resolve => setTimeout(resolve, 600)); // Simulate network delay
  
  const tariffNames: Record<string, string> = {
    '1': 'Стартовый',
    '2': 'Бизнес',
    '3': 'Премиум',
    '4': 'Корпоративный'
  };
  
  const newPayment: PaymentHistoryItem = {
    id: Date.now().toString(),
    date: new Date().toISOString(),
    amount,
    description: 'Оплата подписки',
    status: 'success',
    tariff: tariffNames[tariffId] || `Тариф ${tariffId}`,
    period: `${months} ${months === 1 ? 'месяц' : months < 5 ? 'месяца' : 'месяцев'}`
  };
  
  // Get existing payment history
  const history = await getPaymentHistory(userId);
  const updatedHistory = [newPayment, ...history];
  
  // Save updated history
  localStorage.setItem(`payment_history_${userId}`, JSON.stringify(updatedHistory));
  
  return newPayment;
};
