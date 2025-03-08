
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  status: 'active' | 'inactive';
  registeredAt: string;
  lastLogin?: string;
  avatar?: string;
  tariffId?: string;
  storeCount?: number;
  trialEndDate?: string;
  isInTrial?: boolean;
  subscriptionEndDate?: string;
  isSubscriptionActive?: boolean;
  phone?: string; // Add phone field to the User interface
  company?: string; // Add company field to the User interface
}

const mockUsers: User[] = [
  {
    id: '1',
    name: 'Александр Иванов',
    email: 'alex@example.com',
    role: 'admin',
    status: 'active',
    registeredAt: '2023-02-15T08:30:00Z',
    lastLogin: '2023-06-28T14:22:10Z',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    tariffId: '3',
    storeCount: 2,
    isInTrial: false,
    isSubscriptionActive: true,
    subscriptionEndDate: '2024-12-31T23:59:59Z'
  },
  {
    id: '2',
    name: 'Екатерина Смирнова',
    email: 'kate@example.com',
    role: 'user',
    status: 'active',
    registeredAt: '2023-03-21T11:45:00Z',
    lastLogin: '2023-06-25T09:15:30Z',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kate',
    tariffId: '2',
    storeCount: 1,
    isInTrial: false,
    isSubscriptionActive: true,
    subscriptionEndDate: '2024-10-25T23:59:59Z'
  },
  {
    id: '3',
    name: 'Михаил Петров',
    email: 'michael@example.com',
    role: 'user',
    status: 'inactive',
    registeredAt: '2023-04-10T15:20:00Z',
    lastLogin: '2023-05-17T16:40:12Z',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
    tariffId: '1',
    storeCount: 1,
    isInTrial: false,
    isSubscriptionActive: false
  },
  {
    id: '4',
    name: 'Анна Козлова',
    email: 'anna@example.com',
    role: 'user',
    status: 'active',
    registeredAt: '2023-05-05T09:10:00Z',
    lastLogin: '2023-06-27T12:35:45Z',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Anna',
    tariffId: '2',
    storeCount: 2,
    isInTrial: false,
    isSubscriptionActive: true,
    subscriptionEndDate: '2024-11-05T23:59:59Z'
  },
  {
    id: '5',
    name: 'Дмитрий Соколов',
    email: 'dmitry@example.com',
    role: 'user',
    status: 'active',
    registeredAt: '2023-05-28T14:30:00Z',
    lastLogin: '2023-06-26T18:50:22Z',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dmitry',
    tariffId: '1',
    storeCount: 0,
    isInTrial: false,
    isSubscriptionActive: false
  }
];

export const TARIFF_STORE_LIMITS: Record<string, number> = {
  '1': 1,
  '2': 3,
  '3': 10,
  '4': 999
};

const DEFAULT_TARIFF_ID = '1';

const calculateTrialEndDate = (): string => {
  const trialEndDate = new Date();
  trialEndDate.setDate(trialEndDate.getDate() + 3);
  return trialEndDate.toISOString();
};

const calculateSubscriptionEndDate = (months: number = 1): string => {
  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + months);
  return endDate.toISOString();
};

const isUserInTrial = (trialEndDate?: string): boolean => {
  if (!trialEndDate) return false;
  const now = new Date();
  const endDate = new Date(trialEndDate);
  return now < endDate;
};

const isSubscriptionActive = (subscriptionEndDate?: string): boolean => {
  if (!subscriptionEndDate) return false;
  const now = new Date();
  const endDate = new Date(subscriptionEndDate);
  return now < endDate;
};

const initializeUsers = () => {
  const storedUsers = localStorage.getItem('mockUsers');
  if (!storedUsers) {
    localStorage.setItem('mockUsers', JSON.stringify(mockUsers));
    return [...mockUsers];
  }
  return JSON.parse(storedUsers);
};

let users = initializeUsers();

const saveUsers = () => {
  localStorage.setItem('mockUsers', JSON.stringify(users));
};

const ADMIN_CREDENTIALS = {
  email: 'admin',
  password: 'admin'
};

export const authenticate = (email: string, password: string): Promise<{ success: boolean; user?: User; errorMessage?: string }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
        let adminUser = users.find(u => u.email === 'admin@admin.com');
        
        if (!adminUser) {
          adminUser = {
            id: '0',
            name: 'Администратор',
            email: 'admin@admin.com',
            role: 'admin',
            status: 'active',
            registeredAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin'
          };
          users.unshift(adminUser);
          saveUsers();
        } else {
          adminUser.lastLogin = new Date().toISOString();
          saveUsers();
        }
        
        resolve({ 
          success: true, 
          user: adminUser 
        });
        return;
      }
      
      const user = users.find(u => u.email === email);
      if (user) {
        user.lastLogin = new Date().toISOString();
        saveUsers();
        resolve({ 
          success: true, 
          user 
        });
        return;
      }
      
      resolve({ 
        success: false, 
        errorMessage: 'Неверный логин или пароль' 
      });
    }, 500);
  });
};

export const registerUser = (name: string, email: string, password: string): Promise<{ success: boolean; user?: User; errorMessage?: string }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const existingUser = users.find(u => u.email === email);
      if (existingUser) {
        resolve({
          success: false,
          errorMessage: 'Пользователь с таким email уже существует'
        });
        return;
      }

      const trialEndDate = calculateTrialEndDate();
      
      const newUser: User = {
        id: String(Date.now()),
        name,
        email,
        role: 'user',
        status: 'active',
        registeredAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name.replace(/\s/g, '')}`,
        tariffId: DEFAULT_TARIFF_ID,
        storeCount: 0,
        trialEndDate: trialEndDate,
        isInTrial: true,
        isSubscriptionActive: false
      };

      users.push(newUser);
      saveUsers();

      resolve({
        success: true,
        user: newUser
      });
    }, 800);
  });
};

const updateUsersTrialAndSubscriptionStatus = (usersList: User[]): User[] => {
  return usersList.map(user => {
    if (user.trialEndDate) {
      user.isInTrial = isUserInTrial(user.trialEndDate);
    }
    
    if (user.subscriptionEndDate) {
      user.isSubscriptionActive = isSubscriptionActive(user.subscriptionEndDate);
      
      if (!user.isSubscriptionActive) {
        user.tariffId = DEFAULT_TARIFF_ID;
      }
    }
    
    return user;
  });
};

export const getUsers = (): Promise<User[]> => {
  return new Promise((resolve) => {
    users = JSON.parse(localStorage.getItem('mockUsers') || JSON.stringify(users));
    
    const updatedUsers = updateUsersTrialAndSubscriptionStatus([...users]);
    
    users = updatedUsers;
    saveUsers();
    
    setTimeout(() => {
      resolve([...users]);
    }, 500);
  });
};

export const getUserById = (id: string): Promise<User | undefined> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const user = users.find(user => user.id === id);
      resolve(user ? {...user} : undefined);
    }, 300);
  });
};

export const updateUser = (id: string, updates: Partial<User>): Promise<User | undefined> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = users.findIndex(user => user.id === id);
      if (index !== -1) {
        if (updates.isSubscriptionActive && users[index].isInTrial) {
          updates.isInTrial = false;
          updates.trialEndDate = undefined;
        }
        
        users[index] = { ...users[index], ...updates };
        saveUsers();
        resolve({...users[index]});
      } else {
        resolve(undefined);
      }
    }, 500);
  });
};

export const addUser = (user: Omit<User, 'id'>): Promise<User> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newUser = {
        ...user,
        id: String(Date.now()),
        registeredAt: user.registeredAt || new Date().toISOString()
      };
      users.push(newUser);
      saveUsers();
      resolve({...newUser});
    }, 500);
  });
};

export const deleteUser = (id: string): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = users.findIndex(user => user.id === id);
      if (index !== -1) {
        users.splice(index, 1);
        saveUsers();
        resolve(true);
      } else {
        resolve(false);
      }
    }, 500);
  });
};

export const canAddStore = (userId: string): Promise<{allowed: boolean; message?: string}> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const user = users.find(u => u.id === userId);
      
      if (!user) {
        resolve({
          allowed: false,
          message: "Пользователь не найден"
        });
        return;
      }
      
      const tariffLimit = user.tariffId ? TARIFF_STORE_LIMITS[user.tariffId] : 0;
      const currentStoreCount = user.storeCount || 0;
      
      if (currentStoreCount >= tariffLimit) {
        resolve({
          allowed: false,
          message: `Достигнут лимит магазинов для вашего тарифа (${tariffLimit}). Пожалуйста, обновите ваш тарифный план.`
        });
      } else {
        resolve({
          allowed: true
        });
      }
    }, 300);
  });
};

export const incrementStoreCount = (userId: string): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const userIndex = users.findIndex(u => u.id === userId);
      if (userIndex === -1) {
        resolve(false);
        return;
      }
      
      users[userIndex] = {
        ...users[userIndex],
        storeCount: (users[userIndex].storeCount || 0) + 1
      };
      
      saveUsers();
      resolve(true);
    }, 300);
  });
};

export const getTrialDaysRemaining = (userId: string): Promise<number> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const user = users.find(u => u.id === userId);
      
      if (!user || !user.trialEndDate) {
        resolve(0);
        return;
      }
      
      const now = new Date();
      const endDate = new Date(user.trialEndDate);
      
      if (now > endDate) {
        resolve(0);
        return;
      }
      
      const timeDiff = endDate.getTime() - now.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
      
      resolve(daysDiff);
    }, 300);
  });
};

export const activateSubscription = (
  userId: string, 
  tariffId: string, 
  months: number = 1
): Promise<{success: boolean; user?: User; message?: string}> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const userIndex = users.findIndex(u => u.id === userId);
      
      if (userIndex === -1) {
        resolve({
          success: false,
          message: "Пользователь не найден"
        });
        return;
      }
      
      const subscriptionEndDate = calculateSubscriptionEndDate(months);
      
      users[userIndex] = {
        ...users[userIndex],
        tariffId,
        isInTrial: false,
        trialEndDate: undefined,
        isSubscriptionActive: true,
        subscriptionEndDate
      };
      
      saveUsers();
      
      resolve({
        success: true,
        user: {...users[userIndex]},
        message: `Подписка активирована до ${new Date(subscriptionEndDate).toLocaleDateString('ru-RU')}`
      });
    }, 500);
  });
};

export const getSubscriptionStatus = (userId: string): Promise<{
  isActive: boolean;
  daysRemaining: number;
  endDate?: string;
  tariffId?: string;
}> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const user = users.find(u => u.id === userId);
      
      if (!user || !user.subscriptionEndDate) {
        resolve({
          isActive: false,
          daysRemaining: 0
        });
        return;
      }
      
      const now = new Date();
      const endDate = new Date(user.subscriptionEndDate);
      const isActive = now < endDate;
      
      let daysRemaining = 0;
      if (isActive) {
        const timeDiff = endDate.getTime() - now.getTime();
        daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));
      }
      
      resolve({
        isActive,
        daysRemaining,
        endDate: user.subscriptionEndDate,
        tariffId: user.tariffId
      });
    }, 300);
  });
};

export const renewSubscription = (
  userId: string, 
  months: number = 1
): Promise<{success: boolean; user?: User; message?: string}> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const userIndex = users.findIndex(u => u.id === userId);
      
      if (userIndex === -1) {
        resolve({
          success: false,
          message: "Пользователь не найден"
        });
        return;
      }
      
      const subscriptionEndDate = calculateSubscriptionEndDate(months);
      
      users[userIndex] = {
        ...users[userIndex],
        isSubscriptionActive: true,
        subscriptionEndDate
      };
      
      saveUsers();
      
      resolve({
        success: true,
        user: {...users[userIndex]},
        message: `Подписка продлена до ${new Date(subscriptionEndDate).toLocaleDateString('ru-RU')}`
      });
    }, 500);
  });
};
