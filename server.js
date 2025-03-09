
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
  // Сохраняем основные таблицы для пользователей и их данных
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    status TEXT DEFAULT 'active',
    subscription_type TEXT DEFAULT 'free',
    subscription_expiry DATETIME
  )`);

  // Добавляем таблицу stores для хранения магазинов пользователей
  db.run(`CREATE TABLE IF NOT EXISTS stores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    marketplace TEXT NOT NULL,
    api_key TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
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
});

// Регистрация пользователя
app.post('/api/register', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email и пароль обязательны' });
  }
  const query = 'INSERT INTO users (email, password) VALUES (?, ?)';
  db.run(query, [email, password], function(err) {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Ошибка при регистрации пользователя' });
    }
    res.json({ id: this.lastID });
  });
});

// Авторизация пользователя
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email и пароль обязательны' });
  }
  const query = 'SELECT * FROM users WHERE email = ? AND password = ?';
  db.get(query, [email, password], (err, row) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Ошибка при авторизации' });
    }
    if (!row) {
      return res.status(401).json({ error: 'Неверные учетные данные' });
    }
    res.json({ id: row.id, email: row.email, role: row.role, status: row.status });
  });
});

// Получение информации о пользователе по ID
app.get('/api/users/:id', (req, res) => {
  const userId = req.params.id;
  const query = 'SELECT id, email, role, status, subscription_type, subscription_expiry FROM users WHERE id = ?';
  db.get(query, [userId], (err, row) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Ошибка при получении информации о пользователе' });
    }
    if (!row) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    res.json(row);
  });
});

// Обновление информации о пользователе
app.put('/api/users/:id', (req, res) => {
    const userId = req.params.id;
    const { role, status, subscription_type, subscription_expiry } = req.body;
  
    // Проверяем, что хотя бы одно из полей для обновления присутствует в запросе
    if (!role && !status && !subscription_type && !subscription_expiry) {
      return res.status(400).json({ error: 'Необходимо указать хотя бы одно поле для обновления' });
    }
  
    let query = 'UPDATE users SET ';
    const updates = [];
    const values = [];
  
    if (role) {
      updates.push('role = ?');
      values.push(role);
    }
    if (status) {
      updates.push('status = ?');
      values.push(status);
    }
    if (subscription_type) {
      updates.push('subscription_type = ?');
      values.push(subscription_type);
    }
    if (subscription_expiry) {
      updates.push('subscription_expiry = ?');
      values.push(subscription_expiry);
    }
  
    query += updates.join(', ');
    query += ' WHERE id = ?';
    values.push(userId);
  
    db.run(query, values, function(err) {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Ошибка при обновлении информации о пользователе' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Пользователь не найден' });
      }
      res.json({ message: 'Информация о пользователе успешно обновлена' });
    });
  });

// Настройка SMTP
app.post('/api/email-settings', (req, res) => {
  const { smtp_host, smtp_port, smtp_user, smtp_password, pop3_host, pop3_port, pop3_user, pop3_password } = req.body;
  const query = `INSERT INTO email_settings (smtp_host, smtp_port, smtp_user, smtp_password, pop3_host, pop3_port, pop3_user, pop3_password)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
  db.run(query, [smtp_host, smtp_port, smtp_user, smtp_password, pop3_host, pop3_port, pop3_user, pop3_password], function(err) {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Ошибка при настройке SMTP' });
    }
    res.json({ id: this.lastID });
  });
});

// Получение настроек SMTP
app.get('/api/email-settings', (req, res) => {
  db.get('SELECT * FROM email_settings ORDER BY id DESC LIMIT 1', (err, row) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Ошибка при получении настроек SMTP' });
    }
    if (!row) {
      return res.status(404).json({ error: 'Настройки SMTP не найдены' });
    }
    res.json(row);
  });
});

// Запрос на сброс пароля
app.post('/api/password-reset-request', (req, res) => {
  const { email } = req.body;
  const query = 'SELECT * FROM users WHERE email = ?';
  db.get(query, [email], (err, row) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Ошибка при запросе на сброс пароля' });
    }
    if (!row) {
      return res.status(404).json({ error: 'Пользователь с таким email не найден' });
    }

    // Генерация токена и сохранение в базе данных
    const token = require('crypto').randomBytes(20).toString('hex');
    const expiry = new Date(Date.now() + 3600000); // Токен действителен 1 час
    const insertQuery = 'INSERT INTO password_reset_tokens (user_id, token, expiry) VALUES (?, ?, ?)';
    db.run(insertQuery, [row.id, token, expiry.toISOString()], function(insertErr) {
      if (insertErr) {
        console.error(insertErr);
        return res.status(500).json({ error: 'Ошибка при сохранении токена сброса пароля' });
      }

      // Отправка email с токеном
      db.get('SELECT * FROM email_settings ORDER BY id DESC LIMIT 1', (emailSettingsErr, emailSettings) => {
        if (emailSettingsErr) {
          console.error(emailSettingsErr);
          return res.status(500).json({ error: 'Ошибка при получении настроек SMTP' });
        }
        if (!emailSettings) {
          return res.status(400).json({ error: 'Настройки SMTP не найдены' });
        }

        const transporter = nodemailer.createTransport({
          host: emailSettings.smtp_host,
          port: emailSettings.smtp_port,
          secure: true,
          auth: {
            user: emailSettings.smtp_user,
            pass: emailSettings.smtp_password
          }
        });

        const mailOptions = {
          from: emailSettings.smtp_user,
          to: email,
          subject: 'Сброс пароля',
          text: `Для сброса пароля перейдите по ссылке: http://localhost:3000/reset-password/${token}`
        };

        transporter.sendMail(mailOptions, (sendErr, info) => {
          if (sendErr) {
            console.error(sendErr);
            return res.status(500).json({ error: 'Ошибка при отправке email' });
          }
          console.log('Email sent: ' + info.response);
          res.json({ message: 'Инструкции по сбросу пароля отправлены на ваш email' });
        });
      });
    });
  });
});

// Сброс пароля
app.post('/api/reset-password', (req, res) => {
  const { token, newPassword } = req.body;
  const query = 'SELECT * FROM password_reset_tokens WHERE token = ? AND expiry > ?';
  db.get(query, [token, new Date().toISOString()], (err, row) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Ошибка при сбросе пароля' });
    }
    if (!row) {
      return res.status(400).json({ error: 'Неверный или устаревший токен' });
    }

    // Обновление пароля пользователя
    const updateQuery = 'UPDATE users SET password = ? WHERE id = ?';
    db.run(updateQuery, [newPassword, row.user_id], function(updateErr) {
      if (updateErr) {
        console.error(updateErr);
        return res.status(500).json({ error: 'Ошибка при обновлении пароля' });
      }

      // Удаление токена из базы данных
      const deleteQuery = 'DELETE FROM password_reset_tokens WHERE token = ?';
      db.run(deleteQuery, [token], function(deleteErr) {
        if (deleteErr) {
          console.error(deleteErr);
          return res.status(500).json({ error: 'Ошибка при удалении токена сброса пароля' });
        }

        res.json({ message: 'Пароль успешно сброшен' });
      });
    });
  });
});

// История платежей
app.post('/api/payment-history', (req, res) => {
  const { user_id, payment_date, amount, subscription_type, payment_method } = req.body;
  const query = `INSERT INTO payment_history (user_id, payment_date, amount, subscription_type, payment_method)
                 VALUES (?, ?, ?, ?, ?)`;
  db.run(query, [user_id, payment_date, amount, subscription_type, payment_method], function(err) {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Ошибка при добавлении записи в историю платежей' });
    }
    res.json({ id: this.lastID });
  });
});

// Получение истории платежей пользователя
app.get('/api/payment-history/:user_id', (req, res) => {
  const userId = req.params.user_id;
  const query = 'SELECT * FROM payment_history WHERE user_id = ?';
  db.all(query, [userId], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Ошибка при получении истории платежей' });
    }
    res.json(rows);
  });
});

// API для работы с магазинами

// Добавление нового магазина
app.post('/api/stores', (req, res) => {
  const { user_id, name, marketplace, api_key } = req.body;
  
  if (!user_id || !name || !marketplace || !api_key) {
    return res.status(400).json({ error: 'Все поля обязательны для заполнения' });
  }
  
  const query = `INSERT INTO stores (user_id, name, marketplace, api_key, created_at, last_updated) 
                VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`;
  
  db.run(query, [user_id, name, marketplace, api_key], function(err) {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Ошибка при добавлении магазина' });
    }
    
    res.status(201).json({ 
      id: this.lastID,
      message: 'Магазин успешно добавлен',
      store: {
        id: this.lastID,
        user_id,
        name,
        marketplace,
        created_at: new Date().toISOString()
      }
    });
  });
});

// Получение всех магазинов пользователя
app.get('/api/stores/user/:user_id', (req, res) => {
  const userId = req.params.user_id;
  
  const query = 'SELECT id, name, marketplace, created_at, last_updated FROM stores WHERE user_id = ?';
  
  db.all(query, [userId], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Ошибка при получении списка магазинов' });
    }
    
    res.json(rows);
  });
});

// Получение информации о конкретном магазине
app.get('/api/stores/:id', (req, res) => {
  const storeId = req.params.id;
  
  const query = 'SELECT id, user_id, name, marketplace, created_at, last_updated FROM stores WHERE id = ?';
  
  db.get(query, [storeId], (err, row) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Ошибка при получении информации о магазине' });
    }
    
    if (!row) {
      return res.status(404).json({ error: 'Магазин не найден' });
    }
    
    res.json(row);
  });
});

// Обновление информации о магазине
app.put('/api/stores/:id', (req, res) => {
  const storeId = req.params.id;
  const { name, marketplace, api_key } = req.body;
  
  // Проверяем, что хотя бы одно из полей для обновления присутствует в запросе
  if (!name && !marketplace && !api_key) {
    return res.status(400).json({ error: 'Необходимо указать хотя бы одно поле для обновления' });
  }
  
  let query = 'UPDATE stores SET last_updated = CURRENT_TIMESTAMP';
  const values = [];
  
  if (name) {
    query += ', name = ?';
    values.push(name);
  }
  
  if (marketplace) {
    query += ', marketplace = ?';
    values.push(marketplace);
  }
  
  if (api_key) {
    query += ', api_key = ?';
    values.push(api_key);
  }
  
  query += ' WHERE id = ?';
  values.push(storeId);
  
  db.run(query, values, function(err) {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Ошибка при обновлении информации о магазине' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Магазин не найден' });
    }
    
    res.json({ message: 'Информация о магазине успешно обновлена' });
  });
});

// Удаление магазина
app.delete('/api/stores/:id', (req, res) => {
  const storeId = req.params.id;
  const userId = req.query.user_id; // Используется для проверки прав
  
  // Проверяем, принадлежит ли магазин указанному пользователю
  if (userId) {
    const checkQuery = 'SELECT * FROM stores WHERE id = ? AND user_id = ?';
    
    db.get(checkQuery, [storeId, userId], (err, row) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Ошибка при проверке магазина' });
      }
      
      if (!row) {
        return res.status(403).json({ error: 'У вас нет прав на удаление этого магазина' });
      }
      
      // Проверка условия: магазин можно удалить только через месяц после регистрации
      const createdAt = new Date(row.created_at);
      const now = new Date();
      const oneMonthLater = new Date(createdAt);
      oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);
      
      if (now < oneMonthLater) {
        const daysRemaining = Math.ceil((oneMonthLater.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return res.status(403).json({ 
          error: 'Магазин можно удалить только через месяц после создания',
          daysRemaining: daysRemaining
        });
      }
      
      // Если проверки пройдены, удаляем магазин
      deleteStore(storeId, res);
    });
  } else {
    // Если user_id не указан, просто удаляем магазин (например, для админа)
    deleteStore(storeId, res);
  }
});

// Функция для удаления магазина
function deleteStore(storeId, res) {
  const query = 'DELETE FROM stores WHERE id = ?';
  
  db.run(query, [storeId], function(err) {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Ошибка при удалении магазина' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Магазин не найден' });
    }
    
    res.json({ message: 'Магазин успешно удален' });
  });
}

app.listen(port, () => {
  console.log(`Сервер запущен на порту ${port}`);
});
