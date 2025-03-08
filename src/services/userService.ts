
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  status: 'active' | 'inactive';
  registeredAt: string;
  lastLogin?: string;
  avatar?: string;
}

// Mock data for users
const mockUsers: User[] = [
  {
    id: '1',
    name: 'Александр Иванов',
    email: 'alex@example.com',
    role: 'admin',
    status: 'active',
    registeredAt: '2023-02-15T08:30:00Z',
    lastLogin: '2023-06-28T14:22:10Z',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex'
  },
  {
    id: '2',
    name: 'Екатерина Смирнова',
    email: 'kate@example.com',
    role: 'user',
    status: 'active',
    registeredAt: '2023-03-21T11:45:00Z',
    lastLogin: '2023-06-25T09:15:30Z',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Kate'
  },
  {
    id: '3',
    name: 'Михаил Петров',
    email: 'michael@example.com',
    role: 'user',
    status: 'inactive',
    registeredAt: '2023-04-10T15:20:00Z',
    lastLogin: '2023-05-17T16:40:12Z',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael'
  },
  {
    id: '4',
    name: 'Анна Козлова',
    email: 'anna@example.com',
    role: 'user',
    status: 'active',
    registeredAt: '2023-05-05T09:10:00Z',
    lastLogin: '2023-06-27T12:35:45Z',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Anna'
  },
  {
    id: '5',
    name: 'Дмитрий Соколов',
    email: 'dmitry@example.com',
    role: 'user',
    status: 'active',
    registeredAt: '2023-05-28T14:30:00Z',
    lastLogin: '2023-06-26T18:50:22Z',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dmitry'
  }
];

// Mock admin credentials
const ADMIN_CREDENTIALS = {
  email: 'admin',
  password: 'admin'
};

// Function to authenticate a user login
export const authenticate = (email: string, password: string): Promise<{ success: boolean; user?: User; errorMessage?: string }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Check if admin credentials
      if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
        // Create admin user if not exists
        let adminUser = mockUsers.find(u => u.email === 'admin@admin.com');
        
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
          mockUsers.unshift(adminUser);
        } else {
          // Update last login
          adminUser.lastLogin = new Date().toISOString();
        }
        
        resolve({ 
          success: true, 
          user: adminUser 
        });
        return;
      }
      
      // Check if user exists in mockUsers
      const user = mockUsers.find(u => u.email === email);
      if (user) {
        // In a real app, we would check the password here
        // For the demo, we'll just accept any password for existing users
        user.lastLogin = new Date().toISOString();
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

// Function to register a new user
export const registerUser = (name: string, email: string, password: string): Promise<{ success: boolean; user?: User; errorMessage?: string }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Check if user already exists
      const existingUser = mockUsers.find(u => u.email === email);
      if (existingUser) {
        resolve({
          success: false,
          errorMessage: 'Пользователь с таким email уже существует'
        });
        return;
      }

      // Create new user
      const newUser: User = {
        id: String(mockUsers.length + 1),
        name,
        email,
        role: 'user',
        status: 'active',
        registeredAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name.replace(/\s/g, '')}`
      };

      // Add to users array
      mockUsers.push(newUser);

      resolve({
        success: true,
        user: newUser
      });
    }, 800);
  });
};

// Function to get all users
export const getUsers = (): Promise<User[]> => {
  return new Promise((resolve) => {
    // Simulate API delay
    setTimeout(() => {
      resolve([...mockUsers]);
    }, 500);
  });
};

// Function to get a user by ID
export const getUserById = (id: string): Promise<User | undefined> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const user = mockUsers.find(user => user.id === id);
      resolve(user ? {...user} : undefined);
    }, 300);
  });
};

// Function to simulate updating a user
export const updateUser = (id: string, updates: Partial<User>): Promise<User | undefined> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = mockUsers.findIndex(user => user.id === id);
      if (index !== -1) {
        mockUsers[index] = { ...mockUsers[index], ...updates };
        resolve({...mockUsers[index]});
      } else {
        resolve(undefined);
      }
    }, 500);
  });
};

// Function to add a new user
export const addUser = (user: Omit<User, 'id'>): Promise<User> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newUser = {
        ...user,
        id: String(mockUsers.length + 1),
        registeredAt: user.registeredAt || new Date().toISOString()
      };
      mockUsers.push(newUser);
      resolve({...newUser});
    }, 500);
  });
};

// Function to delete a user
export const deleteUser = (id: string): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = mockUsers.findIndex(user => user.id === id);
      if (index !== -1) {
        mockUsers.splice(index, 1);
        resolve(true);
      } else {
        resolve(false);
      }
    }, 500);
  });
};
