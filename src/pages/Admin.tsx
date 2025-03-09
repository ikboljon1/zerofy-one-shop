
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserManagement from "@/components/admin/UserManagement";
import TariffManagement from "@/components/admin/TariffManagement";
import SMTPSettings from "@/components/admin/SMTPSettings";
import MainLayout from "@/components/layout/MainLayout";

const Admin = () => {
  const [activeTab, setActiveTab] = useState("users");

  return (
    <MainLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Панель администратора</h1>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="users">Пользователи</TabsTrigger>
            <TabsTrigger value="tariffs">Тарифы</TabsTrigger>
            <TabsTrigger value="settings">Настройки</TabsTrigger>
          </TabsList>
          
          <TabsContent value="users">
            <UserManagement />
          </TabsContent>
          
          <TabsContent value="tariffs">
            <TariffManagement />
          </TabsContent>
          
          <TabsContent value="settings">
            <div className="space-y-8">
              <SMTPSettings />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Admin;
