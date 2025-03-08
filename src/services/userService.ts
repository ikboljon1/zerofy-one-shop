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
}

export const TARIFF_STORE_LIMITS: Record<string, number> = {
  "1": 1,  // Стартовый
  "2": 3,  // Бизнес
  "3": 10, // Премиум
  "4": 999 // Корпоративный
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
