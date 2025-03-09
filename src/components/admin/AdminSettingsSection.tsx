
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import PasswordChangeForm from "@/components/PasswordChangeForm";
import { User } from "@/services/userService";

interface AdminSettingsSectionProps {
  userData: User | null;
}

const AdminSettingsSection: React.FC<AdminSettingsSectionProps> = ({ userData }) => {
  if (!userData) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <p className="text-gray-400">Необходимо войти в систему для доступа к настройкам</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <Card className="border border-gray-800 bg-gray-900 shadow-md">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-white">Настройки профиля администратора</CardTitle>
          <CardDescription className="text-gray-400">
            Управление учетными данными администратора
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">Изменение пароля</h3>
            <PasswordChangeForm userId={userData.id} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettingsSection;
