
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Zap, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import AuthModal from "@/components/auth/AuthModal";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  
  // Проверяем авторизацию при загрузке компонента
  useEffect(() => {
    const userString = localStorage.getItem('user') || sessionStorage.getItem('user');
    const isAuth = !!userString;
    setIsAuthenticated(isAuth);
    
    // Проверяем, является ли пользователь администратором
    if (isAuth && userString) {
      try {
        const user = JSON.parse(userString);
        setIsAdmin(user.role === 'admin');
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
  }, []);
  
  const handleLogin = () => {
    // Если пользователь уже авторизован, перенаправляем на дашборд
    if (isAuthenticated) {
      navigate('/dashboard');
      return;
    }
    
    // Иначе показываем модальное окно авторизации
    setShowAuthModal(true);
  };
  
  const handleTariffClick = () => {
    // Если мы на главной странице, то скроллим к разделу тарифов
    if (window.location.pathname === '/') {
      const pricingSection = document.querySelector('#pricing-section');
      if (pricingSection) {
        pricingSection.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // Если на другой странице, то переходим на главную и скроллим к тарифам
      navigate('/?section=pricing');
    }
  };
  
  const handleLogout = () => {
    // Удаляем данные пользователя из localStorage и sessionStorage
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');
    // Сбрасываем состояние авторизации
    setIsAuthenticated(false);
    setIsAdmin(false);
    // Перенаправляем на главную страницу
    navigate('/');
  };
  
  const renderAuthButton = () => {
    if (!isAuthenticated) {
      return (
        <Button onClick={handleLogin}>Войти</Button>
      );
    }
    
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">{isAdmin ? "Админ-панель" : "Мой кабинет"}</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => navigate(isAdmin ? '/admin' : '/dashboard')}>
            {isAdmin ? "Админ-панель" : "Мой кабинет"}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleLogout} className="text-red-500">
            <LogOut className="h-4 w-4 mr-2" />
            Выйти
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };
  
  return (
    <nav className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur border-b">
      <div className="container flex items-center justify-between h-16 px-4 md:px-6">
        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <Zap className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl">Zerofy</span>
        </div>
        
        {/* Desktop Navigation */}
        {!isMobile && (
          <div className="flex items-center gap-6">
            <span className="text-sm font-medium cursor-pointer hover:text-primary transition-colors" 
                  onClick={handleTariffClick}>
              Тарифы
            </span>
            {renderAuthButton()}
          </div>
        )}
        
        {/* Mobile Navigation */}
        {isMobile && (
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 15 15"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                >
                  <path
                    d="M1.5 3C1.22386 3 1 3.22386 1 3.5C1 3.77614 1.22386 4 1.5 4H13.5C13.7761 4 14 3.77614 14 3.5C14 3.22386 13.7761 3 13.5 3H1.5ZM1 7.5C1 7.22386 1.22386 7 1.5 7H13.5C13.7761 7 14 7.22386 14 7.5C14 7.77614 13.7761 8 13.5 8H1.5C1.22386 8 1 7.77614 1 7.5ZM1 11.5C1 11.2239 1.22386 11 1.5 11H13.5C13.7761 11 14 11.2239 14 11.5C14 11.7761 13.7761 12 13.5 12H1.5C1.22386 12 1 11.7761 1 11.5Z"
                    fill="currentColor"
                    fillRule="evenodd"
                    clipRule="evenodd"
                  ></path>
                </svg>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex flex-col gap-6 mt-6">
                <span className="text-sm font-medium cursor-pointer hover:text-primary transition-colors" 
                      onClick={() => {
                        handleTariffClick();
                        setIsMenuOpen(false);
                      }}>
                  Тарифы
                </span>
                {isAuthenticated ? (
                  <>
                    <Button onClick={() => {
                      navigate(isAdmin ? '/admin' : '/dashboard');
                      setIsMenuOpen(false);
                    }}>
                      {isAdmin ? "Админ-панель" : "Мой кабинет"}
                    </Button>
                    <Button 
                      variant="destructive" 
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center gap-2"
                    >
                      <LogOut className="h-4 w-4" />
                      Выйти
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => {
                    handleLogin();
                    setIsMenuOpen(false);
                  }}>
                    Войти
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        )}
      </div>
      
      {/* Auth Modal */}
      <AuthModal 
        open={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
        initialMode="login"
      />
    </nav>
  );
};

export default Navbar;
