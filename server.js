
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Хранилище транспортеров (для разных настроек SMTP)
let transporters = {};

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

// Обработка запроса на сброс пароля
app.post('/api/reset-password-request', async (req, res) => {
  try {
    const { email, smtpSettings, resetUrl } = req.body;
    
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

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
