
import React from "react";
import { Zap, Mail, Phone, MapPin, Twitter, Instagram, Facebook, Linkedin } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-muted py-12 border-t">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Zap className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl">Zerofy</span>
            </div>
            <p className="text-muted-foreground">
              Мы помогаем продавцам на маркетплейсах управлять своим бизнесом более эффективно с помощью аналитики и искусственного интеллекта.
            </p>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-medium text-lg mb-4">Информация</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Политика конфиденциальности</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Условия использования</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-medium text-lg mb-4">Контакты</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a href="mailto:info@zerofy.ru" className="text-muted-foreground hover:text-primary transition-colors">info@zerofy.ru</a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <a href="tel:+78001234567" className="text-muted-foreground hover:text-primary transition-colors">+7 (800) 123-45-67</a>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Москва, ул. Примерная, 123</span>
              </li>
            </ul>

            <div className="flex gap-4 mt-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t mt-10 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Zerofy. Все права защищены.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
