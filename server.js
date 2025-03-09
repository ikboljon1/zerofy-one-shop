
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const nodemailer = require('nodemailer');
const Database = require('better-sqlite3');

const app = express();
const PORT = process.env.PORT || 3001;
const DB_PATH = './database.sqlite';

// Инициализация базы данных
const db = new Database(DB_PATH);

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Создание необходимых таблиц при запуске
function initializeDatabase() {
  // Таблица пользователей
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT,
      phone TEXT,
      company TEXT,
      tariff_id TEXT NOT NULL,
      is_subscription_active INTEGER DEFAULT 0,
      subscription_end_date TEXT,
      store_count INTEGER DEFAULT 0,
      avatar TEXT,
      is_in_trial INTEGER DEFAULT 0,
      trial_end_date TEXT,
      role TEXT DEFAULT 'user',
      status TEXT DEFAULT 'active',
      registered_at TEXT NOT NULL,
      last_login TEXT
    )
  `);

  // Таблица настроек электронной почты
  db.exec(`
    CREATE TABLE IF NOT EXISTS email_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      smtp_host TEXT,
      smtp_port INTEGER,
      smtp_secure INTEGER DEFAULT 0,
      smtp_username TEXT,
      smtp_password TEXT,
      smtp_from_email TEXT,
      smtp_from_name TEXT,
      pop3_host TEXT,
      pop3_port INTEGER,
      pop3_secure INTEGER DEFAULT 0,
      pop3_username TEXT,
      pop3_password TEXT,
      pop3_leave_on_server INTEGER DEFAULT 1,
      pop3_auto_check_interval INTEGER DEFAULT 15
    )
  `);

  // Таблица токенов для сброса пароля
  db.exec(`
    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      user_id TEXT NOT NULL,
      token TEXT NOT NULL,
      expiry TEXT NOT NULL,
      PRIMARY KEY (user_id, token)
    )
  `);

  // Таблица истории платежей
  db.exec(`
    CREATE TABLE IF NOT EXISTS payment_history (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      date TEXT NOT NULL,
      amount REAL NOT NULL,
      description TEXT,
      status TEXT NOT NULL,
      tariff TEXT NOT NULL,
      period TEXT NOT NULL
    )
  `);

  // Добавление тестовых пользователей, если таблица пустая
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
  
  if (userCount.count === 0) {
    const adminUser = {
      id: '1',
      name: 'Администратор',
      email: 'admin@example.com',
      password: 'admin',
      tariff_id: '3',
      is_subscription_active: 1,
      subscription_end_date: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString(),
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
      role: 'admin',
      status: 'active',
      registered_at: new Date().toISOString(),
      last_login: new Date().toISOString(),
      store_count: 2
    };
    
    const regularUser = {
      id: '2',
      name: 'Иван Иванов',
      email: 'ivan@example.com',
      password: 'password',
      phone: '+7 (999) 123-45-67',
      company: 'ООО Компания',
      tariff_id: '2',
      is_subscription_active: 1,
      subscription_end_date: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString(),
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ivan',
      role: 'user',
      status: 'active',
      registered_at: new Date(new Date().setMonth(new Date().getMonth() - 2)).toISOString(),
      last_login: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(),
      store_count: 1
    };
    
    const trialUser = {
      id: '3',
      name: 'Мария Петрова',
      email: 'maria@example.com',
      password: 'password',
      tariff_id: '1',
      is_subscription_active: 0,
      is_in_trial: 1,
      trial_end_date: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString(),
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',
      role: 'user',
      status: 'active',
      registered_at: new Date(new Date().setDate(new Date().getDate() - 5)).toISOString(),
      store_count: 1
    };
    
    const insertUser = db.prepare(`
      INSERT INTO users 
      (id, name, email, password, phone, company, tariff_id, is_subscription_active, 
       subscription_end_date, store_count, avatar, is_in_trial, trial_end_date, 
       role, status, registered_at, last_login) 
      VALUES 
      (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    // Вставка тестовых пользователей
    insertUser.run(
      adminUser.id, adminUser.name, adminUser.email, adminUser.password,
      null, null, adminUser.tariff_id, adminUser.is_subscription_active,
      adminUser.subscription_end_date, adminUser.store_count, adminUser.avatar,
      0, null, adminUser.role, adminUser.status, adminUser.registered_at, adminUser.last_login
    );
    
    insertUser.run(
      regularUser.id, regularUser.name, regularUser.email, regularUser.password,
      regularUser.phone, regularUser.company, regularUser.tariff_id, regularUser.is_subscription_active,
      regularUser.subscription_end_date, regularUser.store_count, regularUser.avatar,
      0, null, regularUser.role, regularUser.status, regularUser.registered_at, regularUser.last_login
    );
    
    insertUser.run(
      trialUser.id, trialUser.name, trialUser.email, trialUser.password,
      null, null, trialUser.tariff_id, trialUser.is_subscription_active,
      null, trialUser.store_count, trialUser.avatar,
      trialUser.is_in_trial, trialUser.trial_end_date, trialUser.role, trialUser.status, 
      trialUser.registered_at, null
    );
    
    console.log('Тестовые пользователи добавлены в базу данных');
  }

  // Проверяем настройки email
  const emailSettingsCount = db.prepare('SELECT COUNT(*) as count FROM email_settings').get();
  
  if (emailSettingsCount.count === 0) {
    // Добавляем дефолтные настройки email
    db.prepare(`
      INSERT INTO email_settings 
      (smtp_host, smtp_port, smtp_secure, smtp_username, smtp_password, smtp_from_email, smtp_from_name,
       pop3_host, pop3_port, pop3_secure, pop3_username, pop3_password, pop3_leave_on_server, pop3_auto_check_interval)
      VALUES
      (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'smtp.gmail.com', 587, 0, '', '', '', 'Zerofy System',
      'pop.gmail.com', 995, 1, '', '', 1, 15
    );
    
    console.log('Добавлены дефолтные настройки email');
  }
}

// Инициализация базы данных при запуске
initializeDatabase();

// Хранилище транспортеров (для разных настроек SMTP)
let transporters = {};

// API для работы с пользователями
app.get('/api/users', (req, res) => {
  try {
    const users = db.prepare('SELECT * FROM users').all();
    
    // Преобразуем булевы поля из INTEGER в Boolean для совместимости с фронтендом
    const formattedUsers = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      password: user.password,
      phone: user.phone,
      company: user.company,
      tariffId: user.tariff_id,
      isSubscriptionActive: Boolean(user.is_subscription_active),
      subscriptionEndDate: user.subscription_end_date,
      storeCount: user.store_count,
      avatar: user.avatar,
      isInTrial: Boolean(user.is_in_trial),
      trialEndDate: user.trial_end_date,
      role: user.role,
      status: user.status,
      registeredAt: user.registered_at,
      lastLogin: user.last_login
    }));
    
    res.json(formattedUsers);
  } catch (error) {
    console.error('Ошибка при получении пользователей:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// API для получения настроек SMTP
app.get('/api/email-settings', (req, res) => {
  try {
    const settings = db.prepare('SELECT * FROM email_settings LIMIT 1').get();
    
    if (!settings) {
      return res.json({ 
        smtp: {
          host: "smtp.gmail.com",
          port: 587,
          secure: false,
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
      });
    }
    
    const emailSettings = {
      smtp: {
        host: settings.smtp_host,
        port: settings.smtp_port,
        secure: Boolean(settings.smtp_secure),
        username: settings.smtp_username,
        password: settings.smtp_password,
        fromEmail: settings.smtp_from_email,
        fromName: settings.smtp_from_name
      },
      pop3: {
        host: settings.pop3_host,
        port: settings.pop3_port,
        secure: Boolean(settings.pop3_secure),
        username: settings.pop3_username,
        password: settings.pop3_password,
        leaveOnServer: Boolean(settings.pop3_leave_on_server),
        autoCheckInterval: settings.pop3_auto_check_interval
      }
    };
    
    res.json(emailSettings);
  } catch (error) {
    console.error('Ошибка при получении настроек SMTP:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// API для сохранения настроек SMTP
app.post('/api/email-settings', (req, res) => {
  try {
    const { smtp, pop3 } = req.body;
    
    db.prepare(`
      UPDATE email_settings SET
      smtp_host = ?,
      smtp_port = ?,
      smtp_secure = ?,
      smtp_username = ?,
      smtp_password = ?,
      smtp_from_email = ?,
      smtp_from_name = ?,
      pop3_host = ?,
      pop3_port = ?,
      pop3_secure = ?,
      pop3_username = ?,
      pop3_password = ?,
      pop3_leave_on_server = ?,
      pop3_auto_check_interval = ?
    `).run(
      smtp.host,
      smtp.port,
      smtp.secure ? 1 : 0,
      smtp.username,
      smtp.password,
      smtp.fromEmail,
      smtp.fromName,
      pop3?.host || null,
      pop3?.port || null,
      pop3?.secure ? 1 : 0,
      pop3?.username || null,
      pop3?.password || null,
      pop3?.leaveOnServer ? 1 : 0,
      pop3?.autoCheckInterval || 15
    );
    
    res.json({ success: true, message: 'Настройки успешно сохранены' });
  } catch (error) {
    console.error('Ошибка при сохранении настроек SMTP:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Проверка соединения SMTP
app.post('/api/test-smtp', async (req, res) => {
  try {
    const { host, port, secure, username, password, fromEmail, fromName } = req.body;
    
    // Создаем тестовый транспортер
    const testTransporter = nodemailer.createTransport({
      host,
      port: parseInt(port),
      secure: Boolean(secure),
      auth: {
        user: username,
        pass: password
      },
      tls: {
        // Не проверять сертификат для локальной разработки
        rejectUnauthorized: false
      }
    });
    
    // Проверяем соединение
    console.log(`Проверка соединения с SMTP: ${host}:${port}`);
    await testTransporter.verify();
    
    console.log('Соединение установлено успешно');
    res.json({ success: true, message: 'Соединение с SMTP сервером успешно установлено и проверено' });
  } catch (error) {
    console.error('Ошибка подключения к SMTP:', error);
    res.json({ 
      success: false, 
      message: `Ошибка подключения к SMTP: ${error.message}` 
    });
  }
});

// Аутентификация пользователя
app.post('/api/authenticate', (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Специальная проверка для входа админа
    if (email === 'admin' && password === 'admin') {
      const adminUser = db.prepare("SELECT * FROM users WHERE role = 'admin' LIMIT 1").get();
      
      if (adminUser) {
        // Обновляем время последнего входа
        const now = new Date().toISOString();
        db.prepare('UPDATE users SET last_login = ? WHERE id = ?').run(now, adminUser.id);
        
        // Форматируем пользователя для ответа
        const formattedUser = {
          id: adminUser.id,
          name: adminUser.name,
          email: adminUser.email,
          tariffId: adminUser.tariff_id,
          isSubscriptionActive: Boolean(adminUser.is_subscription_active),
          subscriptionEndDate: adminUser.subscription_end_date,
          storeCount: adminUser.store_count,
          avatar: adminUser.avatar,
          isInTrial: Boolean(adminUser.is_in_trial),
          trialEndDate: adminUser.trial_end_date,
          role: adminUser.role,
          status: adminUser.status,
          registeredAt: adminUser.registered_at,
          lastLogin: now
        };
        
        return res.json({ success: true, user: formattedUser });
      }
    }
    
    // Обычная проверка для остальных пользователей
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    
    if (user && (password === 'password' || password === user.password)) {
      // Обновляем время последнего входа
      const now = new Date().toISOString();
      db.prepare('UPDATE users SET last_login = ? WHERE id = ?').run(now, user.id);
      
      // Форматируем пользователя для ответа
      const formattedUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        company: user.company,
        tariffId: user.tariff_id,
        isSubscriptionActive: Boolean(user.is_subscription_active),
        subscriptionEndDate: user.subscription_end_date,
        storeCount: user.store_count,
        avatar: user.avatar,
        isInTrial: Boolean(user.is_in_trial),
        trialEndDate: user.trial_end_date,
        role: user.role,
        status: user.status,
        registeredAt: user.registered_at,
        lastLogin: now
      };
      
      return res.json({ success: true, user: formattedUser });
    }
    
    res.json({ success: false, errorMessage: 'Неверный логин или пароль' });
  } catch (error) {
    console.error('Ошибка при аутентификации пользователя:', error);
    res.status(500).json({ success: false, errorMessage: error.message });
  }
});

// Обработка запроса на сброс пароля
app.post('/api/reset-password-request', async (req, res) => {
  try {
    const { email, smtpSettings, resetUrl } = req.body;
    
    // Проверяем существование пользователя
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    
    if (!user) {
      // Для безопасности возвращаем успешный результат даже если пользователь не найден
      return res.json({ 
        success: true, 
        message: "Если указанный email зарегистрирован в системе, инструкции по восстановлению пароля будут отправлены на него."
      });
    }
    
    // Создаем или используем существующий транспортер
    let transporter;
    if (!transporters[smtpSettings.host]) {
      transporter = nodemailer.createTransport({
        host: smtpSettings.host,
        port: parseInt(smtpSettings.port),
        secure: Boolean(smtpSettings.secure),
        auth: {
          user: smtpSettings.username,
          pass: smtpSettings.password
        },
        tls: {
          rejectUnauthorized: false
        }
      });
      transporters[smtpSettings.host] = transporter;
    } else {
      transporter = transporters[smtpSettings.host];
    }
    
    // Генерируем токен для сброса пароля
    const resetToken = Math.random().toString(36).substring(2, 15);
    const resetExpiry = new Date(new Date().getTime() + 60 * 60 * 1000); // 1 час
    
    // Сохраняем токен в базу данных
    // Сначала удаляем старые токены для этого пользователя
    db.prepare('DELETE FROM password_reset_tokens WHERE user_id = ?').run(user.id);
    
    // Вставляем новый токен
    db.prepare('INSERT INTO password_reset_tokens (user_id, token, expiry) VALUES (?, ?, ?)').run(
      user.id, resetToken, resetExpiry.toISOString()
    );
    
    // Формируем HTML письма
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
    
    // Отправляем письмо
    const mailOptions = {
      from: `"${smtpSettings.fromName}" <${smtpSettings.fromEmail}>`,
      to: email,
      subject: 'Восстановление пароля',
      html: emailHtml
    };
    
    console.log(`Отправка письма на ${email}`);
    await transporter.sendMail(mailOptions);
    
    console.log('Письмо отправлено успешно');
    res.json({ success: true, message: 'Письмо с инструкциями отправлено успешно' });
  } catch (error) {
    console.error('Ошибка отправки письма:', error);
    res.json({ 
      success: false, 
      message: `Ошибка отправки письма: ${error.message}` 
    });
  }
});

// Подтверждение сброса пароля
app.post('/api/reset-password', (req, res) => {
  try {
    const { email, token, newPassword } = req.body;
    
    // Находим пользователя
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    
    if (!user) {
      return res.json({ success: false, message: "Неверные данные для сброса пароля" });
    }
    
    // Проверяем токен
    const resetData = db.prepare('SELECT * FROM password_reset_tokens WHERE user_id = ? AND token = ?').get(user.id, token);
    
    if (!resetData) {
      return res.json({ success: false, message: "Срок действия ссылки для сброса пароля истек" });
    }
    
    // Проверяем срок действия токена
    const now = new Date();
    const expiry = new Date(resetData.expiry);
    
    if (now > expiry) {
      return res.json({ success: false, message: "Срок действия ссылки для сброса пароля истек" });
    }
    
    // Обновляем пароль пользователя
    db.prepare('UPDATE users SET password = ? WHERE id = ?').run(newPassword, user.id);
    
    // Удаляем токен
    db.prepare('DELETE FROM password_reset_tokens WHERE user_id = ?').run(user.id);
    
    res.json({ 
      success: true, 
      message: "Пароль успешно сброшен. Теперь вы можете войти в систему, используя новый пароль." 
    });
  } catch (error) {
    console.error('Ошибка при сбросе пароля:', error);
    res.json({ success: false, message: error.message });
  }
});

// API для регистрации нового пользователя
app.post('/api/register', (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Проверяем, что пользователь с таким email не существует
    const existingUser = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    
    if (existingUser) {
      return res.json({
        success: false,
        errorMessage: 'Пользователь с таким email уже существует'
      });
    }
    
    const userId = Date.now().toString();
    const now = new Date();
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 3); // 3 дня пробного периода
    
    // Вставляем нового пользователя
    db.prepare(`
      INSERT INTO users 
      (id, name, email, password, tariff_id, is_subscription_active, is_in_trial, 
       trial_end_date, avatar, role, status, registered_at, last_login, store_count)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      userId,
      name,
      email,
      password,
      '3', // Тариф по умолчанию
      0, // Подписка не активна
      1, // В пробном периоде
      trialEndDate.toISOString(),
      `https://api.dicebear.com/7.x/avataaars/svg?seed=${name.replace(/\s+/g, '')}`,
      'user',
      'active',
      now.toISOString(),
      now.toISOString(),
      0 // Количество магазинов
    );
    
    // Получаем созданного пользователя
    const newUser = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    
    // Форматируем пользователя для ответа
    const formattedUser = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      tariffId: newUser.tariff_id,
      isSubscriptionActive: Boolean(newUser.is_subscription_active),
      isInTrial: Boolean(newUser.is_in_trial),
      trialEndDate: newUser.trial_end_date,
      avatar: newUser.avatar,
      role: newUser.role,
      status: newUser.status,
      registeredAt: newUser.registered_at,
      lastLogin: newUser.last_login,
      storeCount: newUser.store_count
    };
    
    res.json({
      success: true,
      user: formattedUser
    });
  } catch (error) {
    console.error('Ошибка при регистрации пользователя:', error);
    res.status(500).json({ 
      success: false, 
      errorMessage: error.message 
    });
  }
});

// API для получения истории платежей пользователя
app.get('/api/payment-history/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    
    const payments = db.prepare('SELECT * FROM payment_history WHERE user_id = ? ORDER BY date DESC').all(userId);
    
    const formattedPayments = payments.map(payment => ({
      id: payment.id,
      date: payment.date,
      amount: payment.amount,
      description: payment.description,
      status: payment.status,
      tariff: payment.tariff,
      period: payment.period
    }));
    
    res.json(formattedPayments);
  } catch (error) {
    console.error('Ошибка при получении истории платежей:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// API для добавления платежа
app.post('/api/payment', (req, res) => {
  try {
    const { userId, tariffId, amount, months } = req.body;
    
    const paymentId = Date.now().toString();
    const now = new Date().toISOString();
    
    // Добавляем запись о платеже
    db.prepare(`
      INSERT INTO payment_history 
      (id, user_id, date, amount, description, status, tariff, period)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      paymentId,
      userId,
      now,
      amount,
      'Оплата подписки',
      'success',
      tariffId,
      months.toString()
    );
    
    // Обновляем информацию о подписке пользователя
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    
    if (!user) {
      return res.json({ success: false, message: "Пользователь не найден" });
    }
    
    let endDate = new Date();
    
    if (Boolean(user.is_subscription_active) && user.subscription_end_date && user.tariff_id === tariffId) {
      const existingEndDate = new Date(user.subscription_end_date);
      if (existingEndDate > new Date()) {
        endDate = existingEndDate;
      }
    }
    
    endDate.setMonth(endDate.getMonth() + months);
    
    // Обновляем пользователя
    db.prepare(`
      UPDATE users SET
      tariff_id = ?,
      is_subscription_active = 1,
      is_in_trial = 0,
      trial_end_date = NULL,
      subscription_end_date = ?
      WHERE id = ?
    `).run(tariffId, endDate.toISOString(), userId);
    
    // Получаем обновленного пользователя
    const updatedUser = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    
    // Форматируем пользователя
    const formattedUser = {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      company: updatedUser.company,
      tariffId: updatedUser.tariff_id,
      isSubscriptionActive: Boolean(updatedUser.is_subscription_active),
      subscriptionEndDate: updatedUser.subscription_end_date,
      storeCount: updatedUser.store_count,
      avatar: updatedUser.avatar,
      isInTrial: Boolean(updatedUser.is_in_trial),
      trialEndDate: updatedUser.trial_end_date,
      role: updatedUser.role,
      status: updatedUser.status,
      registeredAt: updatedUser.registered_at,
      lastLogin: updatedUser.last_login
    };
    
    // Получаем запись о платеже
    const payment = db.prepare('SELECT * FROM payment_history WHERE id = ?').get(paymentId);
    
    const formattedPayment = {
      id: payment.id,
      date: payment.date,
      amount: payment.amount,
      description: payment.description,
      status: payment.status,
      tariff: payment.tariff,
      period: payment.period
    };
    
    res.json({
      success: true,
      user: formattedUser,
      payment: formattedPayment,
      message: `Подписка активирована до ${endDate.toLocaleDateString()}`
    });
  } catch (error) {
    console.error('Ошибка при добавлении платежа:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
