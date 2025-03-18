const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');

const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.json());

// Создание базы данных и таблиц
const db = new sqlite3.Database('./database.sqlite');

db.serialize(() => {
  // Обновляем таблицу users добавляя необходимые поля
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT,
    phone TEXT UNIQUE,
    company TEXT,
    role TEXT DEFAULT 'user',
    status TEXT DEFAULT 'active',
    tariff_id TEXT DEFAULT '1',
    is_subscription_active BOOLEAN DEFAULT 0,
    subscription_expiry DATETIME,
    registered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME,
    store_count INTEGER DEFAULT 0,
    is_in_trial BOOLEAN DEFAULT 0,
    avatar TEXT
  )`);

  // Таблица для тарифов
  db.run(`CREATE TABLE IF NOT EXISTS tariffs (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    period TEXT NOT NULL,
    description TEXT,
    features TEXT,
    is_popular BOOLEAN DEFAULT 0,
    is_active BOOLEAN DEFAULT 1,
    store_limit INTEGER DEFAULT 1
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS email_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    smtp_host TEXT NOT NULL,
    smtp_port INTEGER NOT NULL,
    smtp_user TEXT NOT NULL,
    smtp_password TEXT NOT NULL,
    pop3_host TEXT NOT NULL,
    pop3_port INTEGER NOT NULL,
    pop3_user TEXT NOT NULL,
    pop3_password TEXT NOT NULL
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    token TEXT NOT NULL,
    expiry DATETIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS payment_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    payment_date DATETIME NOT NULL,
    amount REAL NOT NULL,
    subscription_type TEXT NOT NULL,
    payment_method TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`);

  // Создаем таблицы для хранения данных от API
  db.run(`CREATE TABLE IF NOT EXISTS store_stats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    store_id TEXT NOT NULL,
    date_from TEXT NOT NULL,
    date_to TEXT NOT NULL,
    data TEXT NOT NULL,
    timestamp INTEGER NOT NULL
  )`);

  // Таблица для хранения заказов
  db.run(`CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    store_id TEXT NOT NULL,
    date_from TEXT NOT NULL,
    date_to TEXT NOT NULL,
    orders TEXT NOT NULL,
    warehouse_distribution TEXT NOT NULL,
    region_distribution TEXT NOT NULL,
    timestamp INTEGER NOT NULL
  )`);

  // Таблица для хранения продаж
  db.run(`CREATE TABLE IF NOT EXISTS sales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    store_id TEXT NOT NULL,
    date_from TEXT NOT NULL,
    date_to TEXT NOT NULL,
    sales TEXT NOT NULL,
    timestamp INTEGER NOT NULL
  )`);

  // Таблица для хранения данных о товарах
  db.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    store_id TEXT NOT NULL,
    products TEXT NOT NULL,
    timestamp INTEGER NOT NULL
  )`);

  // Таблица для хранения детальной аналитики
  db.run(`CREATE TABLE IF NOT EXISTS analytics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    store_id TEXT NOT NULL,
    date_from TEXT NOT NULL,
    date_to TEXT NOT NULL,
    data TEXT NOT NULL,
    penalties TEXT NOT NULL,
    returns TEXT NOT NULL,
    deductions TEXT NOT NULL,
    deductions_timeline TEXT NOT NULL,
    product_advertising_data TEXT NOT NULL,
    advertising_breakdown TEXT NOT NULL,
    timestamp INTEGER NOT NULL
  )`);

  // Таблица для хранения данных о себестоимости
  db.run(`CREATE TABLE IF NOT EXISTS cost_price (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    store_id TEXT NOT NULL,
    total_cost_price REAL NOT NULL,
    total_sold_items INTEGER NOT NULL,
    avg_cost_price REAL NOT NULL,
    last_update_date TEXT NOT NULL,
    timestamp INTEGER NOT NULL
  )`);

  // Обновляем таблицу user_stores для хранения связи пользователей с магазинами
  db.run(`CREATE TABLE IF NOT EXISTS user_stores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    store_id TEXT NOT NULL,
    marketplace TEXT NOT NULL,
    store_name TEXT NOT NULL,
    api_key TEXT NOT NULL,
    is_selected BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_fetch_date DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE(user_id, store_id)
  )`);
  
  // Обновляем таблицу product_advertising добавляя поле user_id
  db.run(`CREATE TABLE IF NOT EXISTS product_advertising (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    store_id TEXT NOT NULL,
    user_id INTEGER,
    product_advertising_data TEXT NOT NULL,
    timestamp INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`);

  // Добавляем таблицу для настроек приложения
  db.run(`CREATE TABLE IF NOT EXISTS app_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    setting_name TEXT UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Проверим, есть ли настройка верификации, если нет - добавим со значением по умолчанию (email)
  db.get("SELECT * FROM app_settings WHERE setting_name = 'verification_method'", (err, row) => {
    if (!row) {
      db.run("INSERT INTO app_settings (setting_name, setting_value) VALUES ('verification_method', 'email')");
    }
  });
  
  // Проверяем, есть ли тарифы в базе данных, если нет - добавляем начальные
  db.get("SELECT COUNT(*) as count FROM tariffs", (err, row) => {
    if (err || (row && row.count === 0)) {
      // Добавляем начальные тарифы
      const initialTariffs = [
        {
          id: '1',
          name: 'Базовый',
          price: 990,
          period: 'monthly',
          description: 'Идеально для начинающих продавцов',
          features: JSON.stringify([
            'Доступ к основным отчетам',
            'Управление до 100 товаров',
            'Базовая аналитика',
            'Email поддержка'
          ]),
          is_popular: 0,
          is_active: 1,
          store_limit: 1
        },
        {
          id: '2',
          name: 'Профессиональный',
          price: 1990,
          period: 'monthly',
          description: 'Для растущих магазинов',
          features: JSON.stringify([
            'Все функции Базового тарифа',
            'Управление до 1000 товаров',
            'Расширенная аналитика',
            'Приоритетная поддержка',
            'API интеграции'
          ]),
          is_popular: 1,
          is_active: 1,
          store_limit: 2
        },
        {
          id: '3',
          name: 'Бизнес',
          price: 4990,
          period: 'monthly',
          description: 'Комплексное решение для крупных продавцов',
          features: JSON.stringify([
            'Все функции Профессионального тарифа',
            'Неограниченное количество товаров',
            'Персональный менеджер',
            'Расширенный API доступ',
            'Белая метка (White Label)',
            'Приоритетные обновления'
          ]),
          is_popular: 0,
          is_active: 1,
          store_limit: 10
        },
        {
          id: '4',
          name: 'Корпоративный',
          price: 9990,
          period: 'monthly',
          description: 'Максимальные возможности для корпоративных клиентов',
          features: JSON.stringify([
            'Все функции Бизнес тарифа',
            'Неограниченное количество товаров',
            'Выделенный аккаунт-менеджер',
            'Приоритетная техническая поддержка 24/7',
            'Индивидуальная настройка и кастомизация',
            'Интеграция с корпоративными системами'
          ]),
          is_popular: 0,
          is_active: 1,
          store_limit: 999
        }
      ];
      
      initialTariffs.forEach(tariff => {
        db.run(
          `INSERT INTO tariffs (id, name, price, period, description, features, is_popular, is_active, store_limit) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            tariff.id, 
            tariff.name, 
            tariff.price, 
            tariff.period, 
            tariff.description, 
            tariff.features, 
            tariff.is_popular, 
            tariff.is_active, 
            tariff.store_limit
          ]
        );
      });
    }
  });
  
  // Проверяем, есть ли пользователи в базе данных, если нет - до��авляем тестовых
  db.get("SELECT COUNT(*) as count FROM users", (err, row) => {
    if (err || (row && row.count === 0)) {
      // Добавляем тестовых пользователей
      const testUsers = [
        {
          email: 'admin@example.com',
          password: 'admin123',
          name: 'Администратор',
          role: 'admin',
          status: 'active',
          tariff_id: '4',
          is_subscription_active: 1,
          subscription_expiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          registered_at: new Date().toISOString(),
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin'
        },
        {
          email: 'user@example.com',
          password: 'user123',
          name: 'Тестовый Пользователь',
          role: 'user',
          status: 'active',
          tariff_id: '1',
          is_subscription_active: 0,
          registered_at: new Date().toISOString(),
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=User'
        },
        {
          email: 'zerofy',
          password: 'Zerofy2025',
          name: 'Zerofy Admin',
          role: 'admin',
          status: 'active',
          tariff_id: '4',
          is_subscription_active: 1,
          subscription_expiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          registered_at: new Date().toISOString(),
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Zerofy'
        }
      ];
      
      testUsers.forEach(user => {
        db.run(
          `INSERT INTO users (email, password, name, role, status, tariff_id, is_subscription_active, subscription_expiry, registered_at, avatar) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            user.email, 
            user.password, 
            user.name, 
            user.role, 
            user.status, 
            user.tariff_id, 
            user.is_subscription_active, 
            user.subscription_expiry, 
            user.registered_at,
            user.avatar
          ]
        );
      });
    }
  });
});

// API для работы с пользователями
// Получение всех пользователей
app.get('/api/users', (req, res) => {
  db.all('SELECT * FROM users ORDER BY registered_at DESC', (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Ошибка при получении списка пользователей' });
    }
    res.json(rows.map(user => ({
      id: user.id.toString(),
      email: user.email,
      name: user.name,
      phone: user.phone,
      company: user.company,
      role: user.role,
      status: user.status,
      tariffId: user.tariff_id,
      isSubscriptionActive: Boolean(user.is_subscription_active),
      subscriptionEndDate: user.subscription_expiry,
      registeredAt: user.registered_at,
      lastLogin: user.last_login,
      avatar: user.avatar,
      isInTrial: Boolean(user.is_in_trial),
      storeCount: user.store_count || 0
    })));
  });
});

// Получение информации о пользователе по ID
app.get('/api/users/:id', (req, res) => {
  const userId = req.params.id;
  db.get('SELECT * FROM users WHERE id = ?', [userId], (err, user) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Ошибка при получении информации о пользователе' });
    }
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    res.json({
      id: user.id.toString(),
      email: user.email,
      name: user.name,
      phone: user.phone,
      company: user.company,
      role: user.role,
      status: user.status,
      tariffId: user.tariff_id,
      isSubscriptionActive: Boolean(user.is_subscription_active),
      subscriptionEndDate: user.subscription_expiry,
      registeredAt: user.registered_at,
      lastLogin: user.last_login,
      avatar: user.avatar,
      isInTrial: Boolean(user.is_in_trial),
      storeCount: user.store_count || 0
    });
  });
});

// Добавление нового пользователя
app.post('/api/users', (req, res) => {
  const { email, password, name, phone, company, role, status, tariffId } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email и пароль обязательны' });
  }
  
  const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${name || email}`;
  
  const query = `INSERT INTO users (
    email, password, name, phone, company, role, status, tariff_id, avatar, registered_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  
  db.run(query, [
    email, 
    password, 
    name || null, 
    phone || null, 
    company || null, 
    role || 'user', 
    status || 'active', 
    tariffId || '1',
    avatar,
    new Date().toISOString()
  ], function(err) {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Ошибка при добавлении пользователя' });
    }
    
    // Получаем добавленного пользователя
    db.get('SELECT * FROM users WHERE id = ?', [this.lastID], (err, user) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Ошибка при получении добавленного пользователя' });
      }
      
      res.json({
        id: user.id.toString(),
        email: user.email,
        name: user.name,
        phone: user.phone,
        company: user.company,
        role: user.role,
        status: user.status,
        tariffId: user.tariff_id,
        isSubscriptionActive: Boolean(user.is_subscription_active),
        subscriptionEndDate: user.subscription_expiry,
        registeredAt: user.registered_at,
        lastLogin: user.last_login,
        avatar: user.avatar,
        isInTrial: Boolean(user.is_in_trial),
        storeCount: user.store_count || 0
      });
    });
  });
});

// Обновление информации о пользователе
app.put('/api/users/:id', (req, res) => {
  const userId = req.params.id;
  const {
    email, password, name, phone, company, role, status,
    tariffId, isSubscriptionActive, subscriptionEndDate, lastLogin
  } = req.body;

  // Формируем SQL запрос на обновление только переданных полей
  let updates = [];
  let values = [];

  if (email !== undefined) {
    updates.push('email = ?');
    values.push(email);
  }
  if (password !== undefined) {
    updates.push('password = ?');
    values.push(password);
  }
  if (name !== undefined) {
    updates.push('name = ?');
    values.push(name);
  }
  if (phone !== undefined) {
    updates.push('phone = ?');
    values.push(phone);
  }
  if (company !== undefined) {
    updates.push('company = ?');
    values.push(company);
  }
  if (role !== undefined) {
    updates.push('role = ?');
    values.push(role);
  }
  if (status !== undefined) {
    updates.push('status = ?');
    values.push(status);
  }
  if (tariffId !== undefined) {
    updates.push('tariff_id = ?');
    values.push(tariffId);
  }
  if (isSubscriptionActive !== undefined) {
    updates.push('is_subscription_active = ?');
    values.push(isSubscriptionActive ? 1 : 0);
  }
  if (subscriptionEndDate !== undefined) {
    updates.push('subscription_expiry = ?');
    values.push(subscriptionEndDate);
  }
  if (lastLogin !== undefined) {
    updates.push('last_login = ?');
    values.push(lastLogin);
  }

  if (updates.length === 0) {
    return res.status(400).json({ error: 'Нет данных для обновления' });
  }

  const query = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
  values.push(userId);

  db.run(query, values, function(err) {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Ошибка при обновлении информации о пользователе' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    
    // Получаем обновленного пользователя
    db.get('SELECT * FROM users WHERE id = ?', [userId], (err, user) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Ошибка при получении обновленного пользователя' });
      }
      
      res.json({
        id: user.id.toString(),
        email: user.email,
        name: user.name,
        phone: user.phone,
        company: user.company,
        role: user.role,
        status: user.status,
        tariffId: user.tariff_id,
        isSubscriptionActive: Boolean(user.is_subscription_active),
        subscriptionEndDate: user.subscription_expiry,
        registeredAt: user.registered_at,
        lastLogin: user.last_login,
        avatar: user.avatar,
        isInTrial: Boolean(user.is_in_trial),
        storeCount: user.store_count || 0
      });
    });
  });
});

// Удаление пользователя
app.delete('/api/users/:id', (req, res) => {
  const userId = req.params.id;
  db.run('DELETE FROM users WHERE id = ?', [userId], function(err) {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Ошибка при удалении пользователя' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    res.json({ success: true });
  });
});

// Авторизация пользователя
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email и пароль обязательны' });
  }
  const query = 'SELECT * FROM users WHERE email = ? AND password = ?';
  db.get(query, [email, password], (err, user) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Ошибка при авторизации' });
    }
    if (!user) {
      return res.status(401).json({ error: 'Неверные учетные данные' });
    }
    res.json({
      id: user.id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
      tariffId: user.tariff_id,
      isSubscriptionActive: Boolean(user.is_subscription_active),
      subscriptionEndDate: user.subscription_expiry,
      avatar: user.avatar
    });
  });
});

// API для работы с тарифами
// Получение всех тарифов
app.get('/api/tariffs', (req, res) => {
  db.all('SELECT * FROM tariffs ORDER BY price ASC', (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Ошибка при получении списка тарифов' });
    }
    
    const tariffs = rows.map(tariff => ({
      id: tariff.id,
      name: tariff.name,
      price: tariff.price,
      period: tariff.period,
      description: tariff.description,
      features: JSON.parse(tariff.features || '[]'),
      isPopular: Boolean(tariff.is_popular),
      isActive: Boolean(tariff.is_active),
      storeLimit: tariff.store_limit
    }));
    
    res.json(tariffs);
  });
});

// Получение тарифа по ID
app.get('/api/tariffs/:id', (req, res) => {
  const tariffId = req.params.id;
  db.get('SELECT * FROM tariffs WHERE id = ?', [tariffId], (err, tariff) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Ошибка при получении информации о тарифе' });
    }
    if (!tariff) {
      return res.status(404).json({ error: 'Тариф не найден' });
    }
    
    res.json({
      id: tariff.id,
      name: tariff.name,
      price: tariff.price,
      period: tariff.period,
      description: tariff.description,
      features: JSON.parse(tariff.features || '[]'),
      isPopular: Boolean(tariff.is_popular),
      isActive: Boolean(tariff.is_active),
      storeLimit: tariff.store_limit
    });
  });
});

// Обновление тарифа
app.put('/api/tariffs/:id', (req, res) => {
  const tariffId = req.params.id;
  const { name, price, period, description, features, isPopular, isActive, storeLimit } = req.body;
  
  // Формируем SQL запрос на обновление только переданных полей
  let updates = [];
  let values = [];
  
  if (name !== undefined) {
    updates.push('name = ?');
    values.push(name);
  }
  if (price !== undefined) {
    updates.push('price = ?');
    values.push(price);
  }
  if (period !== undefined) {
    updates.push('period = ?');
    values.push(period);
  }
  if (description !== undefined) {
    updates.push('description = ?');
    values.push(description);
  }
  if (features !== undefined) {
    updates.push('features = ?');
    values.push(JSON.stringify(features));
  }
  if (isPopular !== undefined) {
    updates.push('is_popular = ?');
    values.push(isPopular ? 1 : 0);
  }
  if (isActive !== undefined) {
    updates.push('is_active = ?');
    values.push(isActive ? 1 : 0);
  }
  if (storeLimit !== undefined) {
    updates.push('store_limit = ?');
    values.push(storeLimit);
  }
  
  if (updates.length === 0) {
    return res.status(400).json({ error: 'Нет данных для обновления' });
  }
  
  const query = `UPDATE tariffs SET ${updates.join(', ')} WHERE id = ?`;
  values.push(tariffId);
  
  db.run(query, values, function(err) {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Ошибка при обновлении тарифа' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Тариф не найден' });
    }
    
    // Получаем обновленный тариф
    db.get('SELECT * FROM tariffs WHERE id = ?', [tariffId], (err, tariff) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Ошибка при получении обновленного тарифа' });
      }
      
      res.json({
        id: tariff.id,
        name: tariff.name,
        price: tariff.price,
        period: tariff.period,
        description: tariff.description,
        features: JSON.parse(tariff.features || '[]'),
        isPopular: Boolean(tariff.is_popular),
        isActive: Boolean(tariff.is_active),
        storeLimit: tariff.store_limit
      });
    });
  });
});

// Получение данных о подписке пользователя
app.get('/api/user-subscription/:userId', (req, res) => {
  const userId = req.params.userId;
  
  // Получаем данные пользователя и его тариф
  db.get(
    `SELECT u.*, t.name as tariff_name, t.store_limit 
     FROM users u 
     LEFT JOIN tariffs t ON u.tariff_id = t.id 
     WHERE u.id = ?`, 
    [userId], 
    (err, row) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Ошибка при получении данных о подписке' });
      }
      if (!row) {
        return res.status(404).json({ error: 'Пользователь не найден' });
      }
      
      // Расчитываем оставшиеся дни подписки
      let daysLeft = 0;
      if (row.subscription_expiry) {
        const endDate = new Date(row.subscription_expiry);
        const currentDate = new Date();
        
        const timeDiff = endDate.getTime() - currentDate.getTime();
        daysLeft = Math.max(0, Math.ceil(timeDiff / (1000 * 3600 * 24)));
      }
      
      res.json({
        isActive: Boolean(row.is_subscription_active),
        tariffId: row.tariff_id,
        tariffName: row.tariff_name,
        startDate: row.registered_at,
        endDate: row.subscription_expiry,
        daysLeft,
        storeLimit: row.store_limit
      });
    }
  );
});

// Активация подписки
app.post('/api/activate-subscription', (req, res) => {
  const { userId, tariffId, months } = req.body;
  
  if (!userId || !tariffId || !months) {
    return res.status(400).json({ error: 'Необходимо указать userId, tariffId и months' });
  }
  
  // Проверяем, существует ли пользователь
  db.get('SELECT * FROM users WHERE id = ?', [userId], (err, user) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Ошибка при активации подписки' });
    }
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    
    // Расчитываем новую дату окончания подписки
    const currentDate = new Date();
    let endDate = user.subscription_expiry ? new Date(user.subscription_expiry) : currentDate;
    
    // Если текущая подписка истекла, начинаем отсчет от текущей даты
    if (endDate < currentDate) {
      endDate = currentDate;
    }
    
    // Добавляем указанное количество месяцев
    endDate.setMonth(endDate.getMonth() + parseInt(months));
    
    // Обновляем данные пользователя
    db.run(
      `UPDATE users SET 
       tariff_id = ?, 
       is_subscription_active = 1, 
       subscription_expiry = ?
       WHERE id = ?`,
      [tariffId, endDate.toISOString(), userId],
      function(err) {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Ошибка при активации подписки' });
        }
        
        // Добавляем запись в историю платежей
        const tariffPromise = new Promise((resolve, reject) => {
          db.get('SELECT * FROM tariffs WHERE id = ?', [tariffId], (err, tariff) => {
            if (err) {
              reject(err);
              return;
            }
            resolve(tariff);
          });
        });
        
        tariffPromise
          .then((tariff) => {
            if (!tariff) {
              throw new Error('Тариф не найден');
            }
            
            // Расчитываем сумму платежа
            const amount = tariff.price * months;
            
            // Добавляем запись в историю платежей
            db.run(
              `INSERT INTO payment_history (
                user_id, payment_date, amount, subscription_type, payment_method
              ) VALUES (?, ?, ?, ?, ?)`,
              [userId, new Date().toISOString(), amount, tariff.name, 'Администратор'],
              function(err) {
                if (err) {
                  console.error(err);
                  // Продолжаем выполнение, даже если не удалось добавить запись в историю платежей
                }
                
                // Получаем обновленного пользователя
                db.get(
                  `SELECT u.*, t.name as tariff_name, t.store_limit 
                   FROM users u 
                   LEFT JOIN tariffs t ON u.tariff_id = t.id 
                   WHERE u.id = ?`, 
                  [userId], 
                  (err, updatedUser) => {
                    if (err) {
                      console.error(err);
                      return res.status(500).json({ error: 'Ошибка при получении обновленного пользователя' });
                    }
                    
                    res.json({
                      id: updatedUser.id.toString(),
                      email: updatedUser.email,
                      name: updatedUser.name,
                      phone: updatedUser.phone,
                      company: updatedUser.company,
                      role: updatedUser.role,
                      status: updatedUser.status,
                      tariffId: updatedUser.tariff_id,
                      isSubscriptionActive: Boolean(updatedUser.is_subscription_active),
                      subscriptionEndDate: updatedUser.subscription_expiry,
                      registeredAt: updatedUser.registered_at,
                      lastLogin: updatedUser.last_login,
                      avatar: updatedUser.avatar,
                      isInTrial: Boolean(updatedUser.is_in_trial),
                      storeCount: updatedUser.store_count || 0,
                      storeLimit: updatedUser.store_limit
                    });
                  }
                );
              }
            );
          })
          .catch((error) => {
            console.error(error);
            return res.status(500).json({ error: 'Ошибка при активации подписки' });
          });
      }
    );
  });
});

// ... keep existing code

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

