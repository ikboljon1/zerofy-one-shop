
import { useState } from "react";
import { Shield } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserManagement from "@/components/admin/UserManagement";
import TariffManagement from "@/components/admin/TariffManagement";

const Admin = () => {
  const [activeTab, setActiveTab] = useState("admin");
  const [activeAdminTab, setActiveAdminTab] = useState("users");

  return (
    <MainLayout 
      activeTab={activeTab} 
      onTabChange={setActiveTab}
    >
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Административная панель</h1>
        </div>

        <Tabs value={activeAdminTab} onValueChange={setActiveAdminTab} className="w-full">
          <TabsList className="grid w-full md:w-auto grid-cols-2">
            <TabsTrigger value="users">Пользователи</TabsTrigger>
            <TabsTrigger value="tariffs">Тарифы</TabsTrigger>
          </TabsList>
          <TabsContent value="users">
            <UserManagement />
          </TabsContent>
          <TabsContent value="tariffs">
            <TariffManagement />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Admin;
