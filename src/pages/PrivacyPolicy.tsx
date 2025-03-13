
import React from "react";
import { Link } from "react-router-dom";
import { ScrollText } from "lucide-react";
import { Button } from "@/components/ui/button";
import Footer from "@/components/layout/Footer";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-grow container mx-auto px-4 py-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-6">
            <ScrollText className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold">Политика конфиденциальности</h1>
          </div>

          <div className="prose prose-gray max-w-none">
            <p className="text-muted-foreground">Последнее обновление: {new Date().toLocaleDateString('ru-RU')}</p>
            
            <h2 className="text-xl font-semibold mt-8 mb-4">1. Введение</h2>
            <p>
              ООО «Зерофай» (далее — «Zerofy», «мы», «нас» или «наш») уважает вашу конфиденциальность и стремится защищать ваши персональные данные. Настоящая политика конфиденциальности описывает, как мы собираем, используем, обрабатываем и храним ваши персональные данные при использовании нашего веб-сайта и услуг.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">2. Какие данные мы собираем</h2>
            <p>
              Мы можем собирать, использовать, хранить и передавать различные виды персональных данных о вас, включая:
            </p>
            <ul className="list-disc pl-5 space-y-2 my-4">
              <li><strong>Идентификационные данные</strong>: имя, фамилия, имя пользователя или аналогичный идентификатор.</li>
              <li><strong>Контактные данные</strong>: адрес электронной почты, номер телефона, почтовый адрес.</li>
              <li><strong>Финансовые данные</strong>: данные платежных карт или банковских счетов для обработки платежей.</li>
              <li><strong>Технические данные</strong>: IP-адрес, данные входа в систему, тип и версия браузера, настройки часового пояса и местоположения, типы и версии плагинов браузера, операционная система и платформа.</li>
              <li><strong>Данные профиля</strong>: имя пользователя и пароль, покупки или заказы, интересы, предпочтения, отзывы и ответы на опросы.</li>
              <li><strong>Данные об использовании</strong>: информация о том, как вы используете наш веб-сайт и услуги.</li>
              <li><strong>Маркетинговые и коммуникационные данные</strong>: ваши предпочтения в получении маркетинговых материалов от нас и наших третьих сторон, и ваши коммуникационные предпочтения.</li>
            </ul>

            <h2 className="text-xl font-semibold mt-8 mb-4">3. Как мы используем ваши данные</h2>
            <p>
              Мы используем ваши персональные данные для следующих целей:
            </p>
            <ul className="list-disc pl-5 space-y-2 my-4">
              <li>Предоставление и управление вашей учетной записью</li>
              <li>Предоставление наших услуг</li>
              <li>Обработка и доставка заказов</li>
              <li>Управление нашими отношениями с вами</li>
              <li>Улучшение нашего веб-сайта, продуктов и услуг</li>
              <li>Рекомендация продуктов или услуг, которые могут вас заинтересовать</li>
              <li>Обеспечение безопасности наших систем и предотвращение мошенничества</li>
            </ul>

            <h2 className="text-xl font-semibold mt-8 mb-4">4. Обмен вашими данными</h2>
            <p>
              Мы можем передавать ваши персональные данные следующим категориям получателей:
            </p>
            <ul className="list-disc pl-5 space-y-2 my-4">
              <li>Поставщикам услуг, которые предоставляют ИТ и системные административные услуги</li>
              <li>Профессиональным консультантам, включая юристов, банкиров, аудиторов и страховщиков</li>
              <li>Налоговым и таможенным органам, регуляторам и другим органам власти</li>
              <li>Третьим сторонам, которым мы продаем, передаем или объединяем части нашего бизнеса или активов</li>
            </ul>

            <h2 className="text-xl font-semibold mt-8 mb-4">5. Безопасность данных</h2>
            <p>
              Мы внедрили соответствующие меры безопасности для предотвращения случайной потери, использования или доступа к вашим персональным данным несанкционированным образом, их изменения или раскрытия. Кроме того, мы ограничиваем доступ к вашим персональным данным сотрудникам, агентам, подрядчикам и другим третьим сторонам, которым это необходимо знать для бизнеса. Они будут обрабатывать ваши персональные данные только по нашим инструкциям и подлежат обязательству конфиденциальности.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">6. Хранение данных</h2>
            <p>
              Мы будем хранить ваши персональные данные только в течение времени, необходимого для выполнения целей, для которых мы их собрали, включая выполнение любых юридических, бухгалтерских или отчетных требований.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">7. Ваши законные права</h2>
            <p>
              В определенных обстоятельствах вы имеете права в отношении ваших персональных данных в соответствии с законами о защите данных, включая право на доступ, исправление, удаление, ограничение обработки, перенос данных, возражение против обработки и отзыв согласия.
            </p>
            
            <h2 className="text-xl font-semibold mt-8 mb-4">8. Изменения в политике конфиденциальности</h2>
            <p>
              Мы можем обновлять нашу политику конфиденциальности время от времени. Любые изменения будут опубликованы на этой странице.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">9. Контактная информация</h2>
            <p>
              Если у вас есть какие-либо вопросы об этой политике конфиденциальности или о наших практиках обработки данных, пожалуйста, свяжитесь с нами по адресу: info@zerofy.ru
            </p>
          </div>

          <div className="mt-10">
            <Button asChild variant="outline">
              <Link to="/">Вернуться на главную</Link>
            </Button>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
