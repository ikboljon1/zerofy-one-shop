
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
  // Сохраняем только основные таблицы для пользователей и их данных
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    status TEXT DEFAULT 'active',
    subscription_type TEXT DEFAULT 'free',
    subscription_expiry DATETIME
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
  
  // Удалили создание таблиц store_stats, orders, sales, products и analytics
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

// Удалены эндпоинты API для store_stats, orders, sales, products и analytics

app.listen(port, () => {
  console.log(`Сервер запущен на порту ${port}`);
});
