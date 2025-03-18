
import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

export interface User {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  company?: string;
  role: 'admin' | 'user';
  status: 'active' | 'inactive';
  tariffId: string;
  isSubscriptionActive: boolean;
  subscriptionEndDate?: string;
  registeredAt: string;
  lastLogin?: string;
  avatar?: string;
  isInTrial?: boolean;
  storeCount?: number;
}

export interface SubscriptionData {
  isActive: boolean;
  tariffId: string;
  tariffName: string;
  startDate?: string;
  endDate?: string;
  daysLeft?: number;
}

export const TARIFF_STORE_LIMITS: Record<string, number> = {
  '1': 1,  // Базовый
  '2': 2,  // Профессиональный (изменено с 3 на 2)
  '3': 10, // Бизнес
  '4': 999 // Корпоративный
};

// Функция получения списка пользователей
export const getUsers = async (): Promise<User[]> => {
  try {
    const response = await axios.get(`${API_URL}/users`);
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw new Error('Failed to fetch users');
  }
};

// Получение пользователя по ID
export const getUser = async (id: string): Promise<User> => {
  try {
    const response = await axios.get(`${API_URL}/users/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw new Error('Failed to fetch user');
  }
};

// Добавление нового пользователя
export const addUser = async (userData: Partial<User>): Promise<User> => {
  try {
    const response = await axios.post(`${API_URL}/users`, userData);
    return response.data;
  } catch (error) {
    console.error('Error adding user:', error);
    throw new Error('Failed to add user');
  }
};

// Обновление данных пользователя
export const updateUser = async (id: string, userData: Partial<User>): Promise<User> => {
  try {
    const response = await axios.put(`${API_URL}/users/${id}`, userData);
    return response.data;
  } catch (error) {
    console.error('Error updating user:', error);
    throw new Error('Failed to update user');
  }
};

// Удаление пользователя
export const deleteUser = async (id: string): Promise<boolean> => {
  try {
    await axios.delete(`${API_URL}/users/${id}`);
    return true;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw new Error('Failed to delete user');
  }
};

// Аутентификация пользователя
export const authenticate = async (email: string, password: string): Promise<{ success: boolean; user?: User; errorMessage?: string }> => {
  try {
    console.log(`Authenticating user: ${email}`);
    
    // Отправляем запрос на сервер для авторизации
    const response = await axios.post(`${API_URL}/login`, { email, password });
    
    if (response.data && response.data.id) {
      // Получаем полные данные пользователя
      const userData = await getUser(response.data.id);
      
      // Обновляем дату последнего входа
      await updateUser(userData.id, {
        lastLogin: new Date().toISOString()
      });
      
      // Возвращаем успешный результат с данными пользователя
      return {
        success: true,
        user: userData
      };
    } else {
      return {
        success: false,
        errorMessage: 'Неверные учетные данные'
      };
    }
  } catch (error) {
    console.error('Error during authentication:', error);
    
    // Если сервер недоступен, используем моковую авторизацию для демо
    if (email === 'admin' && password === 'admin123') {
      // Создаем моковые данные администратора
      const mockAdminUser: User = {
        id: '1',
        email: 'admin@example.com',
        name: 'Администратор',
        role: 'admin',
        status: 'active',
        tariffId: '4',
        isSubscriptionActive: true,
        subscriptionEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        registeredAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      };
      
      return {
        success: true,
        user: mockAdminUser
      };
    } else if (email === 'user' && password === 'user123') {
      // Создаем моковые данные обычного пользователя
      const mockUser: User = {
        id: '2',
        email: 'user@example.com',
        name: 'Тестовый Пользователь',
        role: 'user',
        status: 'active',
        tariffId: '1',
        isSubscriptionActive: false,
        registeredAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      };
      
      return {
        success: true,
        user: mockUser
      };
    } else if (email === 'zerofy' && password === 'Zerofy2025') {
      // Создаем моковые данные для Zerofy
      const mockZerofyUser: User = {
        id: '3',
        email: 'zerofy@example.com',
        name: 'Zerofy Admin',
        role: 'admin',
        status: 'active',
        tariffId: '4',
        isSubscriptionActive: true,
        subscriptionEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        registeredAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      };
      
      return {
        success: true,
        user: mockZerofyUser
      };
    }
    
    return {
      success: false,
      errorMessage: 'Ошибка аутентификации'
    };
  }
};

// Получение данных о подписке пользователя
export const getUserSubscriptionData = async (userId: string): Promise<SubscriptionData> => {
  try {
    const response = await axios.get(`${API_URL}/user-subscription/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching subscription data:', error);
    
    // Возвращаем моковые данные, если сервер недоступен
    const user = await getUser(userId);
    return getSubscriptionStatus(user);
  }
};

// Активация подписки для пользователя
export const activateSubscription = async (
  userId: string, 
  tariffId: string, 
  months: number
): Promise<{ success: boolean; user?: User }> => {
  try {
    const response = await axios.post(`${API_URL}/activate-subscription`, {
      userId,
      tariffId,
      months
    });
    
    return {
      success: true,
      user: response.data
    };
  } catch (error) {
    console.error('Error activating subscription:', error);
    
    // Если сервер недоступен, имитируем успешную активацию
    try {
      const user = await getUser(userId);
      
      // Расчитываем новую дату окончания подписки
      const currentDate = new Date();
      let endDate = user.subscriptionEndDate ? new Date(user.subscriptionEndDate) : currentDate;
      
      // Если текущая подписка истекла, начинаем отсчет от текущей даты
      if (endDate < currentDate) {
        endDate = currentDate;
      }
      
      // Добавляем указанное количество месяцев
      endDate.setMonth(endDate.getMonth() + months);
      
      // Обновляем данные пользователя
      const updatedUser = await updateUser(userId, {
        tariffId,
        isSubscriptionActive: true,
        subscriptionEndDate: endDate.toISOString()
      });
      
      return {
        success: true,
        user: updatedUser
      };
    } catch (innerError) {
      console.error('Error in fallback activation:', innerError);
      throw new Error('Failed to activate subscription');
    }
  }
};

// Получение статуса подписки из данных пользователя
export const getSubscriptionStatus = (user: User): SubscriptionData => {
  let tariffName = 'Неизвестный';
  
  switch (user.tariffId) {
    case '1':
      tariffName = 'Базовый';
      break;
    case '2':
      tariffName = 'Профессиональный';
      break;
    case '3':
      tariffName = 'Бизнес';
      break;
    case '4':
      tariffName = 'Корпоративный';
      break;
  }
  
  let daysLeft = 0;
  
  if (user.subscriptionEndDate) {
    const endDate = new Date(user.subscriptionEndDate);
    const currentDate = new Date();
    
    const timeDiff = endDate.getTime() - currentDate.getTime();
    daysLeft = Math.max(0, Math.ceil(timeDiff / (1000 * 3600 * 24)));
  }
  
  return {
    isActive: user.isSubscriptionActive || false,
    tariffId: user.tariffId || '1',
    tariffName,
    startDate: user.registeredAt,
    endDate: user.subscriptionEndDate,
    daysLeft
  };
};

// Расчет оставшихся дней пробного периода
export const getTrialDaysRemaining = (user: User): number => {
  if (!user.isInTrial) return 0;
  
  const registrationDate = new Date(user.registeredAt);
  const currentDate = new Date();
  
  // Пробный период - 14 дней с момента регистрации
  const trialEndDate = new Date(registrationDate);
  trialEndDate.setDate(trialEndDate.getDate() + 14);
  
  // Если пробный период закончился, возвращаем 0
  if (currentDate > trialEndDate) return 0;
  
  // Иначе возвращаем количество оставшихся дней
  const timeDiff = trialEndDate.getTime() - currentDate.getTime();
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
};
