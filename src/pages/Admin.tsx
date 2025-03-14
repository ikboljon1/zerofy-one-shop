
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import UserManagement from "@/components/admin/UserManagement";
import AdminSettingsSection from "@/components/admin/AdminSettingsSection";
import TariffManagement from "@/components/admin/TariffManagement";
import SMTPSettings from "@/components/admin/SMTPSettings";
import SMSIntegrationSettings from "@/components/admin/SMSIntegrationSettings";
import VerificationSettings from "@/components/admin/VerificationSettings";
import AdminDashboard from "@/components/admin/AdminDashboard";
import SystemStatus from "@/components/admin/SystemStatus";
import VerifyPhoneNumber from "@/components/admin/VerifyPhoneNumber";
import AdminActivityLog from "@/components/admin/AdminActivityLog";
import { useTheme } from "@/hooks/use-theme";
import ThemeSelector from "@/components/admin/ThemeSelector";
import RealTimeLog from "@/components/admin/RealTimeLog";
import LandingPageManager from "@/components/admin/LandingPageManager";

const Admin = () => {
  const [userData, setUserData] = useState(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    // Проверка роли пользователя при загрузке компонента
    const userString = localStorage.getItem('user') || sessionStorage.getItem('user');
    
    if (userString) {
      try {
        const user = JSON.parse(userString);
        setUserData(user);
        setUserRole(user.role);
        
        // Если пользователь не админ, перенаправляем на дашборд
        if (user.role !== 'admin') {
          navigate('/dashboard');
        }
      } catch (e) {
        console.error('Ошибка при парсинге данных пользователя:', e);
        navigate('/dashboard');
      }
    } else {
      // Если пользователь не авторизован, перенаправляем на главную
      navigate('/');
    }
  }, [navigate]);

  // Если роль пользователя еще не определена, показываем загрузку
  if (userRole === null) {
    return (
      <div className="container mx-auto py-10 flex justify-center items-center h-[80vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Если пользователь не админ, показываем сообщение об ошибке доступа
  if (userRole !== 'admin') {
    return (
      <div className="container mx-auto py-10">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Ошибка доступа</AlertTitle>
          <AlertDescription>
            У вас нет прав для доступа к административной панели.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Административная панель</h1>
        <ThemeSelector currentTheme={theme} onToggle={toggleTheme} />
      </div>
      
      <AdminDashboard />
      
      <Tabs defaultValue="users" className="w-full mt-8">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="users">Пользователи</TabsTrigger>
          <TabsTrigger value="tariffs">Тарифы</TabsTrigger>
          <TabsTrigger value="landing">Лендинг</TabsTrigger>
          <TabsTrigger value="logs">Логи</TabsTrigger>
          <TabsTrigger value="settings">Настройки</TabsTrigger>
          <TabsTrigger value="verification">Верификация</TabsTrigger>
          <TabsTrigger value="system">Система</TabsTrigger>
        </TabsList>
        
        <TabsContent value="users">
          <UserManagement />
          <div className="mt-8">
            <AdminActivityLog />
          </div>
        </TabsContent>
        
        <TabsContent value="tariffs">
          <TariffManagement />
        </TabsContent>
        
        <TabsContent value="landing">
          <LandingPageManager />
        </TabsContent>
        
        <TabsContent value="logs">
          <RealTimeLog />
        </TabsContent>
        
        <TabsContent value="settings">
          <AdminSettingsSection userData={userData} />
          <div className="mt-8">
            <SMTPSettings />
          </div>
          <div className="mt-8">
            <SMSIntegrationSettings />
          </div>
        </TabsContent>
        
        <TabsContent value="verification">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <VerificationSettings />
            <VerifyPhoneNumber />
          </div>
        </TabsContent>
        
        <TabsContent value="system">
          <SystemStatus />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Admin;
