
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import PasswordResetRequestForm from "./PasswordResetRequestForm";
import PasswordResetForm from "./PasswordResetForm";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
  resetToken?: string;
  resetEmail?: string;
}

const AuthModal = ({ open, onClose, initialMode = 'login', resetToken, resetEmail }: AuthModalProps) => {
  const [activeTab, setActiveTab] = useState<string>(initialMode);
  const [resetMode, setResetMode] = useState<'request' | 'reset' | null>(
    resetToken && resetEmail ? 'reset' : null
  );
  const [emailForReset, setEmailForReset] = useState<string>(resetEmail || '');

  // Проверка URL на наличие параметров для сброса пароля
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get('resetToken');
    const emailFromUrl = urlParams.get('email');
    
    if (tokenFromUrl && emailFromUrl) {
      setResetMode('reset');
      setEmailForReset(emailFromUrl);
      
      // Если модальное окно еще не открыто, вызываем onClose, которое по сути его откроет
      if (!open) {
        onClose();
      }
      
      // Очищаем URL от параметров сброса пароля для безопасности
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [open, onClose]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setResetMode(null);
  };

  const handleForgotPassword = () => {
    setResetMode('request');
  };

  const handleBackToLogin = () => {
    setResetMode(null);
    setActiveTab('login');
  };

  const handleResetSent = (email: string) => {
    setEmailForReset(email);
  };

  const handleResetSuccess = () => {
    setResetMode(null);
    setActiveTab('login');
  };

  const renderContent = () => {
    if (resetMode === 'request') {
      return (
        <PasswordResetRequestForm 
          onBack={handleBackToLogin} 
          onResetSent={handleResetSent}
        />
      );
    }

    if (resetMode === 'reset' || (resetToken && resetEmail)) {
      return (
        <PasswordResetForm 
          email={emailForReset || resetEmail || ''} 
          token={resetToken || ''}
          onSuccess={handleResetSuccess}
        />
      );
    }

    return (
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Войти</TabsTrigger>
          <TabsTrigger value="register">Регистрация</TabsTrigger>
        </TabsList>
        <TabsContent value="login">
          <LoginForm onSuccess={onClose} onForgotPassword={handleForgotPassword} />
        </TabsContent>
        <TabsContent value="register">
          <RegisterForm onSuccess={onClose} />
        </TabsContent>
      </Tabs>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            {resetMode === 'request' 
              ? 'Восстановление пароля'
              : resetMode === 'reset'
                ? 'Создание нового пароля'
                : activeTab === 'login' 
                  ? 'Добро пожаловать!' 
                  : 'Присоединяйтесь к Zerofy'}
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            {resetMode === 'request'
              ? 'Введите email для получения инструкций'
              : resetMode === 'reset'
                ? 'Создайте новый пароль для вашей учетной записи'
                : activeTab === 'login'
                  ? 'Войдите в свою учетную запись'
                  : 'Создайте учетную запись для начала работы'}
          </DialogDescription>
        </DialogHeader>
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
