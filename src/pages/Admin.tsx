
import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import UserManagement from "@/components/admin/UserManagement";
import AdminSettingsSection from "@/components/admin/AdminSettingsSection";
import TariffManagement from "@/components/admin/TariffManagement";
import SMTPSettings from "@/components/admin/SMTPSettings";
import SMSIntegrationSettings from "@/components/admin/SMSIntegrationSettings";
import VerificationSettings from "@/components/admin/VerificationSettings";

const Admin = () => {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // Здесь можно добавить загрузку данных пользователя при необходимости
    // Например, получение информации о текущем администраторе
  }, []);

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Административная панель</h1>
      
      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="users">Пользователи</TabsTrigger>
          <TabsTrigger value="tariffs">Тарифы</TabsTrigger>
          <TabsTrigger value="settings">Настройки</TabsTrigger>
          <TabsTrigger value="verification">Верификация</TabsTrigger>
        </TabsList>
        
        <TabsContent value="users">
          <UserManagement />
        </TabsContent>
        
        <TabsContent value="tariffs">
          <TariffManagement />
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
          <VerificationSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Admin;
