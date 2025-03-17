
import React from "react";
import { Zap, Mail, Phone, MapPin, Twitter, Instagram, Facebook, Linkedin } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return <footer className="bg-muted py-12 border-t">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-wrap justify-between items-start gap-6">
          {/* Company Info */}
          <div className="space-y-4 flex-1">
            <div className="flex items-center gap-2">
              <Zap className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl">Zerofy</span>
            </div>
            <p className="text-muted-foreground max-w-md">
              Мы помогаем продавцам на маркетплейсах управлять своим бизнесом более эффективно с помощью аналитики и искусственного интеллекта.
            </p>
          </div>

          {/* Legal */}
          <div className="flex-shrink-0">
            <h3 className="font-medium text-lg mb-4">Информация</h3>
            <ul className="space-y-2">
              <li><Link to="/privacy-policy" className="text-muted-foreground hover:text-primary transition-colors">Политика конфиденциальности</Link></li>
              <li><Link to="/terms-of-service" className="text-muted-foreground hover:text-primary transition-colors">Условия использования</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="flex-shrink-0">
            <h3 className="font-medium text-lg mb-4">Контакты</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a href="mailto:info@zerofy.ru" className="text-muted-foreground hover:text-primary transition-colors">info@zerofy.ru</a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <a href="tel:+996709727212" className="text-muted-foreground hover:text-primary transition-colors">+996709727212</a>
              </li>
              
            </ul>

            
          </div>
        </div>

        <div className="border-t mt-10 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Zerofy. Все права защищены.
          </p>
        </div>
      </div>
    </footer>;
};
export default Footer;
