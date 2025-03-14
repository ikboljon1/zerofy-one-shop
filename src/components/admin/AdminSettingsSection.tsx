
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings } from "lucide-react";

// Добавляем определение типа для пропсов, чтобы исправить ошибку типизации
export interface AdminSettingsSectionProps {
  userData?: {
    id: number;
    email: string;
    role: string;
  };
}

const AdminSettingsSection = ({ userData }: AdminSettingsSectionProps) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center">
          <Settings className="h-5 w-5 mr-2 text-muted-foreground" />
          <CardTitle>Настройки администратора</CardTitle>
        </div>
        <CardDescription>
          Настройте параметры системы и сервисы интеграции
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="general">Общие</TabsTrigger>
            <TabsTrigger value="integration">Интеграции</TabsTrigger>
            <TabsTrigger value="security">Безопасность</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Общие настройки</h3>
              <p className="text-sm text-muted-foreground">
                Настройте общие параметры работы системы.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="integration">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Настройки интеграций</h3>
              <p className="text-sm text-muted-foreground">
                Настройте параметры интеграции с внешними сервисами.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="security">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Настройки безопасности</h3>
              <p className="text-sm text-muted-foreground">
                Настройте параметры безопасности и доступа.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AdminSettingsSection;
